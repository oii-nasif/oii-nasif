// The half- and quarter-width tiles: projects, stack groups, credentials.

import { Ink, measure, wrap, clamp, drawable, n } from "../lib/type.mjs";
import { doc, card, arrowOut, star, chips } from "../lib/svg.mjs";
import { HALF, QUARTER } from "../lib/theme.mjs";

const caps = (s) => s.toUpperCase();
const PAD = 25; // content inset from the image edge on half-width tiles

const BLURB = { face: "body", size: 12.6, leading: 18.6 };

/** How many lines a project's blurb needs, so every card can share a height. */
export const blurbLines = (p) => wrap(p.blurb, BLURB.face, BLURB.size, HALF - 2 * PAD).length;

/** A project. `stars` comes from GitHub at build time; `rows` is the blurb depth to leave room for. */
export function project(t, p, stars = 0, rows = blurbLines(p)) {
  const W = HALF;
  const H = Math.round(99 + (rows - 1) * BLURB.leading + 24 + 21 + 24);
  const ink = new Ink();
  const x1 = W - PAD;
  let body = card(t, W, H);

  body += ink.text(caps(p.kicker), { x: PAD, y: 41, face: "monoBold", size: 9.5, tracking: 0.12, fill: t.accentInk });

  // Top right, from the edge inwards: open arrow, stars, live.
  body += arrowOut(x1, 31, 8.5, t.text3);
  let rx = x1 - 22;
  if (stars > 0) {
    const label = String(stars);
    const lw = measure(label, "monoBold", 10, 0.04);
    body += ink.text(label, { x: rx, y: 41, face: "monoBold", size: 10, tracking: 0.04, fill: t.text2, anchor: "end" });
    body += star(rx - lw - 9, 37.2, 5.2, t.accent === t.accentInk ? t.accent : t.accentInk);
    rx -= lw + 28;
  }
  if (p.live) {
    const lw = measure("LIVE", "monoBold", 9.5, 0.12);
    body += ink.text("LIVE", { x: rx, y: 41, face: "monoBold", size: 9.5, tracking: 0.12, fill: t.text2, anchor: "end" });
    body += `<circle class="pulse" cx="${n(rx - lw - 9)}" cy="37.5" r="3" fill="${t.accentInk}"/><circle cx="${n(rx - lw - 9)}" cy="37.5" r="3" fill="${t.accentInk}"/>`;
  }

  body += ink.text(p.name, { x: PAD - 1, y: 75, face: "title", size: 22, fill: t.text });

  const lines = wrap(p.blurb, BLURB.face, BLURB.size, x1 - PAD);
  body += ink.block(lines, { x: PAD, y: 99, fill: t.text2, ...BLURB });

  const row = chips(ink, p.stack, { x: PAD, y: H - 45, maxWidth: x1 - PAD, t, size: 9.6, height: 21, padX: 8, gap: 5 });
  if (row.rows > 1) throw new Error(`Stack chips for "${p.name}" wrap; trim the list.`);
  body += row.svg;

  const css =
    `.pulse{transform-box:fill-box;transform-origin:center;animation:pulse 2.8s ease-out infinite}` +
    `@keyframes pulse{0%{transform:scale(1);opacity:.6}70%,100%{transform:scale(3);opacity:0}}`;
  return { w: W, h: H, svg: doc({ w: W, h: H, ink, css: p.live ? css : "", body, label: `${p.name}: ${p.blurb} Built with ${p.stack.join(", ")}.` }) };
}

const STACK_CHIP = { size: 10.8, height: 24, padX: 10, gap: 6, rowGap: 7, tracking: 0 };

/** How many chip rows a stack group needs, so every card can share a height. */
export function stackRows(group) {
  return chips(new Ink(), group.items, { x: PAD, y: 0, maxWidth: HALF - 2 * PAD, t: {}, ...STACK_CHIP }).rows;
}

/** A stack group: a title and its tools as chips. */
export function stackCard(t, group, rows) {
  const W = HALF;
  const top = 92;
  const H = top + rows * STACK_CHIP.height + (rows - 1) * STACK_CHIP.rowGap + 27;
  const ink = new Ink();
  let body = card(t, W, H);
  body += ink.text(caps(group.kicker), { x: PAD, y: 41, face: "monoBold", size: 9.5, tracking: 0.12, fill: t.accentInk });
  body += ink.text(group.title, { x: PAD - 1, y: 73, face: "title", size: 21, fill: t.text });
  body += chips(ink, group.items, { x: PAD, y: top, maxWidth: W - 2 * PAD, t, fill: t.sunk, stroke: t.sunk, color: t.text, ...STACK_CHIP }).svg;
  return { w: W, h: H, svg: doc({ w: W, h: H, ink, body, label: `${group.title}: ${group.items.join(", ")}.` }) };
}

const POST = { face: "title", size: 17, leading: 22.5, max: 3 };

/** How many lines a post's title takes, so the tiles can share a height. */
export const titleLines = (p) => clamp(drawable(p.title, POST.face), POST.face, POST.size, HALF - 2 * PAD - 14, POST.max).length;

/** A blog post: date, title, the first lines of its description. */
export function post(t, p, rows = titleLines(p)) {
  const W = HALF;
  const ink = new Ink();
  const x1 = W - PAD;
  const title = clamp(drawable(p.title, POST.face), POST.face, POST.size, x1 - PAD - 14, POST.max);
  const summary = clamp(drawable(p.description, "body"), "body", 12.4, x1 - PAD, 2);
  const descY = 72 + (rows - 1) * POST.leading + 27;
  const H = Math.round(descY + 18.4 + 27);
  let body = card(t, W, H);
  body += ink.text(caps(p.dateLabel), { x: PAD, y: 41, face: "monoBold", size: 9.5, tracking: 0.12, fill: t.accentInk });
  body += arrowOut(x1, 31, 8.5, t.text3);
  body += ink.block(title, { x: PAD - 0.5, y: 72, fill: t.text, ...POST });
  body += ink.block(summary, { x: PAD, y: descY, leading: 18.4, face: "body", size: 12.4, fill: t.text2 });
  return { w: W, h: H, svg: doc({ w: W, h: H, ink, body, label: `${p.title}. ${p.dateLabel}.` }) };
}

/** A credential: exam code, what it is, when. */
export function credential(t, c) {
  const W = QUARTER;
  const H = 124;
  const pad = 18;
  const ink = new Ink();
  let body = card(t, W, H, { r: 12 });
  body += ink.text(caps(c.issuer), { x: pad, y: 30, face: "mono", size: 8.6, tracking: 0.1, fill: t.text3 });
  body += arrowOut(W - pad, 22, 7, t.text3, 1.4);
  body += ink.text(c.code, { x: pad - 0.5, y: 58, face: "title", size: 20, fill: t.text });
  const lines = wrap(c.name, "body", 11.2, W - 2 * pad);
  if (lines.length > 2) throw new Error(`Credential name "${c.name}" needs ${lines.length} lines; the tile holds 2.`);
  body += ink.block(lines, { x: pad, y: 76, leading: 14.5, face: "body", size: 11.2, fill: t.text2 });
  body += ink.text(caps(c.date), { x: pad, y: H - 15, face: "monoBold", size: 8.6, tracking: 0.1, fill: t.accentInk });
  return { w: W, h: H, svg: doc({ w: W, h: H, ink, body, label: `${c.code}: ${c.name}. ${c.issuer}, ${c.date}.` }) };
}
