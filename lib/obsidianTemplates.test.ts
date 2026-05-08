import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildObsidianTemplatePack,
  createTemplateFilename,
  obsidianScenarios,
} from "@/lib/obsidianTemplates";

describe("obsidian template pack", () => {
  it("exposes three scenarios", () => {
    assert.equal(obsidianScenarios.length, 3);
  });

  it("builds an academic pack with three file blocks", () => {
    const pack = buildObsidianTemplatePack({
      scenarioId: "academic",
      vaultName: "Research Lab",
      detailLevel: "guided",
    });

    assert.match(pack, /File: research-dashboard\.md/);
    assert.match(pack, /File: literature-note\.md/);
    assert.match(pack, /File: synthesis-note\.md/);
    assert.match(pack, /Vault: Research Lab/);
  });

  it("creates a safe markdown filename", () => {
    assert.equal(
      createTemplateFilename({
        scenarioId: "reading",
        vaultName: "Creator Notes!",
        detailLevel: "lean",
      }),
      "reading-notes-creator-notes-template-pack.md",
    );
  });
});
