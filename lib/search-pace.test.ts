import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isSingleWordSearch,
  searchPassGaps,
  searchPassLines,
  searchResultLimit,
} from "./search-pace.ts";

describe("search pace", () => {
  it("gives a single word a longer pass and more results", () => {
    assert.equal(isSingleWordSearch("dog"), true);
    assert.equal(isSingleWordSearch("tables now now"), true);
    assert.equal(isSingleWordSearch("genuine iPhone"), false);
    assert.equal(searchResultLimit("dog"), 12);
    assert.equal(searchResultLimit("house in Lagos"), 8);
    const single = searchPassGaps("shoe");
    const phrase = searchPassGaps("tokunbo Toyota Corolla");
    assert.ok(single.reduce((sum, gap) => sum + gap, 0) > phrase.reduce((sum, gap) => sum + gap, 0));
  });

  it("reveals the catalog pass one line at a time", () => {
    const early = searchPassLines({
      query: "dog",
      step: 0,
      detectedCategory: null,
      resultCount: null,
    });
    assert.equal(early.length, 1);
    assert.match(early[0], /our websites/);

    const done = searchPassLines({
      query: "dog",
      step: 2,
      detectedCategory: "Animals and pets",
      resultCount: 12,
    });
    assert.equal(done.length, 3);
    assert.match(done[0], /our websites/);
    assert.match(done[1], /Animals and pets/);
    assert.match(done[2], /closest websites are ready/);
    assert.doesNotMatch(done.join(" "), /\d/);
  });
});
