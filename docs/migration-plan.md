# Ynab Sync Migration Plan (Macquarie Only)

## Goals
- Migrate Macquarie CSV import flow from `banksy` into `ynab-sync` as a Bun CLI.
- Prevent migration of sensitive values (API keys, account IDs, bank details, memo ignore lists, local data).
- Keep behavior-compatible where safe, while modernizing the structure for Bun.

## Non-Goals
- Multi-bank support in phase 1.
- Reusing hardcoded runtime values from `banksy`.
- Copying `.env`, `data/`, ignored memo lists, or account IDs from the old repository.

## Security and Data Safety Requirements
- Do not copy literal values from:
  - legacy `accountsConfig`
  - legacy `memosToIgnore`
  - `.env` values
  - `banksy/data/*`
- All sensitive/runtime values must be loaded at runtime from a local config file.
- Runtime config file must be gitignored.
- Dry-run must be default; writes to YNAB require explicit `--apply`.
- Add checks before commit to ensure no sensitive literals were introduced.

## Runtime Config Strategy (Local Only)
- Single source of runtime truth: local JSON config file.
- No SSM, no S3, no cloud config backends.
- Suggested path: `./config/local.json` (gitignored).
- Suggested template path: `./config/local.example.json` (safe to commit).

Required runtime values:
- `ynabApiKey`
- `ynabBudgetId`
- account mapping (`csv file/account key -> ynab account id`)
- `memosToIgnore[]`
- parser options (date range, negative-only behavior)

## Multi-Phase Execution Plan

## Phase Progress
- [x] Phase 0: Baseline and Guardrails
- [x] Phase 1: Domain and Reconciliation Core
- [ ] Phase 2: Macquarie CSV Parser
- [ ] Phase 3: YNAB Client Layer
- [ ] Phase 4: Bun CLI Command
- [ ] Phase 5: Secret and Data Leak Checks
- [ ] Phase 6: Docs and Onboarding

### Phase 0: Baseline and Guardrails
- Scaffold `src/` for CLI architecture.
- Add strict config validation (Zod) for local config file shape.
- Add `dry-run` default and explicit `--apply` flag.
- Add logging redaction for sensitive fields.

Deliverable:
- CLI boots, validates config, and performs no writes by default.

### Phase 1: Domain and Reconciliation Core
- Port and adapt:
  - transaction/account types
  - money conversion helpers (YNAB milliunits)
  - reconciliation logic (new/existing/ignored)
- Ensure no hardcoded account IDs or ignore memos in source.

Deliverable:
- Pure logic covered with `bun test`.

### Phase 2: Macquarie CSV Parser
- Port Macquarie parser behavior from `banksy`.
- Keep date and amount normalization compatible.
- Keep parser pure and typed.

Deliverable:
- Parser tests with CSV fixtures.

### Phase 3: YNAB Client Layer
- Build YNAB wrapper for:
  - loading account metadata
  - fetching recent transactions
  - creating transactions
- Keep side effects behind interfaces for testability.

Deliverable:
- Unit tests with mocks and dry-run integration path.

### Phase 4: Bun CLI Command
- Implement `import-csv` command:
  - read local runtime config
  - parse CSV
  - reconcile
  - print summary
  - apply writes only with `--apply`
- Include summary counters:
  - parsed
  - ignored
  - existing
  - new
  - created (apply only)

Deliverable:
- End-to-end local run with dry-run summary.

### Phase 5: Secret and Data Leak Checks
- Add pre-commit checks:
  - scan staged changes for obvious secrets/token patterns
  - grep for known legacy account IDs and memo literals
- Verify local config file is not tracked.

Deliverable:
- Clean git status with no sensitive data committed.

### Phase 6: Docs and Onboarding
- Update `README.md` with:
  - local config setup
  - dry-run/apply workflow
  - sample command usage
  - troubleshooting for CSV and account mapping

Deliverable:
- Safe onboarding path for local usage.

## Acceptance Criteria
- Macquarie CSV import works in dry-run and apply modes.
- No hardcoded account IDs/memo ignore lists in committed source.
- No secrets or local bank data tracked by git.
- Tests pass via Bun.

## Rollout Checklist
- [ ] Create `config/local.json` from committed example template
- [ ] Run dry-run and verify reconciliation output
- [ ] Run apply for narrow date range
- [ ] Confirm created transactions in YNAB
- [ ] Re-run same CSV to verify no duplicates
