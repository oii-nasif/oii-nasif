// Small SVG building blocks shared by every graphic.

import { n, measure } from "./type.mjs";
import { INSET, INSET_Y, RADIUS } from "./theme.mjs";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Animations are decoration: with reduced motion everything simply sits in its
// final state, which is also what a renderer that ignores CSS will show.
const MOTION_GUARD = "@media (prefers-reduced-motion:reduce){*{animation:none!important}}";

/** Wrap a body in an <svg> root with its glyph defs and styles. */
export function doc({ w, h, label, ink, css = "", defs = "", body }) {
  const style = css ? `<style>${css}${MOTION_GUARD}</style>` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">` +
    `<title>${esc(label)}</title>` +
    `<defs>${defs}${ink ? ink.defs() : ""}</defs>` +
    style +
    body +
    `</svg>\n`
  );
}

/** The card every graphic sits on: inset from the image edge, hairline border. */
export function card(t, w, h, { fill = t.card, stroke = t.line, r = RADIUS } = {}) {
  return `<rect x="${INSET + 0.5}" y="${INSET_Y + 0.5}" width="${w - 2 * INSET - 1}" height="${h - 2 * INSET_Y - 1}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
}

export const rect = (x, y, w, h, attrs = "") => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" ${attrs}/>`;

export const hline = (x1, x2, y, stroke, attrs = "") =>
  `<path d="M${n(x1)} ${n(y)}H${n(x2)}" stroke="${stroke}" ${attrs}/>`;

export const vline = (x, y1, y2, stroke, attrs = "") =>
  `<path d="M${n(x)} ${n(y1)}V${n(y2)}" stroke="${stroke}" ${attrs}/>`;

/** A north-east arrow, the "opens elsewhere" mark. (x, y) is its top-right corner. */
export function arrowOut(x, y, size, stroke, width = 1.6) {
  const s = size;
  return `<path d="M${n(x - s)} ${n(y + s)}L${n(x)} ${n(y)}M${n(x - s * 0.72)} ${n(y)}H${n(x)}V${n(y + s * 0.72)}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** A right-pointing arrow starting at (x, y). */
export function arrowRight(x, y, length, stroke, width = 1.5) {
  const h = 3.5;
  return `<path d="M${n(x)} ${n(y)}H${n(x + length)}M${n(x + length - h)} ${n(y - h)}L${n(x + length)} ${n(y)}L${n(x + length - h)} ${n(y + h)}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** A five-point star centred on (cx, cy). */
export function star(cx, cy, r, fill) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r * 0.44 : r;
    pts.push(`${n(cx + Math.cos(a) * rad)} ${n(cy + Math.sin(a) * rad)}`);
  }
  return `<path d="M${pts.join("L")}Z" fill="${fill}"/>`;
}

/**
 * A row of chips that wraps to `maxWidth`. Returns { svg, height, rows }.
 * (x, y) is the top-left of the first chip.
 */
export function chips(ink, labels, { x, y, maxWidth, t, face = "mono", size = 10.5, tracking = 0.02, padX = 9, height = 22, gap = 6, rowGap = 6, fill, stroke, color }) {
  let cx = x;
  let cy = y;
  let rows = 1;
  let svg = "";
  for (const label of labels) {
    const w = measure(label, face, size, tracking) + padX * 2;
    if (cx > x && cx + w > x + maxWidth) {
      cx = x;
      cy += height + rowGap;
      rows++;
    }
    svg += `<rect x="${n(cx + 0.5)}" y="${n(cy + 0.5)}" width="${n(w - 1)}" height="${height - 1}" rx="${(height - 1) / 2}" fill="${fill ?? "none"}" stroke="${stroke ?? t.line2}"/>`;
    svg += ink.text(label, { x: cx + padX, y: cy + height / 2 + size * 0.36, face, size, tracking, fill: color ?? t.text2 });
    cx += w + gap;
  }
  return { svg, height: rows * height + (rows - 1) * rowGap, rows };
}
