// Renders each IFEELVOID look into an HTML mock of the Claude desktop window, from the mod's real tokens.
import { mkdirSync, writeFileSync } from 'node:fs'

import { LOOKS, type LookName } from '../hooks/looks'
import { EVENT_HORIZON } from '../hooks/scene-horizon'
import { SIGNAL_BLEED } from '../hooks/scene'
import { skyLook, type SkyState } from '../hooks/sky'

const OUT = '/tmp/void-gallery'
mkdirSync(OUT, { recursive: true })

type Inputs = Record<string, string>
interface Entry { slug: string; title: string; sub: string; args: any }

const FIXED: readonly [LookName, string][] = [
  ['event-horizon', 'A pixel black hole over an equalizer skyline'],
  ['void', 'The still original'],
  ['day', 'The void in daylight'],
  ['signal-bleed', 'Scanlines and purple glitch tears'],
  ['studio-night', 'Lit by VU-meter amber'],
  ['release', 'Black and white, one purple'],
]

const SKIES: readonly [string, SkyState][] = [
  ['sky-dawn', { phase: 'dawn', season: 'autumn', weather: 'clear' }],
  ['sky-day', { phase: 'day', season: 'autumn', weather: 'clear' }],
  ['sky-dusk', { phase: 'dusk', season: 'autumn', weather: 'clear' }],
  ['sky-blue-hour', { phase: 'twilight', season: 'autumn', weather: 'clear' }],
  ['sky-night', { phase: 'night', season: 'winter', weather: 'clear' }],
  ['sky-winter-snow', { phase: 'day', season: 'winter', weather: 'snow' }],
  ['sky-spring', { phase: 'day', season: 'spring', weather: 'clear' }],
  ['sky-summer', { phase: 'day', season: 'summer', weather: 'clear' }],
  ['sky-rain', { phase: 'day', season: 'autumn', weather: 'rain' }],
  ['sky-storm', { phase: 'day', season: 'summer', weather: 'storm' }],
]

function palette(colors: any) {
  const dark = colors.inputs.dark !== undefined && colors.inputs.light === undefined
  const v: Inputs = dark ? colors.inputs.dark : colors.inputs.light
  const role = (r: string) => v[`role-${r}-${dark ? 300 : 600}`]
  return {
    dark,
    s0: v['gray-' + (dark ? 900 : 20)], s1: v['gray-' + (dark ? 850 : 10)], s2: v['gray-' + (dark ? 830 : 0)], s3: v['gray-' + (dark ? 800 : 0)],
    t1: v[dark ? 'gray-50' : 'gray-900'], t2: v[dark ? 'gray-200' : 'gray-600'], t3: v[dark ? 'gray-400' : 'gray-400'],
    line: dark ? 'rgba(255,255,255,.09)' : 'rgba(0,0,0,.09)',
    fill: v['role-accent-fill'], on: v['role-accent-on'],
    kw: role('accent'), str: role('success'), lit: role('pro'), name: role('danger'), vari: role('warning'),
  }
}

function ground(backdrop: any, s0: string): string {
  if (backdrop?.scene === 'event-horizon') return `<div class="scene">${EVENT_HORIZON}</div>`
  if (backdrop?.scene === 'signal-bleed') return `<div class="scene" style="background:${s0}">${SIGNAL_BLEED}</div>`
  if (backdrop?.gradient) {
    const stops = backdrop.gradient.stops.map((s: any) => `${s.color} ${Math.round(s.at * 100)}%`).join(',')
    return `<div class="scene" style="background:linear-gradient(${backdrop.gradient.angle}deg,${stops})"></div>`
  }
  return `<div class="scene" style="background:${backdrop?.color ?? s0}"></div>`
}

function page(e: Entry): string {
  const p = palette(e.args.colors)
  const glassy = e.args.backdrop?.scene !== undefined || e.args.backdrop?.gradient !== undefined
  const panel = (c: string, a: number) => (glassy ? `color-mix(in srgb, ${c} ${a}%, transparent)` : c)
  return `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}body{width:1440px;height:800px;overflow:hidden;font:15px/1.55 -apple-system,"SF Pro Text",system-ui,sans-serif;color:${p.t1};background:${p.s0};position:relative}
.scene{position:absolute;inset:0}.scene svg{width:100%;height:100%;display:block}
.app{position:absolute;inset:0;display:grid;grid-template-columns:270px 1fr}
.side{background:${panel(p.s1, 72)};backdrop-filter:blur(18px);border-right:1px solid ${p.line};padding:52px 14px 14px}
.side h4{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:${p.t3};margin:18px 10px 8px}
.item{padding:8px 10px;border-radius:8px;color:${p.t2};font-size:14px}.item.on{background:${panel(p.s3, 90)};color:${p.t1}}
.new{display:flex;gap:8px;align-items:center;padding:9px 10px;border:1px solid ${p.line};border-radius:10px;color:${p.t1};font-size:14px}
.main{display:flex;flex-direction:column;padding:52px 0 26px}
.chat{flex:1;width:760px;margin:0 auto;display:flex;flex-direction:column;gap:22px;padding-top:8px}
.user{align-self:flex-end;background:${panel(p.s3, 88)};border:1px solid ${p.line};padding:11px 15px;border-radius:16px;max-width:560px}
.bot{color:${p.t1}}.bot p{margin-bottom:10px}.muted{color:${p.t2}}
.chip{display:inline-block;font:12px ui-monospace,Menlo,monospace;color:${p.t2};border:1px solid ${p.line};background:${panel(p.s1, 80)};padding:3px 9px;border-radius:7px;margin-bottom:12px}
pre{background:${panel(p.s2, 92)};border:1px solid ${p.line};border-radius:12px;padding:14px 16px;font:13px/1.6 ui-monospace,Menlo,monospace;color:${p.t1};margin:6px 0 12px}
.kw{color:${p.kw}}.str{color:${p.str}}.lit{color:${p.lit}}.nm{color:${p.name}}.va{color:${p.vari}}.cm{color:${p.t3}}
.prompt{width:760px;margin:0 auto;background:${panel(p.s1, 90)};backdrop-filter:blur(18px);border:1px solid ${p.line};border-radius:18px;padding:14px 16px;display:flex;align-items:flex-end;justify-content:space-between;min-height:96px}
.ph{color:${p.t3}}.send{width:34px;height:34px;border-radius:10px;background:${p.fill};color:${p.on};display:grid;place-items:center;font-weight:700}
.tag{position:absolute;right:26px;top:16px;font:600 12px ui-monospace,Menlo,monospace;letter-spacing:.06em;color:${p.t2};background:${panel(p.s1, 85)};border:1px solid ${p.line};padding:5px 10px;border-radius:8px}
.dots{position:absolute;left:18px;top:18px;display:flex;gap:8px}.dots i{width:12px;height:12px;border-radius:50%;background:${p.t3};opacity:.5}
</style>${ground(e.args.backdrop, p.s0)}
<div class="app"><aside class="side"><div class="new">＋ New session</div><h4>Today</h4>
<div class="item on">Master hits harder</div><div class="item">Void Sky theme</div><div class="item">KeyFinder 3.2 release</div><div class="item">Set list, 124 BPM</div>
<h4>This week</h4><div class="item">Store copy pass</div><div class="item">Stems for the remix</div></aside>
<main class="main"><div class="chat">
<div class="user">Make the master hit harder without killing the transients.</div>
<div class="bot"><span class="chip">Edit · mastering/chain.ts</span>
<p>Parallel compression keeps the attack and lifts the body. Blend it under the dry signal instead of squashing the whole bus:</p>
<pre><span class="kw">export const</span> <span class="va">chain</span> = [
  <span class="nm">eq</span>({ <span class="va">lowShelf</span>: <span class="lit">-1.5</span>, <span class="va">at</span>: <span class="str">'30Hz'</span> }),
  <span class="nm">parallel</span>(<span class="nm">compressor</span>({ <span class="va">ratio</span>: <span class="lit">8</span>, <span class="va">attack</span>: <span class="lit">0.3</span> }), { <span class="va">mix</span>: <span class="lit">0.35</span> }),
  <span class="nm">limiter</span>({ <span class="va">ceiling</span>: <span class="lit">-1</span>, <span class="va">lookahead</span>: <span class="kw">true</span> }), <span class="cm">// LUFS -8, peaks intact</span>
]</pre>
<p class="muted">Kick and snare keep their snap; the mix gains about 2 LU without touching the limiter harder.</p></div>
</div><div class="prompt"><span class="ph">Reply…</span><span class="send">↑</span></div></main></div>
<div class="dots"><i></i><i></i><i></i></div><div class="tag">${e.title.toUpperCase()}</div>`
}

const entries: Entry[] = [
  ...FIXED.map(([name, sub]) => ({ slug: name, title: LOOKS[name].label, sub, args: LOOKS[name].args })),
  ...SKIES.map(([slug, state]) => { const l = skyLook(state); return { slug, title: l.label, sub: '', args: l.args } }),
]
for (const e of entries) writeFileSync(`${OUT}/${e.slug}.html`, page(e))
writeFileSync(`${OUT}/index.json`, JSON.stringify(entries.map(({ slug, title, sub }) => ({ slug, title, sub }))))
console.log(entries.map(e => e.slug).join(' '))
