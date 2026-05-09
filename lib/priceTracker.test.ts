import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
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
});
