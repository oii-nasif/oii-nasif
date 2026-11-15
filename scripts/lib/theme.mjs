// Design tokens. These mirror the "Viewfinder" system on nasif.tech: warm paper
// and forest ink, hairlines, and a single accent (the owls' eyes).
// Every graphic is drawn once per theme; the README picks one with <picture>.

/** Blend `top` over `base` at `alpha` and return a solid hex. */
export function mix(base, top, alpha) {
  const ch = (hex, i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const out = [0, 1, 2].map((i) => Math.round(ch(base, i) * (1 - alpha) + ch(top, i) * alpha));
  return `#${out.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function build({ name, card, sunk, text, text2, text3, accent, accentInk, onAccent, heat, hero }) {
  return {
    name,
    card, // card surface
    sunk, // recessed surface: chips, empty heatmap cells, tracks
    text,
    text2,
    text3,
    accent, // fills and marks only
    accentInk, // the accent when it has to be read as text or a thin line
    onAccent, // text on an accent fill
    line: mix(card, text, 0.13), // hairline
    line2: mix(card, text, 0.28), // stronger rule
    wash: mix(card, text, 0.05), // barely-there fill
    heat, // sequential ramp for the contribution grid, low to high
    hero,
  };
}

const INK = "#0a0d08";
const PAPER = "#f4f1e8";
const OWL = "#f2c53d";

export const themes = {
  light: build({
    name: "light",
    card: "#f6f3ea",
    sunk: "#e9e5d7",
    text: "#12160f",
    text2: "#4c5245",
    text3: "#757b6c",
    accent: OWL,
    accentInk: "#7a5e00",
    onAccent: "#12160f",
    heat: ["#e9e5d7", "#cfa935", "#a98612", "#816502", "#574300"],
    // The hero is a viewfinder, so it stays dark in both themes.
    hero: { bg: INK, text: PAPER, text2: "#b6baa9", text3: "#858a7b", line: mix(INK, PAPER, 0.16) },
  }),
  dark: build({
    name: "dark",
    card: "#141910",
    sunk: "#1f2618",
    text: PAPER,
    text2: "#b6baa9",
    text3: "#868b7c",
    accent: OWL,
    accentInk: OWL,
    onAccent: "#12160f",
    heat: ["#1f2618", "#544a1c", "#8c7426", "#bf9b30", "#f2c53d"],
    hero: { bg: INK, text: PAPER, text2: "#b6baa9", text3: "#858a7b", line: mix(INK, PAPER, 0.16) },
  }),
};

// Layout grid, in px at 1x. The README sets images at these exact widths so
// they sit on a shared column and wrap to one per row on a phone.
export const FULL = 828; // one per row
export const HALF = 412; // two per row
export const QUARTER = 204; // four per row
// Transparent margin inside every image. Images sit inline in a paragraph, so
// a row of two is separated by a space and stacked rows by the line's descent;
// these two insets even that out to the same ~10px gutter both ways.
export const INSET = 3;
export const INSET_Y = 1.5;
export const RADIUS = 14;
