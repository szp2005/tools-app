import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAmazonSearchUrl,
  buildSideHustleUserPrompt,
  parseSideHustleIdeasJson,
  validateSideHustleInput,
} from "@/lib/sideHustle";

describe("side hustle ideas", () => {
  it("validates allowed inputs", () => {
    assert.deepEqual(
      validateSideHustleInput({ skill: "writing", time: "10h", budget: "500" }),
      { skill: "writing", time: "10h", budget: "500" },
    );
    assert.throws(() => validateSideHustleInput({ skill: "music", time: "10h", budget: "500" }));
  });

  it("builds Amazon affiliate search URLs", () => {
    assert.equal(
      buildAmazonSearchUrl("USB microphone", "toolrouteai-20"),
      "https://www.amazon.com/s?k=USB%20microphone&tag=toolrouteai-20",
    );
  });

  it("prompts for exactly three ideas and affiliate links", () => {
    const prompt = buildSideHustleUserPrompt(
      { skill: "programming", time: "5h", budget: "0" },
      "toolrouteai-20",
    );

    assert.match(prompt, /Generate exactly 3 side-hustle ideas/);
    assert.match(prompt, /Include at least two Amazon affiliate links/);
    assert.match(prompt, /toolrouteai-20/);
  });

  it("normalizes model JSON and adds affiliate coverage", () => {
    const result = parseSideHustleIdeasJson(
      JSON.stringify({
        ideas: [
          {
            title: "Automation audit service",
            fit: "Good for a programmer with little time.",
            income_range: "$300-$1200/month",
            startup_path: ["Pick a niche", "Audit one workflow", "Send a sample", "Close a fixed offer"],
            tools: [],
            risks: ["Clients may not know their process well."],
          },
          {
            title: "Tiny internal tool builds",
            fit: "Small scoped builds match a 5h/week schedule.",
            income_range: "$500-$2000/month",
            startup_path: ["Collect pains", "Build one demo", "Ask for intros", "Sell maintenance"],
            tools: [],
            risks: ["Scope creep can erase margins."],
          },
          {
            title: "Spreadsheet cleanup packages",
            fit: "Operations-heavy but coding helps automate repeat work.",
            income_range: "$200-$900/month",
            startup_path: ["Find messy sheets", "Create before/after examples", "Package fixes", "Ask for referrals"],
            tools: [],
            risks: ["Data privacy needs clear boundaries."],
          },
        ],
      }),
      "programming",
      "toolrouteai-20",
    );
    const links = result.ideas.flatMap((idea) => idea.tools).map((tool) => tool.amazon_url);

    assert.equal(result.ideas.length, 3);
    assert.ok(links.filter((url) => url.includes("amazon.com") && url.includes("tag=toolrouteai-20")).length >= 2);
  });
});
