// Experience, drawn to scale: a staircase of roles over a time axis, with the
// client projects underneath. Widths are months, so the picture is the record.

import { Ink, measure, n } from "../lib/type.mjs";
import { doc, card, hline } from "../lib/svg.mjs";
import { FULL } from "../lib/theme.mjs";

const W = FULL;
const H = 372;
const X0 = 40;
const X1 = W - 40;
const BASE = 266; // the time axis
const RISER = 30;

const months = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  return y * 12 + (m - 1);
};
const caps = (s) => s.toUpperCase();

export function career(t, { career: data }, now = new Date()) {
  const ink = new Ink();
  const start = months(data.roles[0].from);
  const nowM = now.getUTCFullYear() * 12 + now.getUTCMonth() + 0.5;
  // Leave a little future on the axis so the current role has room to exist.
  const end = Math.max(Math.ceil((nowM + 4) / 3) * 3, start + 12);
  const xOf = (m) => X0 + ((m - start) / (end - start)) * (X1 - X0);
  const xNow = xOf(nowM);
  let body = card(t, W, H);

  // Headline in the open corner above the first steps.
  body += ink.text(data.headline[0], { x: X0, y: 62, face: "heading", size: 24, fill: t.text });
  body += ink.text(data.headline[1], { x: X0, y: 90, face: "serif", size: 25, fill: t.text2 });

  // Staircase.
  const steps = data.roles.map((role, i) => ({
    ...role,
    x: xOf(months(role.from)),
    xEnd: i + 1 < data.roles.length ? xOf(months(data.roles[i + 1].from)) : X1,
    y: BASE - RISER * (i + 1),
  }));
  const top = steps.at(-1);
  let outline = `M${n(X0)} ${BASE}`;
  for (const s of steps) outline += `V${n(s.y)}H${n(s.xEnd)}`;
  body += `<path d="${outline}V${BASE}Z" fill="${t.wash}"/>`;
  // The current role: solid up to today, hatched lightly into the future.
  body += `<rect x="${n(top.x)}" y="${n(top.y)}" width="${n(xNow - top.x)}" height="${n(BASE - top.y)}" fill="${t.accent}"/>`;
  body += `<rect x="${n(xNow)}" y="${n(top.y)}" width="${n(X1 - xNow)}" height="${n(BASE - top.y)}" fill="${t.accent}" fill-opacity=".28"/>`;
  const length = steps.reduce((sum, s) => sum + RISER + (s.xEnd - s.x), 0);
  body += `<path class="stair" d="${outline}" fill="none" stroke="${t.text}" stroke-width="1.6" stroke-linejoin="round" stroke-dasharray="${n(length + 4)}"/>`;

  // Role labels: tucked under each tread; the top one flies above its step.
  steps.forEach((s, i) => {
    const isTop = i === steps.length - 1;
    const period = caps(s.period);
    if (isTop) {
      const pw = measure(period, "mono", 9, 0.08);
      body += ink.text(s.title, { x: X1 - pw - 12, y: s.y - 12, face: "title", size: 14, fill: t.text, anchor: "end" });
      body += ink.text(period, { x: X1, y: s.y - 12, face: "mono", size: 9, tracking: 0.08, fill: t.accentInk, anchor: "end" });
    } else {
      const tw = measure(s.title, "title", 13.5);
      body += ink.text(s.title, { x: s.x + 10, y: s.y + 19.5, face: "title", size: 13.5, fill: t.text });
      body += ink.text(period, { x: s.x + 10 + tw + 11, y: s.y + 19, face: "mono", size: 9, tracking: 0.08, fill: t.text3 });
    }
  });

  // Today.
  body += `<circle class="pulse" cx="${n(xNow)}" cy="${n(top.y)}" r="4.5" fill="${t.accentInk}"/>`;
  body += `<circle cx="${n(xNow)}" cy="${n(top.y)}" r="4.5" fill="${t.text}" stroke="${t.card}" stroke-width="2"/>`;

  // Time axis.
  body += hline(X0, X1, BASE + 0.5, t.line2);
  for (let y = Math.ceil(start / 12); y * 12 < end; y++) {
    const x = xOf(y * 12);
    body += `<path d="M${n(x)} ${BASE}v6" stroke="${t.line2}"/>`;
    body += ink.text(String(y), { x: x + 5, y: BASE + 16, face: "mono", size: 9, tracking: 0.06, fill: t.text3 });
  }

  // Project lane: two rows so neighbours that overlap in time never collide.
  const laneY = [296, 326];
  body += ink.text("PROJECTS", { x: X0, y: laneY[0] + 6.5, face: "mono", size: 8.5, tracking: 0.1, fill: t.text3 });
  data.projects.forEach((p, i) => {
    const y = laneY[i % 2];
    const x = xOf(months(p.from));
    const live = p.to === null;
    const xe = live ? xNow : xOf(months(p.to) + 1);
    body += `<rect x="${n(x)}" y="${y}" width="${n(xe - x)}" height="6" rx="3" fill="${live ? t.accent : t.line2}"/>`;
    if (live) body += `<rect x="${n(xe)}" y="${y}" width="${n(X1 - xe)}" height="6" rx="3" fill="${t.accent}" fill-opacity=".28"/>`;
    body += ink.text(p.name, { x, y: y + 21, face: "bodyMed", size: 11.5, fill: live ? t.text : t.text2 });
  });

  const css =
    `.stair{animation:stair 2.2s cubic-bezier(.4,0,.2,1) .2s both}@keyframes stair{from{stroke-dashoffset:${n(length + 4)}}}` +
    `.pulse{transform-box:fill-box;transform-origin:center;animation:pulse 2.6s ease-out 2.4s infinite}` +
    `@keyframes pulse{0%{transform:scale(1);opacity:.55}70%,100%{transform:scale(3.2);opacity:0}}`;

  const label =
    `Career at ${data.company}: ` +
    data.roles.map((r) => `${r.title}, ${r.period}`).join("; ") +
    ". Projects: " +
    data.projects.map((p) => p.name).join(", ") +
    ".";
  return { w: W, h: H, svg: doc({ w: W, h: H, ink, css, body, label }) };
}
