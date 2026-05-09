import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPriceTrackerFeedXml,
  buildPriceTrackerIndexPayload,
  classifyPrice,
  getLatestPriceTrackerPubDate,
  getPriceTrackerRecords,
  getPriceTrackerStats,
} from "@/lib/priceTracker";
import type { PriceTrackerRecord } from "@/lib/priceTracker";
import { buildPriceTrackerCsv, createPriceTrackerCsvFilename } from "@/lib/priceTrackerCsv";

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

  it("builds a machine-readable JSON payload for price signals", () => {
    const records = getPriceTrackerRecords(4);
    const generatedAt = new Date("2026-05-09T00:00:00Z");
    const payload = buildPriceTrackerIndexPayload(records, generatedAt);

    assert.equal(payload.schema_version, "1");
    assert.equal(payload.generated_at, "2026-05-09T00:00:00.000Z");
    assert.equal(payload.source, "https://tools.toolrouteai.com/price-tracker");
    assert.equal(payload.count, 4);
    assert.equal(payload.records.length, 4);
    assert.equal(payload.stats.total, 4);
    assert.ok(payload.latest_pub_date);
    assert.deepEqual(payload.latest_pub_date, getLatestPriceTrackerPubDate(records));
    assert.ok(payload.records.every((record) => record.id && record.price && record.price_kind));
  });

  it("builds a CSV export for price signals", () => {
    const records = getPriceTrackerRecords(2);
    const csv = buildPriceTrackerCsv(records);

    assert.match(csv, /^name,price,price_kind,source_site,source_url,category,pubDate,tags,description\n/);
    assert.match(csv, /https:\/\//);
    assert.equal(createPriceTrackerCsvFilename(new Date("2026-05-09T00:00:00Z")), "ai-tool-price-signals-2026-05-09.csv");
  });

  it("escapes CSV cells safely", () => {
    const record: PriceTrackerRecord = {
      id: "csv-test",
      name: "CSV Test",
      description: 'He said "ship it", then added a newline\nfor import testing.',
      source_site: "ai-tools-pro",
      source_url: "https://ai.toolrouteai.com/csv-test",
      tags: ["=formula", "pricing"],
      category: "Testing",
      pubDate: "2026-05-09",
      price: "$0,$10",
      price_kind: "Variable",
    };
    const csv = buildPriceTrackerCsv([record]);

    assert.match(csv, /"\$0,\$10"/);
    assert.match(csv, /,'=formula; pricing,/);
    assert.match(csv, /"He said ""ship it"", then added a newline\nfor import testing\."/);
  });
});
