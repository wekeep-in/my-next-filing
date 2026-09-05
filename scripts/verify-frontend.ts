import assert from 'node:assert/strict'
import { indiaDate } from '../src/lib/india-date.ts'
import {
  blankDraft,
  canOpenGroup,
  completeDraft,
  draftFromProfile,
  exampleProfile,
  firstIncompleteGroup,
  hasForeignClients,
  hasPlatformWork,
  isBlankDraft,
  isBusinessPath,
  isUnregisteredGst,
  questionnaireGroups,
  validateDraftGroup,
} from '../src/routes/check/model.ts'

const today = '2026-09-05'
assert.equal(indiaDate(new Date('2026-09-04T18:29:59Z')), '2026-09-04')
assert.equal(indiaDate(new Date('2026-09-04T18:30:00Z')), today)
assert.equal(indiaDate(new Date('2026-12-31T18:30:00Z')), '2027-01-01')
assert.equal(isBlankDraft(blankDraft()), true)
assert.equal(firstIncompleteGroup(blankDraft(), today), 'tax-year')
assert.equal(canOpenGroup(blankDraft(), 'review', today), false)
const exampleDraft = draftFromProfile(exampleProfile)
assert.equal(isBlankDraft(exampleDraft), false)
assert.equal(firstIncompleteGroup(exampleDraft, today), null)
assert.equal(canOpenGroup(exampleDraft, 'review', today), true)
const completedExample = completeDraft(exampleDraft, today)
assert.ok(completedExample.valid)
assert.deepEqual(completedExample.profile, exampleProfile)
assert.equal(completeDraft(blankDraft(), today).valid, false)
for (const { id } of questionnaireGroups) {
  assert.deepEqual(validateDraftGroup(exampleDraft, id, today), [])
  if (id !== 'review')
    assert.ok(
      validateDraftGroup(blankDraft(), id, today).every(
        (error) => error.group === id,
      ),
    )
}
assert.equal(
  completeDraft(
    {
      ...exampleDraft,
      amounts: { ...exampleDraft.amounts, cashReceipts: '2000000' },
    },
    today,
  ).valid,
  false,
)
assert.equal(
  completeDraft({ ...exampleDraft, personKind: 'not-individual' }, today).valid,
  true,
)
assert.equal(
  isBusinessPath({ ...exampleDraft, path: 'eligible-business' }),
  true,
)
for (const delivery of ['platform', 'both', 'direct', 'not-sure'] as const)
  assert.equal(
    hasPlatformWork({ ...exampleDraft, delivery }),
    delivery === 'platform' || delivery === 'both',
  )
for (const clientKind of ['foreign', 'mixed', 'domestic', 'not-sure'] as const)
  assert.equal(
    hasForeignClients({ ...exampleDraft, clientKind }),
    clientKind === 'foreign' || clientKind === 'mixed',
  )
assert.equal(isUnregisteredGst(exampleDraft), true)
assert.equal(
  isUnregisteredGst({ ...exampleDraft, gstKind: 'registered' }),
  false,
)
process.stdout.write('Frontend verification passed.\n')
