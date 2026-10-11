import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatScore, initials, isBlankQuery, searchHref, splitList } from "./format.ts";

describe("search formatting", () => {
  it("formats cosine similarity as a percentage", () => {
    assert.equal(formatScore(0.482), "48.2%");
    assert.equal(formatScore(1.4), "100.0%");
    assert.equal(formatScore(-0.2), "0.0%");
    assert.equal(formatScore(Number.NaN), "0.0%");
  });

  it("builds a results link and rejects blank searches", () => {
    assert.equal(isBlankQuery("   "), true);
    assert.equal(isBlankQuery("rice"), false);
    assert.equal(searchHref("  fresh rice  "), "/results?q=fresh%20rice");
  });

  it("builds initials and splits comma-separated lists", () => {
    assert.equal(initials("Jumia Nigeria"), "JN");
    assert.equal(initials("Konga"), "K");
    assert.equal(initials("   "), "S");
    assert.deepEqual(splitList(" phones, Phones, solar inverter, "), [
      "phones",
      "solar inverter",
    ]);
  });
});
