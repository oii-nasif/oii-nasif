// The flagship system as a four-stage pipeline, with a signal running through it.

import { Ink, wrap, n } from "../lib/type.mjs";
import { doc, card, hline } from "../lib/svg.mjs";
import { FULL } from "../lib/theme.mjs";

const W = FULL;
const PAD = 31;
const caps = (s) => s.toUpperCase();

export function flagship(t, { flagship: data }) {
  const ink = new Ink();
  const x0 = PAD;
  const x1 = W - PAD;
  let body = "";

  // Name and one-line summary.
  body += ink.text(caps(`${data.name} · ${data.alias}`), { x: x0, y: 43, face: "monoBold", size: 10, tracking: 0.12, fill: t.accentInk });
  body += ink.text(data.summary, { x: x0, y: 72, face: "title", size: 18.5, fill: t.text });

  // Headline figures.
  const fy = 96;
  const fw = (x1 - x0) / data.figures.length;
  body += hline(x0, x1, fy + 0.5, t.line);
  data.figures.forEach((f, i) => {
    const x = x0 + i * fw;
    if (i) body += `<path d="M${n(x - 18)} ${fy + 14}V${fy + 62}" stroke="${t.line}"/>`;
    body += ink.text(f.value, { x, y: fy + 45, face: "figure", size: 31, fill: t.text });
    body += ink.text(caps(f.label), { x, y: fy + 63, face: "mono", size: 9, tracking: 0.1, fill: t.text3 });
  });
  body += hline(x0, x1, fy + 78.5, t.line);

  // Pipeline.
  const ty = fy + 110; // track
  const colW = (x1 - x0) / data.stages.length;
  const trackEnd = x1;
  const trackLen = trackEnd - x0;
  body += hline(x0, trackEnd, ty, t.line2);
  body += `<path class="flow" d="M${x0} ${ty}H${n(trackEnd)}" fill="none" stroke="${t.accentInk}" stroke-width="2" stroke-linecap="round" stroke-dasharray="54 ${n(trackLen)}"/>`;

  let tallest = 0;
  data.stages.forEach((s, i) => {
    const x = x0 + i * colW;
    body += `<circle cx="${n(x + 5)}" cy="${ty}" r="5" fill="${t.card}" stroke="${t.text}" stroke-width="1.5"/>`;
    body += `<circle class="node n${i}" cx="${n(x + 5)}" cy="${ty}" r="2.4" fill="${t.accentInk}"/>`;
    body += ink.text(s.no, { x: x + 17, y: ty - 9, face: "monoBold", size: 9.5, tracking: 0.1, fill: t.text3 });
    body += ink.text(s.title, { x, y: ty + 30, face: "title", size: 15, fill: t.text });
    const lines = s.lines.flatMap((l) => wrap(l, "body", 12, colW - 22));
    body += ink.block(lines, { x, y: ty + 51, leading: 17.5, face: "body", size: 12, fill: t.text2 });
    tallest = Math.max(tallest, lines.length);
  });

  const H = Math.round(ty + 51 + (tallest - 1) * 17.5 + 30);
  const dur = 5.5;
  const css =
    `.flow{animation:flow ${dur}s linear infinite}@keyframes flow{from{stroke-dashoffset:54}to{stroke-dashoffset:${n(-trackLen)}}}` +
    `.node{opacity:.25;animation:node ${dur}s linear infinite}` +
    data.stages.map((_, i) => `.n${i}{animation-delay:${n((dur * (i * colW)) / (trackLen + 54) - 0.1)}s}`).join("") +
    `@keyframes node{0%,2%{opacity:.25;transform:scale(1)}6%{opacity:1}22%{opacity:1}34%,100%{opacity:.25}}`;

  const label =
    `${data.name} (${data.alias}): ${data.summary} ` +
    data.figures.map((f) => `${f.value} ${f.label}`).join(", ") +
    ". " +
    data.stages.map((s) => `${s.title}: ${s.lines.join(", ")}`).join(". ") +
    ".";
  return { w: W, h: H, svg: doc({ w: W, h: H, ink, css, body: card(t, W, H) + body, label }) };
}
