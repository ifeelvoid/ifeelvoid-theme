// Generates hooks/scene-horizon.ts: a pixel-art black hole for IFEELVOID.
// Run: node tools/gen-horizon.mjs hooks/scene-horizon.ts
import { writeFileSync } from 'node:fs'
const out = process.argv[2]
let seed = 7
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const CX = 1230, CY = 340, CELL = 12, RS = 112
const LEVELS = ['#2a0f45', '#4b1a7a', '#7b2cbf', '#a35cf0', '#d7b4ff', '#ffffff']
const cut = [0.12, 0.25, 0.4, 0.58, 0.76, 0.92]
function field(x, y) {
  const r = Math.hypot(x, y), a = Math.atan2(y, x)
  const grain = 0.78 + 0.22 * rnd()
  const streak = 0.86 + 0.14 * Math.sin(a * 13 + r * 0.06)
  const rd = Math.hypot(x, y / 0.19)
  let disk = 0
  if (rd > 132 && rd < 440) disk = Math.pow(1 - (rd - 132) / 308, 1.6) * (1 + 0.55 * (-x / rd)) * 0.95
  if (y < 0 && r < RS) disk = 0 // back of the disk hides behind the shadow
  let lens = 0
  if (r > RS - 4) lens = Math.exp(-(((r - 134) / 16) ** 2)) * (y < 0 ? 1 : 0.55) * (1 + 0.35 * (-x / r))
  let ring = Math.exp(-(((r - RS - 6) / 5) ** 2)) * 0.9
  if (r < RS - 2 && !(y > 0 && disk > 0)) return -1 // shadow
  return Math.max(disk, lens, ring) * grain * streak
}
const paths = LEVELS.map(() => [[], [], []])
const shadow = []
for (let gy = -420; gy < 420; gy += CELL) for (let gx = -480; gx < 480; gx += CELL) {
  const b = field(gx + CELL / 2, gy + CELL / 2)
  if (b === -1) { shadow.push(`M${CX + gx} ${CY + gy}h${CELL}v${CELL}h-${CELL}z`); continue }
  let lv = -1
  for (let i = 0; i < cut.length; i++) if (b >= cut[i]) lv = i
  if (lv < 0) continue
  paths[lv][Math.floor(rnd() * 3)].push(`M${CX + gx} ${CY + gy}h${CELL}v${CELL}h-${CELL}z`)
}
const diskSvg = paths.flatMap((groups, lv) => groups.map((d, g) => d.length ? `<path class="f${g}" fill="${LEVELS[lv]}" d="${d.join('')}"/>` : '')).join('\n')
const debris = Array.from({ length: 18 }, () => {
  const a = rnd() * Math.PI * 2, r = 170 + rnd() * 260, s = rnd() < 0.3 ? 8 : 5
  return `<rect x="${(Math.cos(a) * r).toFixed(0)}" y="${(Math.sin(a) * r).toFixed(0)}" width="${s}" height="${s}" fill="${rnd() < 0.5 ? '#d7b4ff' : '#9d4edd'}"/>`
}).join('')
const stars = Array.from({ length: 110 }, () => {
  const s = rnd() < 0.15 ? 3 : 2
  return `<rect class="s${Math.floor(rnd() * 3)}" x="${(rnd() * 1600).toFixed(0)}" y="${(rnd() * 900).toFixed(0)}" width="${s}" height="${s}"/>`
}).join('')
const COLS = 80, W = 1600 / COLS
const bars = Array.from({ length: COLS }, (_, i) => {
  const h = 60 + Math.round(rnd() * 100)
  return `<rect class="b b${i % 9}" x="${(i * W + 2).toFixed(0)}" y="${300 - h}" width="${(W - 4).toFixed(0)}" height="${h}"/>`
}).join('')
const barCss = Array.from({ length: 9 }, (_, i) =>
  `.b${i}{animation-duration:${(0.9 + rnd() * 1.6).toFixed(2)}s;animation-delay:-${(rnd() * 2).toFixed(2)}s}`).join('')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset=".65" stop-color="#05030a"/><stop offset="1" stop-color="#1b0c2a"/></linearGradient>
<radialGradient id="halo"><stop offset="0" stop-color="#7b2cbf" stop-opacity=".55"/><stop offset=".45" stop-color="#4b1a7a" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<pattern id="blk" width="20" height="13" patternUnits="userSpaceOnUse"><rect width="20" height="9" fill="#9d4edd"/></pattern>
<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".35"/></pattern>
<linearGradient id="edge" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".3" stop-color="#fff" stop-opacity=".12"/><stop offset=".7" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".9"/></linearGradient>
<linearGradient id="up" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity=".25"/></linearGradient>
<mask id="em" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="300"><rect width="1600" height="300" fill="url(#edge)"/></mask>
</defs>
<style>
.f0{animation:fl 3.1s ease-in-out infinite}.f1{animation:fl 4.3s ease-in-out -1.2s infinite}.f2{animation:fl 5.7s ease-in-out -2.6s infinite}
@keyframes fl{0%,100%{opacity:1}50%{opacity:.62}}
.halo{animation:br 7s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes br{0%,100%{opacity:.75;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}
.orb{animation:sp 38s linear infinite;transform-origin:0 0}
@keyframes sp{to{transform:rotate(-360deg)}}
.s0,.s1,.s2{fill:#efe6ff}.s0{animation:tw 4s steps(2) infinite}.s1{animation:tw 6.5s steps(2) -2s infinite}.s2{opacity:.4}
@keyframes tw{0%,100%{opacity:.9}50%{opacity:.15}}
.b{fill:url(#blk);transform-box:fill-box;transform-origin:bottom;animation:eq 1.4s steps(5) infinite alternate}
@keyframes eq{0%{transform:scaleY(.25)}40%{transform:scaleY(.9)}70%{transform:scaleY(.5)}100%{transform:scaleY(1)}}
${barCss}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<rect width="100%" height="100%" fill="url(#g)"/>
<svg width="100%" height="100%" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">${stars}</svg>
<svg x="0" y="0" width="100%" height="100%" viewBox="0 0 1600 1000" preserveAspectRatio="xMaxYMin meet">
<circle class="halo" cx="${CX}" cy="${CY}" r="420" fill="url(#halo)"/>
<path fill="#000" d="${shadow.join('')}"/>
${diskSvg}
<g transform="translate(${CX} ${CY}) scale(1 .19)"><g class="orb">${debris}</g></g>
</svg>
<svg x="0" y="0" width="100%" height="100%" viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax meet" overflow="visible">
<g mask="url(#em)" opacity=".7">${bars}</g>
</svg>
<rect width="100%" height="100%" fill="url(#scan)"/>
</svg>`
const ts = `// Event Horizon: a pixel-art black hole with a purple accretion disk, debris in orbit,
// and a spectrum-analyzer skyline along the foot. Generated; edit gen.mjs, not this file.
export const EVENT_HORIZON = ${JSON.stringify(svg)}
`
writeFileSync(out, ts)
console.log('svg chars', svg.length)
