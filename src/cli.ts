import { loadLocalConfig, parseCliOptions } from "./config";
import { createLogger } from "./logger";

export const runCli = async (args: string[]): Promise<void> => {
  const options = parseCliOptions(args);
  const logger = createLogger("ynab-sync");

  if (!options.apply) {
    logger.info("Running in dry-run mode. Pass --apply to enable YNAB writes.");
  }

  const config = await loadLocalConfig();
  logger.info("Local config validated", {
    ynabBudgetId: config.ynabBudgetId,
    accountCount: config.accounts.length,
    memosToIgnore: config.memosToIgnore.length,
    apply: options.apply,
  });

  logger.info("Phase 0 baseline complete. CSV import flow will be added in upcoming phases.");
};
