import { describe, expect, it } from "bun:test";

import { createYnabClient, type YnabTransport } from "./ynabClient";

describe("createYnabClient", () => {
  it("loads accounts from YNAB", async () => {
    const calls: { method: string; path: string; body?: unknown }[] = [];
    const transport: YnabTransport = {
      request: async <T>(options: Parameters<YnabTransport["request"]>[0]): Promise<T> => {
        calls.push({ method: options.method, path: options.path, body: options.body });
        return {
          data: {
            accounts: [
              {
                id: "acc-1",
                name: "Macquarie Visa",
                balance: 150000,
              },
            ],
          },
        } as T;
      },
    };

    const client = createYnabClient({
      apiKey: "token",
      budgetId: "budget-1",
      transport,
    });

    const result = await client.loadAccounts();

    expect(calls).toEqual([{ method: "GET", path: "/budgets/budget-1/accounts", body: undefined }]);
    expect(result).toEqual([
      {
        accountId: "acc-1",
        balance: 150000,
        name: "Macquarie Visa",
        transactions: [],
      },
    ]);
  });

  it("fetches recent transactions by since_date", async () => {
    const calls: { method: string; path: string; body?: unknown }[] = [];
    const transport: YnabTransport = {
      request: async <T>(options: Parameters<YnabTransport["request"]>[0]): Promise<T> => {
        calls.push({ method: options.method, path: options.path, body: options.body });
        return {
          data: {
            transactions: [
              {
                account_id: "acc-1",
                amount: -5200,
                date: "2025-10-15",
                memo: "Coffee Shop",
              },
            ],
          },
        } as T;
      },
    };

    const client = createYnabClient({
      apiKey: "token",
      budgetId: "budget-1",
      transport,
    });

    const result = await client.fetchRecentTransactions("2025-09-01");

    expect(calls).toEqual([
      {
        method: "GET",
        path: "/budgets/budget-1/transactions?since_date=2025-09-01",
        body: undefined,
      },
    ]);
    expect(result).toEqual([
      {
        accountId: "acc-1",
        amount: -5200,
        date: "2025-10-15",
        memo: "Coffee Shop",
      },
    ]);
  });

  it("skips create request in dry-run mode", async () => {
    const transport: YnabTransport = {
      request: async () => {
        throw new Error("request should not be called");
      },
    };

    const client = createYnabClient({
      apiKey: "token",
      budgetId: "budget-1",
      transport,
    });

    const result = await client.createTransactions(
      [
        {
          accountId: "acc-1",
          amount: -5200,
          date: "2025-10-15",
          memo: "Coffee Shop",
        },
      ],
      { apply: false },
    );

    expect(result).toEqual({
      createdCount: 0,
      skippedCount: 1,
    });
  });

  it("creates transactions in apply mode", async () => {
    const calls: { method: string; path: string; body?: unknown }[] = [];
    const transport: YnabTransport = {
      request: async <T>(options: Parameters<YnabTransport["request"]>[0]): Promise<T> => {
        calls.push({ method: options.method, path: options.path, body: options.body });
        return {
          data: {
            transaction_ids: ["txn-1"],
          },
        } as T;
      },
    };

    const client = createYnabClient({
      apiKey: "token",
      budgetId: "budget-1",
      transport,
    });

    const result = await client.createTransactions(
      [
        {
          accountId: "acc-1",
          amount: -5200,
          date: "2025-10-15",
          memo: "Coffee Shop",
        },
      ],
      { apply: true },
    );

    expect(calls).toEqual([
      {
        method: "POST",
        path: "/budgets/budget-1/transactions",
        body: {
          transactions: [
            {
              account_id: "acc-1",
              amount: -5200,
              date: "2025-10-15",
              memo: "Coffee Shop",
            },
          ],
        },
      },
    ]);
    expect(result).toEqual({
      createdCount: 1,
      skippedCount: 0,
    });
  });
});
