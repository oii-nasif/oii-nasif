// Draws every graphic in the README, once per theme, into assets/.
//
//   npm run build            everything, with live numbers from GitHub
//   npm run build:static     no network: reuse the numbers saved in data/github.json
//
// The live build needs a token in GH_TOKEN or GITHUB_TOKEN (any token that can
// read public data will do). .github/workflows/profile.yml runs it every day.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { themes } from "./lib/theme.mjs";
import { fetchGitHub, fetchFeed } from "./lib/github.mjs";
import * as content from "./content.mjs";
import { hero } from "./cards/hero.mjs";
import { heading, pill, closing } from "./cards/chrome.mjs";
import { career } from "./cards/career.mjs";
import { flagship } from "./cards/flagship.mjs";
import { project, blurbLines, stackCard, stackRows, credential, post, titleLines } from "./cards/tiles.mjs";
import { heatmap, streak, totals } from "./cards/github.mjs";

const ROOT = new URL("../", import.meta.url);
const OUT = new URL("assets/", ROOT);
const DATA = new URL("data/github.json", ROOT);
const README = new URL("README.md", ROOT);
const offline = process.argv.includes("--offline");

const written = [];
async function emit(name, render) {
  for (const theme of Object.values(themes)) {
    const { svg } = render(theme);
    const file = `${name}-${theme.name}.svg`;
    await writeFile(new URL(file, OUT), svg);
    written.push({ file, bytes: Buffer.byteLength(svg) });
  }
}

// --- Numbers -----------------------------------------------------------------

async function loadGitHub() {
  if (!offline) {
    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    if (!token) throw new Error("Set GH_TOKEN (or GITHUB_TOKEN), or run `npm run build:static`.");
    const gh = await fetchGitHub(content.profile.login, token);
    await mkdir(new URL("./", DATA), { recursive: true });
    await writeFile(DATA, `${JSON.stringify(gh, null, 1)}\n`);
    return gh;
  }
  return JSON.parse(await readFile(DATA, "utf8"));
}

// --- Writing: the newest posts from the blog's feed ---------------------------

const POSTS = new URL("data/posts.json", ROOT);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

async function loadPosts() {
  let posts;
  if (offline) {
    posts = JSON.parse(await readFile(POSTS, "utf8"));
  } else {
    try {
      posts = await fetchFeed(content.profile.feed, 4);
      await writeFile(POSTS, `${JSON.stringify(posts, null, 1)}\n`);
    } catch (err) {
      console.warn(`Feed unavailable (${err.message}); keeping the saved posts.`);
      posts = JSON.parse(await readFile(POSTS, "utf8"));
    }
  }
  // Tiles sit two to a row, so show an even number when there is more than one.
  const count = posts.length >= 4 ? 4 : posts.length >= 2 ? 2 : posts.length;
  return posts.slice(0, count).map((p) => ({
    ...p,
    dateLabel: `${Number(p.date.slice(8))} ${MONTHS[Number(p.date.slice(5, 7)) - 1]} ${p.date.slice(0, 4)}`,
  }));
}

const attr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Rewrite the block between the writing markers in README.md. */
async function syncWriting(posts) {
  const tiles = posts
    .map(
      (p, i) =>
        `  <a href="${attr(p.link)}"><picture><source media="(prefers-color-scheme: dark)" srcset="assets/post-${i + 1}-dark.svg"><img src="assets/post-${i + 1}-light.svg" width="412" alt="${attr(`${p.title}. ${p.dateLabel}.`)}"></picture></a>`,
    )
    .join("\n");
  const readme = await readFile(README, "utf8");
  const next = readme.replace(/(<!-- writing:start -->)[\s\S]*?(<!-- writing:end -->)/, `$1\n<p align="center">\n${tiles}\n</p>\n$2`);
  if (next !== readme) await writeFile(README, next);
}

// --- Draw --------------------------------------------------------------------

await mkdir(OUT, { recursive: true });
const gh = await loadGitHub();
// The career chart only needs to know which month it is.
const now = new Date(`${gh.today.slice(0, 7)}-15T00:00:00Z`);

await emit("hero", (t) => hero(t, content));
for (const s of content.sections) await emit(`h-${s.id}`, (t) => heading(t, s));
for (const l of content.links) await emit(`link-${l.id}`, (t) => pill(t, l));
await emit("career", (t) => career(t, content, now));
await emit("flagship", (t) => flagship(t, content));
const depth = Math.max(...content.projects.map(blurbLines));
for (const p of content.projects) await emit(`project-${p.id}`, (t) => project(t, p, gh.repos[p.repo]?.stars ?? 0, depth));
const rows = Math.max(...content.stack.map(stackRows));
for (const g of content.stack) await emit(`stack-${g.id}`, (t) => stackCard(t, g, rows));
for (const c of content.credentials) await emit(`cred-${c.id}`, (t) => credential(t, c));
await emit("gh-activity", (t) => heatmap(t, gh));
await emit("gh-streak", (t) => streak(t, gh));
await emit("gh-totals", (t) => totals(t, gh));
await emit("closing", (t) => closing(t, content.closing));

const posts = await loadPosts();
const titleDepth = Math.max(1, ...posts.map(titleLines));
for (const [i, p] of posts.entries()) await emit(`post-${i + 1}`, (t) => post(t, p, titleDepth));
await syncWriting(posts);

const total = written.reduce((sum, f) => sum + f.bytes, 0);
console.log(`${written.length} files, ${(total / 1024).toFixed(0)} KB${offline ? " (offline)" : ""}`);
