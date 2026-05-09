import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPriceTrackerFeedXml,
  classifyPrice,
  getPriceTrackerRecords,
  getPriceTrackerStats,
} from "@/lib/priceTracker";

describe("price tracker index", () => {
  it("extracts priced records from all source sites", () => {
    const records = getPriceTrackerRecords();
    const stats = getPriceTrackerStats(records);

    assert.ok(records.length >= 200);
    assert.equal(stats.sources, 4);
    assert.ok(stats.free > 0);
    assert.ok(stats.monthly > 0);
  });

  it("classifies common price formats", () => {
    assert.equal(classifyPrice("Free (Open Weights)"), "Free");
    assert.equal(classifyPrice("$39-$149/month"), "Monthly");
    assert.equal(classifyPrice("Custom enterprise pricing"), "Enterprise");
    assert.equal(classifyPrice("$1600-$2000"), "One-time");
  });

  it("builds an RSS feed for price signals", () => {
    const records = getPriceTrackerRecords(3);
    const feed = buildPriceTrackerFeedXml(records);

    assert.match(feed, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
    assert.match(feed, /<rss version="2.0">/);
    assert.match(feed, /<title>AI Tool Price Tracker<\/title>/);
    assert.match(feed, /tools-price:/);
    assert.match(feed, /Price signal:/);
  });
});
