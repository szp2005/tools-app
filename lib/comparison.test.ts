import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildComparison, searchTools, validateComparisonIds } from "./comparison";
import { buildStaticComparisonPage, comparisonPages, getComparisonPage } from "./comparisonPages";

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

  it("requires at least two unique ids", () => {
    assert.throws(
      () => validateComparisonIds(["ai-tools-pro-safe-id"]),
      /at least two unique/,
    );
    assert.throws(
      () => validateComparisonIds(["ai-tools-pro-safe-id", "ai-tools-pro-safe-id"]),
      /at least two unique/,
    );
  });

  it("builds static comparison SEO pages", () => {
    assert.ok(comparisonPages.length >= 16);
    assert.ok(getComparisonPage("midjourney-vs-dall-e-3"));
    assert.ok(getComparisonPage("claude-3-5-sonnet-vs-gpt-4o"));
    assert.ok(getComparisonPage("obsidian-dataview-vs-templater"));
    assert.equal(getComparisonPage("missing-pair"), undefined);

    for (const page of comparisonPages) {
      const comparison = buildStaticComparisonPage(page);

      assert.equal(comparison.tools.length, 2);
      assert.ok(comparison.matrix.length >= 5);
      assert.ok(page.summary.length > 200);
      assert.ok(page.bestFor.length >= 3);
      assert.ok(page.decisionGuide.length >= 2);
      assert.ok(page.faqs.length >= 2);
      assert.deepEqual(
        comparison.tools.map((tool) => tool.id),
        page.ids,
      );
    }
  });
});
