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
import {
  AdditionalIncomeHelp,
  EquityGainsHelp,
  SalaryCoverageHelp,
} from '@/routes/check/other-income-help'
import { RentalIncomeHelp } from '@/routes/check/rental-income-fields'

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
        title="Fit for this app"
        description="First, check whether this app covers your work and tax situation. Choose Not sure when you cannot confirm an answer. Some answers will stop the estimate; that does not mean you have done anything wrong."
        first
      />
      <QuestionSections initialOpen="about-you">
        <QuestionSection id="about-you" title="About you">
          <div className="field-stack">
            <ChoiceField
              id="personKind"
              label="Are you answering for yourself as an individual?"
              help="Choose Yes if you freelance in your own name or as a sole proprietor, meaning you own the business yourself. Choose No for a company, partnership firm or other organisation."
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
              help="This app can only estimate tax for adults. You must also confirm this before saving."
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
              label={`What is your Indian tax residence status for ${taxYearShort}?`}
              help={
                <>
                  Tax residence depends on time spent in India and rules about
                  earlier years, not just citizenship or your address. Use a
                  status confirmed for this tax year, or choose Not sure.{' '}
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
                  A tax regime is a set of income-tax rates and deductions.
                  Deductions reduce the income on which tax is calculated. This
                  app supports only the new regime. <TaxRegimeHelp />
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

        <QuestionSection id="about-practice" title="About your freelance work">
          <div className="field-stack">
            <ChoiceField
              id="onePractice"
              label="Do you run one freelance service business or profession?"
              help="This means the work you do for clients on your own account. Several clients can belong to one practice. Choose No if you run another business or profession too."
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
              label="Is your freelance practice set up and managed in India?"
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
              label="Do you pay another freelancer or business to do any of your client work?"
              help="This is subcontracting. Include anyone who delivers part of the work you sell to clients."
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
                help="Support work could be bookkeeping or maintaining your own website. Choose Yes only if the contractor does no client work, is not an employee or agent, and creates no separate business, overseas operation or duty for you to deduct tax from their pay. Choose Not sure if any of this is unclear."
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
                This app needs a confirmed type of work to estimate tax. Keep
                Not sure until you can identify it from your contracts or with a
                tax adviser.
              </p>
            )}
            <ChoiceField
              id="path"
              label="Which tax method do you use for this work?"
              help={
                <>
                  Both options use a minimum percentage of work income as
                  profit. This is called the presumptive method. Choose only the
                  path confirmed in your tax records or by a tax adviser. If you
                  do not know it, read the help before choosing.{' '}
                  <TaxMethodHelp />
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
                help="This must cover all your freelance work, not just your main service. Choose Not sure if the classification is unconfirmed."
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
                  label="Can you confirm you are not claiming a Chapter VIII-C deduction?"
                  help="These are special deductions for certain incomes and businesses under the Income-tax Act. They are different from ordinary business costs. Check the deduction section of your tax computation, or ask your adviser whether any claim falls under Chapter VIII-C. Choose Not sure if you cannot confirm."
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
                  help="If you used this business method and then stopped following it within the next five tax years, you can be barred from using it for five years after the year you stopped. Check your past returns or ask your adviser. This question is about that restriction, not how long you have freelanced."
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
                  help={
                    <>
                      {help}{' '}
                      {key === 'salaryInvestments' && (
                        <>
                          <SalaryCoverageHelp /> <AdditionalIncomeHelp />{' '}
                          <EquityGainsHelp />
                        </>
                      )}
                      {key === 'otherIncome' && <RentalIncomeHelp />}
                    </>
                  }
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
