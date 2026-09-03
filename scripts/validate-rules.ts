import { currentRules, validateRules } from '../src/rules/index.ts'

const result = validateRules(currentRules)

if (!result.valid) {
  process.stderr.write(`${result.errors.join('\n')}\n`)
  process.exitCode = 1
}
