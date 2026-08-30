import { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { Profile } from '../evaluation'
import { formatMoney } from '../app'
import { getCurrentCheck, setCurrentCheck } from '../current-check'
import {
  JourneySidebar,
  calculationStep,
  questionnaireSteps,
} from '../journey-sidebar'

type MoneyKey =
  | 'grossProfessionalReceipts'
  | 'cashReceipts'
  | 'higherExpectedProfit'
  | 'taxableBankInterest'
  | 'tdsAlreadyDeducted'
  | 'tcsAlreadyCollected'
  | 'advanceTaxAlreadyPaid'
  | 'gstAggregateTurnover'

type MoneyPatch = { -readonly [Key in MoneyKey]?: number }

const statesAndUnionTerritories = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const

const emptyProfile = (): Profile => ({
  scopeConfirmed: null,
  residentIndividual: true,
  newTaxRegime: true,
  itOrSoftwareConsulting: true,
  presumptiveProfessionalTaxation: true,
  directIndianClients: true,
  noGstin: true,
  grossProfessionalReceipts: 0,
  cashReceipts: 0,
  higherExpectedProfit: 0,
  taxableBankInterest: 0,
  tdsAlreadyDeducted: 0,
  tcsAlreadyCollected: 0,
  advanceTaxAlreadyPaid: 0,
  stateOrUnionTerritory: '',
  gstAggregateTurnover: 0,
  unsupportedFacts: [],
})

const exampleProfile: Profile = {
  scopeConfirmed: true,
  residentIndividual: true,
  newTaxRegime: true,
  itOrSoftwareConsulting: true,
  presumptiveProfessionalTaxation: true,
  directIndianClients: true,
  noGstin: true,
  grossProfessionalReceipts: 1_900_000,
  cashReceipts: 0,
  higherExpectedProfit: 1_400_000,
  taxableBankInterest: 10_000,
  tdsAlreadyDeducted: 40_000,
  tcsAlreadyCollected: 0,
  advanceTaxAlreadyPaid: 0,
  stateOrUnionTerritory: 'Maharashtra',
  gstAggregateTurnover: 1_910_000,
  unsupportedFacts: [],
}

const moneyKeys: readonly MoneyKey[] = [
  'grossProfessionalReceipts',
  'cashReceipts',
  'higherExpectedProfit',
  'taxableBankInterest',
  'tdsAlreadyDeducted',
  'tcsAlreadyCollected',
  'advanceTaxAlreadyPaid',
  'gstAggregateTurnover',
]

function moneyText(profile: Profile) {
  return Object.fromEntries(
    moneyKeys.map((key) => [key, profile[key].toLocaleString('en-IN')]),
  ) as Record<MoneyKey, string>
}

function parseMoney(
  value: string,
  optional: boolean,
): { value: number } | { error: string } {
  const trimmed = value.trim()
  if (!trimmed)
    return optional ? { value: 0 } : { error: 'Enter a whole-rupee amount.' }
  if (!/^(?:₹\s?)?[\d,]+$/.test(trimmed))
    return { error: 'Use a non-negative whole-rupee amount.' }
  const amount = Number(trimmed.replace(/^₹\s?/, '').replaceAll(',', ''))
  if (!Number.isSafeInteger(amount) || amount < 0)
    return { error: 'Use an amount within the supported whole-rupee range.' }
  return { value: amount }
}

function FieldError({
  id,
  error,
}: {
  readonly id: string
  readonly error?: string
}) {
  return error ? (
    <p className="field-error" id={id} role="alert">
      {error}
    </p>
  ) : null
}

function MoneyField({
  id,
  label,
  help,
  value,
  error,
  onChange,
  onBlur,
}: {
  readonly id: MoneyKey
  readonly label: string
  readonly help: string
  readonly value: string
  readonly error?: string
  readonly onChange: (value: string) => void
  readonly onBlur: () => void
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <p className="field-help" id={`${id}-help`}>
        {help}
      </p>
      <div className="money-input">
        <span aria-hidden="true">₹</span>
        <input
          id={id}
          aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`}
          aria-invalid={Boolean(error)}
          autoComplete="off"
          inputMode="numeric"
          value={value.replace(/^₹\s?/, '')}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
      </div>
      <FieldError id={`${id}-error`} error={error} />
    </div>
  )
}

function QuestionHeading({ title }: { readonly title: string }) {
  return (
    <>
      <span className="period-pill">1 April 2026 to 31 March 2027</span>
      <h1 id="check-title">{title}</h1>
    </>
  )
}

export function CheckRoute() {
  const location = useLocation()
  const navigate = useNavigate()
  const exampleRequested = Boolean(
    (location.state as { example?: boolean } | null)?.example,
  )
  const personalRequested = Boolean(
    (location.state as { personal?: boolean } | null)?.personal,
  )
  const animateRequested = Boolean(
    (location.state as { animate?: boolean } | null)?.animate,
  )
  const requestedStep = (location.state as { step?: number } | null)?.step
  const [currentCheck] = useState(getCurrentCheck)
  const [usingExample] = useState(
    exampleRequested || (!personalRequested && Boolean(currentCheck?.example)),
  )
  const startingProfile = usingExample
    ? exampleProfile
    : !personalRequested && currentCheck
      ? currentCheck.profile
      : emptyProfile()
  const startingHighestStep = usingExample
    ? questionnaireSteps.length - 1
    : !personalRequested && currentCheck
      ? currentCheck.highestStep
      : 0
  const [profile, setProfile] = useState<Profile>(startingProfile)
  const [rawMoney, setRawMoney] = useState<Record<MoneyKey, string>>(() =>
    moneyText(startingProfile),
  )
  const [step, setStep] = useState(
    Number.isInteger(requestedStep)
      ? Math.min(Math.max(requestedStep ?? 0, 0), startingHighestStep)
      : 0,
  )
  const [highestStep, setHighestStep] = useState(startingHighestStep)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [motion, setMotion] = useState<'none' | 'step' | 'error'>(
    animateRequested ? 'step' : 'none',
  )

  useEffect(() => {
    if (exampleRequested || personalRequested) {
      setCurrentCheck(startingProfile, usingExample, false, startingHighestStep)
      navigate('/check', { replace: true, state: null })
    }
  }, [
    exampleRequested,
    navigate,
    personalRequested,
    startingProfile,
    startingHighestStep,
    usingExample,
  ])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  const setMoney = (key: MoneyKey, value: string) => {
    setHighestStep((current) => Math.min(current, step))
    setRawMoney((current) => ({ ...current, [key]: value }))
  }

  const commitMoney = (key: MoneyKey, optional: boolean) => {
    const parsed = parseMoney(rawMoney[key], optional)
    if ('error' in parsed) return
    const nextProfile = { ...profile, [key]: parsed.value }
    setProfile(nextProfile)
    setCurrentCheck(
      nextProfile,
      usingExample,
      false,
      Math.min(highestStep, step),
    )
    setRawMoney((current) => ({
      ...current,
      [key]: parsed.value.toLocaleString('en-IN'),
    }))
  }

  const parseFields = (keys: readonly MoneyKey[], optional: boolean) => {
    const nextErrors: Record<string, string> = {}
    const patch: MoneyPatch = {}
    for (const key of keys) {
      const parsed = parseMoney(rawMoney[key], optional)
      if ('error' in parsed) nextErrors[key] = parsed.error
      else patch[key] = parsed.value
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return null
    }
    const next = { ...profile, ...patch }
    setProfile(next)
    setRawMoney(
      (current) =>
        Object.fromEntries(
          moneyKeys.map((key) => [
            key,
            key in patch
              ? (patch[key] as number).toLocaleString('en-IN')
              : current[key],
          ]),
        ) as Record<MoneyKey, string>,
    )
    return next
  }

  const validateStep = (): Profile | null => {
    const nextErrors: Record<string, string> = {}
    let nextProfile = profile
    if (step === 0) {
      const next = parseFields(
        ['grossProfessionalReceipts', 'cashReceipts', 'higherExpectedProfit'],
        false,
      )
      if (!next) return null
      nextProfile = next
      if (next.cashReceipts > next.grossProfessionalReceipts) {
        nextErrors.cashReceipts =
          'Cash receipts cannot be above gross professional receipts.'
      }
      if (next.higherExpectedProfit < next.grossProfessionalReceipts / 2) {
        nextErrors.higherExpectedProfit =
          'Higher expected profit cannot be below half of gross professional receipts.'
      }
    }
    if (step === 1) {
      const next = parseFields(['taxableBankInterest'], true)
      if (!next) return null
      nextProfile = next
    }
    if (step === 2) {
      const next = parseFields(
        ['tdsAlreadyDeducted', 'tcsAlreadyCollected', 'advanceTaxAlreadyPaid'],
        true,
      )
      if (!next) return null
      nextProfile = next
    }
    if (step === 3) {
      const next = parseFields(['gstAggregateTurnover'], false)
      if (!next) return null
      nextProfile = next
      if (!next.stateOrUnionTerritory)
        nextErrors.stateOrUnionTerritory = 'Select a state or Union territory.'
    }
    if (step === 4 && profile.scopeConfirmed === null)
      nextErrors.scopeConfirmed = 'Choose Yes or No before calculating.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0 ? nextProfile : null
  }

  const changeStep = (nextStep: number, animate: boolean) => {
    setErrors({})
    setMotion(animate ? 'step' : 'none')
    setStep(nextStep)
  }

  const next = (event: MouseEvent<HTMLButtonElement>) => {
    const animate = event.detail > 0
    const nextProfile = validateStep()
    if (!nextProfile) {
      setMotion(animate ? 'error' : 'none')
      return
    }
    if (step === questionnaireSteps.length - 1) {
      setMotion('none')
      setCurrentCheck(
        nextProfile,
        usingExample,
        true,
        questionnaireSteps.length - 1,
      )
      const button = event.currentTarget.getBoundingClientRect()
      navigate('/plan', {
        state: animate
          ? {
              animate: true,
              confettiOrigin: {
                x: (button.left + button.width / 2) / window.innerWidth,
                y: (button.top + button.height / 2) / window.innerHeight,
              },
            }
          : null,
      })
      return
    }
    const nextStep = step + 1
    setHighestStep((current) => Math.max(current, nextStep))
    setCurrentCheck(nextProfile, usingExample, false, nextStep)
    changeStep(nextStep, animate)
  }

  const selectJourneyStep = (journeyStep: number, animate: boolean) => {
    if (journeyStep === 0) {
      setMotion('none')
      navigate('/', { state: { animate } })
      return
    }
    if (journeyStep <= questionnaireSteps.length) {
      changeStep(journeyStep - 1, animate)
    }
  }

  const questionGroupClassName = `question-group${motion === 'step' ? ' question-group--enter' : ''}`

  return (
    <section
      className="questionnaire journey-layout"
      aria-labelledby="check-title"
    >
      {usingExample && (
        <p className="notice notice--top notice--example">
          These are fictional amounts. Replace them with your own answers if you
          use the personal check.
        </p>
      )}
      <div
        className={`questionnaire-main${motion === 'error' ? ' is-pointer-activated' : ''}`}
      >
        {step === 0 && (
          <div
            className={questionGroupClassName}
            key={step}
            aria-labelledby="check-title"
          >
            <QuestionHeading title="Professional receipts" />
            <MoneyField
              id="grossProfessionalReceipts"
              label="Gross professional receipts"
              help="Enter gross professional receipts from your invoice or receipt records. Do not subtract expenses or TDS."
              value={rawMoney.grossProfessionalReceipts}
              error={errors.grossProfessionalReceipts}
              onChange={(value) => setMoney('grossProfessionalReceipts', value)}
              onBlur={() => commitMoney('grossProfessionalReceipts', false)}
            />
            <MoneyField
              id="cashReceipts"
              label="Professional receipts received in cash"
              help="Include cash and non-account-payee cheques or drafts. Enter zero if all receipts came through bank or online payments."
              value={rawMoney.cashReceipts}
              error={errors.cashReceipts}
              onChange={(value) => setMoney('cashReceipts', value)}
              onBlur={() => commitMoney('cashReceipts', false)}
            />
            <MoneyField
              id="higherExpectedProfit"
              label="Higher expected profit"
              help="Enter your expected profit. It must be at least 50% of gross professional receipts."
              value={rawMoney.higherExpectedProfit}
              error={errors.higherExpectedProfit}
              onChange={(value) => setMoney('higherExpectedProfit', value)}
              onBlur={() => commitMoney('higherExpectedProfit', false)}
            />
          </div>
        )}

        {step === 1 && (
          <div
            className={questionGroupClassName}
            key={step}
            aria-labelledby="check-title"
          >
            <QuestionHeading title="Bank interest" />
            <MoneyField
              id="taxableBankInterest"
              label="Taxable bank or deposit interest"
              help="Enter taxable bank or deposit interest before TDS. Use your interest certificate or annual statement. Enter zero if none."
              value={rawMoney.taxableBankInterest}
              error={errors.taxableBankInterest}
              onChange={(value) => setMoney('taxableBankInterest', value)}
              onBlur={() => commitMoney('taxableBankInterest', true)}
            />
          </div>
        )}

        {step === 2 && (
          <div
            className={questionGroupClassName}
            key={step}
            aria-labelledby="check-title"
          >
            <QuestionHeading title="Tax credits and payments" />
            <MoneyField
              id="tdsAlreadyDeducted"
              label="TDS already deducted"
              help="Enter TDS already deducted by a client or bank for this income. Exclude expected TDS."
              value={rawMoney.tdsAlreadyDeducted}
              error={errors.tdsAlreadyDeducted}
              onChange={(value) => setMoney('tdsAlreadyDeducted', value)}
              onBlur={() => commitMoney('tdsAlreadyDeducted', true)}
            />
            <MoneyField
              id="tcsAlreadyCollected"
              label="TCS already collected"
              help="Enter TCS already collected and available as credit. Enter zero if none."
              value={rawMoney.tcsAlreadyCollected}
              error={errors.tcsAlreadyCollected}
              onChange={(value) => setMoney('tcsAlreadyCollected', value)}
              onBlur={() => commitMoney('tcsAlreadyCollected', true)}
            />
            <MoneyField
              id="advanceTaxAlreadyPaid"
              label="Advance tax already paid"
              help="Enter advance tax already paid for income earned from 1 April 2026 to 31 March 2027. Exclude self-assessment tax for another period."
              value={rawMoney.advanceTaxAlreadyPaid}
              error={errors.advanceTaxAlreadyPaid}
              onChange={(value) => setMoney('advanceTaxAlreadyPaid', value)}
              onBlur={() => commitMoney('advanceTaxAlreadyPaid', true)}
            />
          </div>
        )}

        {step === 3 && (
          <div
            className={questionGroupClassName}
            key={step}
            aria-labelledby="check-title"
          >
            <QuestionHeading title="GST check" />
            <div className="field">
              <label htmlFor="stateOrUnionTerritory">
                State or Union territory
              </label>
              <p className="field-help" id="state-help">
                Select the state or Union territory from which you make taxable
                supplies. Do not select your client's location.
              </p>
              <select
                id="stateOrUnionTerritory"
                aria-describedby={`state-help${errors.stateOrUnionTerritory ? ' state-error' : ''}`}
                aria-invalid={Boolean(errors.stateOrUnionTerritory)}
                value={profile.stateOrUnionTerritory}
                onChange={(event) => {
                  const nextProfile = {
                    ...profile,
                    stateOrUnionTerritory: event.target.value,
                  }
                  setHighestStep((current) => Math.min(current, step))
                  setProfile(nextProfile)
                  setCurrentCheck(
                    nextProfile,
                    usingExample,
                    false,
                    Math.min(highestStep, step),
                  )
                }}
              >
                <option value="">Select a state or Union territory</option>
                {statesAndUnionTerritories.map((state) => (
                  <option key={state}>{state}</option>
                ))}
              </select>
              <FieldError
                id="state-error"
                error={errors.stateOrUnionTerritory}
              />
            </div>
            <MoneyField
              id="gstAggregateTurnover"
              label="GST aggregate turnover for this PAN"
              help="Enter taxable and exempt supplies across India for this PAN, before GST. Include IT or software invoices and relevant interest, not profit."
              value={rawMoney.gstAggregateTurnover}
              error={errors.gstAggregateTurnover}
              onChange={(value) => setMoney('gstAggregateTurnover', value)}
              onBlur={() => commitMoney('gstAggregateTurnover', false)}
            />
          </div>
        )}

        {step === 4 && (
          <div
            className={questionGroupClassName}
            key={step}
            aria-labelledby="check-title"
          >
            <QuestionHeading title="Review your assumptions" />
            <p>
              Change any group before calculating. The estimate is local and
              immediate when you continue.
            </p>
            <div className="review-list">
              <article>
                <h2>Supported profile</h2>
                <p>
                  Resident individual; new tax regime; presumptive IT or
                  software consulting; direct clients in India; no GSTIN.
                </p>
                <ul className="scope-list">
                  <li>
                    No salary, house-property income, dividends, gifts, capital
                    gains, crypto, lottery, gaming, foreign income or relief, or
                    agricultural income.
                  </li>
                  <li>
                    No other business or profession, foreign clients, platform,
                    marketplace or agency income, commission, brokerage, or
                    goods sales.
                  </li>
                  <li>
                    No unlisted deductions, losses, or credits; disputed TDS or
                    TCS; employee or deductor duties; audit requirement;
                    compulsory GST-registration fact; or another unsupported
                    fact.
                  </li>
                </ul>
                <fieldset
                  className="review-confirmation"
                  aria-invalid={Boolean(errors.scopeConfirmed)}
                  aria-describedby={
                    errors.scopeConfirmed ? 'scope-confirmed-error' : undefined
                  }
                >
                  <legend>Do all of these statements apply?</legend>
                  <div className="choice-row">
                    <label>
                      <input
                        type="radio"
                        name="scopeConfirmed"
                        checked={profile.scopeConfirmed === true}
                        onChange={() => {
                          const nextProfile = {
                            ...profile,
                            scopeConfirmed: true,
                          }
                          setProfile(nextProfile)
                          setErrors((current) => ({
                            ...current,
                            scopeConfirmed: '',
                          }))
                          setCurrentCheck(
                            nextProfile,
                            usingExample,
                            false,
                            highestStep,
                          )
                        }}
                      />{' '}
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="scopeConfirmed"
                        checked={profile.scopeConfirmed === false}
                        onChange={() => {
                          const nextProfile = {
                            ...profile,
                            scopeConfirmed: false,
                          }
                          setProfile(nextProfile)
                          setErrors((current) => ({
                            ...current,
                            scopeConfirmed: '',
                          }))
                          setCurrentCheck(
                            nextProfile,
                            usingExample,
                            false,
                            highestStep,
                          )
                        }}
                      />{' '}
                      No
                    </label>
                  </div>
                  <FieldError
                    id="scope-confirmed-error"
                    error={errors.scopeConfirmed}
                  />
                </fieldset>
              </article>
              <article>
                <h2>Professional receipts</h2>
                <p>
                  {formatMoney(profile.grossProfessionalReceipts)} gross
                  receipts; {formatMoney(profile.cashReceipts)} received in
                  cash; {formatMoney(profile.higherExpectedProfit)} expected
                  profit.
                </p>
                <button
                  type="button"
                  className="text-button"
                  onClick={(event) => changeStep(0, event.detail > 0)}
                >
                  Change
                </button>
              </article>
              <article>
                <h2>Bank interest</h2>
                <p>
                  {formatMoney(profile.taxableBankInterest)} taxable interest.
                </p>
                <button
                  type="button"
                  className="text-button"
                  onClick={(event) => changeStep(1, event.detail > 0)}
                >
                  Change
                </button>
              </article>
              <article>
                <h2>Tax credits and payments</h2>
                <p>
                  {formatMoney(profile.tdsAlreadyDeducted)} TDS;{' '}
                  {formatMoney(profile.tcsAlreadyCollected)} TCS;{' '}
                  {formatMoney(profile.advanceTaxAlreadyPaid)} advance tax.
                </p>
                <button
                  type="button"
                  className="text-button"
                  onClick={(event) => changeStep(2, event.detail > 0)}
                >
                  Change
                </button>
              </article>
              <article>
                <h2>GST check</h2>
                <p>
                  {profile.stateOrUnionTerritory};{' '}
                  {formatMoney(profile.gstAggregateTurnover)} GST aggregate
                  turnover.
                </p>
                <button
                  type="button"
                  className="text-button"
                  onClick={(event) => changeStep(3, event.detail > 0)}
                >
                  Change
                </button>
              </article>
            </div>
          </div>
        )}
      </div>
      <JourneySidebar
        activeStep={step + 1}
        backAction={
          <button
            className="button button--secondary"
            type="button"
            onClick={(event) => {
              const animate = event.detail > 0
              if (step === 0) {
                setErrors({})
                setMotion('none')
                navigate('/', { state: { animate } })
              } else {
                changeStep(step - 1, animate)
              }
            }}
          >
            Back
          </button>
        }
        action={
          <button
            className="button button--primary"
            type="button"
            onClick={next}
          >
            {step === questionnaireSteps.length - 1
              ? 'Calculate my plan'
              : 'Next'}
          </button>
        }
        disabledSteps={Array.from(
          { length: calculationStep + 1 },
          (_, index) => index,
        ).filter(
          (journeyStep) =>
            journeyStep === calculationStep || journeyStep > highestStep + 1,
        )}
        onStepSelect={selectJourneyStep}
      />
    </section>
  )
}
