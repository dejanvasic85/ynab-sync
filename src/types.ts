export interface BankAccount {
  name: string;
  balance: number;
  transactions: BankTransaction[];
}

export interface BankTransaction {
  amount: number;
  category: string;
  date: string;
  description: string;
}

export interface BudgetTransaction {
  date: string;
  amount: number;
  memo: string;
  accountId: string;
}

export interface BudgetAccount {
  name: string;
  accountId: string;
  balance: number;
  transactions: BudgetTransaction[];
}

export interface AccountConfig {
  fileName: string;
  ynabAccountId: string;
  negativeOnly: boolean;
}

export interface LocalConfig {
  ynabApiKey: string;
  ynabBudgetId: string;
  accounts: AccountConfig[];
  memosToIgnore: string[];
  numberOfDaysToFetch: number;
  includeOnlyAfterDays: number;
}

export interface CliOptions {
  apply: boolean;
  dataDir: string;
}
