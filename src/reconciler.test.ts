import { describe, expect, it } from "bun:test";

import { reconcile } from "./reconciler";
import type { BankAccount, BudgetAccount } from "./types";

describe("reconcile", () => {
  it("returns new, existing, and ignored buckets", () => {
    const budgetAccount: BudgetAccount = {
      accountId: "test-account",
      balance: 100,
      name: "Offset",
      transactions: [
        {
          accountId: "test-account",
          amount: -100000,
          date: "2021-07-24",
          memo: "existing transaction",
        },
      ],
    };

    const bankAccount: BankAccount = {
      balance: 0,
      name: "Offset",
      transactions: [
        {
          amount: -99,
          category: "Withdrawals & Transfers",
          date: "2021-08-14",
          description: "new transaction",
        },
        {
          amount: -100,
          category: "Groceries",
          date: "2021-07-24",
          description: "existing transaction",
        },
        {
          amount: -101,
          category: "Entertainment",
          date: "2021-07-23",
          description: "ignored transaction",
        },
      ],
    };

    const result = reconcile(budgetAccount, bankAccount, {
      shouldIgnore: ({ memo }) => memo === "ignored transaction",
    });

    expect(result.newTransactions).toHaveLength(1);
    expect(result.existingTransactions).toHaveLength(1);
    expect(result.ignored).toHaveLength(1);
  });
});
