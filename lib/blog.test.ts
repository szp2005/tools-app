import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getBlogArticles, getBlogSlugs } from "./blog";

const expectedSlugs = [
  "how-to-use-prompt-optimizer-effectively",
  "ai-tool-comparison-guide-for-solopreneurs",
  "obsidian-template-best-practices",
  "ai-tool-price-monitoring-strategy",
  "finding-the-right-side-hustle-with-ai",
].sort();

describe("blog articles", () => {
  it("exposes the five N5 tutorial slugs", () => {
    assert.deepEqual(getBlogSlugs(), expectedSlugs);
  });

  it("meets content depth and CTA requirements", () => {
    const articles = getBlogArticles();
    assert.equal(articles.length, 5);

    for (const article of articles) {
      assert.ok(article.wordCount >= 1500, `${article.slug} is too short: ${article.wordCount}`);
      assert.ok(article.wordCount <= 2000, `${article.slug} is too long: ${article.wordCount}`);
      assert.ok(article.h2Count >= 3, `${article.slug} needs at least 3 H2 headings`);
      assert.ok(article.h3Count >= 5, `${article.slug} needs at least 5 H3 headings`);
      assert.match(article.toolHref, /^\/[a-z0-9-]+/);
      assert.match(article.ogImage, /^\/og-.+\.png$/);
      assert.ok(article.featureList.length >= 3);
      assert.ok(article.keywords.length >= 3);
    }
  });
});
