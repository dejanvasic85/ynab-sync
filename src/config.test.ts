import { describe, expect, it } from "bun:test";

import { parseCliOptions, parseLocalConfig } from "./config";

describe("config", () => {
  it("parses apply CLI option", () => {
    expect(parseCliOptions([]).apply).toBe(false);
    expect(parseCliOptions(["--apply"]).apply).toBe(true);
    expect(parseCliOptions([]).dataDir).toBe("data");
    expect(parseCliOptions(["--data-dir", "fixtures"]).dataDir).toBe("fixtures");
  });

  it("throws when data-dir flag has no value", () => {
    expect(() => parseCliOptions(["--data-dir"])).toThrow("--data-dir requires a path value.");
  });

  it("validates required local config fields", () => {
    const parsed = parseLocalConfig({
      ynabApiKey: "token",
      ynabBudgetId: "budget",
      accounts: [{ fileName: "Visa - Macquarie.csv", ynabAccountId: "acc-id", negativeOnly: true }],
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
});
