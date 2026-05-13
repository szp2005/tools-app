import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildSiteHealthPayload } from "./siteHealth";

describe("site health payload", () => {
  it("summarizes tools, indexes, SEO pages, and feeds", () => {
    const payload = buildSiteHealthPayload(new Date("2026-05-09T00:00:00Z"));

    assert.equal(payload.schema_version, "1");
    assert.equal(payload.generated_at, "2026-05-09T00:00:00.000Z");
    assert.equal(payload.status, "ok");
    assert.equal(payload.site, "https://tools.toolrouteai.com");
    assert.equal(payload.tools.length, 4);
    assert.ok(payload.indexes.tools.total >= 600);
    assert.equal(payload.indexes.tools.source_sites, 4);
    assert.ok(payload.indexes.obsidian.total > 0);
    assert.ok(payload.indexes.price_tracker.total >= 200);
    assert.equal(payload.seo_pages.comparison_pairs, 4);
    assert.equal(payload.seo_pages.price_segments, 5);
    assert.equal(payload.seo_pages.obsidian_scenarios, 4);
    assert.equal(payload.tools[2].path, "/obsidian-templates");
    assert.match(payload.machine_feeds.price_tracker_rss, /feed\.xml$/);
    assert.match(payload.machine_feeds.price_tracker_json, /index\.json$/);
  });
});
