import { describe, expect, it } from "bun:test";

import { fromYnabMilliunits, toYnabMilliunits } from "./money";

describe("money", () => {
  it("converts decimal amount to YNAB milliunits", () => {
    expect(toYnabMilliunits(-129.48)).toBe(-129480);
  });

  it("converts YNAB milliunits back to decimal amount", () => {
    expect(fromYnabMilliunits(129480)).toBe(129.48);
  });
});
