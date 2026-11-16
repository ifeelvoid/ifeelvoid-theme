import type { EngineInterface } from 'claude-code'

import { NEW_YORK } from './sun'

export type Weather = 'clear' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm'

// Open-Meteo: free, no key. Only New York's city-level coordinates leave the machine.
const WEATHER_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${NEW_YORK.lat}&longitude=${NEW_YORK.lon}` +
  '&current=weather_code,cloud_cover&timezone=America%2FNew_York'

/** WMO weather interpretation codes, folded into the six skies the theme draws. */
export function weatherFromCode(code: number, cloudCover: number): Weather {
  if (code >= 95) return 'storm'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain'
  if (code === 45 || code === 48) return 'fog'
  if (code === 3 || cloudCover >= 70) return 'cloudy'
  return 'clear'
}

/** The current sky over New York, or an error line. Never throws. */
export async function fetchWeather($: EngineInterface): Promise<{ weather: Weather } | { error: string }> {
  try {
    const response = await $.http.fetch(WEATHER_URL)
    if (!response.ok) return { error: `weather service answered ${response.status}` }
    const body: unknown = JSON.parse(response.text)
    const current = (body as { current?: { weather_code?: unknown; cloud_cover?: unknown } }).current
    if (typeof current?.weather_code !== 'number') return { error: 'weather service sent no weather_code' }
    const cover = typeof current.cloud_cover === 'number' ? current.cloud_cover : 0
    return { weather: weatherFromCode(current.weather_code, cover) }
  } catch (error) {
    return { error: `weather fetch failed: ${error instanceof Error ? error.message : String(error)}` }
  }
}
