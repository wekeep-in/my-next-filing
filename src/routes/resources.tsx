import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '@/app-context'
import { ExternalLink } from '@/components/external-link'
import { FieldHelp } from '@/components/field-help'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDate } from '@/lib/format'
import {
  emptyResourceFilters,
  resolveResources,
  searchResources,
} from '@/resources'
import type { Resource } from '@/resources'
import { currentRules } from '@/rules'

function ResourceLabel({
  id,
  label,
  help,
}: {
  readonly id: string
  readonly label: string
  readonly help?: string
}) {
  return (
    <div className="mb-1 flex min-h-7 items-center gap-1 sm:mb-2">
      <label htmlFor={id}>{label}</label>
      {help && (
        <FieldHelp id={id} label={label}>
          {help}
        </FieldHelp>
      )}
    </div>
  )
}

function ResourceFilter({
  id,
  label,
  help,
  value,
  options,
  onChange,
}: {
  readonly id: string
  readonly label: string
  readonly help?: string
  readonly value: string
  readonly options: readonly {
    readonly value: string
    readonly label: string
    readonly count: number
  }[]
  readonly onChange: (value: string) => void
}) {
  const items = options.map((option) => ({
    value: option.value,
    label: `${option.label} (${option.count})`,
  }))
  return (
    <div className="min-w-0">
      <ResourceLabel id={id} label={label} help={help} />
      <Select
        items={items}
        value={value}
        onValueChange={(next) => {
          if (typeof next === 'string') onChange(next)
        }}
      >
        <SelectTrigger
          id={id}
          aria-describedby={help ? `${id}-help` : undefined}
          className="whitespace-normal *:data-[slot=select-value]:line-clamp-none"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          align="start"
          alignItemWithTrigger={false}
          sideOffset={6}
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={Boolean(
                option.value && option.count === 0 && option.value !== value,
              )}
              className="[&>span:first-child]:min-w-0 [&>span:first-child]:whitespace-normal"
            >
              {option.label} ({option.count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function ResourceCard({ resource }: { readonly resource: Resource }) {
  return (
    <Card
      as="article"
      className="resource-card px-4 pt-6 pb-4 sm:px-6"
      aria-labelledby={`resource-${resource.id}`}
    >
      <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-2">
        <Badge variant="outline">{resource.documentType}</Badge>
        <span className="text-sm text-muted-foreground">
          {resource.publisher}
        </span>
      </div>
      <h2
        id={`resource-${resource.id}`}
        className="m-0 text-heading-3/snug [&>a]:inline-block [&>a]:min-h-11 [&>a]:py-1"
      >
        <ExternalLink href={resource.url}>{resource.title}</ExternalLink>
      </h2>
      <p className="mt-1 mb-3">{resource.description}</p>
      {resource.reviewAreas.length > 0 && (
        <p className="mt-3 mb-0 rounded-control border border-warning-border bg-warning-surface p-3 text-sm text-warning">
          <strong>Review needed: {resource.reviewAreas.join(', ')}.</strong>{' '}
          Check the official source for updates before relying on this guidance.
        </p>
      )}
      <details>
        <summary>About this source</summary>
        <ul className="m-0 space-y-3 pl-5">
          {resource.taxPeriod && <li>Reviewed for {resource.taxPeriod}</li>}
          <li>
            {resource.sources.length > 1
              ? 'Earliest source check: '
              : 'Last checked '}
            {formatDate(resource.reviewDate)}
          </li>
          {resource.sources.map((source) => (
            <li key={source.id}>
              {source.title}
              {source.kind === 'statutory' && source.publicationDate && (
                <span className="block text-muted-foreground">
                  Published {formatDate(source.publicationDate)}
                </span>
              )}
            </li>
          ))}
        </ul>
        {resource.references && (
          <ul className="mt-3 mb-0 space-y-1 pl-5">
            {resource.references.map((reference) => (
              <li key={reference}>{reference}</li>
            ))}
          </ul>
        )}
      </details>
    </Card>
  )
}

export function ResourcesRoute() {
  const { resourceFilters: filters, setResourceFilters: setFilters } = useApp()
  const location = useLocation()
  const heading = useRef<HTMLHeadingElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [now, setNow] = useState(() => new Date())
  const catalogue = useMemo(() => resolveResources(currentRules, now), [now])
  const search = useMemo(
    () => searchResources(catalogue.resources, filters),
    [catalogue.resources, filters],
  )
  const filtered = Boolean(filters.topic || filters.task)
  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [location.key])
  useEffect(() => {
    const refreshDate = () => {
      if (document.visibilityState === 'visible') setNow(new Date())
    }
    window.addEventListener('focus', refreshDate)
    document.addEventListener('visibilitychange', refreshDate)
    return () => {
      window.removeEventListener('focus', refreshDate)
      document.removeEventListener('visibilitychange', refreshDate)
    }
  }, [])
  const clearSearch = () => {
    setFilters((previous) => ({ ...previous, query: '' }))
    input.current?.focus()
  }
  const clearFilter = (kind: 'topic' | 'task') => {
    setFilters((previous) => ({ ...previous, [kind]: '' }))
    document.getElementById(`resource-${kind}`)?.focus()
  }
  return (
    <section
      className="reference-page resources-page"
      aria-labelledby="resources-title"
    >
      <header className="resources-header">
        <h1
          id="resources-title"
          ref={heading}
          tabIndex={-1}
          className="mb-0 focus:outline-none"
        >
          Resources
        </h1>
        <p className="mt-3 mb-0 text-lg">
          Official tax references and help portals for freelancers in India.
        </p>
      </header>
      <aside className="resources-sidebar" aria-label="Browse resources">
        <nav aria-label="Resources navigation" className="grid gap-3">
          <Link
            to="/"
            className={buttonVariants({
              className: 'w-full whitespace-normal',
            })}
          >
            Back to Home
          </Link>
        </nav>
        {catalogue.resources.length > 0 && (
          <form
            role="search"
            aria-label="Find resources"
            onSubmit={(event) => event.preventDefault()}
            className="mt-8"
          >
            <ResourceLabel
              id="resource-search"
              label="Search resources"
              help="Try a topic, form name or section number."
            />
            <div className="relative">
              <Input
                id="resource-search"
                ref={input}
                type="search"
                value={filters.query}
                maxLength={200}
                autoComplete="off"
                spellCheck={false}
                aria-describedby="resource-search-help"
                placeholder="e.g. advance tax"
                className="pr-12 [&::-webkit-search-cancel-button]:appearance-none"
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    query: event.target.value,
                  }))
                }
              />
              {filters.query && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-0.5 -translate-y-1/2"
                  aria-label="Clear search"
                  onClick={clearSearch}
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              )}
            </div>
            <div className="resource-filters mt-5 grid gap-5">
              <ResourceFilter
                id="resource-topic"
                label="Topic"
                value={filters.topic}
                options={[
                  {
                    value: '',
                    label: 'All topics',
                    count: search.allTopicsCount,
                  },
                  ...search.topics,
                ]}
                onChange={(value) =>
                  setFilters((previous) => ({
                    ...previous,
                    topic:
                      search.topics.find((option) => option.value === value)
                        ?.value ?? '',
                  }))
                }
              />
              <ResourceFilter
                id="resource-task"
                label="Task"
                help="LUT means letter of undertaking."
                value={filters.task}
                options={[
                  {
                    value: '',
                    label: 'All tasks',
                    count: search.allTasksCount,
                  },
                  ...search.tasks,
                ]}
                onChange={(value) =>
                  setFilters((previous) => ({
                    ...previous,
                    task:
                      search.tasks.find((option) => option.value === value)
                        ?.value ?? '',
                  }))
                }
              />
            </div>
            {filtered && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {filters.topic && (
                  <Button
                    type="button"
                    variant="outline"
                    className="text-sm whitespace-normal"
                    aria-label={`Remove topic filter: ${search.topics.find((option) => option.value === filters.topic)!.label}`}
                    onClick={() => clearFilter('topic')}
                  >
                    {
                      search.topics.find(
                        (option) => option.value === filters.topic,
                      )!.label
                    }{' '}
                    <span aria-hidden="true">×</span>
                  </Button>
                )}
                {filters.task && (
                  <Button
                    type="button"
                    variant="outline"
                    className="text-sm whitespace-normal"
                    aria-label={`Remove task filter: ${search.tasks.find((option) => option.value === filters.task)!.label}`}
                    onClick={() => clearFilter('task')}
                  >
                    {
                      search.tasks.find(
                        (option) => option.value === filters.task,
                      )!.label
                    }{' '}
                    <span aria-hidden="true">×</span>
                  </Button>
                )}
                <Button
                  type="button"
                  variant="link"
                  className="min-h-11"
                  onClick={() => {
                    setFilters((previous) => ({
                      ...previous,
                      topic: '',
                      task: '',
                    }))
                    document.getElementById('resource-topic')?.focus()
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </form>
        )}
      </aside>
      <div className="resources-results min-w-0">
        {catalogue.resources.length === 0 ? (
          <Card className="p-6">
            <h2 className="mt-0 text-2xl">Resources are unavailable</h2>
            <p className="mb-0">
              We can't show the resource list right now. Return to My Next
              Filing to continue your estimate.
            </p>
          </Card>
        ) : (
          <>
            <p
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="mt-0 mb-4 font-bold text-foreground"
            >
              {search.results.length}{' '}
              {search.results.length === 1 ? 'resource' : 'resources'}
            </p>
            {search.results.length ? (
              <ul
                className="m-0 grid list-none gap-4 p-0"
                aria-label="Resources"
              >
                {search.results.map((resource) => (
                  <li key={resource.id}>
                    <ResourceCard resource={resource} />
                  </li>
                ))}
              </ul>
            ) : (
              <Card className="p-6">
                <h2 className="mt-0 text-2xl">
                  No resources match{' '}
                  {filters.query.trim() ? 'your search' : 'these filters'}
                </h2>
                <p>
                  {search.periodProblem
                    ? 'This collection covers Tax Year 2026-27. An Assessment Year can refer to a different period.'
                    : filtered
                      ? 'Try a different search or remove a filter to see more resources.'
                      : 'Try a broader term, such as GST or advance tax.'}
                </p>
                {search.suggestion && (
                  <Button
                    variant="link"
                    className="mb-4 min-h-11 whitespace-normal"
                    onClick={() => {
                      setFilters((previous) => ({
                        ...previous,
                        query: search.suggestion!,
                      }))
                      input.current?.focus()
                    }}
                  >
                    Did you mean “{search.suggestion}”?
                  </Button>
                )}
                <div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters(emptyResourceFilters)
                      input.current?.focus()
                    }}
                  >
                    Show all resources
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </section>
  )
}
