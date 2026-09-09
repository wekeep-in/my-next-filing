import {
  QuestionSection,
  QuestionSections,
} from '@/routes/check/question-section'
import {
  activityOptions,
  isBusinessPath,
  unsupportedSituationGroups,
} from '@/routes/check/model'
import { taxYearShort } from '@/lib/tax-period'
import type { QuestionnaireDispatch } from '@/routes/check/session'
import type { Activity, TriState } from '@/evaluation'
import { CheckHeading, ChoiceField, SelectField } from '@/routes/check/fields'
import type { Draft, DraftChoice, DraftPath } from '@/routes/check/model'
import { ResidenceHelp } from '@/routes/check/residence-help'
import { TaxRegimeHelp } from '@/routes/check/tax-regime-help'
import { TaxMethodHelp } from '@/routes/check/tax-method-help'

export function SituationStep({
  className,
  draft,
  errors,
  dispatch,
}: {
  readonly className: string
  readonly draft: Draft
  readonly errors: Record<string, string>
  readonly dispatch: QuestionnaireDispatch
}) {
  return (
    <div className={className}>
      <CheckHeading
        title="Fit for this version"
        description="Answer a few questions about you and your work. We will stop before the money questions if this version does not fit."
        first
      />
      <QuestionSections initialOpen="about-you">
        <QuestionSection id="about-you" title="About you">
          <div className="field-stack">
            <ChoiceField
              id="personKind"
              label="Are you an individual, not a company or firm?"
              value={draft.personKind}
              options={['individual', 'not-individual', 'not-sure']}
              labels={{ individual: 'Yes', 'not-individual': 'No' }}
              error={errors.personKind}
              onChange={(value) =>
                dispatch({
                  type: 'field-changed',
                  field: 'personKind',
                  value: value as Draft['personKind'],
                })
              }
            />
            <ChoiceField
              id="adult"
              label="Are you 18 or older?"
              help="This version can only estimate tax for adults. You must also confirm this before saving."
              value={draft.adult}
              error={errors.adult}
              onChange={(value) =>
                dispatch({
                  type: 'field-changed',
                  field: 'adult',
                  value: value as TriState,
                })
              }
            />
            <ChoiceField
              id="residence"
              label={`What was your Indian tax residence status for ${taxYearShort}?`}
              help={
                <>
                  Use the status in your tax records or confirmed by your tax
                  adviser. Choose Not sure if you have not confirmed it.{' '}
                  <ResidenceHelp />
                </>
              }
              value={draft.residence}
              options={[
                'resident-ordinarily-resident',
                'resident-not-ordinarily-resident',
                'non-resident',
                'not-sure',
              ]}
              error={errors.residence}
              onChange={(value) =>
                dispatch({
                  type: 'field-changed',
                  field: 'residence',
                  value: value as Draft['residence'],
                })
              }
            />
            <ChoiceField
              id="taxRegime"
              label={`Which tax regime are you using for ${taxYearShort}?`}
              help={
                <>
                  This version only supports the new tax regime.{' '}
                  <TaxRegimeHelp />
                </>
              }
              value={draft.taxRegime}
              options={['new', 'old', 'not-sure']}
              error={errors.taxRegime}
              onChange={(value) =>
                dispatch({
                  type: 'field-changed',
                  field: 'taxRegime',
                  value: value as Draft['taxRegime'],
                })
              }
            />
          </div>
        </QuestionSection>

        <QuestionSection id="about-practice" title="About your practice">
          <div className="field-stack">
            <ChoiceField
              id="onePractice"
              label="Do you run one self-employed service practice?"
              help="Choose No if you have more than one business or profession."
              value={draft.onePractice}
              error={errors.onePractice}
              onChange={(value) =>
                dispatch({
                  type: 'field-changed',
                  field: 'onePractice',
                  value: value as TriState,
                })
              }
            />
            <ChoiceField
              id="setupInIndia"
              label="Is the practice set up and managed in India?"
              value={draft.setupInIndia}
              error={errors.setupInIndia}
              onChange={(value) =>
                dispatch({
                  type: 'field-changed',
                  field: 'setupInIndia',
                  value: value as TriState,
                })
              }
            />
            <ChoiceField
              id="workInIndia"
              label="Do you perform all the work that earns this income while in India?"
              value={draft.workInIndia}
              error={errors.workInIndia}
              onChange={(value) =>
                dispatch({
                  type: 'field-changed',
                  field: 'workInIndia',
                  value: value as TriState,
                })
              }
            />
          </div>
        </QuestionSection>

        <QuestionSection id="people-involved" title="Who helps with the work">
          <div className="field-stack">
            <ChoiceField
              id="hasPartner"
              label="Do you have a business partner in this practice?"
              value={draft.hasPartner}
              error={errors.hasPartner}
              onChange={(value) =>
                dispatch({
                  type: 'field-changed',
                  field: 'hasPartner',
                  value: value as TriState,
                })
              }
            />
            <ChoiceField
              id="hasEmployee"
              label="Do you employ anyone in this practice?"
              value={draft.hasEmployee}
              error={errors.hasEmployee}
              onChange={(value) =>
                dispatch({
                  type: 'field-changed',
                  field: 'hasEmployee',
                  value: value as TriState,
                })
              }
            />
            <ChoiceField
              id="hasForeignOperation"
              label="Does your practice have an office or other business operation outside India?"
              help="Foreign clients alone do not count. We ask about clients later."
              value={draft.hasForeignOperation}
              error={errors.hasForeignOperation}
              onChange={(value) =>
                dispatch({
                  type: 'field-changed',
                  field: 'hasForeignOperation',
                  value: value as TriState,
                })
              }
            />
            <ChoiceField
              id="hasClientWorkSubcontractor"
              label="Does a subcontractor help deliver work to your clients?"
              value={draft.hasClientWorkSubcontractor}
              error={errors.hasClientWorkSubcontractor}
              onChange={(value) =>
                dispatch({
                  type: 'hasClientWorkSubcontractor-changed',
                  value: value as TriState,
                })
              }
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
                  dispatch({
                    type: 'field-changed',
                    field: 'contractorBoundary',
                    value: value as Draft['contractorBoundary'],
                  })
                }
              />
            )}
          </div>
        </QuestionSection>
        <QuestionSection
          id="work-and-tax-method"
          title="Your work and tax method"
        >
          <div className="field-stack">
            <SelectField
              id="activity"
              label="Which option best describes your work?"
              value={draft.activity}
              error={errors.activity}
              onChange={(value) =>
                dispatch({
                  type: 'field-changed',
                  field: 'activity',
                  value: value as Activity,
                })
              }
              options={activityOptions}
            />
            {draft.activity === 'not-sure' && (
              <p className="field-help" role="status">
                Not sure stops the estimate. Choose a specific option if you can
                confirm one.
              </p>
            )}
            <ChoiceField
              id="path"
              label="Which tax method do you use for this work?"
              help={
                <>
                  Choose the method in your records or the one confirmed by your
                  tax adviser. We cannot estimate your tax without a confirmed
                  method. <TaxMethodHelp />
                </>
              }
              options={['specified-profession', 'eligible-business']}
              value={draft.path}
              error={errors.path}
              onChange={(value) =>
                dispatch({ type: 'path-changed', value: value as DraftPath })
              }
            />
            {draft.path && (
              <ChoiceField
                id="pathConfirmed"
                label={
                  isBusinessPath(draft)
                    ? 'Is your whole practice an eligible business?'
                    : 'Is your whole practice a specified profession?'
                }
                help="Choose Yes only if this matches your records or professional advice."
                value={draft.pathConfirmed}
                error={errors.pathConfirmed}
                onChange={(value) =>
                  dispatch({
                    type: 'field-changed',
                    field: 'pathConfirmed',
                    value: value as TriState,
                  })
                }
              />
            )}
            {isBusinessPath(draft) && (
              <div className="field-stack">
                <ChoiceField
                  id="notGoodsCarriage"
                  label="Does your practice provide services rather than transport goods?"
                  value={draft.notGoodsCarriage}
                  error={errors.notGoodsCarriage}
                  onChange={(value) =>
                    dispatch({
                      type: 'field-changed',
                      field: 'notGoodsCarriage',
                      value: value as TriState,
                    })
                  }
                />
                <ChoiceField
                  id="notAgencyCommissionBrokerage"
                  label="Do you provide services on your own account, rather than as an agent, commission earner, or broker?"
                  value={draft.notAgencyCommissionBrokerage}
                  error={errors.notAgencyCommissionBrokerage}
                  onChange={(value) =>
                    dispatch({
                      type: 'field-changed',
                      field: 'notAgencyCommissionBrokerage',
                      value: value as TriState,
                    })
                  }
                />
                <ChoiceField
                  id="noChapterViiiCDeduction"
                  label="Are you claiming no Chapter VIII-C deduction?"
                  value={draft.noChapterViiiCDeduction}
                  error={errors.noChapterViiiCDeduction}
                  onChange={(value) =>
                    dispatch({
                      type: 'field-changed',
                      field: 'noChapterViiiCDeduction',
                      value: value as TriState,
                    })
                  }
                />
                <ChoiceField
                  id="fiveYearExclusion"
                  label="Does the five-year exclusion apply to this method?"
                  help="This checks whether an earlier use of this method affects you now. Choose Not sure if you need to review earlier years."
                  options={['none', 'applies', 'not-sure']}
                  value={draft.fiveYearExclusion}
                  error={errors.fiveYearExclusion}
                  onChange={(value) =>
                    dispatch({
                      type: 'field-changed',
                      field: 'fiveYearExclusion',
                      value: value as Draft['fiveYearExclusion'],
                    })
                  }
                />
              </div>
            )}
          </div>
        </QuestionSection>
        {unsupportedSituationGroups.map(({ key, title, question, help }) => {
          const field = `unsupportedSituationAnswers-${key}`
          return (
            <QuestionSection
              key={key}
              id={`situations-${key}-title`}
              title={title}
            >
              <div className="fit-situation-question">
                <ChoiceField
                  id={field}
                  label={question}
                  help={help}
                  value={draft.unsupportedSituationAnswers[key]}
                  error={errors[field]}
                  onChange={(value) =>
                    dispatch({
                      type: 'unsupported-situation-changed',
                      situation: key,
                      value: value as DraftChoice,
                    })
                  }
                />
              </div>
            </QuestionSection>
          )
        })}
      </QuestionSections>
    </div>
  )
}
