import { describe, expect, it } from "bun:test";
import { join } from "node:path";

import { parseMacquarieCsvFile } from "./macquarieCsv";

describe("parseMacquarieCsvFile", () => {
  it("parses records after the includeOnlyAfter date", async () => {
    const parsed = await parseMacquarieCsvFile({
      accountName: "Macquarie Visa",
      filePath: join(import.meta.dir, "__fixtures__/macquarie.csv"),
      includeOnlyAfter: new Date("2025-09-01T00:00:00.000Z"),
    });

    expect(parsed.name).toBe("Macquarie Visa");
    expect(parsed.transactions).toHaveLength(2);
    expect(parsed.transactions[0]).toEqual({
      amount: -5.2,
      category: "Food",
      date: "2025-10-15",
      description: "Coffee Shop",
    });
    expect(parsed.transactions[1]).toEqual({
      amount: 2500,
      category: "Income",
      date: "2025-10-14",
      description: "Salary",
    });
    expect(parsed.balance).toBe(1240);
  });

  it("throws when file is missing", async () => {
    await expect(
      parseMacquarieCsvFile({
        accountName: "Macquarie Visa",
        filePath: "/tmp/does-not-exist.csv",
        includeOnlyAfter: new Date("2025-09-01T00:00:00.000Z"),
      }),
    ).rejects.toThrow("CSV file not found");
  });
});
