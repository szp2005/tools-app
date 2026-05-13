export const siteBaseUrl = "https://tools.toolrouteai.com";

export const supportedLocales = [
  { code: "en", label: "English", path: "/" },
  { code: "zh-CN", label: "中文", path: "/zh-cn" },
] as const;

export const zhCnSubscribeCopy = {
  label: "每周 AI 工具简报",
  description: "每周发一封，整理可直接用的 AI 工具、prompt 和独立运营工作流。",
  placeholder: "you@example.com",
  ariaLabel: "邮箱地址",
  button: "订阅",
  loading: "订阅中...",
  success: "订阅成功。下一期会发到你的邮箱。",
  already: "已订阅过",
  error: "订阅失败，请稍后再试",
  invalidEmail: "请输入有效邮箱地址。",
};

export const zhCnToolCards = [
  {
    name: "Prompt Optimizer",
    description: "把粗糙需求改成结构清晰、可直接丢给 ChatGPT / Claude / Gemini 的提示词。",
    status: "已上线",
    href: "/zh-cn/prompt-optimizer",
  },
  {
    name: "Comparison Builder",
    description: "从内容库里检索工具资料，生成 AI 工具对比表，并支持 Markdown / PDF 下载。",
    status: "已上线",
    href: "/zh-cn/comparison",
  },
  {
    name: "Obsidian Template Generator",
    description: "按学术、项目、读书、创作场景生成可下载的 Obsidian 模板包。",
    status: "已上线",
    href: "/zh-cn/obsidian-templates",
  },
  {
    name: "Price Tracker",
    description: "跟踪主流 AI 工具价格页与价格变动信号，先做人工校验的轻量版本。",
    status: "MVP",
    href: "/zh-cn/price-tracker",
  },
  {
    name: "Side Hustle Ideas",
    description: "根据技能、每周时间和预算，生成 3 个可执行的副业测试方案。",
    status: "已上线",
    href: "/zh-cn/side-hustle-ideas",
  },
];

export const zhCnObsidianLinks = [
  {
    name: "学术研究模板",
    description: "文献笔记、研究仪表盘、综述整理和论文推进工作流。",
    href: "/obsidian-templates/academic",
  },
  {
    name: "项目管理模板",
    description: "项目看板、决策记录、周复盘和一人公司运营流程。",
    href: "/obsidian-templates/project",
  },
  {
    name: "读书笔记模板",
    description: "书摘、文章捕捉、卡片笔记和知识沉淀结构。",
    href: "/obsidian-templates/reading",
  },
  {
    name: "创作工作流模板",
    description: "选题捕捉、草稿 brief、发布清单和复盘模板。",
    href: "/obsidian-templates/creative",
  },
];
