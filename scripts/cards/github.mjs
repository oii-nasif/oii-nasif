// The GitHub cards: a year of contributions, the streak, and a few totals.
// Fed by lib/github.mjs; redrawn every day by the workflow.

import { Ink, measure, n } from "../lib/type.mjs";
import { doc, card, vline } from "../lib/svg.mjs";
import { FULL, HALF } from "../lib/theme.mjs";

const caps = (s) => s.toUpperCase();
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const day = (iso) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;
const dayYear = (iso) => `${day(iso)} ${iso.slice(0, 4)}`;
const num = (v) => v.toLocaleString("en-US");
const range = (from, to) => (from === to ? dayYear(to) : from.slice(0, 4) === to.slice(0, 4) ? `${day(from)} – ${dayYear(to)}` : `${dayYear(from)} – ${dayYear(to)}`);

/** 53 weeks of contributions, coloured with GitHub's own quartile levels. */
export function heatmap(t, gh) {
  const W = FULL;
  const H = 244;
  const PAD = 29;
  const ink = new Ink();
  const LABELS = 34; // room for the weekday labels
  const PITCH = (W - 2 * PAD - LABELS) / gh.weeks.length;
  const CELL = PITCH - 2; // a 2px gap between cells does the separating
  const gx = PAD + LABELS + 2;
  const gy = 98;
  let body = card(t, W, H);

  // Headline.
  const total = num(gh.lastYear);
  body += ink.text(total, { x: PAD - 1, y: 60, face: "figureL", size: 38, fill: t.text });
  body += ink.text("contributions in the last 12 months", { x: PAD + measure(total, "figureL", 38) + 11, y: 60, face: "body", size: 13.5, fill: t.text2 });
  const first = gh.weeks[0][0].date;
  body += ink.text(caps(`${dayYear(first)} – ${dayYear(gh.today)}`), { x: W - PAD, y: 58, face: "mono", size: 9, tracking: 0.1, fill: t.text3, anchor: "end" });

  // Weekday and month labels.
  ["Mon", "Wed", "Fri"].forEach((d, i) => {
    body += ink.text(d, { x: PAD, y: gy + (1 + i * 2) * PITCH + CELL - 2.2, face: "mono", size: 8.5, fill: t.text3 });
  });
  let lastMonth = -1;
  let lastLabelX = -99;
  gh.weeks.forEach((week, w) => {
    const m = Number(week[0].date.slice(5, 7)) - 1;
    const x = gx + w * PITCH;
    if (m !== lastMonth && x - lastLabelX > 30 && w < gh.weeks.length - 1) {
      body += ink.text(MONTHS[m], { x, y: gy - 8, face: "mono", size: 8.5, fill: t.text3 });
      lastLabelX = x;
    }
    lastMonth = m;
  });

  // Cells, one group per week so the year can fade in left to right.
  let active = 0;
  let best = { count: 0, date: gh.today };
  gh.weeks.forEach((week, w) => {
    let col = "";
    week.forEach((d) => {
      const row = new Date(`${d.date}T00:00:00Z`).getUTCDay();
      if (d.count > 0) active++;
      if (d.count > best.count) best = d;
      col += `<rect x="${n(gx + w * PITCH)}" y="${n(gy + row * PITCH)}" width="${n(CELL)}" height="${n(CELL)}" rx="2.5" fill="${t.heat[d.level]}"/>`;
    });
    body += `<g class="wk" style="animation-delay:${(w * 0.016).toFixed(3)}s">${col}</g>`;
  });

  // Footer: what the year amounted to, and the scale.
  const fy = H - 23;
  body += ink.text(caps(`${active} active days · busiest ${day(best.date)}, ${best.count} contributions`), { x: PAD, y: fy, face: "mono", size: 9, tracking: 0.1, fill: t.text3 });
  let lx = W - PAD;
  body += ink.text("More", { x: lx, y: fy, face: "mono", size: 8.5, fill: t.text3, anchor: "end" });
  lx -= measure("More", "mono", 8.5) + 6;
  for (let i = 4; i >= 0; i--) {
    lx -= CELL;
    body += `<rect x="${n(lx)}" y="${n(fy - CELL + 1.5)}" width="${n(CELL)}" height="${n(CELL)}" rx="2.5" fill="${t.heat[i]}"/>`;
    lx -= 2;
  }
  body += ink.text("Less", { x: lx - 4, y: fy, face: "mono", size: 8.5, fill: t.text3, anchor: "end" });

  const css = `.wk{animation:wk .5s ease-out both}@keyframes wk{from{opacity:0}}`;
  const label = `${total} contributions in the last 12 months, on ${active} active days. Busiest day: ${dayYear(best.date)}, with ${best.count}.`;
  return { w: W, h: H, svg: doc({ w: W, h: H, ink, css, body, label }) };
}

/** Current and longest streak, over a 30-day strip. */
export function streak(t, gh) {
  const W = HALF;
  const H = 178;
  const PAD = 25;
  const ink = new Ink();
  const { current, longest } = gh;
  const split = 218;
  let body = card(t, W, H);

  const big = (value, x, label, period, strong) => {
    let s = ink.text(caps(label), { x, y: 41, face: "monoBold", size: 9.5, tracking: 0.12, fill: strong ? t.accentInk : t.text3 });
    const size = strong ? 44 : 30;
    const face = strong ? "figureL" : "figure";
    const v = String(value);
    s += ink.text(v, { x: x - 1, y: 88, face, size, fill: t.text });
    s += ink.text(value === 1 ? "day" : "days", { x: x + measure(v, face, size) + 7, y: 88, face: "body", size: 13, fill: t.text2 });
    s += ink.text(caps(period), { x, y: 107, face: "mono", size: 8.6, tracking: 0.08, fill: t.text3 });
    return s;
  };
  body += big(current.days, PAD, "Current streak", current.days ? range(current.from, current.to) : "No commits today yet", true);
  body += vline(split - 16.5, 30, 110, t.line);
  body += big(longest.days, split, "Longest streak", longest.days ? range(longest.from, longest.to) : "–", false);

  // The last 30 days as thin bars on a shared baseline.
  const base = H - 24;
  const maxH = 24;
  const slot = (W - 2 * PAD) / gh.last30.length;
  const peak = Math.max(1, ...gh.last30.map((d) => d.count));
  gh.last30.forEach((d, i) => {
    const x = PAD + i * slot;
    const bw = slot - 3;
    if (d.count === 0) {
      body += `<rect x="${n(x)}" y="${base - 2}" width="${n(bw)}" height="2" rx="1" fill="${t.line2}"/>`;
    } else {
      const h = Math.max(4, (d.count / peak) * maxH);
      body += `<path class="bar" style="animation-delay:${(0.3 + i * 0.02).toFixed(2)}s" d="M${n(x)} ${base}V${n(base - h + 2)}q0-2 2-2H${n(x + bw - 2)}q2 0 2 2V${base}Z" fill="${t.accentInk}"/>`;
    }
  });

  const css = `.bar{transform-box:fill-box;transform-origin:bottom;animation:bar .6s cubic-bezier(.22,1,.36,1) both}@keyframes bar{from{transform:scaleY(0)}}`;
  const label = `Current streak: ${current.days} days. Longest streak: ${longest.days} days${longest.days ? `, ${range(longest.from, longest.to)}` : ""}.`;
  return { w: W, h: H, svg: doc({ w: W, h: H, ink, css, body, label }) };
}

/** Four totals, each labelled with exactly what it counts. */
export function totals(t, gh) {
  const W = HALF;
  const H = 178;
  const PAD = 25;
  const ink = new Ink();
  const items = [
    { value: num(gh.allTime), label: `Contributions since ${gh.since}` },
    { value: num(gh.publicRepos), label: "Public repositories" },
    { value: num(gh.stars), label: "Stars earned" },
    { value: num(gh.followers), label: "Followers" },
  ];
  const colW = (W - 2 * PAD) / 2;
  let body = card(t, W, H);
  items.forEach((item, i) => {
    const x = PAD + (i % 2) * colW + (i % 2 ? 12 : 0);
    const y = i < 2 ? 62 : 136;
    body += ink.text(item.value, { x: x - 1, y, face: "figure", size: 30, fill: t.text });
    body += ink.text(caps(item.label), { x, y: y + 18, face: "mono", size: 8.6, tracking: 0.08, fill: t.text3 });
  });
  body += vline(PAD + colW - 4.5, 30, H - 30, t.line);
  body += `<path d="M${PAD} ${H / 2 + 0.5}H${W - PAD}" stroke="${t.line}"/>`;
  const label = items.map((i) => `${i.label}: ${i.value}`).join(". ") + ".";
  return { w: W, h: H, svg: doc({ w: W, h: H, ink, body, label }) };
}
