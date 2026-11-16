import { expect, test } from 'claude-code/testing'

import { lookForHour, newYorkHour } from '../hooks/looks'

test('each hour boundary picks the right look', () => {
  expect(lookForHour(0)).toBe('studio-night')
  expect(lookForHour(7)).toBe('studio-night')
  expect(lookForHour(8)).toBe('day')
  expect(lookForHour(17)).toBe('day')
  expect(lookForHour(18)).toBe('signal-bleed')
  expect(lookForHour(23)).toBe('signal-bleed')
})

test('New York hour follows daylight saving and wraps at midnight', () => {
  expect(newYorkHour(Date.UTC(2026, 6, 1, 12))).toBe(8) // EDT, UTC-4
  expect(newYorkHour(Date.UTC(2026, 0, 15, 12))).toBe(7) // EST, UTC-5
  expect(newYorkHour(Date.UTC(2026, 0, 15, 5))).toBe(0) // midnight, not 24
  expect(newYorkHour(Date.UTC(2026, 0, 15, 4, 59))).toBe(23)
})

// The test host refuses theme.set, so these cover only the input check that runs before it.
test('/void rejects names that are not looks, built-in object names included', async ($, on) => {
  on('command.register', () => ({ value: { command: 'void' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  for (const args of ['toString', 'constructor', '__proto__', 'hasOwnProperty', 'nope']) {
    const run = await $.command.run({ command: 'void', args, origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 100 } })
    expect(run.text).toContain('Use: /void')
  }
})
