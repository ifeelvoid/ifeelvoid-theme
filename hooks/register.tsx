import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { LOOKS, lookForHour, newYorkHour, type LookName } from './looks'
import { EVENT_HORIZON } from './scene-horizon'
import { SIGNAL_BLEED } from './scene'
import { skyLook, type SkyState } from './sky'
import { phaseAt, seasonAt } from './sun'
import { fetchWeather, type Weather } from './weather'

const CHECK_EVERY_MS = 60_000
const WEATHER_EVERY_MS = 15 * 60_000
const USAGE = 'Use: /void sky | event-horizon | void | day | signal-bleed | studio-night | release | schedule | auto'

type Mode = 'sky' | 'schedule' | LookName

interface Paint {
  readonly key: string
  readonly label: string
  readonly args: ThemeSetArgs
  readonly problems: readonly string[]
}

// Module state resets on reload: back to the live sky.
let mode: Mode = 'sky'
let painted: string | undefined
let weather: Weather | 'unknown' = 'unknown'

async function paint($: EngineInterface, look: Paint, status: string | undefined): Promise<void> {
  if (look.key === painted) return
  const unpainted = look.problems.find(line => line.startsWith("Desktop won't paint"))
  if (unpainted !== undefined) $.ui.toast(`${look.label}: ${unpainted}`)
  const set = await $.theme.set(look.args)
  painted = look.key
  $.ui.status(set.isDrawn ? status : set.reason)
}

async function skyNow($: EngineInterface): Promise<SkyState> {
  const now = await $.clock.now()
  return { phase: phaseAt(now), season: seasonAt(now), weather }
}

async function refresh($: EngineInterface): Promise<string> {
  if (mode === 'sky') {
    const look = skyLook(await skyNow($))
    await paint($, look, look.label)
    return look.label
  }
  const name = mode === 'schedule' ? lookForHour(newYorkHour(await $.clock.now())) : mode
  await paint($, { key: `look:${name}`, ...LOOKS[name] }, undefined)
  return LOOKS[name].label
}

async function updateWeather($: EngineInterface): Promise<void> {
  const result = await fetchWeather($)
  if ('error' in result) {
    $.ui.status(`Void Sky: ${result.error}; keeping the last sky`)
    return
  }
  weather = result.weather
  if (mode === 'sky') await refresh($)
}

const SCENES: Readonly<Record<string, { source: string; alt: string }>> = {
  'event-horizon': { source: EVENT_HORIZON, alt: 'A pixel black hole with a purple accretion disk over a pulsing equalizer skyline' },
  'signal-bleed': { source: SIGNAL_BLEED, alt: 'Scanlines drifting down the edges with an occasional purple glitch' },
}

export const register: Register = on => {
  mode = 'sky'
  painted = undefined

  on('session.start', async ($, e, next) => {
    await refresh($)
    void updateWeather($)
    $.clock.every(CHECK_EVERY_MS, async () => {
      await refresh($)
    })
    $.clock.every(WEATHER_EVERY_MS, async () => {
      await updateWeather($)
    })
    $.command.register({
      name: 'void',
      description: 'Theme: sky (sun, season, weather), event-horizon, void, day, signal-bleed, studio-night, release, schedule, or auto',
    })
    return next(e)
  })

  on('command.run', { command: 'void' }, async ($, e) => {
    const arg = e.args.trim()
    if (arg === '' || arg === 'auto' || arg === 'sky') {
      mode = 'sky'
      void updateWeather($)
      return { text: `${await refresh($)}. Follows the sun over New York, the season and the weather.` }
    }
    if (arg === 'schedule') {
      mode = 'schedule'
      return { text: `On the hourly schedule: ${await refresh($)}.` }
    }
    if (!Object.hasOwn(LOOKS, arg)) return { text: USAGE }
    mode = arg as LookName
    return { text: `${await refresh($)} until /void sky.` }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    const scene = SCENES[String(e.props.scene)]
    if (scene === undefined || (e.surface !== 'desktop' && e.surface !== 'mobile')) return next(e)
    const { Svg } = $.ui.resolve(e)
    return <Svg source={scene.source} alt={scene.alt} isInteractive />
  })
}
