import type { ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import type { Phase, Season } from './sun'
import type { Weather } from './weather'

// Void Sky: the palette and the ground follow the sun over New York, the season and the weather.
// Light while the sun is up, the void after dark; a storm pulls the void back in at any hour.

export interface SkyState {
  readonly phase: Phase
  readonly season: Season
  readonly weather: Weather | 'unknown'
}

export interface SkyLook {
  readonly key: string
  readonly label: string
  readonly args: ThemeSetArgs
  readonly problems: readonly string[]
}

type Anchors = Readonly<
  Record<'surface-0' | 'surface-1' | 'surface-2' | 'surface-3' | 'text-primary' | 'text-secondary' | 'text-muted', string>
>

interface Painted {
  readonly anchors: Anchors
  readonly sky: readonly Hsl[]
  readonly satScale: number
}

interface Hsl {
  readonly h: number
  readonly s: number
  readonly l: number
}

const ROLES = { danger: '#c62f35', success: '#1f8a5c', warning: '#a86f0c' } as const
const LIGHT_ROLES = { ...ROLES, accent: '#7b2cbf', pro: '#5a189a' } as const
const DARK_ROLES = { accent: '#9d4edd', pro: '#7b2cbf', danger: '#e5484d', success: '#3fb98a', warning: '#d9a23a' } as const

/** Light-mode paper per season: winter ice, spring sage, summer sand, autumn amber. */
const SEASON_PAPER: Readonly<Record<Season, Hsl>> = {
  winter: { h: 212, s: 24, l: 91 },
  spring: { h: 140, s: 18, l: 90 },
  summer: { h: 44, s: 34, l: 90 },
  autumn: { h: 28, s: 32, l: 88 },
}

/** A clear day's sky per season: top of the window, then the glow it settles into under the prompt. */
const SEASON_SKY: Readonly<Record<Season, { top: Hsl; glow: Hsl }>> = {
  winter: { top: { h: 205, s: 40, l: 88 }, glow: { h: 232, s: 28, l: 90 } },
  spring: { top: { h: 188, s: 50, l: 84 }, glow: { h: 110, s: 34, l: 85 } },
  summer: { top: { h: 202, s: 72, l: 79 }, glow: { h: 38, s: 70, l: 82 } },
  autumn: { top: { h: 212, s: 46, l: 82 }, glow: { h: 20, s: 58, l: 82 } },
}

/** The void at night leans with the season: colder in winter, warmer in autumn. */
const SEASON_NIGHT_HUE: Readonly<Record<Season, number>> = { winter: 258, spring: 278, summer: 282, autumn: 292 }

const WEATHER_LIGHT: Readonly<Record<Weather | 'unknown', { sat: number; dl: number; hue?: number }>> = {
  clear: { sat: 1, dl: 1 },
  unknown: { sat: 1, dl: 0 },
  cloudy: { sat: 0.35, dl: -1 },
  fog: { sat: 0.2, dl: 3 },
  rain: { sat: 0.5, dl: -4, hue: 212 },
  snow: { sat: 0.35, dl: 5, hue: 210 },
  storm: { sat: 0.5, dl: 0 },
}

const VOID_NIGHT_GROUND: readonly Hsl[] = [
  { h: 0, s: 0, l: 0 },
  { h: 280, s: 33, l: 2.5 },
  { h: 276, s: 50, l: 10 },
]

const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, value))

function hex({ h, s, l }: Hsl): `#${string}` {
  const sat = clamp(s, 0, 100) / 100
  const light = clamp(l, 0, 100) / 100
  const k = (n: number): number => (n + h / 30) % 12
  const a = sat * Math.min(light, 1 - light)
  const channel = (n: number): string =>
    Math.round(255 * (light - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))))
      .toString(16)
      .padStart(2, '0')
  return `#${channel(0)}${channel(8)}${channel(4)}`
}

function ground(stops: readonly Hsl[], satScale: number): ThemeSetArgs['backdrop'] {
  const last = stops.length - 1
  return {
    gradient: {
      angle: 180,
      stops: stops.map((stop, index) => ({ at: index / last, color: hex({ ...stop, s: stop.s * satScale }) })),
    },
  }
}

const isDark = ({ phase, weather }: SkyState): boolean => phase === 'night' || phase === 'twilight' || weather === 'storm'

function lightLook(state: SkyState): Painted {
  const paper = SEASON_PAPER[state.season]
  const weather = WEATHER_LIGHT[state.weather]
  const phaseShift = state.phase === 'dawn' ? { h: 345, ds: 6, dl: -2 } : state.phase === 'dusk' ? { h: 28, ds: 10, dl: -4 } : undefined
  const hue = weather.hue ?? (phaseShift === undefined ? paper.h : (paper.h + phaseShift.h) / 2)
  const sat = (paper.s + (phaseShift?.ds ?? 0)) * weather.sat
  const base = clamp(paper.l + weather.dl + (phaseShift?.dl ?? 0), 82, 93)
  const surface = (dl: number): string => hex({ h: hue, s: sat, l: clamp(base + dl, 0, 98) })
  const ink = (l: number): string => hex({ h: hue, s: 14, l })
  const anchors: Anchors = {
    'surface-0': surface(0),
    'surface-1': surface(3.5),
    'surface-2': surface(6),
    'surface-3': surface(6),
    'text-primary': ink(5),
    'text-secondary': ink(23),
    'text-muted': ink(36),
  }
  const paperStop = { h: hue, s: sat, l: base }
  const sky: readonly Hsl[] =
    state.phase === 'dawn'
      ? [{ h: 230, s: 35, l: 80 }, { h: 345, s: 45, l: 86 }, { h: 30, s: 70, l: 84 }]
      : state.phase === 'dusk'
        ? [{ h: 265, s: 35, l: 72 }, { h: 330, s: 40, l: 78 }, { h: 28, s: 80, l: 72 }]
        : state.weather === 'clear' || state.weather === 'unknown'
          ? [SEASON_SKY[state.season].top, paperStop, SEASON_SKY[state.season].glow]
          : [{ h: weather.hue ?? hue, s: 14, l: clamp(base - 8 + weather.dl, 60, 95) }, paperStop, { h: 275, s: 18, l: 86 }]
  const satScale = state.weather === 'clear' || state.weather === 'unknown' ? 1 : Math.max(weather.sat, 0.4)
  return { anchors, sky, satScale }
}

function darkLook(state: SkyState): Painted {
  const storm = state.weather === 'storm'
  const wet = state.weather === 'rain' || state.weather === 'snow'
  const hue = storm ? 230 : wet ? 225 : state.phase === 'twilight' ? 245 : SEASON_NIGHT_HUE[state.season]
  const dull = state.weather === 'cloudy' || state.weather === 'fog' ? 0.5 : 1
  const sat = (storm ? 18 : state.phase === 'twilight' ? 30 : 22) * dull
  const base = state.phase === 'twilight' ? 6 : 2.5
  const surface = (dl: number): string => hex({ h: hue, s: sat, l: base + dl })
  const ink = (l: number): string => hex({ h: hue, s: 12, l })
  const anchors: Anchors = {
    'surface-0': surface(0),
    'surface-1': surface(2),
    'surface-2': surface(3.5),
    'surface-3': surface(5),
    'text-primary': ink(94),
    'text-secondary': ink(77),
    'text-muted': ink(61),
  }
  const sky: readonly Hsl[] = storm
    ? [{ h: 220, s: 15, l: 4 }, { h: hue, s: sat, l: base }, { h: 265, s: 25, l: 12 }]
    : state.phase === 'twilight'
      ? [{ h: 235, s: 45, l: 9 }, { h: hue, s: sat, l: base }, { h: 270, s: 45, l: 16 }]
      : wet
        ? [{ h: 0, s: 0, l: 0 }, { h: hue, s: sat, l: base }, { h: 250, s: 30, l: 10 }]
        : VOID_NIGHT_GROUND
  return { anchors, sky, satScale: dull }
}

const TITLE: Readonly<Record<Phase, string>> = { night: 'Night', twilight: 'Blue Hour', dawn: 'Dawn', dusk: 'Dusk', day: 'Day' }
const capital = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1)

export function skyLabel(state: SkyState): string {
  const parts = [TITLE[state.phase], capital(state.season)]
  return `Void Sky · ${(state.weather === 'unknown' ? parts : [...parts, capital(state.weather)]).join(' · ')}`
}

const cache = new Map<string, SkyLook>()

/** The whole theme for one sky. Built once per state; a state repeats all day. */
export function skyLook(state: SkyState): SkyLook {
  const key = `${state.phase}|${state.season}|${state.weather}`
  const cached = cache.get(key)
  if (cached !== undefined) return cached
  const dark = isDark(state)
  const { anchors, sky, satScale } = dark ? darkLook(state) : lightLook(state)
  const label = skyLabel(state)
  const colors = dark
    ? makeColors({ label, id: 'ifeelvoid-sky', only: 'dark', roles: DARK_ROLES, dark: { gray: { anchors: anchors } } })
    : makeColors({ label, id: 'ifeelvoid-sky', only: 'light', roles: LIGHT_ROLES, light: { gray: { anchors: anchors } } })
  const look: SkyLook = { key, label, args: { colors: colors.theme, backdrop: ground(sky, satScale) }, problems: colors.problems }
  cache.set(key, look)
  return look
}
