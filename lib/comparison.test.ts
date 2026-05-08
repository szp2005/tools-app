import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildComparison, searchTools, validateComparisonIds } from "./comparison";

describe("comparison search", () => {
  it("returns at least five AI writing matches", () => {
    const results = searchTools("AI writing", 10);

    assert.ok(results.length >= 5);
    assert.ok(results.every((result) => result.id && result.name && result.description));
  });

  it("returns midjourney matches with safe ids", () => {
    const results = searchTools("midjourney", 10);

    assert.ok(results.length >= 1);
    assert.match(results[0].id, /^[a-z0-9-]+$/);
  });
});

describe("comparison build", () => {
  it("builds a matrix for selected ids", () => {
    const ids = searchTools("midjourney", 2).map((result) => result.id);
    const comparison = buildComparison(ids);

    assert.equal(comparison.tools.length, ids.length);
    assert.deepEqual(
      comparison.matrix.map((row) => row.dimension),
      ["Price", "Category", "Rating", "Source Site", "Tags"],
    );
    assert.ok(comparison.matrix.every((row) => row.values.length === ids.length));
  });

  it("rejects injected ids", () => {
    assert.throws(
      () => validateComparisonIds(["ai-tools-pro-safe-id", "../package.json"]),
      /lowercase letters/,
    );
  });
});
