import type { BankAccount, BudgetAccount, BudgetTransaction } from "./types";
import { toYnabMilliunits } from "./money";

export interface ReconcileResult {
  newTransactions: BudgetTransaction[];
  existingTransactions: BudgetTransaction[];
  ignored: BudgetTransaction[];
}

interface ReconcileOptions {
  shouldIgnore?: (txn: BudgetTransaction) => boolean;
}

const emptyReconcileResultValue: ReconcileResult = {
  newTransactions: [],
  existingTransactions: [],
  ignored: [],
};

const areTransactionsEqual = (left: BudgetTransaction, right: BudgetTransaction): boolean => {
  return left.amount === right.amount && left.date === right.date;
};

export const reconcile = (
  budgetAccount: BudgetAccount,
  bankAccount: BankAccount,
  { shouldIgnore }: ReconcileOptions = {},
): ReconcileResult => {
  return bankAccount.transactions.reduce<ReconcileResult>((result, bankTransaction) => {
    const mappedTransaction: BudgetTransaction = {
      accountId: budgetAccount.accountId,
      amount: toYnabMilliunits(bankTransaction.amount),
      date: bankTransaction.date,
      memo: bankTransaction.description,
    };

    if (shouldIgnore?.(mappedTransaction)) {
      result.ignored.push(mappedTransaction);
      return result;
    }

    const existingTransaction = budgetAccount.transactions.find((budgetTransaction) => {
      return areTransactionsEqual(budgetTransaction, mappedTransaction);
    });

    if (existingTransaction) {
      result.existingTransactions.push(mappedTransaction);
      return result;
    }

    result.newTransactions.push(mappedTransaction);
    return result;
  }, structuredClone(emptyReconcileResultValue));
};
