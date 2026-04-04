import { join } from "node:path";

import { loadLocalConfig, parseCliOptions } from "./config";
import { createLogger } from "./logger";
import { parseMacquarieCsvFile } from "./parsers/macquarieCsv";
import { reconcile } from "./reconciler";
import { createYnabClient } from "./ynabClient";

const subtractDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() - days);
  result.setUTCHours(0, 0, 0, 0);
  return result;
};

export const runCli = async (args: string[]): Promise<void> => {
  const options = parseCliOptions(args);
  const logger = createLogger("ynab-sync");

  if (!options.apply) {
    logger.info("Running in dry-run mode. Pass --apply to enable YNAB writes.");
  }

  const config = await loadLocalConfig();
  const ynabClient = createYnabClient({
    apiKey: config.ynabApiKey,
    budgetId: config.ynabBudgetId,
  });

  logger.info("Local config validated", {
    ynabBudgetId: config.ynabBudgetId,
    accountCount: config.accounts.length,
    memosToIgnore: config.memosToIgnore.length,
    apply: options.apply,
  });

  const includeOnlyAfter = subtractDays(new Date(), config.includeOnlyAfterDays);
  const ynabSinceDate = subtractDays(new Date(), config.numberOfDaysToFetch);
  const ynabAccounts = await ynabClient.loadAccounts();
  const recentTransactions = await ynabClient.fetchRecentTransactions(ynabSinceDate.toISOString().slice(0, 10));

  const ynabTransactionsByAccountId = new Map<string, typeof recentTransactions>();
  for (const transaction of recentTransactions) {
    let existingTransactions = ynabTransactionsByAccountId.get(transaction.accountId);

    if (!existingTransactions) {
      existingTransactions = [];
      ynabTransactionsByAccountId.set(transaction.accountId, existingTransactions);
    }

    existingTransactions.push(transaction);
  }

  let totalParsed = 0;
  let totalIgnored = 0;
  let totalExisting = 0;
  let totalNew = 0;
  let totalCreated = 0;

  for (const accountConfig of config.accounts) {
    const filePath = join(options.dataDir, accountConfig.fileName);
    const accountName = accountConfig.fileName.replace(/\.csv$/i, "");
    const parsedAccount = await parseMacquarieCsvFile({
      accountName,
      filePath,
      includeOnlyAfter,
    });

    const matchingYnabAccount = ynabAccounts.find((account) => account.accountId === accountConfig.ynabAccountId);

    if (!matchingYnabAccount) {
      throw new Error(
        `YNAB account '${accountConfig.ynabAccountId}' for file '${accountConfig.fileName}' was not found in budget '${config.ynabBudgetId}'.`,
      );
    }

    const budgetAccount = {
      ...matchingYnabAccount,
      transactions: ynabTransactionsByAccountId.get(accountConfig.ynabAccountId) ?? [],
    };

    const reconciliationResult = reconcile(budgetAccount, parsedAccount, {
      shouldIgnore: ({ memo, amount }) => {
        const isMemoIgnored = config.memosToIgnore.includes(memo);
        const isPositiveFiltered = accountConfig.negativeOnly && amount > 0;
        return isMemoIgnored || isPositiveFiltered;
      },
    });

    const createResult = await ynabClient.createTransactions(reconciliationResult.newTransactions, {
      apply: options.apply,
    });

    totalParsed += parsedAccount.transactions.length;
    totalIgnored += reconciliationResult.ignored.length;
    totalExisting += reconciliationResult.existingTransactions.length;
    totalNew += reconciliationResult.newTransactions.length;
    totalCreated += createResult.createdCount;

    logger.info("CSV parsed", {
      fileName: accountConfig.fileName,
      accountName: parsedAccount.name,
      parsed: parsedAccount.transactions.length,
      ignored: reconciliationResult.ignored.length,
      existing: reconciliationResult.existingTransactions.length,
      new: reconciliationResult.newTransactions.length,
      created: createResult.createdCount,
      dryRun: !options.apply,
    });
  }

  logger.info("Import summary", {
    parsed: totalParsed,
    ignored: totalIgnored,
    existing: totalExisting,
    new: totalNew,
    created: totalCreated,
    dryRun: !options.apply,
  });
};
