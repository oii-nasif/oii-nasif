// The hero: a camera viewfinder. Frame brackets, an autofocus box that hunts
// and locks, a readout along the bottom, and the owls from nasif.tech.

import { Ink, measure, n } from "../lib/type.mjs";
import { doc, card, hline } from "../lib/svg.mjs";
import { FULL, INSET, INSET_Y, RADIUS } from "../lib/theme.mjs";

const W = FULL;
const H = 372;
const LEFT = 58;
const RIGHT = W - 58;

// Four L-shaped corner marks around a box.
function brackets(x, y, w, h, arm) {
  const x2 = x + w;
  const y2 = y + h;
  return (
    `M${n(x)} ${n(y + arm)}V${n(y)}H${n(x + arm)}` +
    `M${n(x2 - arm)} ${n(y)}H${n(x2)}V${n(y + arm)}` +
    `M${n(x2)} ${n(y2 - arm)}V${n(y2)}H${n(x2 - arm)}` +
    `M${n(x + arm)} ${n(y2)}H${n(x)}V${n(y2 - arm)}`
  );
}

export function hero(t, { profile }) {
  const c = t.hero;
  const ink = new Ink();
  const caps = (s) => s.toUpperCase();
  let body = "";

  // Surface, a warm glow where the subject sits, and a rule-of-thirds grid.
  const defs =
    `<radialGradient id="glow" cx="678" cy="166" r="250" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0" stop-color="${t.accent}" stop-opacity=".13"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>` +
    `<clipPath id="frame"><rect x="${INSET}" y="${INSET_Y}" width="${W - 2 * INSET}" height="${H - 2 * INSET_Y}" rx="${RADIUS}"/></clipPath>`;
  body += card(t, W, H, { fill: c.bg, stroke: c.line });
  body += `<g clip-path="url(#frame)"><rect x="${INSET}" y="${INSET_Y}" width="${W - 2 * INSET}" height="${H - 2 * INSET_Y}" fill="url(#glow)"/></g>`;
  const thirdX = (W - 2 * INSET) / 3;
  const thirdY = (H - 2 * INSET_Y) / 3;
  body += `<path d="M${n(INSET + thirdX)} ${INSET_Y + 1}V${H - INSET_Y - 1}M${n(INSET + 2 * thirdX)} ${INSET_Y + 1}V${H - INSET_Y - 1}M${INSET + 1} ${n(INSET_Y + thirdY)}H${W - INSET - 1}M${INSET + 1} ${n(INSET_Y + 2 * thirdY)}H${W - INSET - 1}" stroke="${c.text}" stroke-opacity=".045"/>`;

  // Frame brackets.
  body += `<path class="br" d="${brackets(27, 27, W - 54, H - 54, 22)}" fill="none" stroke="${c.text}" stroke-opacity=".62" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;

  // Status line.
  body += `<g class="in"><circle class="pulse" cx="62" cy="54.5" r="3.5" fill="${t.accent}"/><circle cx="62" cy="54.5" r="3.5" fill="${t.accent}"/>`;
  body += ink.text(caps(profile.status), { x: 75, y: 58.2, face: "mono", size: 10.5, tracking: 0.1, fill: c.text });
  body += ink.text(caps(profile.location), { x: RIGHT, y: 58.2, face: "mono", size: 10.5, tracking: 0.1, fill: c.text3, anchor: "end" });
  body += `</g>`;

  // Who.
  body += `<g class="in d1">${ink.text(caps(`${profile.role} · ${profile.company}`), { x: LEFT, y: 122, face: "mono", size: 11, tracking: 0.14, fill: t.accent })}</g>`;
  body += `<g class="in d2">${ink.text(profile.name, { x: LEFT - 2, y: 175, face: "display", size: 50, fill: c.text })}</g>`;
  body += `<g class="in d3">${ink.text(profile.tagline[0], { x: LEFT, y: 213, face: "bodyMed", size: 18.5, fill: c.text2 })}</g>`;
  body += `<g class="in d4">${ink.text(profile.tagline[1], { x: LEFT, y: 244, face: "serif", size: 25.5, fill: c.text })}</g>`;

  // Autofocus box with the owls: two eyes, the site's one accent.
  const ax = 678;
  const ay = 166;
  const bw = 156;
  const bh = 118;
  let owl = "";
  for (const side of [-1, 1]) {
    const ex = ax + side * 31;
    const ey = ay - 3;
    owl += `<circle cx="${ex}" cy="${ey}" r="27" fill="none" stroke="${c.text}" stroke-opacity=".16"/>`;
    owl +=
      `<g class="lid"><circle cx="${ex}" cy="${ey}" r="19" fill="${t.accent}"/>` +
      `<g class="look"><circle cx="${ex}" cy="${ey}" r="9.5" fill="${c.bg}"/><circle cx="${ex - 3.4}" cy="${ey - 3.6}" r="2.5" fill="${c.text}"/></g></g>`;
  }
  owl += `<path d="M${ax - 5.5} ${ay + 20}Q${ax} ${ay + 17.5} ${ax + 5.5} ${ay + 20}L${ax} ${ay + 31}Z" fill="${c.text}" fill-opacity=".5"/>`;
  body += `<g class="in d2">${owl}</g>`;
  body += `<g class="af"><path class="afs" d="${brackets(ax - bw / 2, ay - bh / 2, bw, bh, 15)}" fill="none" stroke="${t.accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  body += `<g class="lk">${ink.text("AF-C", { x: ax - bw / 2, y: ay - bh / 2 - 11, face: "mono", size: 9, tracking: 0.12, fill: c.text3 })}`;
  body += `<circle cx="${ax + bw / 2 - 38}" cy="${ay - bh / 2 - 14}" r="2.6" fill="${t.accent}"/>`;
  body += ink.text("LOCK", { x: ax + bw / 2, y: ay - bh / 2 - 11, face: "mono", size: 9, tracking: 0.12, fill: c.text2, anchor: "end" });
  body += ink.text("SPOTTED OWLETS · DHAKA", { x: ax, y: ay + bh / 2 + 21, face: "mono", size: 9, tracking: 0.12, fill: c.text3, anchor: "middle" });
  body += `</g>`;

  // Readout.
  const ry = 280;
  body += `<g class="in d5">${hline(LEFT, RIGHT, ry + 0.5, c.line)}`;
  const GAP = 34;
  let x = LEFT;
  profile.readout.forEach((item) => {
    const label = caps(item.label);
    body += ink.text(item.value, { x, y: ry + 40, face: "figure", size: 27, fill: c.text });
    body += ink.text(label, { x, y: ry + 58, face: "mono", size: 8.6, tracking: 0.08, fill: c.text3 });
    x += Math.max(measure(label, "mono", 8.6, 0.08), measure(item.value, "figure", 27)) + GAP;
    body += `<path d="M${n(x - GAP / 2)} ${ry + 16}V${ry + 58}" stroke="${c.line}"/>`;
  });

  // Mode dial: the roles from the site, one at a time. One size fits the longest.
  body += ink.text("MODE", { x, y: ry + 58, face: "mono", size: 8.6, tracking: 0.08, fill: c.text3 });
  let modeSize = 22;
  while (profile.modes.some((mode) => measure(mode, "serif", modeSize) > RIGHT - x)) modeSize -= 0.5;
  profile.modes.forEach((mode, i) => {
    body += `<g class="mode m${i}">${ink.text(mode, { x, y: ry + 39, face: "serif", size: modeSize, fill: t.accent })}</g>`;
  });
  body += `</g>`;

  const span = profile.modes.length * 3;
  const css =
    `.in{animation:in .9s cubic-bezier(.22,1,.36,1) both}` +
    `@keyframes in{from{opacity:0;transform:translateY(10px)}}` +
    [1, 2, 3, 4, 5].map((i) => `.d${i}{animation-delay:${(i * 0.12).toFixed(2)}s}`).join("") +
    `.br{transform-origin:${W / 2}px ${H / 2}px;animation:br 1.2s cubic-bezier(.22,1,.36,1) both}` +
    `@keyframes br{from{opacity:0;transform:scale(1.045)}}` +
    `.af{transform-origin:${ax}px ${ay}px;animation:af 2s cubic-bezier(.3,.8,.3,1) .5s both}` +
    `@keyframes af{0%{opacity:0;transform:scale(1.3)}22%{opacity:1}48%{transform:scale(.93)}74%{transform:scale(1.035)}100%{transform:scale(1)}}` +
    `.afs{animation:afs .25s linear 2.35s both}@keyframes afs{from{stroke:${c.text}}}` +
    `.lk{animation:lk .3s linear 2.45s both}@keyframes lk{from{opacity:0}}` +
    `.pulse{transform-origin:62px 54.5px;animation:pulse 2.8s ease-out infinite}` +
    `@keyframes pulse{0%{transform:scale(1);opacity:.65}70%,100%{transform:scale(3.4);opacity:0}}` +
    `.lid{transform-box:fill-box;transform-origin:center;animation:blink 7.5s 3s infinite}` +
    `@keyframes blink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.07)}}` +
    `.look{animation:look 13s ease-in-out 4s infinite}` +
    `@keyframes look{0%,34%,100%{transform:translateX(0)}40%,54%{transform:translateX(3.5px)}62%,78%{transform:translateX(-3.5px)}84%{transform:translateX(0)}}` +
    `.mode{opacity:0;animation:mode ${span}s infinite both}.m0{opacity:1}` +
    profile.modes.map((_, i) => `.m${i}{animation-delay:${i * 3}s}`).join("") +
    `@keyframes mode{0%{opacity:0;transform:translateY(7px)}${n(100 / span / 3.2)}%,${n(100 / profile.modes.length - 3)}%{opacity:1;transform:translateY(0)}${n(100 / profile.modes.length)}%,100%{opacity:0;transform:translateY(-7px)}}`;

  return {
    w: W,
    h: H,
    svg: doc({
      w: W,
      h: H,
      ink,
      defs,
      css,
      body,
      label: `${profile.name}. ${profile.role} at ${profile.company}. ${profile.tagline.join(" ")} ${profile.status}.`,
    }),
  };
}
