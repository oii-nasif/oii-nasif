// Everything the graphics say. Edit here, run `npm run build`, commit.
// Keep it in step with nasif.tech (src/data/*.ts in the portfolio repo).

export const profile = {
  login: "oii-nasif",
  name: "Nasif Ishtiaque Islam",
  role: "Senior Software Engineer",
  company: "Brain Station 23",
  status: "Open to backend & platform roles",
  location: "Dhaka, Bangladesh · Remote-friendly",
  // The line from the nasif.tech home page.
  tagline: ["I build the backend systems nobody sees,", "and photograph the birds most people walk past."],
  site: "https://www.nasif.tech",
  feed: "https://www.nasif.tech/rss.xml",
  // Cycles in the hero, the way a camera's mode dial would.
  modes: ["backend engineer", ".NET specialist", "distributed-systems builder", "weekend photographer"],
  // Shown along the bottom of the hero, like a camera's readout.
  readout: [
    { value: "4+", label: "years in industry" },
    { value: "150+", label: "API endpoints" },
    { value: "4", label: "enterprise platforms" },
    { value: "6", label: "certifications" },
  ],
};

export const links = [
  { id: "site", label: "nasif.tech", primary: true },
  { id: "resume", label: "Résumé" },
  { id: "blog", label: "Blog" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "email", label: "Email" },
];

export const sections = [
  { id: "experience", no: "01", title: "Experience", aside: "at Brain Station 23", note: "Jan 2022 – now" },
  { id: "flagship", no: "02", title: "Flagship", aside: "the platform I lead backend on", note: "Client work · Mar 2024 – now" },
  { id: "projects", no: "03", title: "Projects", aside: "built after hours", note: "Open source" },
  { id: "stack", no: "04", title: "Stack", aside: "what I reach for", note: ".NET · Azure · SQL" },
  { id: "credentials", no: "05", title: "Credentials", aside: "exams and contests", note: "2017 – 2026" },
  { id: "github", no: "06", title: "GitHub", aside: "lately", note: "Refreshed daily" },
  { id: "writing", no: "07", title: "Writing", aside: "from nasif.tech", note: "Blog" },
];

// Roles are contiguous: each runs from `from` to the next one's `from`.
// Months are "YYYY-MM"; `to` on a project is inclusive, null means ongoing.
export const career = {
  company: "Brain Station 23",
  headline: ["Trainee to Senior", "in under five years."],
  roles: [
    { title: "Trainee Software Engineer", from: "2022-01", period: "Jan – Sep 2022" },
    { title: "Associate Software Engineer · IC1A", from: "2022-10", period: "Oct 2022 – Jun 2023" },
    { title: "Associate Software Engineer · IC1B", from: "2023-07", period: "Jul 2023 – Jun 2024" },
    { title: "Software Engineer II", from: "2024-07", period: "Jul 2024 – Sep 2026" },
    { title: "Senior Software Engineer I", from: "2026-10", period: "Oct 2026 – now" },
  ],
  projects: [
    { name: "NISSAN Owner's Manual", from: "2022-06", to: "2022-12" },
    { name: "LEADRS", from: "2022-12", to: "2023-08" },
    { name: "SAFVIC Systems", from: "2023-07", to: "2024-02" },
    { name: "MJH Risk Monitor · ClarusRisk Dashboard", from: "2024-03", to: null },
  ],
};

export const flagship = {
  name: "MJH Risk Monitor",
  alias: "ClarusRisk Dashboard",
  summary: "Risk monitoring and portfolio management for institutional asset managers.",
  figures: [
    { value: "150+", label: "REST endpoints" },
    { value: "40+", label: "controllers" },
    { value: "243", label: "domain entities" },
    { value: "5", label: "regulatory frameworks" },
  ],
  stages: [
    { no: "01", title: "Access & tenancy", lines: ["SAML 2.0 single sign-on", "JWT, permission-based auth", "RBAC across tenants"] },
    { no: "02", title: "API layer", lines: ["ASP.NET Core on .NET 10", "Clean Architecture", "Redis caching layer"] },
    { no: "03", title: "Risk & compliance", lines: ["VaR, liquidity stress tests", "PRIIPS · AIFM · SFDR", "UCITS · MiFID II reporting"] },
    { no: "04", title: "Real-time & delivery", lines: ["Live portfolio monitoring", "SignalR · Hangfire on Redis", "PDF pipeline, SFTP delivery"] },
  ],
};

// `repo` pulls live stars from GitHub at build time.
export const projects = [
  {
    id: "chartwell",
    repo: "ChartWell",
    name: "ChartWell",
    kicker: ".NET MAUI · Android",
    blurb:
      "A private, offline-first health record for Android. Medicines, vitals, doctor visits and about 100 lab tests in 13 panels, with on-device OCR. Nothing leaves the phone unless you ask.",
    stack: [".NET MAUI 9", "C#", "SQLite", "SkiaSharp", "xUnit"],
  },
  {
    id: "wednesday-united",
    repo: "WednesdayUnited",
    name: "Wednesday United",
    kicker: "Full-stack · In production",
    live: true,
    blurb:
      "Runs a real weekly football club: sign-ups, team sheets, payment verification and an append-only ledger. Every rule is enforced inside Postgres, with row-level security.",
    stack: ["React 19", "TypeScript", "TanStack", "Supabase", "Vitest"],
  },
  {
    id: "sentinelops",
    repo: "SentinelOps-AI",
    name: "SentinelOps AI",
    kicker: "Multi-agent · SRE",
    live: true,
    blurb:
      "An incident commander built from seven agents. They read the logs, reason to a root cause, size the blast radius, then stop for human sign-off before writing the post-mortem.",
    stack: ["TypeScript", "Gemini SDK", "JSON schemas", "Cloud Run"],
  },
  {
    id: "misconfigured",
    repo: "misconfigured-dp700",
    name: "Misconfigured",
    kicker: "Microsoft Fabric · DP-700",
    live: true,
    blurb:
      "Find the one faulty line in 32 broken Fabric artefacts. Drill, daily fault, a mock exam scored out of 1000, and a field guide, with 71 behavioural tests and no dependencies.",
    stack: ["Vanilla JS", "No dependencies", "node:test", "GitHub Pages"],
  },
];

export const stack = [
  {
    id: "backend",
    title: "Backend",
    kicker: "The core",
    items: ["C#", ".NET 10", "ASP.NET Core", "Web API", "MVC", "Clean Architecture", "EF Core", "Dapper", "MediatR", "SignalR", "Hangfire"],
  },
  {
    id: "data",
    title: "Data",
    kicker: "Storage & caching",
    items: ["SQL Server", "Query optimization", "Indexing", "Transactions", "PostgreSQL", "MySQL", "Redis", "Microsoft Fabric"],
  },
  {
    id: "cloud",
    title: "Cloud & DevOps",
    kicker: "Ship & observe",
    items: ["Azure App Services", "Azure Functions", "Azure Storage", "Azure AI Services", "GitHub Actions", "Azure DevOps", "Application Insights", "Serilog"],
  },
  {
    id: "edges",
    title: "Security, tests & UI",
    kicker: "Around the core",
    items: ["JWT", "ASP.NET Identity", "SAML 2.0 SSO", "RBAC", "xUnit", "NUnit", "Moq", "Angular", "TypeScript", "JavaScript", "Python"],
  },
];

export const credentials = [
  { id: "gh-200", code: "GH-200", name: "GitHub Actions", issuer: "GitHub", date: "Sep 2026" },
  { id: "dp-700", code: "DP-700", name: "Fabric Data Engineer Associate", issuer: "Microsoft", date: "May 2026" },
  { id: "ai-102", code: "AI-102", name: "Azure AI Engineer Associate", issuer: "Microsoft", date: "Jun 2024" },
  { id: "ai-900", code: "AI-900", name: "Azure AI Fundamentals", issuer: "Microsoft", date: "Dec 2023" },
  { id: "az-900", code: "AZ-900", name: "Azure Fundamentals", issuer: "Microsoft", date: "May 2023" },
  { id: "dp-900", code: "DP-900", name: "Azure Data Fundamentals", issuer: "Microsoft", date: "Oct 2022" },
  { id: "kaggle-agents", code: "AI Agents", name: "5-Day Intensive, with Google", issuer: "Kaggle · course", date: "Jul 2026" },
  { id: "icpc", code: "ICPC", name: "Honorable Mention, Dhaka Regional Preliminary", issuer: "Contest", date: "2018 · 2020" },
];

export const closing = {
  lines: ["Building something that has to", "survive real-world abuse?"],
  action: "Say hello",
};
