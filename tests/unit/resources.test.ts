import { test } from 'vitest'
import assert from 'node:assert/strict'
import { currentRules } from '../../src/rules/index.ts'
import type { RuleDataset, Source } from '../../src/rules/index.ts'
import {
  emptyResourceFilters,
  resolveResources,
  resourceDefinitions,
  searchResources,
} from '../../src/resources/index.ts'
import type { ResourceFilters } from '../../src/resources/index.ts'

const now = new Date('2026-09-08T12:00:00+05:30')
const catalogue = resolveResources(currentRules, now)

const search = (query: string, filters: Partial<ResourceFilters> = {}) =>
  searchResources(catalogue.resources, {
    ...emptyResourceFilters,
    ...filters,
    query,
  })
const ids = (query: string, filters: Partial<ResourceFilters> = {}) =>
  search(query, filters).results.map((resource) => resource.id)
const sameMatches = (a: string, b: string) =>
  assert.deepEqual(ids(a).sort(), ids(b).sort())

const act = catalogue.resources.find(
  (resource) => resource.id === 'income-tax-act-2025-2026',
)!

const withSources = (change: (source: Source) => Source): RuleDataset => ({
  ...currentRules,
  sources: currentRules.sources.map(change),
})

test('publishes unique resources with complete provenance', () => {
  assert.deepEqual(catalogue.errors, [])
  assert.equal(catalogue.resources.length, 31)
  assert.equal(
    new Set(catalogue.resources.map((resource) => resource.url)).size,
    31,
  )
  assert.equal(
    new Set(catalogue.resources.flatMap((resource) => resource.sourceIds)).size,
    37,
  )
})

test('ranks exact titles identifiers and reviewed aliases', () => {
  assert.equal(ids('').length, 31)
  sameMatches('', '   ')
  assert.equal(ids('how do I').length, 0)
  assert.deepEqual(
    new Set(ids('advance tax').slice(0, 2)),
    new Set(['section-404', 'section-408']),
  )
  sameMatches('advance tax', 'how do I pay advance tax')
  sameMatches('ITR', 'income tax return')
  sameMatches('ITR', 'income-tax returns')
  assert.ok(ids('ITR').includes('income-tax-act-2025-2026'))
  assert.deepEqual(ids('section 263'), ['income-tax-act-2025-2026'])
  assert.ok(ids('IDCW').includes('mutual-fund-idcw-guide'))
  for (const variant of ['GSTR3B', 'gstr 3b', 'ＧＳＴＲ－３Ｂ', 'GSTR–3B']) {
    sameMatches('GSTR-3B', variant)
    assert.equal(ids(variant)[0], 'gst-notification-82-2020')
  }
  assert.equal(ids('GSTR-1')[0], 'gst-notification-83-2020')
  assert.equal(ids('section 58')[0], 'section-58')
  sameMatches('section 58', 'sec. 58')
  assert.deepEqual(ids('section 156'), ['income-tax-act-2025-2026'])
  assert.deepEqual(ids('salary'), ['income-tax-act-2025-2026'])
  sameMatches('LUT', 'letter of undertaking')
  assert.deepEqual(
    new Set(ids('LUT')),
    new Set([
      'gst-notification-37-2017',
      'gst-circular-8-2017',
      'gst-circular-125-2019',
      'gst-lut-guide',
    ]),
  )
  assert.ok(
    ids('domestic equity capital gains').includes('income-tax-act-2025-2026'),
  )
  assert.equal(ids('notification 83/2020')[0], 'gst-notification-83-2020')
  sameMatches('notification 83/2020', 'Notification No. 83 / 2020')
  sameMatches('notification 83/2020', 'notification 83-2020')
  sameMatches('notification 83/2020', '83/2020')
  assert.equal(ids('83/202').length, 0)
  assert.equal(ids('reviewed guide').length, 0)
  assert.equal(ids('circular 125/44/2019')[0], 'gst-circular-125-2019')
  assert.ok(ids('GST registration').includes('gst-registration-hub'))
  assert.equal(ids('overseas payments')[0], 'fema-export-regulations-2026')
})

test('protects unsupported identifiers and suggests only unambiguous typos', () => {
  for (const query of [
    'foreign salary',
    'company incorporation',
    'GSTR-9',
    'section 59',
    '44ADA',
    'advance tax bananas',
  ]) {
    assert.equal(ids(query).length, 0, query)
  }
  assert.equal(search('section 59').suggestion, null)
  assert.equal(search('GSTR-9').suggestion, null)
  assert.equal(search('advnace tax').suggestion, 'advance tax')
  assert.equal(search('advnace tax', { topic: 'gst' }).suggestion, null)
  assert.equal(search('advnace txa').suggestion, null)
  assert.equal(
    search('advnace tax Tax Year 2026-27').suggestion,
    'advance tax tax year 2026-27',
  )
  assert.ok(ids('GST registr').includes('gst-registration-hub'))
  assert.equal(ids('section 5').length, 0)
  assert.equal(ids('GSTR-3').length, 0)
  assert.equal(ids('advance tax without').length, 0)
})

test('distinguishes Tax Years Assessment Years and publication years', () => {
  for (const query of [
    'AY 2026-27',
    'GST AY 2026-27',
    'GST Assessment Year 2026-27',
    'GST FY 2026-27',
    'Tax Year 2025-26',
    'Tax Year 2026-28',
    'Tax Year 2026-27 Tax Year 2027-28',
  ]) {
    assert.equal(ids(query).length, 0, query)
    assert.equal(search(query).periodProblem, true, query)
    assert.equal(search(query).suggestion, null, query)
  }
  assert.deepEqual(
    ids('advance tax Tax Year 2026-27').sort(),
    ids('advance tax')
      .filter((id) => id !== 'advance-tax-challan')
      .sort(),
  )
  sameMatches('advance tax Tax Year 2026-27', 'advance tax Tax Year 2026-2027')
  assert.equal(ids('Tax Year 2026-27').length, 21)
  const gstPeriod = search('GST Tax Year 2026-27')
  assert.ok(gstPeriod.results.length > 0)
  assert.ok(
    gstPeriod.results.every(
      (resource) => resource.taxPeriod === currentRules.taxPeriod,
    ),
  )
  assert.ok(ids('Finance Act 2026').includes('finance-act-2026'))
  assert.ok(ids('2020').includes('gst-notification-82-2020'))
  assert.deepEqual(ids('How to generate challan form'), ['advance-tax-challan'])
  assert.equal(
    ids('Identification and generation of applicable return').length,
    0,
  )
})

test('combines filters and counts unique resources in every facet', () => {
  for (const query of ['', 'GST', 'LUT', 'no such resource']) {
    for (const topic of [
      '',
      'income-tax',
      'gst',
      'overseas-clients',
    ] as const) {
      for (const task of [
        '',
        'advance-tax',
        'gst-registration',
        'lut',
      ] as const) {
        const actual = search(query, { topic, task })
        const expected = search(query).results.filter(
          (resource) =>
            (!topic || resource.topics.includes(topic)) &&
            (!task || resource.tasks.includes(task)),
        )
        assert.deepEqual(actual.results, expected)
        for (const option of actual.topics)
          assert.equal(
            option.count,
            ids(query, { topic: option.value, task }).length,
          )
        for (const option of actual.tasks)
          assert.equal(
            option.count,
            ids(query, { topic, task: option.value }).length,
          )
        assert.equal(actual.allTopicsCount, ids(query, { task }).length)
        assert.equal(actual.allTasksCount, ids(query, { topic }).length)
      }
    }
  }
})

test('consolidates source descriptions and oldest review dates', () => {
  assert.equal(act.sources.length, 7)
  assert.equal(act.reviewDate, '2026-09-03')
  assert.ok(act.references?.some((reference) => reference.includes('156')))
  assert.ok(act.references?.some((reference) => reference.includes('salary')))
  assert.ok(
    catalogue.resources.every((resource) => resource.reviewAreas.length === 0),
  )
})

test('warns at independent review boundaries without hiding documents', () => {
  for (const [date, stale] of [
    ['2026-09-30', false],
    ['2026-10-01', false],
    ['2026-10-31', false],
    ['2026-11-01', true],
  ] as const) {
    const result = resolveResources(
      currentRules,
      new Date(`${date}T12:00:00+05:30`),
    )
    assert.deepEqual(result.errors, [])
    assert.equal(result.resources.length, 31)
    assert.equal(
      result.resources.find(
        (resource) => resource.id === 'gst-notification-82-2020',
      )!.reviewAreas.length > 0,
      stale,
    )
    assert.equal(
      result.resources.find(
        (resource) => resource.id === 'gst-notification-37-2017',
      )!.reviewAreas.length > 0,
      stale,
    )
    assert.deepEqual(
      result.resources.find((resource) => resource.id === 'section-404')!
        .reviewAreas,
      [],
    )
  }
})

test('retains bibliography when the root review expires', () => {
  const expired = resolveResources(
    currentRules,
    new Date('2027-09-01T12:00:00+05:30'),
  )
  assert.equal(expired.resources.length, 31)
  assert.ok(
    expired.resources
      .filter((resource) => resource.taxPeriod)
      .every((resource) => resource.reviewAreas.includes('Statutory coverage')),
  )
  assert.ok(
    expired.resources
      .filter((resource) => !resource.taxPeriod)
      .every((resource) => resource.reviewAreas.length === 0),
  )
})

test('scopes malformed and expired groups to their own resources', () => {
  const annualExpired: RuleDataset = {
    ...currentRules,
    groups: {
      ...currentRules.groups,
      annualReturn: {
        ...currentRules.groups.annualReturn,
        expiresOn: '2026-09-05',
      },
    },
  }
  const invalidForeignGroup: RuleDataset = {
    ...currentRules,
    groups: {
      ...currentRules.groups,
      foreignGuidance: { ...currentRules.groups.foreignGuidance, id: 'lut' },
    },
  }
  assert.deepEqual(
    resolveResources(invalidForeignGroup, now).resources.find(
      (resource) => resource.id === 'fema-export-regulations-2026',
    )!.reviewAreas,
    ['Overseas payments'],
  )
  assert.deepEqual(
    resolveResources(annualExpired, now).resources.find(
      (resource) => resource.id === act.id,
    )!.reviewAreas,
    ['Income tax returns'],
  )
})

test('withholds malformed or future source review dates', () => {
  for (const reviewDate of ['2026-02-30', '2026-09-09'] as const) {
    const result = resolveResources(
      withSources((source) =>
        source.id === 'section-58' ? { ...source, reviewDate } : source,
      ),
      now,
    )
    assert.equal(result.resources.length, 30)
    assert.ok(result.errors.length > 0)
    assert.ok(
      !result.resources.some((resource) => resource.id === 'section-58'),
    )
    assert.ok(
      result.resources.some((resource) => resource.id === 'section-404'),
    )
  }
})

test('withholds unsafe source URLs', () => {
  for (const url of [
    'http://example.com',
    'javascript:alert(1)',
    'https://user:password@example.com',
    'not a URL',
  ]) {
    const result = resolveResources(
      withSources((source) =>
        source.id === 'section-58' ? { ...source, url } : source,
      ),
      now,
    )
    assert.equal(result.resources.length, 30)
    assert.ok(result.errors.length > 0)
  }
})

test('rejects mixed periods in grouped sources', () => {
  const mixed = withSources((source) =>
    source.kind === 'statutory' && source.id === 'section-156'
      ? { ...source, taxPeriod: 'Tax Year 2025-26' }
      : source,
  )
  assert.ok(
    !resolveResources(mixed, now).resources.some(
      (resource) => resource.id === act.id,
    ),
  )
})

test('excludes unapproved tutorials from search', () => {
  for (const status of ['provisional', 'deferred', 'rejected'] as const) {
    const result = resolveResources(
      withSources((source) =>
        source.kind === 'tutorial' && source.id === 'gst-portal'
          ? { ...source, status }
          : source,
      ),
      now,
    )
    assert.equal(result.resources.length, 30)
    assert.equal(
      searchResources(result.resources, {
        ...emptyResourceFilters,
        query: 'GST website',
      }).results.length,
      0,
    )
  }
})

test('rejects unclassified duplicate missing and malformed catalogue entries', () => {
  assert.ok(
    resolveResources(
      {
        ...currentRules,
        sources: [
          ...currentRules.sources,
          { ...currentRules.sources[0], id: 'unclassified' },
        ],
      },
      now,
    ).errors.some((error) => error.includes('unclassified')),
  )
  assert.ok(
    resolveResources(
      {
        ...currentRules,
        sources: [...currentRules.sources, currentRules.sources[0]],
      },
      now,
    ).errors.length > 0,
  )
  assert.ok(
    resolveResources(
      {
        ...currentRules,
        sources: currentRules.sources.filter(
          (source) => source.id !== 'section-58',
        ),
      },
      now,
    ).errors.length > 0,
  )
  assert.ok(
    resolveResources(currentRules, now, [
      ...resourceDefinitions,
      resourceDefinitions[0],
    ]).errors.length > 0,
  )
  assert.equal(
    resolveResources(
      currentRules,
      now,
      resourceDefinitions.map((entry) => ({ ...entry, title: '' })),
    ).resources.length,
    0,
  )
  assert.equal(
    resolveResources(
      currentRules,
      now,
      resourceDefinitions.map((entry) =>
        entry.sourceIds[0] === 'gst-portal'
          ? { ...entry, documentType: 'Guide' }
          : entry,
      ),
    ).resources.length,
    30,
  )
})
