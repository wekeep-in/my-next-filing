import assert from 'node:assert/strict'
import { evaluate } from '../src/evaluation/index.ts'
import type { Profile } from '../src/evaluation/index.ts'
import { currentRules, validateRuleDataset } from '../src/rules/index.ts'
import type { RuleDataset } from '../src/rules/index.ts'

const now = new Date('2026-08-30T12:00:00+05:30')

const profile = (changes: Partial<Profile> = {}): Profile => ({
  scopeConfirmed: true,
  residentIndividual: true,
  newTaxRegime: true,
  itOrSoftwareConsulting: true,
  presumptiveProfessionalTaxation: true,
  directIndianClients: true,
  noGstin: true,
  grossProfessionalReceipts: 1_900_000,
  cashReceipts: 0,
  higherExpectedProfit: 1_400_000,
  taxableBankInterest: 10_000,
  tdsAlreadyDeducted: 40_000,
  tcsAlreadyCollected: 0,
  advanceTaxAlreadyPaid: 0,
  stateOrUnionTerritory: 'Maharashtra',
  gstAggregateTurnover: 1_910_000,
  unsupportedFacts: [],
  ...changes,
})

assert.equal(validateRuleDataset(currentRules, now).valid, true)
assert.equal(
  validateRuleDataset({ ...currentRules, effectiveStart: '2026-02-30' }, now)
    .valid,
  false,
)
assert.equal(
  validateRuleDataset({ ...currentRules, presumptive: undefined }, now).valid,
  false,
)
assert.equal(
  validateRuleDataset({ ...currentRules, ruleSources: [] }, now).valid,
  false,
)
assert.equal(
  validateRuleDataset(
    {
      ...currentRules,
      income: {
        ...currentRules.income,
        slabs: [
          { ...currentRules.income.slabs[0], upper: 400_001 },
          ...currentRules.income.slabs.slice(1),
        ],
      },
    },
    now,
  ).valid,
  false,
)
assert.equal(
  validateRuleDataset(
    {
      ...currentRules,
      annualReturn: {
        ...currentRules.annualReturn,
        operativeDueDate: '2027-09-15',
        extensionSourceId: 'missing-extension-source',
      },
    },
    now,
  ).valid,
  false,
)

const malformed = {
  ...currentRules,
  sources: undefined,
} as unknown as RuleDataset
assert.doesNotThrow(() => evaluate(profile(), now, malformed))
assert.equal(evaluate(profile(), now, malformed).kind, 'stale-rules')

const example = evaluate(profile(), now, currentRules)
assert.equal(example.kind, 'supported')
if (example.kind === 'supported') {
  assert.equal(example.tax.professionalIncome, 1_400_000)
  assert.equal(example.tax.roundedTotalIncome, 1_410_000)
  assert.equal(example.tax.finalAmount, 55_160)
  assert.equal(example.gst.difference, 90_000)
  assert.equal(example.annualReturn.requiredByIncome, true)
  assert.deepEqual(
    example.obligations.map((obligation) => obligation.id),
    ['advance-tax', 'annual-return'],
  )
}

const noFiling = evaluate(
  profile({
    grossProfessionalReceipts: 0,
    higherExpectedProfit: 0,
    taxableBankInterest: 0,
    tdsAlreadyDeducted: 0,
    gstAggregateTurnover: 0,
  }),
  now,
  currentRules,
)
assert.equal(noFiling.kind, 'supported')
if (noFiling.kind === 'supported') {
  assert.equal(noFiling.annualReturn.requiredByIncome, false)
  assert.equal(noFiling.nextObligation, null)
  assert.deepEqual(noFiling.obligations, [])
}

const returnRequired = evaluate(
  profile({
    grossProfessionalReceipts: 800_010,
    higherExpectedProfit: 400_005,
    taxableBankInterest: 0,
    tdsAlreadyDeducted: 0,
    gstAggregateTurnover: 800_010,
  }),
  now,
  currentRules,
)
assert.equal(returnRequired.kind, 'supported')
if (returnRequired.kind === 'supported') {
  assert.equal(returnRequired.annualReturn.requiredByIncome, true)
  assert.deepEqual(
    returnRequired.obligations.map((obligation) => obligation.id),
    ['annual-return'],
  )
}

const roundedBalance = evaluate(
  profile({
    grossProfessionalReceipts: 2_600_200,
    higherExpectedProfit: 1_300_100,
    taxableBankInterest: 0,
    tdsAlreadyDeducted: 0,
    advanceTaxAlreadyPaid: 1,
    gstAggregateTurnover: 1_000_000,
  }),
  now,
  currentRules,
)
assert.equal(roundedBalance.kind, 'supported')
if (roundedBalance.kind === 'supported') {
  assert.equal(roundedBalance.tax.finalAmount, 78_010)
  assert.equal(roundedBalance.obligations[0]?.amountDue, 78_010)
}

const roundedToZero = evaluate(
  profile({
    grossProfessionalReceipts: 2_600_200,
    higherExpectedProfit: 1_300_100,
    taxableBankInterest: 0,
    tdsAlreadyDeducted: 78_014,
    gstAggregateTurnover: 1_000_000,
  }),
  now,
  currentRules,
)
assert.equal(roundedToZero.kind, 'supported')
if (roundedToZero.kind === 'supported') {
  assert.equal(roundedToZero.tax.finalAmount, 0)
  assert.equal(roundedToZero.tax.outcome, 'settled')
}

const outsideScope = evaluate(
  profile({ scopeConfirmed: false }),
  now,
  currentRules,
)
assert.equal(outsideScope.kind, 'unsupported')

process.stdout.write('Evaluation and rule checks passed.\n')
