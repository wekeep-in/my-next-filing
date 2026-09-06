import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export function runLighthouse(args: readonly string[] = []) {
  const profiles = resolve('artifacts/lighthouse/.profiles')
  mkdirSync(profiles, { recursive: true })
  const profile = mkdtempSync(join(profiles, 'run-'))
  try {
    // chrome-launcher assumes Windows Chrome on WSL. Its last flag must use our native profile path.
    const result = spawnSync(
      process.execPath,
      [
        fileURLToPath(import.meta.resolve('@lhci/cli/src/cli.js')),
        'autorun',
        ...args,
        `--collect.settings.chromeFlags=--user-data-dir=${JSON.stringify(profile)}`,
      ],
      { stdio: 'inherit' },
    )
    if (result.error) throw result.error
    return result.status ?? 1
  } finally {
    rmSync(profile, {
      recursive: true,
      force: true,
      maxRetries: 3,
      retryDelay: 100,
    })
  }
}

if (import.meta.main) process.exitCode = runLighthouse(process.argv.slice(2))
