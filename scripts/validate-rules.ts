import { currentRules, validateRuleDataset } from '../src/rules/index.ts'

const result = validateRuleDataset(currentRules)

if (!result.valid) {
  process.stderr.write(`${result.errors.join('\n')}\n`)
  process.exitCode = 1
}
