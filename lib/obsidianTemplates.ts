export type ObsidianScenarioId = "academic" | "project" | "reading" | "creative";

export type ObsidianPreference = "markdown" | "dataview" | "templater";

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
  preference: ObsidianPreference;
};

export type ObsidianTemplateFile = {
  filename: string;
  body: string;
};

export const obsidianPreferences: Array<{
  id: ObsidianPreference;
  name: string;
  description: string;
}> = [
  {
    id: "markdown",
    name: "Pure Markdown",
    description: "Portable templates that work in any Markdown notes app.",
  },
  {
    id: "dataview",
    name: "Dataview",
    description: "Adds Dataview query blocks for dashboard-style vaults.",
  },
  {
    id: "templater",
    name: "Templater",
    description: "Adds Templater variables for date and note creation flow.",
  },
];

export const obsidianScenarios: ObsidianScenario[] = [
  {
    id: "academic",
    name: "Academic research",
    description: "Literature notes, source triage, and synthesis workflows for research-heavy vaults.",
    bestFor: "Students, researchers, analysts",
    files: [
      "README.md",
      "00-Dashboard/research-dashboard.md",
      "01-Sources/literature-note.md",
      "01-Sources/source-triage.md",
      "02-Synthesis/synthesis-note.md",
      "03-Reviews/weekly-research-review.md",
    ],
  },
  {
    id: "project",
    name: "Project management",
    description: "A practical project hub with decision logs, risk registers, and weekly reviews.",
    bestFor: "Operators, founders, consultants",
    files: [
      "README.md",
      "00-Dashboard/project-dashboard.md",
      "01-Planning/project-brief.md",
      "02-Logs/decision-log.md",
      "02-Logs/risk-register.md",
      "03-Reviews/weekly-review.md",
    ],
  },
  {
    id: "reading",
    name: "Reading notes",
    description: "Book and article templates that turn highlights into durable ideas.",
    bestFor: "Creators, PKM users, newsletter writers",
    files: [
      "README.md",
      "00-Dashboard/reading-dashboard.md",
      "01-Notes/book-note.md",
      "01-Notes/article-note.md",
      "02-Ideas/idea-distillation.md",
      "02-Ideas/quote-bank.md",
    ],
  },
  {
    id: "creative",
    name: "Creative workflow",
    description: "Idea capture, draft briefs, publishing checklists, and creative retrospectives.",
    bestFor: "Writers, YouTubers, indie makers",
    files: [
      "README.md",
      "00-Dashboard/creative-dashboard.md",
      "01-Ideas/idea-capture.md",
      "02-Drafts/draft-brief.md",
      "03-Publishing/publishing-checklist.md",
      "04-Reviews/creative-retrospective.md",
    ],
  },
];

export function getObsidianScenario(id: ObsidianScenarioId) {
  return obsidianScenarios.find((scenario) => scenario.id === id) ?? obsidianScenarios[0];
}

export function getObsidianPreference(id: ObsidianPreference) {
  return obsidianPreferences.find((preference) => preference.id === id) ?? obsidianPreferences[0];
}

export function buildObsidianTemplatePack(options: TemplatePackOptions) {
  const scenario = getObsidianScenario(options.scenarioId);
  const preference = getObsidianPreference(options.preference);
  const vaultName = sanitizeVaultName(options.vaultName);
  const files = buildObsidianTemplateFiles(options);

  return [
    `# ${scenario.name} template pack`,
    "",
    `Vault: ${vaultName}`,
    `Preference: ${preference.name}`,
    "Source: notes-automate + pkm-insights Obsidian/PKM content index",
    "",
    "## Folder structure",
    "",
    ...files.map((file) => `- ${file.filename}`),
    "",
    "## File blocks",
    "",
    ...files.flatMap((file) => [
      "---",
      `File: ${file.filename}`,
      "---",
      "",
      file.body,
      "",
    ]),
  ].join("\n");
}

export function createTemplateFilename(options: TemplatePackOptions) {
  return `${slugify(getObsidianScenario(options.scenarioId).name)}-${slugify(
    sanitizeVaultName(options.vaultName),
  )}-${options.preference}-template-pack.md`;
}

export function createTemplateZipFilename(options: TemplatePackOptions) {
  return `${slugify(getObsidianScenario(options.scenarioId).name)}-${slugify(
    sanitizeVaultName(options.vaultName),
  )}-${options.preference}-template-pack.zip`;
}

export function buildObsidianTemplateFiles(options: TemplatePackOptions): ObsidianTemplateFile[] {
  const vaultName = sanitizeVaultName(options.vaultName);

  switch (options.scenarioId) {
    case "academic":
      return buildAcademicPack(vaultName, options.preference);
    case "project":
      return buildProjectPack(vaultName, options.preference);
    case "reading":
      return buildReadingPack(vaultName, options.preference);
    case "creative":
      return buildCreativePack(vaultName, options.preference);
    default:
      return buildProjectPack(vaultName, options.preference);
  }
}

function buildAcademicPack(vaultName: string, preference: ObsidianPreference): ObsidianTemplateFile[] {
  return [
    readmeFile(vaultName, "Academic research", preference, [
      "Capture sources quickly",
      "Turn literature notes into synthesis notes",
      "Review open research questions weekly",
    ]),
    {
      filename: "00-Dashboard/research-dashboard.md",
      body: [
        ...frontmatter("research-dashboard", ["research", "dashboard"], preference),
        `# ${vaultName} research dashboard`,
        "",
        "## Active questions",
        "- ",
        "",
        "## Sources to process",
        "- [ ] ",
        "",
        "## Current synthesis",
        "- Claim:",
        "- Evidence:",
        "- Counterpoint:",
        "",
        ...dataviewBlock(preference, 'TABLE status, year, link FROM "01-Sources" SORT file.mtime DESC'),
      ].join("\n"),
    },
    {
      filename: "01-Sources/literature-note.md",
      body: [
        ...frontmatter("literature-note", ["research", "source"], preference),
        "# {{title}}",
        "",
        "## Citation",
        "- Author:",
        "- Year:",
        "- Link:",
        "",
        "## Core idea",
        "- ",
        "",
        "## Useful evidence",
        "- ",
        "",
        "## My take",
        "- Agree:",
        "- Doubt:",
        "- Use in:",
      ].join("\n"),
    },
    {
      filename: "01-Sources/source-triage.md",
      body: [
        ...frontmatter("source-triage", ["research", "inbox"], preference),
        "# Source triage - {{topic}}",
        "",
        "## Keep",
        "- ",
        "",
        "## Reject",
        "- ",
        "",
        "## Follow up",
        "- [ ] ",
      ].join("\n"),
    },
    {
      filename: "02-Synthesis/synthesis-note.md",
      body: [
        ...frontmatter("synthesis-note", ["research", "synthesis"], preference),
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
    {
      filename: "03-Reviews/weekly-research-review.md",
      body: weeklyReviewBody("Weekly research review", preference, ["Sources processed", "Claims clarified", "Next searches"]),
    },
  ];
}

function buildProjectPack(vaultName: string, preference: ObsidianPreference): ObsidianTemplateFile[] {
  return [
    readmeFile(vaultName, "Project management", preference, [
      "Keep one dashboard per project",
      "Log decisions before they disappear",
      "Review risks and next bets weekly",
    ]),
    {
      filename: "00-Dashboard/project-dashboard.md",
      body: [
        ...frontmatter("project-dashboard", ["project", "dashboard"], preference),
        `# ${vaultName} project dashboard`,
        "",
        "## Outcome",
        "- ",
        "",
        "## This week",
        "- [ ] ",
        "",
        "## Risks",
        "| Risk | Signal | Mitigation | Owner |",
        "| --- | --- | --- | --- |",
        "|  |  |  |  |",
        "",
        ...dataviewBlock(preference, 'TASK FROM "01-Planning" OR "02-Logs" WHERE !completed SORT file.mtime DESC'),
      ].join("\n"),
    },
    {
      filename: "01-Planning/project-brief.md",
      body: [
        ...frontmatter("project-brief", ["project", "planning"], preference),
        "# Project brief - {{project}}",
        "",
        "## Goal",
        "- ",
        "",
        "## Constraints",
        "- Budget:",
        "- Time:",
        "- Dependencies:",
        "",
        "## First milestone",
        "- [ ] ",
      ].join("\n"),
    },
    {
      filename: "02-Logs/decision-log.md",
      body: [
        ...frontmatter("decision-log", ["project", "decision"], preference),
        `# Decision log - ${dateToken(preference)}`,
        "",
        "- Context:",
        "- Options considered:",
        "- Decision:",
        "- Revisit when:",
      ].join("\n"),
    },
    {
      filename: "02-Logs/risk-register.md",
      body: [
        ...frontmatter("risk-register", ["project", "risk"], preference),
        "# Risk register",
        "",
        "| Risk | Probability | Impact | Mitigation | Owner |",
        "| --- | --- | --- | --- | --- |",
        "|  |  |  |  |  |",
      ].join("\n"),
    },
    {
      filename: "03-Reviews/weekly-review.md",
      body: weeklyReviewBody("Weekly project review", preference, ["Shipped", "Blocked", "Next bets"]),
    },
  ];
}

function buildReadingPack(vaultName: string, preference: ObsidianPreference): ObsidianTemplateFile[] {
  return [
    readmeFile(vaultName, "Reading notes", preference, [
      "Capture book and article notes",
      "Extract ideas into a reusable idea bank",
      "Turn quotes into future writing inputs",
    ]),
    {
      filename: "00-Dashboard/reading-dashboard.md",
      body: [
        ...frontmatter("reading-dashboard", ["reading", "dashboard"], preference),
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
        "",
        ...dataviewBlock(preference, 'TABLE status, author FROM "01-Notes" SORT file.mtime DESC'),
      ].join("\n"),
    },
    {
      filename: "01-Notes/book-note.md",
      body: [
        ...frontmatter("book-note", ["reading", "book"], preference),
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
        "## What this changes",
        "- In my work:",
        "- In my writing:",
      ].join("\n"),
    },
    {
      filename: "01-Notes/article-note.md",
      body: [
        ...frontmatter("article-note", ["reading", "article"], preference),
        "# {{title}}",
        "",
        "- Link:",
        "- Author:",
        "",
        "## Argument",
        "- ",
        "",
        "## Reusable ideas",
        "- ",
      ].join("\n"),
    },
    {
      filename: "02-Ideas/idea-distillation.md",
      body: [
        ...frontmatter("idea-distillation", ["idea", "writing"], preference),
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
    {
      filename: "02-Ideas/quote-bank.md",
      body: [
        ...frontmatter("quote-bank", ["reading", "quote"], preference),
        "# Quote bank",
        "",
        "| Quote | Source | Why it matters |",
        "| --- | --- | --- |",
        "|  |  |  |",
      ].join("\n"),
    },
  ];
}

function buildCreativePack(vaultName: string, preference: ObsidianPreference): ObsidianTemplateFile[] {
  return [
    readmeFile(vaultName, "Creative workflow", preference, [
      "Capture raw ideas before they are polished",
      "Move drafts through a clear publishing checklist",
      "Review what shipped and what should be reused",
    ]),
    {
      filename: "00-Dashboard/creative-dashboard.md",
      body: [
        ...frontmatter("creative-dashboard", ["creative", "dashboard"], preference),
        `# ${vaultName} creative dashboard`,
        "",
        "## Idea inbox",
        "- ",
        "",
        "## Active drafts",
        "- [ ] ",
        "",
        "## Ready to publish",
        "- [ ] ",
        "",
        ...dataviewBlock(preference, 'TABLE status, channel FROM "02-Drafts" SORT file.mtime DESC'),
      ].join("\n"),
    },
    {
      filename: "01-Ideas/idea-capture.md",
      body: [
        ...frontmatter("idea-capture", ["creative", "idea"], preference),
        "# Idea - {{title}}",
        "",
        "- Trigger:",
        "- Audience:",
        "- Promise:",
        "- Example:",
        "- Next step:",
      ].join("\n"),
    },
    {
      filename: "02-Drafts/draft-brief.md",
      body: [
        ...frontmatter("draft-brief", ["creative", "draft"], preference),
        "# Draft brief - {{title}}",
        "",
        "## Hook",
        "- ",
        "",
        "## Outline",
        "1. ",
        "2. ",
        "3. ",
        "",
        "## Assets needed",
        "- ",
      ].join("\n"),
    },
    {
      filename: "03-Publishing/publishing-checklist.md",
      body: [
        ...frontmatter("publishing-checklist", ["creative", "publishing"], preference),
        "# Publishing checklist",
        "",
        "- [ ] Title is specific",
        "- [ ] First screen has a clear promise",
        "- [ ] Links and references checked",
        "- [ ] Repurpose note created",
      ].join("\n"),
    },
    {
      filename: "04-Reviews/creative-retrospective.md",
      body: weeklyReviewBody("Creative retrospective", preference, ["Published", "Learned", "Reuse next"]),
    },
  ];
}

function readmeFile(
  vaultName: string,
  scenarioName: string,
  preference: ObsidianPreference,
  operatingRules: string[],
): ObsidianTemplateFile {
  return {
    filename: "README.md",
    body: [
      `# ${vaultName} - ${scenarioName} pack`,
      "",
      `Preference: ${getObsidianPreference(preference).name}`,
      "",
      "## How to use",
      "1. Drop these folders into your Obsidian vault.",
      "2. Duplicate templates when creating new notes.",
      "3. Keep dashboard files pinned for weekly review.",
      "",
      "## Operating rules",
      ...operatingRules.map((rule) => `- ${rule}`),
    ].join("\n"),
  };
}

function weeklyReviewBody(
  title: string,
  preference: ObsidianPreference,
  sections: string[],
): string {
  return [
    ...frontmatter("weekly-review", ["review"], preference),
    `# ${title} - ${dateToken(preference)}`,
    "",
    ...sections.flatMap((section) => [`## ${section}`, "- ", ""]),
  ].join("\n").trimEnd();
}

function frontmatter(type: string, tags: string[], preference: ObsidianPreference): string[] {
  return [
    "---",
    `type: ${type}`,
    `created: ${dateToken(preference)}`,
    `tags: [${tags.join(", ")}]`,
    "---",
    "",
  ];
}

function dataviewBlock(preference: ObsidianPreference, query: string): string[] {
  if (preference !== "dataview") {
    return [];
  }

  return ["## Dataview", "```dataview", query, "```", ""];
}

function dateToken(preference: ObsidianPreference) {
  return preference === "templater" ? '<% tp.date.now("YYYY-MM-DD") %>' : "{{date}}";
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
