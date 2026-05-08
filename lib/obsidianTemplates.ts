export type ObsidianScenarioId = "academic" | "project" | "reading";

export type ObsidianScenario = {
  id: ObsidianScenarioId;
  name: string;
  description: string;
  bestFor: string;
  files: string[];
};

export type TemplatePackOptions = {
  scenarioId: ObsidianScenarioId;
  vaultName: string;
  detailLevel: "lean" | "guided";
};

export type ObsidianTemplateFile = {
  filename: string;
  body: string;
};

export const obsidianScenarios: ObsidianScenario[] = [
  {
    id: "academic",
    name: "Academic research",
    description: "Literature notes, source triage, and synthesis prompts for research-heavy vaults.",
    bestFor: "Students, researchers, analysts",
    files: ["research-dashboard.md", "literature-note.md", "synthesis-note.md"],
  },
  {
    id: "project",
    name: "Project operating system",
    description: "A practical project hub with decision logs, weekly reviews, and task capture.",
    bestFor: "Operators, founders, consultants",
    files: ["project-dashboard.md", "decision-log.md", "weekly-review.md"],
  },
  {
    id: "reading",
    name: "Reading notes",
    description: "Book and article templates that turn highlights into durable ideas.",
    bestFor: "Creators, PKM users, newsletter writers",
    files: ["reading-dashboard.md", "book-note.md", "idea-distillation.md"],
  },
];

export function getObsidianScenario(id: ObsidianScenarioId) {
  return obsidianScenarios.find((scenario) => scenario.id === id) ?? obsidianScenarios[0];
}

export function buildObsidianTemplatePack(options: TemplatePackOptions) {
  const scenario = getObsidianScenario(options.scenarioId);
  const vaultName = sanitizeVaultName(options.vaultName);
  const detailLevel = options.detailLevel;
  const sections = buildObsidianTemplateFiles(options);

  return [
    `# ${scenario.name} template pack`,
    "",
    `Vault: ${vaultName}`,
    `Mode: ${detailLevel}`,
    "",
    "Copy each file block below into a separate Obsidian note.",
    "",
    ...sections.flatMap((section) => [
      `---`,
      `File: ${section.filename}`,
      `---`,
      "",
      section.body,
      "",
    ]),
  ].join("\n");
}

export function createTemplateFilename(options: TemplatePackOptions) {
  return `${slugify(getObsidianScenario(options.scenarioId).name)}-${slugify(
    sanitizeVaultName(options.vaultName),
  )}-template-pack.md`;
}

export function buildObsidianTemplateFiles(options: TemplatePackOptions): ObsidianTemplateFile[] {
  return buildScenarioSections(
    options.scenarioId,
    sanitizeVaultName(options.vaultName),
    options.detailLevel,
  );
}

function buildScenarioSections(
  scenarioId: ObsidianScenarioId,
  vaultName: string,
  detailLevel: "lean" | "guided",
): ObsidianTemplateFile[] {
  const guided = detailLevel === "guided";

  if (scenarioId === "academic") {
    return [
      {
        filename: "research-dashboard.md",
        body: [
          `# ${vaultName} research dashboard`,
          "",
          "## Active questions",
          "- ",
          "",
          "## Sources to process",
          "- [ ] ",
          "",
          "## Current synthesis",
          guided ? "- Claim:" : "- ",
          guided ? "- Evidence:" : "",
          guided ? "- Counterpoint:" : "",
          "",
          "## Next review",
          "- Date:",
          "- Decision needed:",
        ].filter(Boolean).join("\n"),
      },
      {
        filename: "literature-note.md",
        body: [
          "---",
          "type: literature-note",
          "status: inbox",
          "tags: [research]",
          "---",
          "",
          "# {{title}}",
          "",
          "## Citation",
          "- Author:",
          "- Year:",
          "- Link:",
          "",
          "## Core idea",
          guided ? "What is the paper or article really saying in one plain sentence?" : "- ",
          "",
          "## Useful evidence",
          "- ",
          "",
          "## My take",
          guided ? "- Agree:" : "- ",
          guided ? "- Doubt:" : "",
          guided ? "- Use in:" : "",
        ].filter(Boolean).join("\n"),
      },
      {
        filename: "synthesis-note.md",
        body: [
          "# Synthesis: {{topic}}",
          "",
          "## Working answer",
          "- ",
          "",
          "## Evidence map",
          "| Source | Supports | Weakens | Note |",
          "| --- | --- | --- | --- |",
          "|  |  |  |  |",
          "",
          "## Open loops",
          "- ",
        ].join("\n"),
      },
    ];
  }

  if (scenarioId === "project") {
    return [
      {
        filename: "project-dashboard.md",
        body: [
          `# ${vaultName} project dashboard`,
          "",
          "## Outcome",
          "- ",
          "",
          "## This week",
          "- [ ] ",
          "",
          "## Risks",
          guided ? "| Risk | Signal | Mitigation | Owner |" : "- ",
          guided ? "| --- | --- | --- | --- |" : "",
          guided ? "|  |  |  |  |" : "",
          "",
          "## Decision log",
          "- [[decision-log]]",
        ].filter(Boolean).join("\n"),
      },
      {
        filename: "decision-log.md",
        body: [
          "# Decision log",
          "",
          "## {{date}} - {{decision}}",
          "- Context:",
          "- Options considered:",
          "- Decision:",
          "- Revisit when:",
        ].join("\n"),
      },
      {
        filename: "weekly-review.md",
        body: [
          "# Weekly review - {{date}}",
          "",
          "## Shipped",
          "- ",
          "",
          "## Blocked",
          "- ",
          "",
          "## Next bets",
          "- [ ] ",
          "",
          guided ? "## One thing to simplify" : "",
          guided ? "- " : "",
        ].filter(Boolean).join("\n"),
      },
    ];
  }

  return [
    {
      filename: "reading-dashboard.md",
      body: [
        `# ${vaultName} reading dashboard`,
        "",
        "## Now reading",
        "- ",
        "",
        "## Ideas to reuse",
        "- ",
        "",
        "## Writing candidates",
        "- ",
      ].join("\n"),
    },
    {
      filename: "book-note.md",
      body: [
        "---",
        "type: book-note",
        "status: reading",
        "tags: [reading]",
        "---",
        "",
        "# {{title}}",
        "",
        "## Why I picked this up",
        "- ",
        "",
        "## Three useful ideas",
        "1. ",
        "2. ",
        "3. ",
        "",
        "## Quotes worth keeping",
        "- ",
        "",
        "## What this changes",
        guided ? "- In my work:" : "- ",
        guided ? "- In my writing:" : "",
      ].filter(Boolean).join("\n"),
    },
    {
      filename: "idea-distillation.md",
      body: [
        "# Idea distillation: {{idea}}",
        "",
        "## Raw note",
        "- ",
        "",
        "## Cleaner version",
        "- ",
        "",
        "## Where it could be used",
        "- Article:",
        "- Project:",
        "- Conversation:",
      ].join("\n"),
    },
  ];
}

function sanitizeVaultName(value: string) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  return trimmed || "My Obsidian Vault";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 56);
}
