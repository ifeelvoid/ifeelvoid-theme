import type { EngineInterface, Register } from 'claude-code'

import { LOOKS, lookForHour, newYorkHour, type LookName } from './looks'
import { SIGNAL_BLEED } from './scene'

const CHECK_EVERY_MS = 60_000

// Module state resets on reload, which is what we want: the schedule re-decides.
let current: LookName | undefined
let override: LookName | undefined

async function apply($: EngineInterface, name: LookName): Promise<void> {
  if (name === current) return
  const look = LOOKS[name]
  const unpainted = look.problems.find(line => line.startsWith("Desktop won't paint"))
  if (unpainted !== undefined) $.ui.toast(`${look.label}: ${unpainted}`)
  const set = await $.theme.set(look.args)
  current = name
  if (!set.isDrawn) $.ui.status(set.reason)
}

async function scheduled($: EngineInterface): Promise<LookName> {
  return lookForHour(newYorkHour(await $.clock.now()))
}

export const register: Register = on => {
  current = undefined
  override = undefined

  on('session.start', async ($, e, next) => {
    await apply($, await scheduled($))
    $.clock.every(CHECK_EVERY_MS, async () => {
      if (override === undefined) await apply($, await scheduled($))
    })
    $.command.register({ name: 'void', description: 'Theme: void, signal-bleed, studio-night, release, or auto' })
    return next(e)
  })

  on('command.run', { command: 'void' }, async ($, e) => {
    const arg = e.args.trim()
    if (arg === '' || arg === 'auto') {
      override = undefined
      const name = await scheduled($)
      await apply($, name)
      return { text: `Back on schedule: ${LOOKS[name].label}.` }
    }
    if (!Object.hasOwn(LOOKS, arg)) return { text: 'Use: /void void | signal-bleed | studio-night | release | auto' }
    override = arg as LookName
    await apply($, override)
    return { text: `${LOOKS[override].label} until /void auto.` }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.props.scene !== 'signal-bleed' || (e.surface !== 'desktop' && e.surface !== 'mobile')) return next(e)
    const { Svg } = $.ui.resolve(e)
    return <Svg source={SIGNAL_BLEED} alt="Scanlines drifting down the edges with an occasional purple glitch" isInteractive />
  })
}
