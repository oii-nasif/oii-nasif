// Page furniture: section headings, the row of link pills, and the closing card.
// Headings and pills have no card behind them, so they sit straight on GitHub's
// page colour.

import { Ink, measure, n } from "../lib/type.mjs";
import { doc, card, arrowRight } from "../lib/svg.mjs";
import { FULL, INSET, INSET_Y } from "../lib/theme.mjs";

const caps = (s) => s.toUpperCase();

/** "01  Experience at Brain Station 23 ............ JAN 2022 – NOW" */
export function heading(t, { no, title, aside, note }) {
  const W = FULL;
  const H = 64;
  const ink = new Ink();
  const x0 = INSET + 1;
  const x1 = W - INSET - 1;
  const base = 39;
  let body = "";

  body += ink.text(no, { x: x0, y: base - 1, face: "monoBold", size: 11, tracking: 0.08, fill: t.accentInk });
  const head = ink.line(
    [
      { str: title, face: "heading", size: 30, fill: t.text },
      { str: aside, face: "serif", size: 30.5, fill: t.text2, gap: 9 },
    ],
    { x: x0 + 34, y: base },
  );
  body += `<g class="in">${head.svg}</g>`;
  body += ink.text(caps(note), { x: x1, y: base - 1, face: "mono", size: 9.5, tracking: 0.12, fill: t.text3, anchor: "end" });

  // Rule, with a short accent stroke that draws in.
  body += `<path d="M${x0} 57.5H${x1}" stroke="${t.text}" stroke-opacity=".16"/>`;
  body += `<path class="mark" d="M${x0} 57H${x0 + 26}" stroke="${t.accent}" stroke-width="3" stroke-dasharray="26" />`;

  const css =
    `.in{animation:in .8s cubic-bezier(.22,1,.36,1) both}@keyframes in{from{opacity:0;transform:translateX(-8px)}}` +
    `.mark{animation:mark .9s cubic-bezier(.22,1,.36,1) .15s both}@keyframes mark{from{stroke-dashoffset:26}}`;

  return { w: W, h: H, svg: doc({ w: W, h: H, ink, css, body, label: `${title} ${aside}` }) };
}

// 15px line icons, drawn in a 15x15 box.
const ICONS = {
  site: `<circle cx="7.5" cy="7.5" r="6"/><path d="M1.5 7.5h12M7.5 1.5c2 2 2 10 0 12M7.5 1.5c-2 2-2 10 0 12"/>`,
  resume: `<path d="M4 1.5h4.5L12 5v8.5H4zM8.5 1.5V5H12M6 8h4M6 10.5h4"/>`,
  blog: `<path d="M9.8 2.2l3 3L5.5 12.5l-3.6.6.6-3.6zM8.3 3.7l3 3"/>`,
  linkedin: `<rect x="1.5" y="1.5" width="12" height="12" rx="2.6"/><path d="M4.9 7v3.6M7.5 10.6V7M7.5 8.6c0-1 .7-1.6 1.5-1.6s1.4.6 1.4 1.6v2"/><circle cx="4.9" cy="4.7" r=".5"/>`,
  email: `<rect x="1.5" y="3" width="12" height="9" rx="1.8"/><path d="M2.2 4.4l5.3 3.9 5.3-3.9"/>`,
};

/** A link pill. The primary one is filled with the accent. */
export function pill(t, { id, label, primary }) {
  const ink = new Ink();
  const size = 11;
  const tracking = 0.1;
  const text = caps(label);
  const padX = 16;
  const H = 39;
  const bodyW = padX + 15 + 9 + measure(text, "monoBold", size, tracking) + padX;
  const W = Math.ceil(bodyW) + 2 * INSET;
  const fg = primary ? t.onAccent : t.text;
  let body = "";
  body += card(t, W, H, { fill: primary ? t.accent : t.card, stroke: primary ? t.accent : t.line2, r: (H - 2 * INSET_Y - 1) / 2 });
  body += `<g transform="translate(${INSET + padX} ${H / 2 - 7.5})" fill="none" stroke="${fg}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${ICONS[id]}</g>`;
  body += ink.text(text, { x: INSET + padX + 24, y: H / 2 + size * 0.36, face: "monoBold", size, tracking, fill: fg });
  return { w: W, h: H, svg: doc({ w: W, h: H, ink, body, label }) };
}

/** The closing card: one line and a way to reach me. Dark in both themes, like the hero. */
export function closing(t, { lines, action }) {
  const W = FULL;
  const H = 136;
  const c = t.hero;
  const ink = new Ink();
  let body = "";
  body += card(t, W, H, { fill: c.bg, stroke: c.line });

  // Frame brackets, as in the hero.
  const a = 16;
  const bx = 22;
  const by = 22;
  const bx2 = W - 22;
  const by2 = H - 22;
  body += `<path d="M${bx} ${by + a}V${by}H${bx + a}M${bx2 - a} ${by}H${bx2}V${by + a}M${bx2} ${by2 - a}V${by2}H${bx2 - a}M${bx + a} ${by2}H${bx}V${by2 - a}" fill="none" stroke="${c.text}" stroke-opacity=".5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;

  body += ink.text(lines[0], { x: 52, y: 63, face: "heading", size: 25, fill: c.text });
  body += ink.text(lines[1], { x: 52, y: 95, face: "serif", size: 27, fill: t.accent });

  // Call to action.
  const label = caps(action);
  const lw = measure(label, "monoBold", 11, 0.1);
  const bw = lw + 16 * 2 + 26;
  const bxr = W - 52;
  const bh = 38;
  const top = H / 2 - bh / 2;
  body += `<rect x="${n(bxr - bw)}" y="${top}" width="${n(bw)}" height="${bh}" rx="${bh / 2}" fill="${t.accent}"/>`;
  body += ink.text(label, { x: bxr - bw + 16, y: H / 2 + 4, face: "monoBold", size: 11, tracking: 0.1, fill: t.onAccent });
  body += `<g class="go">${arrowRight(bxr - 16 - 16, H / 2, 15, t.onAccent, 1.6)}</g>`;

  const css = `.go{animation:go 2.4s ease-in-out infinite}@keyframes go{0%,60%,100%{transform:translateX(0)}30%{transform:translateX(4px)}}`;
  return { w: W, h: H, svg: doc({ w: W, h: H, ink, css, body, label: `${lines.join(" ")} ${action}.` }) };
}
