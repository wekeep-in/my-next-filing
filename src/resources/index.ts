import { indiaDate } from '@/lib/india-date'
import { validateRules } from '@/rules'
import type {
  DateOnly,
  RuleDataset,
  RuleGroupId,
  Source,
  TaxYear,
} from '@/rules'
import {
  resourceDefinitions,
  resourceExclusions,
  resourceTasks,
  resourceTopics,
  resourceTypes,
} from './catalogue'
import type {
  ResourceDefinition,
  ResourceTask,
  ResourceTopic,
} from './catalogue'

export {
  resourceDefinitions,
  resourceExclusions,
  resourceTasks,
  resourceTopics,
}
export type { ResourceDefinition, ResourceTask, ResourceTopic }

export type ResourceFilters = {
  readonly query: string
  readonly topic: ResourceTopic | ''
  readonly task: ResourceTask | ''
}
export const emptyResourceFilters: ResourceFilters = {
  query: '',
  topic: '',
  task: '',
}

export type Resource = ResourceDefinition & {
  readonly id: string
  readonly sources: readonly Source[]
  readonly url: string
  readonly publisher: string
  readonly reviewDate: DateOnly
  readonly taxPeriod: TaxYear | null
  readonly reviewAreas: readonly string[]
}

const reviewGroups = [
  ['incomePaths', 'income-paths', 'Income-tax methods'],
  ['commonIncomeTax', 'common-income-tax', 'Income-tax rates and deductions'],
  ['advanceTax', 'advance-tax', 'Advance tax'],
  ['annualReturn', 'annual-return', 'Income tax returns'],
  ['gstRegistration', 'gst-registration', 'GST registration'],
  ['foreignGuidance', 'foreign-guidance', 'Overseas payments'],
  ['gstCalendar', 'gst-calendar', 'GST return schedules'],
  ['lut', 'lut', 'LUT guidance'],
] as const satisfies readonly (readonly [
  keyof RuleDataset['groups'],
  RuleGroupId,
  string,
])[]

function isDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  )
}

function safeSource(source: Source, today: DateOnly) {
  try {
    const url = new URL(source.url)
    return Boolean(
      source.id?.trim() &&
      source.title?.trim() &&
      source.publisher?.trim() &&
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      isDate(source.reviewDate) &&
      source.reviewDate <= today &&
      (source.kind === 'statutory'
        ? /^Tax Year \d{4}-\d{2}$/.test(source.taxPeriod) &&
          (source.publicationDate === undefined ||
            (isDate(source.publicationDate) &&
              source.publicationDate <= source.reviewDate))
        : source.kind === 'tutorial' &&
          (source.status === 'approved' ||
            source.status === 'starting-link-only')),
    )
  } catch {
    return false
  }
}

export function resolveResources(
  dataset: RuleDataset,
  now: Date,
  definitions: readonly ResourceDefinition[] = resourceDefinitions,
  exclusions: Readonly<Record<string, string>> = resourceExclusions,
): {
  readonly resources: readonly Resource[]
  readonly errors: readonly string[]
} {
  const today = indiaDate(now)
  const validation = validateRules(dataset, now)
  const errors: string[] = []
  const resources: Resource[] = []
  const assigned = [
    ...definitions.flatMap((entry) => entry.sourceIds),
    ...Object.keys(exclusions),
  ]
  const byId = new Map(dataset.sources.map((source) => [source.id, source]))
  const duplicateIds = new Set(
    dataset.sources
      .filter(
        (source, index, all) =>
          all.findIndex((other) => other.id === source.id) !== index,
      )
      .map((source) => source.id),
  )
  for (const source of dataset.sources) {
    if (
      assigned.filter((id) => id === source.id).length !== 1 ||
      duplicateIds.has(source.id)
    )
      errors.push(`Source ${source.id} needs exactly one catalogue assignment.`)
  }
  for (const [id, reason] of Object.entries(exclusions)) {
    if (!byId.has(id) || !reason.trim())
      errors.push(`Invalid resource exclusion: ${id}.`)
  }
  const urls = definitions.map((entry) => byId.get(entry.sourceIds[0])?.url)
  const textList = (values: readonly string[]) =>
    values.every((value) => typeof value === 'string' && value.trim())
  for (const entry of definitions) {
    const sources = entry.sourceIds.map((id) => byId.get(id))
    const primary = sources[0]
    if (
      !primary ||
      !entry.title.trim() ||
      !entry.description.trim() ||
      !resourceTypes.includes(entry.documentType) ||
      entry.topics.length === 0 ||
      entry.tasks.length === 0 ||
      !entry.topics.every((topic) =>
        resourceTopics.some((option) => option.value === topic),
      ) ||
      !entry.tasks.every((task) =>
        resourceTasks.some((option) => option.value === task),
      ) ||
      !textList(entry.aliases) ||
      !textList(entry.identifiers) ||
      !textList(entry.references ?? []) ||
      urls.filter((url) => url === primary.url).length !== 1 ||
      sources.some(
        (source) =>
          !source ||
          !safeSource(source, today) ||
          duplicateIds.has(source.id) ||
          assigned.filter((id) => id === source.id).length !== 1 ||
          source.url !== primary.url ||
          source.publisher !== primary.publisher ||
          source.kind !== primary.kind ||
          (source.kind === 'statutory' &&
            primary.kind === 'statutory' &&
            source.taxPeriod !== primary.taxPeriod),
      ) ||
      (primary.kind === 'tutorial' &&
        primary.status === 'starting-link-only' &&
        entry.documentType !== 'Official portal' &&
        entry.documentType !== 'Official help portal')
    ) {
      errors.push(
        `Invalid resource: ${entry.sourceIds[0] ?? 'missing identity'}.`,
      )
      continue
    }
    // All source identities and their bibliography passed the per-resource checks above.
    const checked = sources.filter(
      (source): source is Source => source !== undefined,
    )
    const reviewAreas =
      primary.kind !== 'statutory'
        ? []
        : !validation.valid
          ? ['Statutory coverage']
          : reviewGroups
              .filter(
                ([key, id]) =>
                  !validation.groups[id].valid &&
                  dataset.groups[key].provenance.some((provenance) =>
                    checked.some(
                      (source) =>
                        source.id === provenance.sourceId ||
                        (source.kind === 'statutory' &&
                          source.coveredRuleIds.includes(provenance.ruleId)),
                    ),
                  ),
              )
              .map(([, , label]) => label)
    resources.push({
      ...entry,
      id: primary.id,
      sources: checked,
      url: primary.url,
      publisher: primary.publisher,
      reviewDate: checked.map((source) => source.reviewDate).sort()[0],
      taxPeriod: primary.kind === 'statutory' ? primary.taxPeriod : null,
      reviewAreas,
    })
  }
  resources.sort(
    (a, b) =>
      a.title.localeCompare(b.title, 'en') || a.id.localeCompare(b.id, 'en'),
  )
  return { resources, errors }
}

const stopWords = new Set([
  'a',
  'an',
  'the',
  'how',
  'do',
  'does',
  'i',
  'my',
  'to',
  'for',
  'of',
  'and',
  'what',
  'when',
  'is',
  'are',
  'can',
])
const protectedWords = new Set([
  'gst',
  'itr',
  'lut',
  'qrmp',
  'fema',
  'section',
  'sections',
  'rule',
  'rules',
  'notification',
  'circular',
  'year',
  'assessment',
  'financial',
])

function plainText(value: string) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[‐‑‒–—−]/g, '-')
}

function normalize(value: string) {
  return plainText(value)
    .replace(/\s*\/\s*/g, '/')
    .replace(/\bgstr[\s-]*(\d+[a-z]?)\b/g, 'gstr$1')
    .replace(/\b(?:gst[\s-]*)?pmt[\s-]*(\d+)\b/g, 'pmt$1')
    .replace(/\b(?:section|sec\.?)\s*[-.:]?\s*(\d+[a-z]?)\b/g, 'section$1')
    .replace(/\brule\s*[-.:]?\s*(\d+[a-z]?)\b/g, 'rule$1')
    .replace(
      /\b(notification|circular)\s*(?:no\.?\s*)?(\d+(?:[-/]\d+)+)/g,
      '$1$2',
    )
    .replace(/(\d)\s*[-/]\s*(?=\d)/g, '$1x')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\bincome tax returns?\b/g, 'itr')
    .replace(/\bletter of undertaking\b/g, 'lut')
}

function parseQuery(query: string) {
  let text = plainText(query.slice(0, 200))
  const periods: string[] = []
  let periodProblem =
    /\b(?:ay|assessment\s+year|fy|financial\s+year)\s*\d{4}\b/.test(text)
  text = text.replace(
    /\btax\s+year\s+(\d{4})\s*-\s*(\d{2}|\d{4})\b/g,
    (_, start: string, end: string) => {
      if (
        end !== String(Number(start) + 1) &&
        end !== String(Number(start) + 1).slice(-2)
      )
        periodProblem = true
      periods.push(`Tax Year ${start}-${end.slice(-2)}`)
      return ''
    },
  )
  if (/\btax\s+year\b/.test(text) || new Set(periods).size > 1)
    periodProblem = true
  const tokens = normalize(text)
    .split(' ')
    .filter((token) => token && !stopWords.has(token))
  return {
    tokens,
    period: periods[0] ?? null,
    periodProblem,
    empty: !query.trim(),
  }
}

function searchFields(resource: Resource) {
  const identifiers = resource.identifiers
    .map(normalize)
    .flatMap((identifier) => [
      identifier,
      identifier.replace(/^(?:notification|circular|section|rule)(?=\d)/, ''),
    ])
  const titles = [
    resource.title,
    ...resource.sources.map((source) => source.title),
  ].map(normalize)
  const aliases = [...resource.aliases, ...(resource.references ?? [])].map(
    normalize,
  )
  const text = normalize(
    [
      ...titles,
      ...aliases,
      ...identifiers,
      resource.description,
      resource.publisher,
      ...resource.sources.flatMap((source) =>
        source.kind === 'statutory' && source.publicationDate
          ? [source.publicationDate.slice(0, 4)]
          : [],
      ),
      ...resource.topics.map(
        (topic) =>
          resourceTopics.find((option) => option.value === topic)!.label,
      ),
      ...resource.tasks.map(
        (task) => resourceTasks.find((option) => option.value === task)!.label,
      ),
    ].join(' '),
  )
  return {
    titles,
    aliases,
    words: text.split(' '),
    identifiers,
  }
}

function queryMatches(
  resources: readonly Resource[],
  query: ReturnType<typeof parseQuery>,
) {
  if (
    query.periodProblem ||
    (!query.empty && !query.period && !query.tokens.length)
  )
    return []
  const phrase = query.tokens.join(' ')
  return resources
    .flatMap((resource) => {
      if (query.period && resource.taxPeriod !== query.period) return []
      const fields = searchFields(resource)
      const matches = query.tokens.every(
        (token, index) =>
          fields.words.includes(token) ||
          (index === query.tokens.length - 1 &&
            /^[a-z]{3,}$/.test(token) &&
            !protectedWords.has(token) &&
            fields.words.some(
              (word) => /^[a-z]+$/.test(word) && word.startsWith(token),
            )),
      )
      if (!matches) return []
      const exactIdentifier = fields.identifiers.some(
        (identifier) =>
          identifier === phrase || query.tokens.includes(identifier),
      )
      const titlePhrase =
        phrase &&
        fields.titles.some((title) => ` ${title} `.includes(` ${phrase} `))
      const aliasPhrase =
        phrase &&
        fields.aliases.some((alias) => ` ${alias} `.includes(` ${phrase} `))
      const titleHits = query.tokens.filter((token) =>
        fields.titles.some((title) => title.split(' ').includes(token)),
      ).length
      return [
        {
          resource,
          score:
            (exactIdentifier ? 0 : titlePhrase ? 1 : aliasPhrase ? 2 : 3) *
              1000 -
            titleHits,
        },
      ]
    })
    .sort(
      (a, b) =>
        a.score - b.score ||
        a.resource.title.localeCompare(b.resource.title, 'en') ||
        a.resource.id.localeCompare(b.resource.id, 'en'),
    )
    .map(({ resource }) => resource)
}

function withinFilters(resource: Resource, filters: ResourceFilters) {
  return (
    (!filters.topic || resource.topics.includes(filters.topic)) &&
    (!filters.task || resource.tasks.includes(filters.task))
  )
}

function oneEdit(a: string, b: string) {
  if (a === b || Math.abs(a.length - b.length) > 1) return false
  if (a.length === b.length) {
    const different = a
      .split('')
      .flatMap((letter, index) => (letter === b[index] ? [] : [index]))
    return (
      different.length === 1 ||
      (different.length === 2 &&
        different[1] === different[0] + 1 &&
        a[different[0]] === b[different[1]] &&
        a[different[1]] === b[different[0]])
    )
  }
  const [short, long] = a.length < b.length ? [a, b] : [b, a]
  let index = 0
  while (index < short.length && short[index] === long[index]) index++
  return short.slice(index) === long.slice(index + 1)
}

export function searchResources(
  resources: readonly Resource[],
  filters: ResourceFilters,
) {
  const query = parseQuery(filters.query)
  const periodProblem =
    query.periodProblem ||
    Boolean(
      query.period &&
      !resources.some((resource) => resource.taxPeriod === query.period),
    )
  const matches = queryMatches(resources, query)
  const results = matches.filter((resource) => withinFilters(resource, filters))
  const topics = resourceTopics.map((option) => ({
    ...option,
    count: matches.filter((resource) =>
      withinFilters(resource, { ...filters, topic: option.value }),
    ).length,
  }))
  const tasks = resourceTasks.map((option) => ({
    ...option,
    count: matches.filter((resource) =>
      withinFilters(resource, { ...filters, task: option.value }),
    ).length,
  }))
  let suggestion: string | null = null
  if (!results.length && !periodProblem && query.tokens.length) {
    const vocabulary = new Set(
      resources
        .flatMap((resource) => searchFields(resource).words)
        .filter(
          (word) => /^[a-z]{5,}$/.test(word) && !protectedWords.has(word),
        ),
    )
    const corrections = new Set<string>()
    const original = plainText(filters.query.slice(0, 200))
    // ponytail: scan the small reviewed vocabulary; index candidates if the catalogue grows substantially.
    for (const match of original.matchAll(/\b[a-z]{5,}\b/g)) {
      const word = match[0]
      if (protectedWords.has(word) || vocabulary.has(word)) continue
      for (const candidate of vocabulary) {
        if (!oneEdit(word, candidate)) continue
        const corrected =
          original.slice(0, match.index) +
          candidate +
          original.slice(match.index + word.length)
        if (
          queryMatches(resources, parseQuery(corrected)).some((resource) =>
            withinFilters(resource, filters),
          )
        )
          corrections.add(corrected)
        if (corrections.size > 1) break
      }
      if (corrections.size > 1) break
    }
    if (corrections.size === 1) suggestion = [...corrections][0]
  }
  return {
    results,
    topics,
    tasks,
    suggestion,
    periodProblem,
    allTopicsCount: matches.filter((resource) =>
      withinFilters(resource, { ...filters, topic: '' }),
    ).length,
    allTasksCount: matches.filter((resource) =>
      withinFilters(resource, { ...filters, task: '' }),
    ).length,
  }
}
