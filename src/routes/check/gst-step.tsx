import {
  QuestionSection,
  QuestionSections,
} from '@/routes/check/question-section'
import { TcsHelp, TdsHelp } from '@/routes/check/other-income-help'
import { useContext } from 'react'
import { currentRules } from '@/rules'
import { taxYearShort } from '@/lib/tax-period'
import { GstLiabilityDateHelp } from '@/routes/check/gst-liability-date-help'
import type { QuestionnaireDispatch } from '@/routes/check/session'
import {
  creditTriggerMayApply,
  gstQuarterQuestions,
  isUnregisteredGst,
  statesAndUnionTerritories,
} from '@/routes/check/model'
import type { GstCadence, GstExportRoute, TriState } from '@/evaluation'
import {
  GstExportHelp,
  GstFrequencyHelp,
  GstRegistrationHelp,
  LutEligibilityHelp,
} from '@/components/gst-help'
import { DatePicker } from '@/components/date-picker'
import {
  CheckHeading,
  ChoiceField,
  CoverageWarnings,
  FieldError,
  MoneyField,
  SelectField,
} from '@/routes/check/fields'
import type {
  Draft,
  DraftAmountKey,
  DraftGstKind,
  DraftGstStatus,
} from '@/routes/check/model'

export function GstStep({
  className,
  draft,
  errors,
  latestThresholdDate,
  dispatch,
  setAmount,
}: {
  readonly className: string
  readonly draft: Draft
  readonly errors: Record<string, string>
  readonly latestThresholdDate: string
  readonly dispatch: QuestionnaireDispatch
  readonly setAmount: (key: DraftAmountKey, value: string) => void
}) {
  const coverage = useContext(CoverageWarnings)
  const quarters = gstQuarterQuestions(draft)
  const registrationFields = (
    <div className="field-stack">
      <ChoiceField
        id="gstKind"
        label="Have you ever had a GSTIN for this practice?"
        options={['unregistered', 'registered', 'not-sure']}
        value={draft.gstKind}
        error={errors.gstKind}
        onChange={(value) =>
          dispatch({
            type: 'gstKind-changed',
            value: value as DraftGstKind,
          })
        }
      />
      {draft.gstKind === 'unregistered' &&
        draft.platformReverseCharge === 'due' && (
          <div className="field">
            <label htmlFor="platformRcmLiabilityDate">
              When did the platform-fee reverse-charge registration liability
              arise?
            </label>
            <p
              id="platformRcmLiabilityDate-help"
              className="text-muted-foreground"
            >
              Use the date established by your records or adviser. Leave it
              unknown for earlier-year or unresolved timing; the plan will still
              show that registration is required.
            </p>
            <DatePicker
              id="platformRcmLiabilityDate"
              describedBy="platformRcmLiabilityDate-help platformRcmLiabilityDate-error"
              invalid={Boolean(errors.platformRcmLiabilityDate)}
              value={draft.platformRcmLiabilityDate}
              min={currentRules.effectiveStart}
              max={latestThresholdDate}
              onChange={(value) =>
                dispatch({
                  type: 'field-changed',
                  field: 'platformRcmLiabilityDate',
                  value,
                })
              }
            />
            <FieldError
              id="platformRcmLiabilityDate-error"
              error={errors.platformRcmLiabilityDate}
            />
          </div>
        )}
      {draft.gstKind === 'registered' && (
        <>
          <ChoiceField
            id="gstStatus"
            label="Which describes your GST registration?"
            help={
              <>
                Choose Something else for multiple GSTINs, composition,
                suspension or cancellation. <GstRegistrationHelp />
              </>
            }
            options={['one-normal', 'other', 'not-sure']}
            value={draft.gstStatus}
            error={errors.gstStatus}
            onChange={(value) =>
              dispatch({
                type: 'gstStatus-changed',
                value: value as DraftGstStatus,
              })
            }
          />
          {draft.gstStatus === 'one-normal' && (
            <>
              <SelectField
                id="gstState"
                label="Where is your active GSTIN registered?"
                value={draft.gstState}
                error={errors.gstState}
                onChange={(value) =>
                  dispatch({
                    type: 'field-changed',
                    field: 'gstState',
                    value: value,
                  })
                }
                options={statesAndUnionTerritories.map((state) => ({
                  value: state,
                  label: state,
                }))}
              />
              <div className="field">
                <label htmlFor="gstRegisteredFrom">
                  Effective GST registration date
                </label>
                <p className="field-help" id="gstRegisteredFrom-help">
                  Use the effective date in your registration records, not the
                  application date. Leave blank if unknown.{' '}
                  <GstRegistrationHelp />
                </p>
                <DatePicker
                  id="gstRegisteredFrom"
                  value={draft.gstRegisteredFrom}
                  min="2017-07-01"
                  max={latestThresholdDate}
                  clearable
                  describedBy={`gstRegisteredFrom-help${errors.gstRegisteredFrom ? ' gstRegisteredFrom-error' : ''}${coverage.gstRegisteredFrom ? ' gstRegisteredFrom-coverage' : ''}`}
                  invalid={Boolean(errors.gstRegisteredFrom)}
                  onChange={(value) =>
                    dispatch({
                      type: 'field-changed',
                      field: 'gstRegisteredFrom',
                      value,
                    })
                  }
                />
                <FieldError
                  id="gstRegisteredFrom-error"
                  error={errors.gstRegisteredFrom}
                />
              </div>
              <ChoiceField
                id="gstContinuous"
                label="Has your GST registration stayed the same?"
                help={
                  <>
                    <ul className="mb-3 list-disc space-y-2 pl-5">
                      <li>
                        It has stayed active as a normal taxpayer in the same
                        state since the effective date.
                      </li>
                      <li>
                        There has been no composition, suspension or
                        cancellation.
                      </li>
                      <li>
                        The effective date matches your first filing period in
                        the GST portal.
                      </li>
                    </ul>
                    Choose Not sure for backdated or unclear periods.{' '}
                    <GstRegistrationHelp />
                  </>
                }
                value={draft.gstContinuous}
                error={errors.gstContinuous}
                onChange={(value) =>
                  dispatch({
                    type: 'field-changed',
                    field: 'gstContinuous',
                    value: value as TriState,
                  })
                }
              />
            </>
          )}
        </>
      )}
      {isUnregisteredGst(draft) && (
        <>
          <SelectField
            id="gstState"
            label="Which state or Union territory do you make taxable supplies from?"
            value={draft.gstState}
            error={errors.gstState}
            onChange={(value) =>
              dispatch({
                type: 'field-changed',
                field: 'gstState',
                value: value,
              })
            }
            options={statesAndUnionTerritories.map((state) => ({
              value: state,
              label: state,
            }))}
          />
          <MoneyField
            id="aggregateTurnover"
            label="GST aggregate turnover for this PAN"
            help={`Enter your all-India total for ${taxYearShort}. Include taxable, exempt, export, and inter-State supplies, including exempt rental supply value. Do not use taxable rental income after deductions. Exclude employment salary, GST, cess, and inward supplies taxed under reverse charge. This may differ from the receipts entered earlier.`}
            value={draft.amounts.aggregateTurnover}
            error={errors.aggregateTurnover}
            onChange={(value) => setAmount('aggregateTurnover', value)}
          />
          <ChoiceField
            id="turnoverComplete"
            label="Is this your complete GST aggregate turnover?"
            labels={{
              yes: "Yes, it's complete",
              no: "No, it's incomplete",
            }}
            value={draft.turnoverComplete}
            error={errors.turnoverComplete}
            onChange={(value) =>
              dispatch({
                type: 'field-changed',
                field: 'turnoverComplete',
                value: value as TriState,
              })
            }
          />
          <ChoiceField
            id="compulsoryRegistration"
            label={
              draft.platformReverseCharge === 'due'
                ? 'Could another reason require GST registration, besides turnover and the platform-fee duty?'
                : 'Could you need to register for GST for a reason other than turnover?'
            }
            help="Choose Not sure if you haven't confirmed this."
            value={draft.compulsoryRegistration}
            error={errors.compulsoryRegistration}
            onChange={(value) =>
              dispatch({
                type: 'field-changed',
                field: 'compulsoryRegistration',
                value: value as TriState,
              })
            }
          />
          <div className="field">
            <label htmlFor="thresholdLiabilityDate">
              If your turnover is above the threshold, when did you become
              liable to register?
            </label>
            <p className="field-help" id="threshold-date-help">
              Choose a past or present date in {taxYearShort}. Leave this blank
              if your turnover is at or below the threshold or you don't know
              the date. <GstLiabilityDateHelp />
            </p>
            <DatePicker
              id="thresholdLiabilityDate"
              value={draft.thresholdLiabilityDate}
              min={currentRules.effectiveStart}
              max={latestThresholdDate}
              clearable
              describedBy={`threshold-date-help${errors.thresholdLiabilityDate ? ' thresholdLiabilityDate-error' : ''}${coverage.thresholdLiabilityDate ? ' thresholdLiabilityDate-coverage' : ''}`}
              invalid={Boolean(errors.thresholdLiabilityDate)}
              onChange={(value) =>
                dispatch({
                  type: 'field-changed',
                  field: 'thresholdLiabilityDate',
                  value: value,
                })
              }
            />
            <FieldError
              id="thresholdLiabilityDate-error"
              error={errors.thresholdLiabilityDate}
            />
          </div>
        </>
      )}
    </div>
  )
  return (
    <div className={className}>
      <CheckHeading
        title="Taxes and GST"
        description="Add tax credits and payments, check other filing conditions, and confirm your GST details."
      />
      <QuestionSections initialOpen="tax-paid-title">
        <QuestionSection id="tax-paid-title" title="Tax already paid">
          <div className="field-stack">
            <ChoiceField
              id="hasTaxPaid"
              label={`Do you have Indian tax credits or advance tax payments to include for ${taxYearShort}?`}
              help="Include Indian TDS or TCS credits and advance tax already paid. Choose No only if all three are zero. Choose Not sure if you need to check your records."
              value={draft.hasTaxPaid}
              error={errors.hasTaxPaid}
              onChange={(value) =>
                dispatch({
                  type: 'field-changed',
                  field: 'hasTaxPaid',
                  value: value as TriState,
                })
              }
            />
            {draft.hasTaxPaid === 'yes' && (
              <>
                <MoneyField
                  id="tds"
                  label="Indian TDS credit"
                  help={
                    <>
                      Enter actual Indian TDS for all income included in this
                      estimate. Count each credit once. <TdsHelp />
                    </>
                  }
                  value={draft.amounts.tds}
                  error={errors.tds}
                  onChange={(value) => setAmount('tds', value)}
                />
                <MoneyField
                  id="tcs"
                  label="Indian TCS credit"
                  help={
                    <>
                      Enter the TCS credit available for {taxYearShort}.{' '}
                      <TcsHelp />
                    </>
                  }
                  value={draft.amounts.tcs}
                  error={errors.tcs}
                  onChange={(value) => setAmount('tcs', value)}
                />
                <MoneyField
                  id="advanceTaxPaid"
                  label="Advance tax already paid"
                  help={`Enter only advance tax paid for ${taxYearShort}. Do not include self-assessment tax.`}
                  value={draft.amounts.advanceTaxPaid}
                  error={errors.advanceTaxPaid}
                  onChange={(value) => setAmount('advanceTaxPaid', value)}
                />
              </>
            )}
          </div>
        </QuestionSection>
        <QuestionSection
          id="filing-conditions-title"
          title="Income-tax filing conditions"
        >
          <div className="field-stack">
            {creditTriggerMayApply(draft) && (
              <ChoiceField
                id="ageSixtyOrOlder"
                label={`Were you 60 or older at any time during ${taxYearShort}?`}
                help="If you were 60 or older, this income-tax return trigger starts at ₹50,000 of combined TDS and TCS instead of ₹25,000."
                value={draft.ageSixtyOrOlder}
                error={errors.ageSixtyOrOlder}
                onChange={(value) =>
                  dispatch({
                    type: 'field-changed',
                    field: 'ageSixtyOrOlder',
                    value: value as TriState,
                  })
                }
              />
            )}
            <ChoiceField
              id="otherAnnualReturnTrigger"
              label="Does another condition require you to file an income-tax return?"
              help="Choose Not sure if you need to review the banking, travel, electricity, or foreign-asset conditions."
              value={draft.otherAnnualReturnTrigger}
              error={errors.otherAnnualReturnTrigger}
              onChange={(value) =>
                dispatch({
                  type: 'field-changed',
                  field: 'otherAnnualReturnTrigger',
                  value: value as TriState,
                })
              }
            />
          </div>
        </QuestionSection>
        <QuestionSection id="gst-registration-title" title="GST registration">
          {registrationFields}
        </QuestionSection>
        {draft.gstKind === 'registered' && draft.gstStatus === 'one-normal' && (
          <>
            <QuestionSection
              id="gst-cadence-title"
              title="GST filing frequency"
            >
              <p className="field-help mb-0!" id="gst-cadence-help">
                Choose the filing frequency shown in the GST portal for each
                quarter. Choose Not sure if you haven't confirmed it.{' '}
                <GstFrequencyHelp />
              </p>
              <div className="field-stack">
                {quarters.map(({ field, label }) => (
                  <SelectField
                    key={field}
                    id={field}
                    label={label}
                    value={draft[field]}
                    error={errors[field]}
                    options={[
                      { value: 'monthly', label: 'Monthly returns' },
                      {
                        value: 'qrmp',
                        label: 'Quarterly returns (QRMP)',
                      },
                      { value: 'not-sure', label: 'Not sure' },
                    ]}
                    onChange={(value) =>
                      dispatch({
                        type: 'field-changed',
                        field,
                        value: value as GstCadence,
                      })
                    }
                  />
                ))}
              </div>
            </QuestionSection>
            <QuestionSection
              id="gst-export-title"
              title="Service exports and LUT"
            >
              <div className="field-stack">
                <SelectField
                  id="gstExportRoute"
                  label="How are you handling GST on service exports?"
                  help={
                    <>
                      Use the treatment in your records for this year. Overseas
                      clients alone do not establish export eligibility.{' '}
                      <GstExportHelp />
                    </>
                  }
                  value={draft.gstExportRoute}
                  error={errors.gstExportRoute}
                  options={[
                    {
                      value: 'none',
                      label: 'No exports or SEZ supplies',
                    },
                    {
                      value: 'lut',
                      label: 'LUT: without IGST',
                    },
                    {
                      value: 'igst',
                      label: 'With IGST payment',
                    },
                    { value: 'other', label: 'Bond, SEZ or mixed routes' },
                    { value: 'not-sure', label: 'Not sure' },
                  ]}
                  onChange={(value) =>
                    dispatch({
                      type: 'field-changed',
                      field: 'gstExportRoute',
                      value: value as GstExportRoute,
                    })
                  }
                />
                {draft.gstExportRoute === 'lut' && (
                  <>
                    <ChoiceField
                      id="gstLutConfirmed"
                      label="Can you confirm these LUT conditions?"
                      help={
                        <>
                          <ul className="mb-3 list-disc space-y-2 pl-5">
                            <li>
                              Your services qualify as exports outside India.
                            </li>
                            <li>
                              You have not been prosecuted under GST or the
                              relevant earlier laws in a case involving tax
                              evasion of more than ₹
                              {currentRules.groups.lut.values
                                .prosecutionThreshold / 10_000_000}{' '}
                              crore.
                            </li>
                            <li>
                              Your LUT facility has not been withdrawn or
                              restricted, and you have no unresolved eligibility
                              issue.
                            </li>
                          </ul>
                          <LutEligibilityHelp />
                        </>
                      }
                      value={draft.gstLutConfirmed}
                      error={errors.gstLutConfirmed}
                      onChange={(value) =>
                        dispatch({
                          type: 'field-changed',
                          field: 'gstLutConfirmed',
                          value: value as TriState,
                        })
                      }
                    />
                    <div className="field">
                      <label htmlFor="gstFirstExportDate">
                        First service export date in {taxYearShort}
                      </label>
                      <p className="field-help" id="gstFirstExportDate-help">
                        Use the first export under this GST registration,
                        including exports already made. Use the first planned
                        date only if you have not exported yet. Submit your LUT
                        before that export. Leave blank if unknown. This only
                        affects the LUT date.
                      </p>
                      <DatePicker
                        id="gstFirstExportDate"
                        value={draft.gstFirstExportDate}
                        min={currentRules.effectiveStart}
                        max={currentRules.effectiveEnd}
                        clearable
                        describedBy={`gstFirstExportDate-help${errors.gstFirstExportDate ? ' gstFirstExportDate-error' : ''}${coverage.gstFirstExportDate ? ' gstFirstExportDate-coverage' : ''}`}
                        invalid={Boolean(errors.gstFirstExportDate)}
                        onChange={(value) =>
                          dispatch({
                            type: 'field-changed',
                            field: 'gstFirstExportDate',
                            value,
                          })
                        }
                      />
                      <FieldError
                        id="gstFirstExportDate-error"
                        error={errors.gstFirstExportDate}
                      />
                    </div>
                  </>
                )}
              </div>
            </QuestionSection>
          </>
        )}
      </QuestionSections>
    </div>
  )
}
