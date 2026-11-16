// Where the sun is and what season it is, from the clock alone. No network.

export const NEW_YORK = { lat: 40.7128, lon: -74.006 } as const

export type Phase = 'night' | 'twilight' | 'dawn' | 'dusk' | 'day'
export type Season = 'winter' | 'spring' | 'summer' | 'autumn'

const RAD = Math.PI / 180
const MS_PER_DAY = 86_400_000
const J2000_FROM_EPOCH_DAYS = 10_957.5 // 2000-01-01T12:00Z in days since 1970
const RISING_PROBE_MS = 10 * 60_000

/** Solar elevation in degrees (low-precision almanac, good to well under a degree). */
export function solarElevation(epochMs: number, lat: number, lon: number): number {
  const d = epochMs / MS_PER_DAY - J2000_FROM_EPOCH_DAYS
  const meanLong = (280.459 + 0.98564736 * d) % 360
  const anomaly = ((357.529 + 0.98560028 * d) % 360) * RAD
  const eclLong = (meanLong + 1.915 * Math.sin(anomaly) + 0.02 * Math.sin(2 * anomaly)) * RAD
  const obliquity = (23.439 - 0.00000036 * d) * RAD
  const declination = Math.asin(Math.sin(obliquity) * Math.sin(eclLong))
  const rightAscension = Math.atan2(Math.cos(obliquity) * Math.sin(eclLong), Math.cos(eclLong)) / RAD
  const gmstDeg = ((18.697374558 + 24.06570982441908 * d) % 24) * 15
  const hourAngle = (gmstDeg + lon - rightAscension) * RAD
  const latRad = lat * RAD
  const sinElev =
    Math.sin(latRad) * Math.sin(declination) + Math.cos(latRad) * Math.cos(declination) * Math.cos(hourAngle)
  return Math.asin(sinElev) / RAD
}

/** Night below -12°, blue hour to -4°, golden hour to +6°, full day above. */
export function phaseAt(epochMs: number, lat = NEW_YORK.lat, lon = NEW_YORK.lon): Phase {
  const elevation = solarElevation(epochMs, lat, lon)
  if (elevation < -12) return 'night'
  if (elevation < -4) return 'twilight'
  if (elevation < 6) return solarElevation(epochMs + RISING_PROBE_MS, lat, lon) > elevation ? 'dawn' : 'dusk'
  return 'day'
}

/** Meteorological seasons in New York: Dec–Feb winter, Mar–May spring, and so on. */
export function seasonAt(epochMs: number): Season {
  const month = Number.parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', month: 'numeric' }).format(epochMs),
    10,
  )
  if (month === 12 || month <= 2) return 'winter'
  if (month <= 5) return 'spring'
  if (month <= 8) return 'summer'
  return 'autumn'
}
