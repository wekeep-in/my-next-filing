import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { isAbsolute, join, relative } from 'node:path'
import { expect, test, vi } from 'vitest'
import { runLighthouse } from '../../scripts/lighthouse'

vi.mock('node:child_process', () => ({ spawnSync: vi.fn() }))

test.each([0, 1])(
  'cleans its native Chrome profile when Lighthouse exits with %i',
  (status) => {
    let profile = ''
    vi.mocked(spawnSync).mockImplementation((_command, args) => {
      const flag = args?.find((arg) =>
        arg.startsWith('--collect.settings.chromeFlags='),
      )
      const value: unknown = JSON.parse(flag!.split('--user-data-dir=')[1])
      if (typeof value !== 'string')
        throw new Error('Expected an explicit profile path')
      profile = value
      expect(isAbsolute(profile)).toBe(true)
      expect(relative('artifacts/lighthouse/.profiles', profile)).toMatch(
        /^run-[^/\\]+$/,
      )
      expect(existsSync(profile)).toBe(true)
      mkdirSync(join(profile, 'Default'))
      writeFileSync(join(profile, 'Default/Preferences'), '{}')
      return {
        status,
        signal: null,
        pid: 1,
        output: [],
        stdout: Buffer.alloc(0),
        stderr: Buffer.alloc(0),
      }
    })
    expect(runLighthouse()).toBe(status)
    expect(existsSync(profile)).toBe(false)
  },
)

test('cleans the profile when the audit process cannot start', () => {
  let profile = ''
  vi.mocked(spawnSync).mockImplementation((_command, args) => {
    const flag = args?.find((arg) =>
      arg.startsWith('--collect.settings.chromeFlags='),
    )
    const value: unknown = JSON.parse(flag!.split('--user-data-dir=')[1])
    if (typeof value !== 'string')
      throw new Error('Expected an explicit profile path')
    profile = value
    throw new Error('Synthetic launch failure')
  })
  expect(() => runLighthouse()).toThrow('Synthetic launch failure')
  expect(existsSync(profile)).toBe(false)
})
