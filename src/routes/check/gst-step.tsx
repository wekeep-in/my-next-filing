import {
  QuestionSection,
  QuestionSections,
} from '@/routes/check/question-section'
import {
  AnnualReturnHelp,
  TcsHelp,
  TdsHelp,
} from '@/routes/check/other-income-help'
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
        label="Have you ever registered this freelance practice for GST?"
        help="GST means Goods and Services Tax, separate from income tax. Registration gives you a GST identification number, or GSTIN. Choose Yes even if a past registration is now cancelled."
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
              When did paying GST on platform fees first require you to
              register?
            </label>
            <p
              id="platformRcmLiabilityDate-help"
              className="text-muted-foreground"
            >
              Use the date confirmed by your records or adviser. Leave blank if
              it is unknown or falls before this tax year. The plan will still
              show that registration is required, but cannot give its deadline.
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
                Use the taxpayer type on your GST registration certificate.
                Choose Something else if you have several registrations, use the
                composition scheme, or a registration is suspended or cancelled.{' '}
                <GstRegistrationHelp />
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
                  Effective GST registration date, if known
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
            label="Which state or Union territory do you provide your services from?"
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
            help={`Aggregate turnover is the total value of goods and services you supply across India under your PAN, your income-tax identity. For ${taxYearShort}, include services sold to Indian and overseas clients and supplies exempt from GST, including qualifying rental value. Exclude salary, GST, cess and purchases on which you pay reverse-charge GST. Use your GST records; this is not profit or bank deposits and may differ from freelance receipts.`}
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
            help="Some activities require registration even below the turnover limit, such as having to pay GST yourself under reverse charge. Selling through a platform or to another state can need a check of the applicable exemptions. Choose No only if you have confirmed that no other registration requirement applies; otherwise choose Not sure."
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
              When did your GST turnover first cross the registration threshold?
            </label>
            <p className="field-help" id="threshold-date-help">
              The threshold is the turnover limit that can require registration.
              Enter the first date you exceeded it in {taxYearShort}, no later
              than today. Leave blank if you have not crossed it or do not know
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
        description="First, include income tax already paid so it is not counted twice. Then check whether you need to file a return and how GST, Goods and Services Tax, applies."
      />
      <QuestionSections initialOpen="tax-paid-title">
        <QuestionSection id="tax-paid-title" title="Tax already paid">
          <div className="field-stack">
            <ChoiceField
              id="hasTaxPaid"
              label={`Do you have Indian tax credits or advance tax payments to include for ${taxYearShort}?`}
              help="TDS is income tax deducted by clients, employers or banks. TCS is income tax collected from you on certain transactions. Advance tax is income tax you pay during the year. Include only amounts already paid or available as credits, not expected payments. Choose No only if all three are zero; choose Not sure if you need to check."
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
                      Add tax deducted by Indian clients, employers and banks
                      for all income in this estimate. Use your tax-credit
                      records and count each amount once. Enter 0 if none.{' '}
                      <TdsHelp />
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
                      Enter income tax collected from you and available as a
                      credit for {taxYearShort}. Exclude GST collections. Enter
                      0 if none. <TcsHelp />
                    </>
                  }
                  value={draft.amounts.tcs}
                  error={errors.tcs}
                  onChange={(value) => setAmount('tcs', value)}
                />
                <MoneyField
                  id="advanceTaxPaid"
                  label="Advance tax already paid"
                  help={`Enter all income tax you have already paid as advance tax for ${taxYearShort}. Exclude self-assessment tax, the balance paid when settling your annual return. Enter 0 if none.`}
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
              help={
                <>
                  An income-tax return is the annual report of your income and
                  tax sent to the government. You may need to file even when no
                  tax is due. Check the banking, travel, electricity and
                  foreign-asset conditions before answering.{' '}
                  <AnnualReturnHelp />
                </>
              }
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
                A GST return is a report you file with the government. Choose
                the frequency shown in the GST portal for each three-month
                quarter. QRMP means quarterly returns with monthly payment
                checks. Choose Not sure if you haven't confirmed it.{' '}
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
                      LUT means Letter of Undertaking, used by eligible
                      exporters to export without paying Integrated GST, or
                      IGST, upfront. SEZ means Special Economic Zone. Use the
                      route confirmed in your records; an overseas client alone
                      is not enough. <GstExportHelp />
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
                        First service export date in {taxYearShort}, if known
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
