import { describe, expect, it } from "bun:test";

import { parseCliOptions, parseLocalConfig } from "./config";

describe("config", () => {
  it("parses csv CLI options", () => {
    expect(parseCliOptions(["csv"]).command).toBe("csv");
    expect(parseCliOptions(["csv"]).apply).toBe(true);
    expect(parseCliOptions(["csv", "--dry-run"]).apply).toBe(false);
    expect(parseCliOptions(["csv"]).dataDir).toBe("config");
    expect(parseCliOptions(["csv", "--data-dir", "fixtures"]).dataDir).toBe("fixtures");
  });

  it("throws when data-dir flag has no value", () => {
    expect(() => parseCliOptions(["csv", "--data-dir"])).toThrow("--data-dir requires a path value.");
  });

  it("throws when command is missing or unsupported", () => {
    expect(() => parseCliOptions([])).toThrow("Usage: bun run index.ts csv [--data-dir <path>] [--dry-run]");
    expect(() => parseCliOptions(["sync"]))
      .toThrow("Usage: bun run index.ts csv [--data-dir <path>] [--dry-run]");
  });

  it("validates required local config fields", () => {
    const parsed = parseLocalConfig({
      ynabApiKey: "token",
      ynabBudgetId: "budget",
      accounts: [{ fileName: "sample-credit-card.csv", ynabAccountId: "acc-id", parser: "macquarie", negativeOnly: true }],
      memosToIgnore: [],
      numberOfDaysToFetch: 120,
      includeOnlyAfterDays: 60,
    });

    expect(parsed.accounts).toHaveLength(1);
    expect(parsed.ynabBudgetId).toBe("budget");
  });

  it("throws when local config is invalid", () => {
    expect(() => {
      parseLocalConfig({
        ynabApiKey: "",
        ynabBudgetId: "",
        accounts: [],
        memosToIgnore: [],
        numberOfDaysToFetch: 0,
        includeOnlyAfterDays: 0,
      });
    }).toThrow();
  });

  it("throws when account parser is unsupported", () => {
    expect(() => {
      parseLocalConfig({
        ynabApiKey: "token",
        ynabBudgetId: "budget",
        accounts: [{ fileName: "sample-credit-card.csv", ynabAccountId: "acc-id", parser: "unknown", negativeOnly: true }],
        memosToIgnore: [],
        numberOfDaysToFetch: 120,
        includeOnlyAfterDays: 60,
      });
    }).toThrow("Unsupported parser");
  });
});
