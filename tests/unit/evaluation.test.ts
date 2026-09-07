import { test } from 'vitest'
import assert from 'node:assert/strict'
import { evaluate, parseProfile } from '../../src/evaluation/index.ts'
import type { Profile } from '../../src/evaluation/index.ts'
import { currentRules, validateRules } from '../../src/rules/index.ts'
import type { RuleDataset } from '../../src/rules/index.ts'
import {
  WORKSPACE_KEY,
  deleteSavedWorkspace,
  deriveWorkspaceView,
  loadSavedWorkspace,
  saveSavedWorkspace,
} from '../../src/workspace/index.ts'
import type { SavedWorkspaceDraft } from '../../src/workspace/index.ts'

const now = new Date('2026-09-08T12:00:00+05:30')

const baseCandidate = {
  taxYear: 'Tax Year 2026-27',
  person: {
    kind: 'individual',
    adult: 'yes',
    residence: 'resident-ordinarily-resident',
  },
  taxRegime: 'new',
  practice: {
    onePractice: 'yes',
    setupInIndia: 'yes',
    workInIndia: 'yes',
    hasPartner: 'no',
    hasEmployee: 'no',
    hasForeignOperation: 'no',
    hasClientWorkSubcontractor: 'no',
    contractorBoundary: 'none',
  },
  activity: 'software-development',
  incomePath: {
    kind: 'specified-profession',
    confirmed: 'yes',
    grossReceipts: 1_900_000,
    cashReceipts: 0,
    declaredProfit: 1_400_000,
  },
  clients: {
    kind: 'domestic',
    delivery: 'direct',
    platform: null,
    foreign: null,
  },
  otherIncome: {
    rentalIncome: { kind: 'none' },
    salary: { kind: 'none' },
    additionalIncome: { kind: 'none' },
    equityGains: { kind: 'none' },
    taxableBankInterest: 10_000,
    tds: 40_000,
    tcs: 0,
    advanceTaxPaid: 0,
    ageSixtyOrOlder: 'no',
    otherAnnualReturnTrigger: 'no',
  },
  gst: {
    kind: 'unregistered',
    state: 'Maharashtra',
    aggregateTurnover: 1_910_000,
    turnoverComplete: 'yes',
    compulsoryRegistration: 'no',
    thresholdLiabilityDate: null,
  },
  unsupportedFacts: [],
} as const

function profileFrom(candidate: unknown): Profile {
  const result = parseProfile(candidate)
  assert.equal(result.valid, true)
  if (!result.valid) throw new Error('Expected a valid Profile.')
  return result.profile
}

const profile = profileFrom(baseCandidate)

const platformFacts = {
  ownAccount: 'yes',
  recipientIdentifiable: 'yes',
  grossBeforeFees: 'yes',
  notEmploymentCommissionBrokerageRoyaltyLicensingAgency: 'yes',
  foreignFeeGstTreatment: 'known',
  noRecipientReverseCharge: 'yes',
} as const

test('validates registration date boundaries', () => {
  for (const [thresholdLiabilityDate, valid] of [
    ['2026-03-31', false],
    ['2026-04-01', true],
    ['2027-03-31', true],
    ['2027-04-01', false],
  ] as const) {
    assert.equal(
      parseProfile({
        ...baseCandidate,
        gst: { ...baseCandidate.gst, thresholdLiabilityDate },
      }).valid,
      valid,
      `GST date boundary: ${thresholdLiabilityDate}`,
    )
  }
})

test('requires platform facts for combined delivery', () => {
  const bothDelivery = evaluate(
    profileFrom({
      ...baseCandidate,
      clients: {
        kind: 'domestic',
        delivery: 'both',
        platform: platformFacts,
        foreign: null,
      },
    }),
    now,
    currentRules,
  )
  assert.equal(bothDelivery.kind, 'supported')
  assert.equal(
    parseProfile({
      ...baseCandidate,
      clients: {
        kind: 'domestic',
        delivery: 'both',
        platform: null,
        foreign: null,
      },
    }).valid,
    false,
  )
})

test('validates rule metadata and supported values', () => {
  assert.equal(validateRules(currentRules, now).valid, true)
  assert.equal(
    validateRules({ ...currentRules, expiresOn: '2028-01-01' }, now).valid,
    false,
  )
  assert.equal(
    validateRules(
      {
        ...currentRules,
        groups: {
          ...currentRules.groups,
          commonIncomeTax: {
            ...currentRules.groups.commonIncomeTax,
            values: {
              ...currentRules.groups.commonIncomeTax.values,
              cessRate: 0.03,
            },
          },
        },
      },
      now,
    ).valid,
    false,
  )
  assert.equal(
    validateRules(
      {
        ...currentRules,
        groups: {
          ...currentRules.groups,
          gstRegistration: {
            ...currentRules.groups.gstRegistration,
            values: {
              ...currentRules.groups.gstRegistration.values,
              standardThreshold: 1_000_000,
            },
          },
        },
      },
      now,
    ).valid,
    true,
  )
})

test('rejects malformed Profiles without coercion', () => {
  assert.equal(parseProfile({ ...baseCandidate, extra: true }).valid, false)
  assert.equal(
    parseProfile({ ...baseCandidate, taxYear: 'Tax Year 2026-99' }).valid,
    false,
  )
  assert.equal(
    parseProfile({
      ...baseCandidate,
      incomePath: { ...baseCandidate.incomePath, grossReceipts: '1900000' },
    }).valid,
    false,
  )
  assert.equal(
    parseProfile({
      ...baseCandidate,
      otherIncome: { ...baseCandidate.otherIncome, tds: 1.5 },
    }).valid,
    false,
  )
  assert.equal(
    parseProfile({
      ...baseCandidate,
      incomePath: { ...baseCandidate.incomePath, cashReceipts: 2_000_000 },
    }).valid,
    false,
  )
  assert.equal(
    parseProfile({
      ...baseCandidate,
      incomePath: {
        ...baseCandidate.incomePath,
        grossReceipts: 1_000_000,
        declaredProfit: 500_000,
      },
      clients: { ...baseCandidate.clients, kind: 'foreign', foreign: null },
    }).valid,
    false,
  )
})

test('reproduces the fictional professional estimate', () => {
  const example = evaluate(profile, now, currentRules)
  assert.equal(example.kind, 'supported')
  if (example.kind === 'supported') {
    assert.equal(example.tax.path, 'specified-profession')
    assert.equal(example.tax.presumptive.usedIncome, 1_400_000)
    assert.equal(example.tax.roundedTotalIncome, 1_410_000)
    assert.equal(example.tax.finalAmount, 55_160)
    assert.equal(example.coverage.gst.kind, 'available')
    assert.equal(example.coverage.gst.value.status, 'below')
    assert.deepEqual(
      example.obligations.map((obligation) => obligation.id),
      ['advance-tax:Tax Year 2026-27', 'annual-return:Tax Year 2026-27'],
    )
    assert.equal('nextObligation' in example, false)
  }
})

test('rejects client-work subcontracting', () => {
  const clientWorkSubcontractor = evaluate(
    profileFrom({
      ...baseCandidate,
      practice: {
        ...baseCandidate.practice,
        hasClientWorkSubcontractor: 'yes',
        contractorBoundary: 'not-sure',
      },
    }),
    now,
    currentRules,
  )
  assert.equal(clientWorkSubcontractor.kind, 'unsupported')
  if (clientWorkSubcontractor.kind === 'unsupported')
    assert.deepEqual(
      clientWorkSubcontractor.facts
        .filter((fact) => fact.code.includes('contractor'))
        .map((fact) => fact.code),
      ['client-work-subcontractor'],
    )
})

test('requires confirmation of unsupported situations', () => {
  const uncertainUnsupportedSituation = evaluate(
    profileFrom({
      ...baseCandidate,
      unsupportedFacts: ['unsupportedFactsNotSure'],
    }),
    now,
    currentRules,
  )
  assert.equal(uncertainUnsupportedSituation.kind, 'unsupported')
  if (uncertainUnsupportedSituation.kind === 'unsupported')
    assert.deepEqual(
      uncertainUnsupportedSituation.facts.map(({ code, label, reason }) => ({
        code,
        label,
        reason,
      })),
      [
        {
          code: 'unsupportedFactsNotSure',
          label: 'Unsupported situations not confirmed',
          reason:
            'Confirm whether any listed situation applies before calculating your plan.',
        },
      ],
    )
})

test('enforces professional receipt limits', () => {
  const professionAtFive = profileFrom({
    ...baseCandidate,
    incomePath: {
      ...baseCandidate.incomePath,
      grossReceipts: 5_000_000,
      cashReceipts: 250_000,
      declaredProfit: 2_500_000,
    },
    otherIncome: {
      ...baseCandidate.otherIncome,
      taxableBankInterest: 0,
      tds: 0,
    },
  })
  assert.equal(evaluate(professionAtFive, now, currentRules).kind, 'supported')
  const professionOverFiveWithLowCash = profileFrom({
    ...baseCandidate,
    incomePath: {
      ...baseCandidate.incomePath,
      grossReceipts: 7_500_000,
      declaredProfit: 3_750_000,
    },
    otherIncome: {
      ...baseCandidate.otherIncome,
      taxableBankInterest: 0,
      tds: 0,
    },
  })
  assert.equal(
    evaluate(professionOverFiveWithLowCash, now, currentRules).kind,
    'supported',
  )
  const professionOverLowCashLimit = profileFrom({
    ...baseCandidate,
    incomePath: {
      ...baseCandidate.incomePath,
      grossReceipts: 7_500_001,
      declaredProfit: 3_750_001,
    },
    otherIncome: {
      ...baseCandidate.otherIncome,
      taxableBankInterest: 0,
      tds: 0,
    },
  })
  assert.equal(
    evaluate(professionOverLowCashLimit, now, currentRules).kind,
    'unsupported',
  )
})

test('evaluates the eligible business path and receipt limit', () => {
  const business = profileFrom({
    ...baseCandidate,
    activity: 'marketing-advertising',
    incomePath: {
      kind: 'eligible-business',
      confirmed: 'yes',
      grossReceipts: 2_000_000,
      qualifyingReceipts: 1_000_000,
      otherReceipts: 1_000_000,
      cashReceipts: 0,
      declaredProfit: 140_000,
      notSpecifiedProfession: 'yes',
      notGoodsCarriage: 'yes',
      notAgencyCommissionBrokerage: 'yes',
      noChapterViiiCDeduction: 'yes',
      fiveYearExclusion: 'none',
    },
    otherIncome: {
      ...baseCandidate.otherIncome,
      taxableBankInterest: 0,
      tds: 0,
    },
  })
  const businessResult = evaluate(business, now, currentRules)
  assert.equal(businessResult.kind, 'supported')
  if (businessResult.kind === 'supported')
    assert.equal(businessResult.tax.presumptive.minimumIncome, 140_000)

  const businessAtLowCashLimit = profileFrom({
    ...business,
    incomePath: {
      ...business.incomePath,
      grossReceipts: 30_000_000,
      qualifyingReceipts: 15_000_000,
      otherReceipts: 15_000_000,
      declaredProfit: 2_100_000,
    },
  })
  assert.equal(
    evaluate(businessAtLowCashLimit, now, currentRules).kind,
    'supported',
  )
})

test('applies the rebate boundary', () => {
  const rebate = evaluate(
    profileFrom({
      ...baseCandidate,
      incomePath: {
        ...baseCandidate.incomePath,
        grossReceipts: 2_400_000,
        declaredProfit: 1_200_000,
      },
      otherIncome: {
        ...baseCandidate.otherIncome,
        taxableBankInterest: 0,
        tds: 0,
      },
    }),
    now,
    currentRules,
  )
  assert.equal(rebate.kind, 'supported')
  if (rebate.kind === 'supported') {
    assert.equal(rebate.tax.roundedTotalIncome, 1_200_000)
    assert.equal(rebate.tax.rebate, 60_000)
    assert.equal(rebate.tax.grossTax, 0)
  }
})

test('applies marginal relief', () => {
  const marginalRelief = evaluate(
    profileFrom({
      ...baseCandidate,
      incomePath: {
        ...baseCandidate.incomePath,
        grossReceipts: 2_420_000,
        declaredProfit: 1_210_000,
      },
      otherIncome: {
        ...baseCandidate.otherIncome,
        taxableBankInterest: 0,
        tds: 0,
      },
    }),
    now,
    currentRules,
  )
  assert.equal(marginalRelief.kind, 'supported')
  if (marginalRelief.kind === 'supported') {
    assert.equal(marginalRelief.tax.marginalRelief, 51_500)
    assert.equal(marginalRelief.tax.grossTax, 10_400)
  }
})

test('creates the advance-tax action at its boundary', () => {
  const advanceBoundary = evaluate(
    profileFrom({
      ...baseCandidate,
      incomePath: {
        ...baseCandidate.incomePath,
        grossReceipts: 2_600_000,
        declaredProfit: 1_300_000,
      },
      otherIncome: {
        ...baseCandidate.otherIncome,
        taxableBankInterest: 0,
        tds: 68_000,
      },
    }),
    now,
    currentRules,
  )
  assert.equal(advanceBoundary.kind, 'supported')
  if (advanceBoundary.kind === 'supported')
    assert.equal(
      advanceBoundary.obligations.some(
        (obligation) => obligation.kind === 'advance-tax',
      ),
      true,
    )
})

test('recognizes the return trigger from credits', () => {
  const returnByCredits = evaluate(
    profileFrom({
      ...baseCandidate,
      incomePath: {
        ...baseCandidate.incomePath,
        grossReceipts: 100_000,
        declaredProfit: 50_000,
      },
      otherIncome: {
        ...baseCandidate.otherIncome,
        taxableBankInterest: 0,
        tds: 25_000,
      },
    }),
    now,
    currentRules,
  )
  assert.equal(returnByCredits.kind, 'supported')
  if (returnByCredits.kind === 'supported')
    assert.equal(returnByCredits.coverage.annualReturn.kind, 'available')
})

test('withholds the age-dependent return conclusion when uncertain', () => {
  const returnAgeBoundary = evaluate(
    profileFrom({
      ...baseCandidate,
      incomePath: {
        ...baseCandidate.incomePath,
        grossReceipts: 100_000,
        declaredProfit: 50_000,
      },
      otherIncome: {
        ...baseCandidate.otherIncome,
        taxableBankInterest: 0,
        tds: 49_999,
        ageSixtyOrOlder: 'not-sure',
      },
    }),
    now,
    currentRules,
  )
  assert.equal(returnAgeBoundary.kind, 'supported')
  if (returnAgeBoundary.kind === 'supported')
    assert.equal(returnAgeBoundary.coverage.annualReturn.kind, 'unavailable')
})

test('creates the registration action above the threshold', () => {
  const gstAbove = evaluate(
    profileFrom({
      ...baseCandidate,
      gst: {
        ...baseCandidate.gst,
        aggregateTurnover: 2_000_001,
        thresholdLiabilityDate: '2026-06-01',
      },
    }),
    now,
    currentRules,
  )
  assert.equal(gstAbove.kind, 'supported')
  if (gstAbove.kind === 'supported')
    assert.equal(
      gstAbove.obligations.some(
        (obligation) => obligation.kind === 'gst-registration',
      ),
      true,
    )
})

test('withholds unresolved foreign guidance independently', () => {
  const foreign = evaluate(
    profileFrom({
      ...baseCandidate,
      clients: {
        kind: 'foreign',
        delivery: 'platform',
        platform: {
          ...platformFacts,
          foreignFeeGstTreatment: 'not-applicable',
        },
        foreign: {
          workPerformedInIndia: 'yes',
          recipientIdentifiable: 'yes',
          ownAccount: 'yes',
          ordinaryPlaceOfSupply: 'yes',
          sameEstablishment: 'no',
          paymentRoute: 'convertible-foreign-exchange',
          settledToIndianBank: 'yes',
          accountExposure: 'possible',
          foreignOperation: 'no',
          foreignTax: 'no',
          treatyRelief: 'no',
          receiptsResolved: 'yes',
          currencyResolved: 'yes',
        },
      },
    }),
    now,
    currentRules,
  )
  assert.equal(foreign.kind, 'supported')
  if (foreign.kind === 'supported')
    assert.equal(foreign.coverage.foreignGuidance.kind, 'unavailable')
})

test('withholds stale annual-return coverage independently', () => {
  const annualStaleRules: RuleDataset = {
    ...currentRules,
    groups: {
      ...currentRules.groups,
      annualReturn: {
        ...currentRules.groups.annualReturn,
        expiresOn: '2026-08-01',
      },
    },
  }
  const areaStale = evaluate(profile, now, annualStaleRules)
  assert.equal(areaStale.kind, 'supported')
  if (areaStale.kind === 'supported')
    assert.equal(areaStale.coverage.annualReturn.kind, 'unavailable')
})

test('withholds missing annual-return provenance and groups', () => {
  const missingAnnualProvenance: RuleDataset = {
    ...currentRules,
    groups: {
      ...currentRules.groups,
      annualReturn: {
        ...currentRules.groups.annualReturn,
        provenance: currentRules.groups.annualReturn.provenance.slice(0, -1),
      },
    },
  }
  const provenanceResult = validateRules(missingAnnualProvenance, now)
  assert.equal(provenanceResult.valid, true)
  if (provenanceResult.valid)
    assert.equal(provenanceResult.groups['annual-return'].valid, false)
  const { annualReturn: _annualReturn, ...missingAnnualGroupValues } =
    currentRules.groups
  const missingAnnualGroup = {
    ...currentRules,
    groups: missingAnnualGroupValues,
  } as unknown as RuleDataset
  const missingGroupResult = validateRules(missingAnnualGroup, now)
  assert.equal(missingGroupResult.valid, true)
  if (missingGroupResult.valid)
    assert.equal(missingGroupResult.groups['annual-return'].valid, false)
  assert.doesNotThrow(() => evaluate(profile, now, missingAnnualGroup))
  assert.equal(evaluate(profile, now, missingAnnualGroup).kind, 'supported')
})

test('stops calculation with stale core rules', () => {
  const coreStaleRules: RuleDataset = {
    ...currentRules,
    groups: {
      ...currentRules.groups,
      commonIncomeTax: {
        ...currentRules.groups.commonIncomeTax,
        expiresOn: '2026-08-01',
      },
    },
  }
  assert.equal(evaluate(profile, now, coreStaleRules).kind, 'stale-rules')
})

test('saves reconciles and deletes workspaces through storage failures', () => {
  class MemoryStorage implements Storage {
    private readonly values = new Map<string, string>()
    clearCalled = false
    get length() {
      return this.values.size
    }
    clear() {
      this.clearCalled = true
      this.values.clear()
    }
    getItem(key: string) {
      return this.values.get(key) ?? null
    }
    key(index: number) {
      return [...this.values.keys()][index] ?? null
    }
    removeItem(key: string) {
      this.values.delete(key)
    }
    setItem(key: string, value: string) {
      this.values.set(key, value)
    }
  }

  class UnavailableStorage implements Storage {
    get length(): number {
      throw new Error('unavailable')
    }
    clear() {
      throw new Error('unavailable')
    }
    getItem(_key: string): string | null {
      throw new Error('unavailable')
    }
    key(_index: number): string | null {
      throw new Error('unavailable')
    }
    removeItem(_key: string) {
      throw new Error('unavailable')
    }
    setItem(_key: string, _value: string) {
      throw new Error('unavailable')
    }
  }

  class FailingWriteStorage extends MemoryStorage {
    override setItem(_key: string, _value: string) {
      throw new Error('quota')
    }
  }

  class FailingRemoveStorage extends MemoryStorage {
    override removeItem(_key: string) {}
  }

  const storage = new MemoryStorage()
  storage.setItem('unrelated', 'keep')
  assert.deepEqual(loadSavedWorkspace(storage, now), { kind: 'absent' })
  const workspaceDraft: SavedWorkspaceDraft = {
    noticeVersion: 2,
    consentDecidedAt: '2026-09-01T00:00:00.000Z',
    activeTaxYear: 'Tax Year 2026-27',
    active: { ruleDatasetId: currentRules.id, profile, completions: [] },
    priorYears: [],
  }
  assert.equal(
    saveSavedWorkspace(storage, null, {
      ...workspaceDraft,
      active: {
        ...workspaceDraft.active!,
        completions: [
          {
            obligationId: 'annual-return:Tax Year 2025-26',
            completedOn: '2026-09-03',
          },
        ],
      },
    }).kind,
    'invalid',
  )
  const underageProfile = profileFrom({
    ...baseCandidate,
    person: { ...baseCandidate.person, adult: 'no' },
  })
  assert.equal(
    saveSavedWorkspace(storage, null, {
      ...workspaceDraft,
      active: { ...workspaceDraft.active!, profile: underageProfile },
    }).kind,
    'invalid',
  )
  assert.equal(
    loadSavedWorkspace(new UnavailableStorage(), now).kind,
    'unavailable',
  )
  assert.equal(
    saveSavedWorkspace(new UnavailableStorage(), null, workspaceDraft).kind,
    'unavailable',
  )
  assert.equal(
    deleteSavedWorkspace(new UnavailableStorage(), null).kind,
    'unavailable',
  )
  const failedWrite = new FailingWriteStorage()
  assert.equal(
    saveSavedWorkspace(failedWrite, null, workspaceDraft).kind,
    'unavailable',
  )
  const failedRemove = new FailingRemoveStorage()
  failedRemove.setItem(
    WORKSPACE_KEY,
    JSON.stringify({
      ...workspaceDraft,
      schemaVersion: 9,
      revision: 0,
      updatedAt: '2026-09-03T06:30:00.000Z',
    }),
  )
  assert.equal(deleteSavedWorkspace(failedRemove, 0).kind, 'deletion-failed')
  const saved = saveSavedWorkspace(storage, null, workspaceDraft)
  assert.equal(saved.kind, 'saved')
  if (saved.kind === 'saved') {
    assert.equal(saved.workspace.revision, 0)
    assert.equal(loadSavedWorkspace(storage).kind, 'ready')
    assert.equal(
      saveSavedWorkspace(storage, null, workspaceDraft).kind,
      'conflict',
    )
    const plan = evaluate(profile, now, currentRules)
    const view = deriveWorkspaceView(saved.workspace, {
      [profile.taxYear]: plan,
    })
    assert.equal(view.openCount, 2)
    assert.equal(view.next?.obligation.kind, 'advance-tax')
    const completionDraft: SavedWorkspaceDraft = {
      ...workspaceDraft,
      active: {
        ...workspaceDraft.active!,
        completions: [
          {
            obligationId: 'annual-return:Tax Year 2026-27',
            completedOn: '2026-09-03',
          },
        ],
      },
    }
    const savedAgain = saveSavedWorkspace(
      storage,
      saved.workspace.revision,
      completionDraft,
    )
    assert.equal(savedAgain.kind, 'saved')
    if (savedAgain.kind === 'saved') {
      const completedView = deriveWorkspaceView(savedAgain.workspace, {
        [profile.taxYear]: plan,
      })
      assert.equal(completedView.completedCount, 1)
      assert.equal(completedView.openCount, 1)
      const noActions = evaluate(
        profileFrom({
          ...baseCandidate,
          incomePath: {
            ...baseCandidate.incomePath,
            grossReceipts: 0,
            declaredProfit: 0,
          },
          otherIncome: {
            ...baseCandidate.otherIncome,
            taxableBankInterest: 0,
            tds: 0,
            advanceTaxPaid: 0,
          },
          gst: { ...baseCandidate.gst, aggregateTurnover: 0 },
        }),
        now,
        currentRules,
      )
      const mismatchView = deriveWorkspaceView(savedAgain.workspace, {
        [profile.taxYear]: noActions,
      })
      assert.equal(mismatchView.completedCount, 0)
      assert.equal(mismatchView.years[0]?.needsReview.length, 1)
      assert.equal(
        deleteSavedWorkspace(storage, savedAgain.workspace.revision).kind,
        'deleted',
      )
    }
  }
  assert.equal(storage.getItem('unrelated'), 'keep')
  assert.equal(storage.clearCalled, false)
  storage.setItem(WORKSPACE_KEY, '{bad json')
  assert.equal(loadSavedWorkspace(storage, now).kind, 'invalid')
  assert.equal(
    saveSavedWorkspace(storage, null, workspaceDraft).kind,
    'invalid',
  )
  assert.equal(deleteSavedWorkspace(storage, null).kind, 'deleted')
})
