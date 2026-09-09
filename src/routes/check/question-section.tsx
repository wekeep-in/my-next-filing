import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { Accordion } from '@base-ui/react/accordion'
import { ChevronDownIcon, CircleCheckIcon } from 'lucide-react'
import { FieldHelp } from '@/components/field-help'

export const QuestionIssues = createContext<Readonly<Record<string, string>>>(
  {},
)

export function QuestionSections({
  initialOpen,
  children,
}: {
  readonly initialOpen?: string
  readonly children: ReactNode
}) {
  return (
    <Accordion.Root
      className="question-sections"
      defaultValue={initialOpen ? [initialOpen] : []}
      keepMounted
    >
      {children}
    </Accordion.Root>
  )
}

export function QuestionSection({
  id,
  title,
  showStatus = true,
  children,
}: {
  readonly id: string
  readonly title: string
  readonly showStatus?: boolean
  readonly children: ReactNode
}) {
  const section = useRef<HTMLDivElement>(null)
  const issues = useContext(QuestionIssues)
  const [messages, setMessages] = useState<readonly string[] | null>(null)
  useLayoutEffect(() => {
    // Associate existing validation with the fields actually rendered in this
    // section, including conditional rows. Do not duplicate the validation rules.
    const ids = Array.from(
      section.current!.querySelectorAll('[id]'),
      (node) => node.id,
    )
    const next = Object.entries(issues)
      .filter(([field]) =>
        ids.some(
          (fieldId) =>
            fieldId === field ||
            fieldId.startsWith(`${field}.`) ||
            fieldId === `${field}-error-anchor`,
        ),
      )
      .map(([, message]) => message)
    setMessages((current) =>
      JSON.stringify(current) === JSON.stringify(next) ? current : next,
    )
  }, [issues, children])
  return (
    <Accordion.Item value={id} className="question-disclosure" ref={section}>
      <Accordion.Header
        render={<h2 />}
        className="question-card-heading"
        aria-label={title}
      >
        <Accordion.Trigger
          id={id}
          className="question-card-trigger"
          aria-label={title}
        >
          <ChevronDownIcon aria-hidden="true" className="size-5 shrink-0" />
        </Accordion.Trigger>
        <span className="question-card-label">{title}</span>{' '}
        {showStatus && (
          <span className="question-card-status">
            {messages?.length === 0 ? (
              <span role="img" aria-label={`${title}: all answers complete`}>
                <CircleCheckIcon
                  aria-hidden="true"
                  className="size-4.5 text-primary"
                />
              </span>
            ) : (
              <FieldHelp
                id={`${id}-status`}
                label={`${title}: answers to check`}
                tone="warning"
              >
                {messages === null
                  ? 'Checking answers.'
                  : `${messages.length} ${messages.length === 1 ? 'answer needs' : 'answers need'} attention. ${messages[0]}`}
              </FieldHelp>
            )}
          </span>
        )}
      </Accordion.Header>
      <Accordion.Panel className="question-panel">
        <div className="question-section">{children}</div>
      </Accordion.Panel>
    </Accordion.Item>
  )
}
