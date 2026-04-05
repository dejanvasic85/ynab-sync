<h1 align="center">ynab-sync</h1>

<p align="center">
  A Bun CLI that imports Macquarie CSV transactions into YNAB with reconciliation safeguards.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#tooling"><strong>Tooling</strong></a> ·
  <a href="#developing-and-running-locally"><strong>Developing and Running Locally</strong></a> ·
  <a href="#command-usage"><strong>Command Usage</strong></a>
</p>

<br/>

## Features

- CSV import via `csv` command
- Reconciliation against recent YNAB transactions (`existing`, `new`, `ignored`)
- Apply mode by default with explicit `--dry-run`
- Per-account and total import summaries
- Config-driven account mapping and memo ignore support
- Runtime config + CSV files isolated under ignored `config/`

## Tooling

- **Bun**: runtime, package manager, and test runner
- **TypeScript**: type-safe implementation
- **Zod**: runtime config validation
- **GitHub Actions**: CI for test + typecheck

## Why This Exists

This project migrates and simplifies a local CSV-to-YNAB workflow into a focused, maintainable CLI. It keeps sensitive values local while preserving safe reconciliation behavior for repeat imports.

## Developing and Running Locally

### Prerequisites

- Bun installed
- YNAB personal access token
- YNAB budget and account IDs

### Install

```bash
bun install
```

### Local config

Create `config/local.json`:

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

Put your CSV files in `config/` (or use a custom `--data-dir`).

## Command Usage

```bash
bun run index.ts csv [--data-dir <path>] [--dry-run]
```

- `--data-dir` defaults to `config`
- apply mode is default
- `--dry-run` skips YNAB writes and prints reconciliation summary only

### Recommended workflow

```bash
# 1) Validate changes first
bun run index.ts csv --dry-run

# 2) Apply if summary looks correct
bun run index.ts csv
```

## Config Reference

- `ynabApiKey`: YNAB API token
- `ynabBudgetId`: target budget ID
- `accounts[]`: map CSV file names to YNAB account IDs
- `accounts[].negativeOnly`: optional positive-amount filter per account
- `memosToIgnore[]`: exact memo values to ignore
- `numberOfDaysToFetch`: YNAB transaction lookback window
- `includeOnlyAfterDays`: CSV transaction date cutoff window

## Security

- `config/` is gitignored and intended for local-only config and bank CSV files
- never commit API tokens, account IDs, or raw financial CSV data

## Troubleshooting

- Missing config file: create `config/local.json` with the schema above
- CSV not found: verify `accounts[].fileName` and `--data-dir`
- Account mismatch: verify each `ynabAccountId` exists in your budget
- Unexpected duplicates: run `--dry-run` and inspect `existing`/`new` counts

## Verify

```bash
bun test
bun run typecheck
```
