import { describe, expect, it } from "bun:test";

import { bankParserMapValue, bankParserNamesValue, getBankParser, isBankParserName } from "./registry";

describe("parser registry", () => {
  it("exposes a readonly map with registered parsers", () => {
    expect(Object.isFrozen(bankParserMapValue)).toBe(true);
    expect(Object.isFrozen(bankParserNamesValue)).toBe(true);
    expect(bankParserNamesValue).toEqual(["macquarie"]);
  });

  it("resolves registered parser names", () => {
    expect(isBankParserName("macquarie")).toBe(true);
    expect(typeof getBankParser("macquarie")).toBe("function");
  });

  it("throws for unsupported parser names", () => {
    expect(() => getBankParser("unknown")).toThrow("Unsupported parser");
  });
});
