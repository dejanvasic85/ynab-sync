# ynab-sync

Import Macquarie CSV transactions into YNAB via a Bun CLI.

## Install

```bash
bun install
```

## Local config

Create `config/local.json` with your real values:

```json
{
  "ynabApiKey": "replace-with-ynab-token",
  "ynabBudgetId": "replace-with-ynab-budget-id",
  "accounts": [
    {
      "fileName": "sample-credit-card.csv",
      "ynabAccountId": "replace-with-ynab-account-id",
      "negativeOnly": true
    },
    {
      "fileName": "sample-offset-account.csv",
      "ynabAccountId": "replace-with-ynab-account-id",
      "negativeOnly": false
    }
  ],
  "memosToIgnore": [],
  "numberOfDaysToFetch": 120,
  "includeOnlyAfterDays": 60
}
```

The root `config` folder is gitignored because it can contain sensitive local config and CSV input files.

## CSV import command

```bash
bun run index.ts csv [--data-dir <path>] [--dry-run]
```

- Default `--data-dir` is `config`.
- Apply mode is default (writes to YNAB).
- Use `--dry-run` to parse/reconcile and print summary without creating transactions.

Examples:

```bash
# Dry run from default config directory
bun run index.ts csv --dry-run

# Apply mode from custom data directory
bun run index.ts csv --data-dir data
```

## Verify

```bash
bun test
```
