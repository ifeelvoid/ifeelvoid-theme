import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// IFEELVOID — black foundation, purple used sparingly, white for contrast only.
// Source: the IFEELVOID brand color palette.
// Dark only: the void has no daylight version.
const { theme, problems } = makeColors({
  label: 'IFEELVOID',
  only: 'dark',
  roles: {
    accent: '#9d4edd', // bright purple — CTAs, focus, active state
    pro: '#7b2cbf', // deep purple — literals, premium marks
    danger: '#e5484d', // cold red
    success: '#3fb98a', // cold green
    warning: '#d9a23a', // dry amber
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#060408', // the void, a breath of purple in the black
        'surface-1': '#0c0910', // cards
        'surface-2': '#110d16', // panels
        'surface-3': '#16111c', // menus
        'text-primary': '#efecf3',
        'text-secondary': '#bfb7ca',
        'text-muted': '#948aa3',
      },
    },
  },
})

// Black to dark purple only, per the palette's gradient rule. The glow sits at the foot, under the prompt.
const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: {
    gradient: {
      angle: 180,
      stops: [
        { at: 0, color: '#000000' },
        { at: 0.62, color: '#060408' },
        { at: 1, color: '#1a0d26' },
      ],
    },
  },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(`IFEELVOID: ${unpainted}`)
    }
    const set = await $.theme.set(LOOK)

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })
}
