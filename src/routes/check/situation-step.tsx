import type { TriState } from '../../evaluation/index.ts'
import { CheckHeading, ChoiceField } from './fields.tsx'
import type { Draft, PatchDraft } from './model.ts'

export function SituationStep({
  className,
  draft,
  errors,
  patchDraft,
}: {
  readonly className: string
  readonly draft: Draft
  readonly errors: Record<string, string>
  readonly patchDraft: PatchDraft
}) {
  return (
    <div className={className}>
      <CheckHeading
        title="Does this fit your situation?"
        description="These questions decide whether this version can give you a tax estimate."
        first
      />
      <div className="question-sections">
        <section className="question-section" aria-labelledby="about-you">
          <h2 id="about-you">About you</h2>
          <div className="field-stack">
            <ChoiceField
              id="personKind"
              label="Are you an individual, not a company or firm?"
              value={draft.personKind}
              options={['individual', 'not-individual', 'not-sure']}
              labels={{ individual: 'Yes', 'not-individual': 'No' }}
              unsupportedOptions={['not-individual']}
              error={errors.personKind}
              onChange={(value) =>
                patchDraft({ personKind: value as Draft['personKind'] })
              }
            />
            <ChoiceField
              id="adult"
              label="Are you 18 or older?"
              help="This version can only estimate tax for adults. You must also confirm this before saving."
              value={draft.adult}
              unsupportedOptions={['no']}
              error={errors.adult}
              onChange={(value) => patchDraft({ adult: value as TriState })}
            />
            <ChoiceField
              id="residence"
              label="What was your Indian tax residence status for 2026-27?"
              help="Use the status in your tax records or confirmed by your tax adviser. Choose Not sure if you have not confirmed it."
              value={draft.residence}
              options={[
                'resident-ordinarily-resident',
                'resident-not-ordinarily-resident',
                'non-resident',
                'not-sure',
              ]}
              error={errors.residence}
              unsupportedOptions={[
                'resident-not-ordinarily-resident',
                'non-resident',
              ]}
              onChange={(value) =>
                patchDraft({ residence: value as Draft['residence'] })
              }
            />
            <ChoiceField
              id="taxRegime"
              label="Which tax regime are you using for 2026-27?"
              help="This version only supports the new tax regime."
              value={draft.taxRegime}
              options={['new', 'old', 'not-sure']}
              unsupportedOptions={['old']}
              error={errors.taxRegime}
              onChange={(value) =>
                patchDraft({ taxRegime: value as Draft['taxRegime'] })
              }
            />
          </div>
        </section>

        <section className="question-section" aria-labelledby="about-practice">
          <h2 id="about-practice">About your practice</h2>
          <div className="field-stack">
            <ChoiceField
              id="onePractice"
              label="Do you run one self-employed service practice?"
              help="Choose No if you have more than one business or profession."
              value={draft.onePractice}
              unsupportedOptions={['no']}
              error={errors.onePractice}
              onChange={(value) =>
                patchDraft({ onePractice: value as TriState })
              }
            />
            <ChoiceField
              id="setupInIndia"
              label="Is the practice set up and managed in India?"
              value={draft.setupInIndia}
              unsupportedOptions={['no']}
              error={errors.setupInIndia}
              onChange={(value) =>
                patchDraft({ setupInIndia: value as TriState })
              }
            />
            <ChoiceField
              id="workInIndia"
              label="Do you perform all the work that earns this income while in India?"
              value={draft.workInIndia}
              unsupportedOptions={['no']}
              error={errors.workInIndia}
              onChange={(value) =>
                patchDraft({ workInIndia: value as TriState })
              }
            />
          </div>
        </section>

        <section className="question-section" aria-labelledby="people-involved">
          <h2 id="people-involved">Who helps with the work</h2>
          <div className="field-stack">
            <ChoiceField
              id="hasPartner"
              label="Do you have a business partner in this practice?"
              value={draft.hasPartner}
              unsupportedOptions={['yes']}
              error={errors.hasPartner}
              onChange={(value) =>
                patchDraft({ hasPartner: value as TriState })
              }
            />
            <ChoiceField
              id="hasEmployee"
              label="Do you employ anyone in this practice?"
              value={draft.hasEmployee}
              unsupportedOptions={['yes']}
              error={errors.hasEmployee}
              onChange={(value) =>
                patchDraft({ hasEmployee: value as TriState })
              }
            />
            <ChoiceField
              id="hasForeignOperation"
              label="Does your practice have an office or other business operation outside India?"
              help="Foreign clients alone do not count. We ask about clients later."
              value={draft.hasForeignOperation}
              unsupportedOptions={['yes']}
              error={errors.hasForeignOperation}
              onChange={(value) =>
                patchDraft({ hasForeignOperation: value as TriState })
              }
            />
            <ChoiceField
              id="hasClientWorkSubcontractor"
              label="Does a subcontractor help deliver work to your clients?"
              value={draft.hasClientWorkSubcontractor}
              unsupportedOptions={['yes']}
              error={errors.hasClientWorkSubcontractor}
              onChange={(value) => {
                const next = value as TriState
                patchDraft(
                  {
                    hasClientWorkSubcontractor: next,
                    contractorBoundary:
                      next === 'no' ? draft.contractorBoundary : '',
                  },
                  'contractorBoundary',
                )
              }}
            />
            {draft.hasClientWorkSubcontractor === 'no' && (
              <ChoiceField
                id="contractorBoundary"
                label="Do you use a contractor in India for support work only?"
                help="Choose Yes only if they do not deliver client work, become an employee or agent, create another business, involve a foreign operation, or require you to deduct tax from their payments."
                options={['none', 'incidental-domestic', 'not-sure']}
                labels={{ none: 'No', 'incidental-domestic': 'Yes' }}
                value={draft.contractorBoundary}
                error={errors.contractorBoundary}
                onChange={(value) =>
                  patchDraft({
                    contractorBoundary: value as Draft['contractorBoundary'],
                  })
                }
              />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
