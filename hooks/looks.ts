import type { ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

export type LookName = 'void' | 'signal-bleed' | 'studio-night' | 'release'

export interface Look {
  readonly name: LookName
  readonly label: string
  readonly args: ThemeSetArgs
  readonly problems: readonly string[]
}

// The void: black foundation, purple used sparingly, white for contrast only.
const VOID_ANCHORS = {
  'surface-0': '#060408',
  'surface-1': '#0c0910',
  'surface-2': '#110d16',
  'surface-3': '#16111c',
  'text-primary': '#efecf3',
  'text-secondary': '#bfb7ca',
  'text-muted': '#948aa3',
} as const

const voidColors = makeColors({
  label: 'IFEELVOID',
  id: 'ifeelvoid',
  only: 'dark',
  roles: { accent: '#9d4edd', pro: '#7b2cbf', danger: '#e5484d', success: '#3fb98a', warning: '#d9a23a' },
  dark: { gray: { anchors: VOID_ANCHORS } },
})

// Studio Night: the same black, lit by VU-meter amber. Purple stays only on literals.
const studioColors = makeColors({
  label: 'IFEELVOID Studio Night',
  id: 'ifeelvoid-studio-night',
  only: 'dark',
  roles: { accent: '#d99a2b', pro: '#9d4edd', danger: '#e5484d', success: '#3fb98a', warning: '#e0702e' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#070606',
        'surface-1': '#0d0c0b',
        'surface-2': '#131110',
        'surface-3': '#181614',
        'text-primary': '#f1ede6',
        'text-secondary': '#c6beb1',
        'text-muted': '#9a9183',
      },
    },
  },
})

// Release Mode: pure black and white, one purple. Built to be read tired.
const releaseColors = makeColors({
  label: 'IFEELVOID Release',
  id: 'ifeelvoid-release',
  only: 'dark',
  contrast: 'more',
  roles: { accent: '#9d4edd', pro: '#b8b8b8', danger: '#ff5a5a', success: '#4fd18b', warning: '#f2b33d' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#000000',
        'surface-1': '#0a0a0a',
        'surface-2': '#111111',
        'surface-3': '#161616',
        'text-primary': '#ffffff',
        'text-secondary': '#d4d4d4',
        'text-muted': '#a3a3a3',
      },
    },
  },
})

// Black to dark purple only: the palette's one allowed gradient. The glow sits under the prompt.
const VOID_GROUND: ThemeSetArgs['backdrop'] = {
  gradient: {
    angle: 180,
    stops: [
      { at: 0, color: '#000000' },
      { at: 0.62, color: '#060408' },
      { at: 1, color: '#1a0d26' },
    ],
  },
}

export const LOOKS: Readonly<Record<LookName, Look>> = {
  void: { name: 'void', label: 'IFEELVOID', args: { colors: voidColors.theme, backdrop: VOID_GROUND }, problems: voidColors.problems },
  'signal-bleed': {
    name: 'signal-bleed',
    label: 'Signal Bleed',
    args: { colors: voidColors.theme, backdrop: { scene: 'signal-bleed', glass: false } },
    problems: voidColors.problems,
  },
  'studio-night': {
    name: 'studio-night',
    label: 'Studio Night',
    args: { colors: studioColors.theme, backdrop: { color: '#070606' } },
    problems: studioColors.problems,
  },
  release: {
    name: 'release',
    label: 'Release Mode',
    args: { colors: releaseColors.theme, backdrop: { color: '#000000' } },
    problems: releaseColors.problems,
  },
}

// America/New_York: Release Mode by day, Signal Bleed in the evening, Studio Night after midnight.
export function lookForHour(hour: number): LookName {
  if (hour >= 8 && hour < 18) return 'release'
  if (hour >= 18) return 'signal-bleed'
  return 'studio-night'
}

export function newYorkHour(epochMs: number): number {
  const text = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', hourCycle: 'h23' }).format(epochMs)
  return Number.parseInt(text, 10)
}
