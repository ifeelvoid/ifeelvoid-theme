import { expect, test } from 'claude-code/testing'

import { skyLook } from '../hooks/sky'
import { NEW_YORK, phaseAt, seasonAt, solarElevation } from '../hooks/sun'
import { weatherFromCode } from '../hooks/weather'

test('solar elevation over New York matches the solstice noons', () => {
  const june = solarElevation(Date.parse('2026-06-21T16:57:00Z'), NEW_YORK.lat, NEW_YORK.lon)
  const december = solarElevation(Date.parse('2026-12-21T16:54:00Z'), NEW_YORK.lat, NEW_YORK.lon)
  expect(Math.abs(june - 72.6) < 0.5).toBe(true)
  expect(Math.abs(december - 25.9) < 0.5).toBe(true)
})

test('one November day walks dawn, day, dusk, blue hour, night', () => {
  expect(phaseAt(Date.parse('2026-11-16T12:00:00Z'))).toBe('dawn')
  expect(phaseAt(Date.parse('2026-11-16T17:00:00Z'))).toBe('day')
  expect(phaseAt(Date.parse('2026-11-16T21:20:00Z'))).toBe('dusk')
  expect(phaseAt(Date.parse('2026-11-16T22:00:00Z'))).toBe('twilight')
  expect(phaseAt(Date.parse('2026-11-17T03:00:00Z'))).toBe('night')
})

test('seasons follow the New York calendar month', () => {
  expect(seasonAt(Date.parse('2026-01-15T17:00:00Z'))).toBe('winter')
  expect(seasonAt(Date.parse('2026-04-15T17:00:00Z'))).toBe('spring')
  expect(seasonAt(Date.parse('2026-07-15T17:00:00Z'))).toBe('summer')
  expect(seasonAt(Date.parse('2026-11-16T17:00:00Z'))).toBe('autumn')
  expect(seasonAt(Date.parse('2026-12-01T03:00:00Z'))).toBe('autumn') // still Nov 30 in New York
})

test('WMO codes fold into the six skies', () => {
  expect(weatherFromCode(0, 0)).toBe('clear')
  expect(weatherFromCode(2, 80)).toBe('cloudy')
  expect(weatherFromCode(45, 0)).toBe('fog')
  expect(weatherFromCode(63, 100)).toBe('rain')
  expect(weatherFromCode(75, 100)).toBe('snow')
  expect(weatherFromCode(95, 100)).toBe('storm')
})

test('every sky Desktop can be asked to paint, it paints', () => {
  for (const phase of ['night', 'twilight', 'dawn', 'dusk', 'day'] as const)
    for (const season of ['winter', 'spring', 'summer', 'autumn'] as const)
      for (const weather of ['clear', 'cloudy', 'fog', 'rain', 'snow', 'storm', 'unknown'] as const) {
        const look = skyLook({ phase, season, weather })
        expect(look.problems.filter(line => line.startsWith("Desktop won't paint"))).toEqual([])
      }
})
