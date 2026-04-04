import type { BudgetAccount, BudgetTransaction } from "./types";

const defaultYnabApiBaseUrlValue = "https://api.ynab.com/v1";

interface YnabRequestOptions {
  method: "GET" | "POST";
  path: string;
  body?: unknown;
}

interface YnabTransport {
  request<T>(options: YnabRequestOptions): Promise<T>;
}

interface CreateYnabClientOptions {
  apiKey: string;
  budgetId: string;
  transport?: YnabTransport;
}

interface CreateTransactionsOptions {
  apply: boolean;
}

interface CreateTransactionsResult {
  createdCount: number;
  skippedCount: number;
}

interface YnabAccountResponse {
  id: string;
  name: string;
  balance: number;
}

interface YnabTransactionResponse {
  account_id: string;
  amount: number;
  date: string;
  memo: string | null;
}

interface YnabAccountsApiResponse {
  data: {
    accounts: YnabAccountResponse[];
  };
}

interface YnabTransactionsApiResponse {
  data: {
    transactions: YnabTransactionResponse[];
  };
}

interface YnabCreateTransactionsApiResponse {
  data: {
    transaction_ids: string[];
  };
}

const mapYnabTransactionToBudgetTransaction = (
  transaction: YnabTransactionResponse,
): BudgetTransaction => {
  return {
    accountId: transaction.account_id,
    amount: transaction.amount,
    date: transaction.date,
    memo: transaction.memo ?? "",
  };
};

export const createFetchTransport = (
  apiKey: string,
  baseUrl = defaultYnabApiBaseUrlValue,
): YnabTransport => {
  return {
    async request<T>({ method, path, body }: YnabRequestOptions): Promise<T> {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`YNAB API request failed (${response.status}): ${responseText}`);
      }

      return (await response.json()) as T;
    },
  };
};

export const createYnabClient = ({
  apiKey,
  budgetId,
  transport = createFetchTransport(apiKey),
}: CreateYnabClientOptions) => {
  const budgetPathPrefix = `/budgets/${budgetId}`;

  return {
    async loadAccounts(): Promise<BudgetAccount[]> {
      const response = await transport.request<YnabAccountsApiResponse>({
        method: "GET",
        path: `${budgetPathPrefix}/accounts`,
      });

      return response.data.accounts.map((account) => {
        return {
          name: account.name,
          accountId: account.id,
          balance: account.balance,
          transactions: [],
        };
      });
    },

    async fetchRecentTransactions(sinceDate: string): Promise<BudgetTransaction[]> {
      const encodedSinceDate = encodeURIComponent(sinceDate);
      const response = await transport.request<YnabTransactionsApiResponse>({
        method: "GET",
        path: `${budgetPathPrefix}/transactions?since_date=${encodedSinceDate}`,
      });

      return response.data.transactions.map(mapYnabTransactionToBudgetTransaction);
    },

    async createTransactions(
      transactions: BudgetTransaction[],
      { apply }: CreateTransactionsOptions,
    ): Promise<CreateTransactionsResult> {
      if (!apply) {
        return {
          createdCount: 0,
          skippedCount: transactions.length,
        };
      }

      if (transactions.length === 0) {
        return {
          createdCount: 0,
          skippedCount: 0,
        };
      }

      const payload = {
        transactions: transactions.map((transaction) => {
          return {
            account_id: transaction.accountId,
            amount: transaction.amount,
            date: transaction.date,
            memo: transaction.memo,
          };
        }),
      };

      const response = await transport.request<YnabCreateTransactionsApiResponse>({
        method: "POST",
        path: `${budgetPathPrefix}/transactions`,
        body: payload,
      });

      return {
        createdCount: response.data.transaction_ids.length,
        skippedCount: 0,
      };
    },
  };
};

export type { CreateTransactionsResult, YnabTransport };
