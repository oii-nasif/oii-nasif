// Typesetting for the SVGs.
//
// GitHub shows README images through <img>, where an SVG cannot load webfonts.
// So text is set here, at build time: each string is laid out with the real
// font (kerning included) and written as outlines. Every glyph is defined once
// per file and reused with <use>, which keeps the files small, and because the
// layout is measured rather than guessed, nothing can overflow its box.

import * as fontkit from "fontkit";
import { fileURLToPath } from "node:url";

const fontFile = (p) => fileURLToPath(new URL(`../../node_modules/${p}`, import.meta.url));

const SOURCES = {
  bricolage:
    "@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2",
  serif: "@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff",
  sans: "@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2",
  mono: "@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
};

// A face is a source plus the variable-font instance to cut from it.
// `prefix` namespaces glyph ids inside a file. `features` switches OpenType
// features off (JetBrains Mono's code ligatures would turn "->" into an arrow).
const FACES = {
  // Bricolage Grotesque has an optical-size axis: each face is cut for the size
  // it is used at, so big type is tight and small type keeps its spacing.
  display: { src: "bricolage", vary: { wght: 800, opsz: 52, wdth: 100 }, prefix: "d" }, // ~50px
  heading: { src: "bricolage", vary: { wght: 800, opsz: 32, wdth: 100 }, prefix: "h" }, // ~30px
  title: { src: "bricolage", vary: { wght: 700, opsz: 20, wdth: 100 }, prefix: "t" }, // ~18px
  figure: { src: "bricolage", vary: { wght: 700, opsz: 30, wdth: 100 }, prefix: "f" }, // numerals ~28px
  figureL: { src: "bricolage", vary: { wght: 700, opsz: 46, wdth: 100 }, prefix: "g" }, // numerals ~44px
  serif: { src: "serif", prefix: "s" },
  body: { src: "sans", vary: { wght: 420 }, prefix: "b" },
  bodyMed: { src: "sans", vary: { wght: 560 }, prefix: "m" },
  mono: { src: "mono", vary: { wght: 500 }, prefix: "c", features: { calt: false, liga: false } },
  monoBold: { src: "mono", vary: { wght: 700 }, prefix: "k", features: { calt: false, liga: false } },
};

const sources = new Map();
const faces = new Map();

function face(key) {
  if (faces.has(key)) return faces.get(key);
  const spec = FACES[key];
  if (!spec) throw new Error(`Unknown face "${key}"`);
  if (!sources.has(spec.src)) sources.set(spec.src, fontkit.openSync(fontFile(SOURCES[spec.src])));
  const base = sources.get(spec.src);
  const font = spec.vary ? base.getVariation(spec.vary) : base;
  const loaded = { key, font, upm: font.unitsPerEm, prefix: spec.prefix, features: spec.features, paths: new Map() };
  faces.set(key, loaded);
  return loaded;
}

/** Font metrics in px for a face at a size: capHeight, xHeight, ascent, descent. */
export function metrics(faceKey, size) {
  const { font, upm } = face(faceKey);
  const k = size / upm;
  return { cap: font.capHeight * k, x: font.xHeight * k, ascent: font.ascent * k, descent: -font.descent * k };
}

const layoutCache = new Map();

function layout(f, str) {
  const id = `${f.key}\u0000${str}`;
  if (layoutCache.has(id)) return layoutCache.get(id);
  const run = f.font.layout(str, f.features);
  run.glyphs.forEach((g) => {
    if (g.id === 0) {
      const ch = String.fromCodePoint(...g.codePoints);
      throw new Error(`Face "${f.key}" has no glyph for "${ch}" (in "${str}"). Draw it as a shape instead.`);
    }
  });
  layoutCache.set(id, run);
  return run;
}

// Glyph outline in font units (y up), rounded to whole units: 1/1000 em.
function outline(f, glyph) {
  if (f.paths.has(glyph.id)) return f.paths.get(glyph.id);
  const r = Math.round;
  let d = "";
  for (const { command, args: a } of glyph.path.commands) {
    if (command === "moveTo") d += `M${r(a[0])} ${r(a[1])}`;
    else if (command === "lineTo") d += `L${r(a[0])} ${r(a[1])}`;
    else if (command === "quadraticCurveTo") d += `Q${r(a[0])} ${r(a[1])} ${r(a[2])} ${r(a[3])}`;
    else if (command === "bezierCurveTo") d += `C${r(a[0])} ${r(a[1])} ${r(a[2])} ${r(a[3])} ${r(a[4])} ${r(a[5])}`;
    else if (command === "closePath") d += "Z";
  }
  f.paths.set(glyph.id, d);
  return d;
}

/** Trim a number for SVG output. */
export const n = (v, places = 2) => {
  const p = 10 ** places;
  return String(Math.round(v * p) / p);
};

/** Width in px of `str` set in a face at a size. `tracking` is in em. */
export function measure(str, faceKey, size, tracking = 0) {
  const f = face(faceKey);
  const { glyphs, positions } = layout(f, str);
  if (!glyphs.length) return 0;
  const units = positions.reduce((sum, p) => sum + p.xAdvance, 0) + tracking * f.upm * (glyphs.length - 1);
  return (units * size) / f.upm;
}

/** Remove characters a face has no glyph for. For text we do not control, such as feed titles. */
export function drawable(str, faceKey) {
  const { font } = face(faceKey);
  return [...str].filter((ch) => font.hasGlyphForCodePoint(ch.codePointAt(0))).join("").replace(/\s+/g, " ").trim();
}

/** Wrap to at most `max` lines, ending the last one with an ellipsis if text was cut. */
export function clamp(str, faceKey, size, maxWidth, max) {
  const lines = wrap(str, faceKey, size, maxWidth);
  if (lines.length <= max) return lines;
  const kept = lines.slice(0, max);
  let last = kept[max - 1].split(" ");
  while (last.length > 1 && measure(`${last.join(" ")}\u2026`, faceKey, size) > maxWidth) last.pop();
  kept[max - 1] = `${last.join(" ").replace(/[\s,.;:\u2014-]+$/, "")}\u2026`;
  return kept;
}

/** Greedy word wrap to a pixel width. Returns an array of lines. */
export function wrap(str, faceKey, size, maxWidth, tracking = 0) {
  const lines = [];
  let line = "";
  for (const word of str.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, faceKey, size, tracking) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * One SVG's worth of text. Collects the glyphs a file uses so they can be
 * emitted once in <defs>.
 */
export class Ink {
  constructor() {
    this.glyphs = new Map();
  }

  /**
   * Set a string. (x, y) is the baseline origin; `anchor` is start | middle | end.
   * Returns the SVG markup; use `measure` for the width.
   */
  text(str, { x = 0, y = 0, face: faceKey = "body", size = 13, fill, anchor = "start", tracking = 0, opacity } = {}) {
    if (!str) return "";
    const f = face(faceKey);
    const { glyphs, positions } = layout(f, str);
    const track = tracking * f.upm;
    let pen = 0;
    let uses = "";
    glyphs.forEach((g, i) => {
      const p = positions[i];
      const d = outline(f, g);
      if (d) {
        const id = `${f.prefix}${g.id.toString(36)}`;
        this.glyphs.set(id, d);
        const gx = Math.round(pen + p.xOffset);
        uses += `<use href="#${id}"${gx ? ` x="${gx}"` : ""}${p.yOffset ? ` y="${Math.round(p.yOffset)}"` : ""}/>`;
      }
      pen += p.xAdvance + track;
    });
    const k = size / f.upm;
    const width = (pen - track) * k;
    const ox = anchor === "middle" ? x - width / 2 : anchor === "end" ? x - width : x;
    const alpha = opacity == null ? "" : ` opacity="${opacity}"`;
    return `<g transform="translate(${n(ox)} ${n(y)}) scale(${n(k, 5)} ${n(-k, 5)})" fill="${fill}"${alpha}>${uses}</g>`;
  }

  /**
   * Set several differently-styled spans on one baseline, e.g. a headline that
   * ends in serif italics. Each span is { str, face, size, fill, tracking, gap }.
   * Returns { svg, width }.
   */
  line(spans, { x = 0, y = 0, anchor = "start" } = {}) {
    const widths = spans.map((s) => measure(s.str, s.face, s.size, s.tracking ?? 0) + (s.gap ?? 0));
    const total = widths.reduce((a, b) => a + b, 0);
    let pen = anchor === "middle" ? x - total / 2 : anchor === "end" ? x - total : x;
    let svg = "";
    spans.forEach((s, i) => {
      svg += this.text(s.str, { ...s, x: pen + (s.gap ?? 0), y: y + (s.dy ?? 0), anchor: "start" });
      pen += widths[i];
    });
    return { svg, width: total };
  }

  /** Set pre-wrapped lines with a fixed leading. */
  block(lines, { x = 0, y = 0, leading, ...style }) {
    return lines.map((str, i) => this.text(str, { ...style, x, y: y + i * leading })).join("");
  }

  /** The <defs> entries for every glyph used so far. */
  defs() {
    return [...this.glyphs].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join("");
  }
}
