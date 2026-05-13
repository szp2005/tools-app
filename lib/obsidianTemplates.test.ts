import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildObsidianTemplateFiles,
  buildObsidianTemplatePack,
  createTemplateFilename,
  createTemplateZipFilename,
  obsidianScenarios,
} from "@/lib/obsidianTemplates";
import { createStoredZipBlob } from "@/lib/zip";

describe("obsidian template pack", () => {
  it("exposes four scenarios", () => {
    assert.deepEqual(obsidianScenarios.map((scenario) => scenario.id), [
      "academic",
      "project",
      "reading",
      "creative",
    ]);
  });

  it("builds an academic pack with at least five file blocks", () => {
    const pack = buildObsidianTemplatePack({
      scenarioId: "academic",
      vaultName: "Research Lab",
      preference: "dataview",
    });

    assert.match(pack, /File: 00-Dashboard\/research-dashboard\.md/);
    assert.match(pack, /File: 01-Sources\/literature-note\.md/);
    assert.match(pack, /File: 02-Synthesis\/synthesis-note\.md/);
    assert.match(pack, /Vault: Research Lab/);
    assert.match(pack, /```dataview/);
    assert.ok((pack.match(/File: /g) ?? []).length >= 5);
  });

  it("creates a safe markdown filename", () => {
    assert.equal(
      createTemplateFilename({
        scenarioId: "reading",
        vaultName: "Creator Notes!",
        preference: "markdown",
      }),
      "reading-notes-creator-notes-markdown-template-pack.md",
    );
    assert.equal(
      createTemplateZipFilename({
        scenarioId: "reading",
        vaultName: "Creator Notes!",
        preference: "markdown",
      }),
      "reading-notes-creator-notes-markdown-template-pack.zip",
    );
  });

  it("returns single-file exports for a project pack", () => {
    const files = buildObsidianTemplateFiles({
      scenarioId: "project",
      vaultName: "Ops",
      preference: "templater",
    });

    assert.ok(files.length >= 5);
    assert.deepEqual(files.map((file) => file.filename).slice(0, 3), [
      "README.md",
      "00-Dashboard/project-dashboard.md",
      "01-Planning/project-brief.md",
    ]);
    assert.match(files[1].body, /# Ops project dashboard/);
    assert.match(files[1].body, /<% tp\.date\.now\("YYYY-MM-DD"\) %>/);
  });

  it("creates a browser zip blob from template files", async () => {
    const files = buildObsidianTemplateFiles({
      scenarioId: "creative",
      vaultName: "Studio",
      preference: "markdown",
    });
    const blob = createStoredZipBlob(files);
    const bytes = new Uint8Array(await blob.arrayBuffer());

    assert.ok(files.length >= 5);
    assert.equal(blob.type, "application/zip");
    assert.deepEqual(Array.from(bytes.slice(0, 4)), [0x50, 0x4b, 0x03, 0x04]);
  });
});
