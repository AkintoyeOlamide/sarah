import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { EngineError, RecommendationEngine } from "./engine.ts";

const platforms = JSON.parse(
  readFileSync(new URL("../data/platforms.json", import.meta.url), "utf8"),
) as unknown[];

function engine() {
  return new RecommendationEngine(structuredClone(platforms));
}

describe("in-browser recommendation engine", () => {
  it("ranks specialists for phones, cars, tables, houses, and shoes", () => {
    const local = engine();

    const phones = local.recommend("genuine iPhone with warranty", 5);
    assert.equal(phones.detected_category?.name, "Mobile phones and accessories");
    assert.ok(phones.results.some((item) => item.id === "slot-ng"));

    const cars = local.recommend("tokunbo Toyota Corolla in Lagos", 5);
    assert.equal(cars.detected_category?.name, "Automotive and used cars");
    assert.ok(cars.results.some((item) => ["jiji-ng", "cars45", "autochek", "elizade-toyota"].includes(item.id)));

    const tables = local.recommend("table", 5);
    assert.equal(tables.detected_category?.name, "Home and furniture");
    assert.ok(tables.results.length > 0);
    assert.ok(tables.results.some((item) => item.categories.includes("Home and furniture")));

    const houses = local.recommend("house", 5);
    assert.equal(houses.detected_category?.name, "Houses and property");
    assert.ok(houses.results.some((item) => item.id === "propertypro"));

    const shoes = local.recommend("shoe", 5);
    assert.equal(shoes.detected_category?.name, "Fashion and clothing");
    assert.ok(shoes.results.some((item) => item.id === "fashpa" || item.id === "payporte"));

    const pets = local.recommend("dog", 5);
    assert.equal(pets.detected_category?.name, "Animals and pets");
    assert.ok(pets.results.some((item) => item.categories.includes("Animals and pets")));

    const power = local.recommend("electricity", 8);
    assert.equal(power.detected_category?.name, "Utilities and bills");
    assert.ok(power.results.some((item) => item.categories.includes("Utilities and bills")));
  });

  it("ships more than 200 websites", () => {
    assert.ok(platforms.length > 200);
  });

  it("still offers shopping sites when the word is not in the catalog", () => {
    const result = engine().recommend("zzzzwidget", 5);
    assert.ok(result.results.length > 0);
    assert.equal(result.message, null);
    assert.ok(result.results.some((item) => item.categories.includes("General shopping")));
  });

  it("rejects blank queries and limits top_k", () => {
    const local = engine();
    assert.throws(() => local.recommend("   "), EngineError);
    assert.throws(() => local.recommend(12), EngineError);
    assert.throws(() => local.recommend("laptop", 0), EngineError);
    const vague = local.recommend("and the", 3);
    assert.deepEqual(vague.results, []);
    assert.ok(vague.message);
    assert.equal(local.recommend("laptop", 2).count, 2);
  });

  it("indexes a platform added in memory", () => {
    const local = engine();
    const created = local.addPlatform({
      id: "quartz-shop",
      name: "Quartz Shop",
      url: "https://example.com/quartz",
      tagline: "A fixture store for the test suite",
      description: "Sells the unique xylophonequartz instrument and nothing else.",
      categories: ["General shopping"],
      keywords: ["xylophonequartz", "quartz instrument", "unique fixture"],
      strengths: ["Only catalog entry for this fixture term"],
      coverage: "Test only",
      verification_notes: "Temporary platform created by the automated test.",
    });
    assert.equal(created.id, "quartz-shop");
    assert.equal(local.recommend("xylophonequartz", 3).results[0].id, "quartz-shop");
    local.deletePlatform("quartz-shop");
    assert.equal(
      local.recommend("xylophonequartz", 3).results.some((item) => item.id === "quartz-shop"),
      false,
    );
  });

  it("ranks furniture websites when the wording is tables", () => {
    const result = engine().recommend("tables now now", 5);
    assert.ok(result.results.length > 0);
    assert.equal(result.query, "tables now now");
    assert.equal(result.detected_category?.name, "Home and furniture");
    assert.ok(result.results.some((item) => item.categories.includes("Home and furniture")));
  });
});
