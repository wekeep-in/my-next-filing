import {
  QuestionSection,
  QuestionSections,
} from '@/routes/check/question-section'
import {
  ForeignAccountHelp,
  ForeignTaxReliefHelp,
  PaymentRouteHelp,
  PlaceOfSupplyHelp,
  PlatformFeeHelp,
} from '@/routes/check/clients-help'
import type { QuestionnaireDispatch } from '@/routes/check/session'
import { hasForeignClients, hasPlatformWork } from '@/routes/check/model'
import type { TriState } from '@/evaluation'
import { CheckHeading, ChoiceField } from '@/routes/check/fields'
import type {
  Draft,
  DraftClientKind,
  DraftDelivery,
} from '@/routes/check/model'

export function ClientsStep({
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
        title="Clients and payments"
        description="Tell us where your clients are and how you work with them. Use your contracts and payment records for the follow-up questions."
      />
      <QuestionSections initialOpen="client-routing">
        <QuestionSection
          id="client-routing"
          title="Where and how you find clients"
        >
          <div className="field-stack">
            <ChoiceField
              id="clientKind"
              label="Where are your clients based?"
              options={['domestic', 'foreign', 'mixed', 'not-sure']}
              labels={{ mixed: 'Both in India and outside India' }}
              value={draft.clientKind}
              error={errors.clientKind}
              onChange={(value) =>
                dispatch({
                  type: 'clientKind-changed',
                  value: value as DraftClientKind,
                })
              }
            />
            <ChoiceField
              id="delivery"
              label="How do you work with these clients?"
              help="A platform is a freelance marketplace that arranges client work or handles the contract and payment. A bank or payment service used only to receive money does not by itself mean platform work."
              options={['direct', 'platform', 'both', 'not-sure']}
              labels={{
                direct: 'Directly',
                platform: 'Through a platform',
                both: 'Directly and through a platform',
              }}
              value={draft.delivery}
              error={errors.delivery}
              onChange={(value) =>
                dispatch({
                  type: 'delivery-changed',
                  value: value as DraftDelivery,
                })
              }
            />
          </div>
        </QuestionSection>
        {hasPlatformWork(draft) && (
          <QuestionSection id="platform-work" title="Platform work">
            <div className="field-stack">
              <ChoiceField
                id="platformOwnAccount"
                label="Do you deliver the main service yourself?"
                help="Choose No if you arrange someone else's service as an agent or intermediary."
                value={draft.platformOwnAccount}
                error={errors.platformOwnAccount}
                onChange={(value) =>
                  dispatch({
                    type: 'field-changed',
                    field: 'platformOwnAccount',
                    value: value as TriState,
                  })
                }
              />
              <ChoiceField
                id="platformRecipientIdentifiable"
                label="Do your records identify who your service contract is with?"
                help="Check who buys your service under the contract. This may be the client or the platform. The name on a bank payment alone is not enough."
                value={draft.platformRecipientIdentifiable}
                error={errors.platformRecipientIdentifiable}
                onChange={(value) =>
                  dispatch({
                    type: 'field-changed',
                    field: 'platformRecipientIdentifiable',
                    value: value as TriState,
                  })
                }
              />
              <ChoiceField
                id="platformGrossBeforeFees"
                label="Do your records show the full client payment before fees and tax deductions?"
                value={draft.platformGrossBeforeFees}
                error={errors.platformGrossBeforeFees}
                onChange={(value) =>
                  dispatch({
                    type: 'field-changed',
                    field: 'platformGrossBeforeFees',
                    value: value as TriState,
                  })
                }
              />
              <ChoiceField
                id="platformIncomeCharacter"
                label="Is this payment for your own freelance services?"
                help="Choose No for employment, commission, brokerage, royalties, licensing or agency income."
                value={draft.platformIncomeCharacter}
                error={errors.platformIncomeCharacter}
                onChange={(value) =>
                  dispatch({
                    type: 'field-changed',
                    field: 'platformIncomeCharacter',
                    value: value as TriState,
                  })
                }
              />
              <ChoiceField
                id="platformForeignFeeGstTreatment"
                label="Does a platform outside India charge you a fee?"
                options={['not-applicable', 'known', 'not-sure']}
                labels={{
                  'not-applicable': 'No foreign platform fee',
                  known: 'Yes, and I have confirmed how GST applies',
                }}
                value={draft.platformForeignFeeGstTreatment}
                error={errors.platformForeignFeeGstTreatment}
                onChange={(value) =>
                  dispatch({
                    type: 'field-changed',
                    field: 'platformForeignFeeGstTreatment',
                    value: value as Draft['platformForeignFeeGstTreatment'],
                  })
                }
              />
              <ChoiceField
                id="platformReverseCharge"
                label="How does reverse-charge GST apply to the platform fees?"
                options={['none', 'due', 'not-sure']}
                labels={{
                  none: 'Confirmed: no reverse-charge duty',
                  due: 'Confirmed: I must pay GST',
                  'not-sure': 'Not sure',
                }}
                help={
                  <>
                    Reverse charge means you, as the buyer of the platform
                    service, must pay its GST directly to the government. Check
                    the fee invoice with your adviser. Choose Not sure if
                    unresolved; your income-tax estimate can still be available.{' '}
                    <PlatformFeeHelp />
                  </>
                }
                value={draft.platformReverseCharge}
                error={errors.platformReverseCharge}
                onChange={(value) =>
                  dispatch({
                    type: 'field-changed',
                    field: 'platformReverseCharge',
                    value: value as Draft['platformReverseCharge'],
                  })
                }
              />
            </div>
          </QuestionSection>
        )}

        {hasForeignClients(draft) && (
          <>
            <QuestionSection id="foreign-clients" title="Foreign clients">
              <div className="field-stack">
                {draft.foreignWorkInIndia === draft.workInIndia &&
                  draft.foreignOperation === draft.hasForeignOperation && (
                    <p className="field-help">
                      Your earlier answers about working in India and overseas
                      business operations also apply here. You can change them
                      in Fit for this app.
                    </p>
                  )}
                {draft.foreignWorkInIndia !== draft.workInIndia && (
                  <ChoiceField
                    id="foreignWorkInIndia"
                    label="Are you physically in India for all the work you do for these clients?"
                    value={draft.foreignWorkInIndia}
                    error={errors.foreignWorkInIndia}
                    onChange={(value) =>
                      dispatch({
                        type: 'field-changed',
                        field: 'foreignWorkInIndia',
                        value: value as TriState,
                      })
                    }
                  />
                )}
                <ChoiceField
                  id="foreignRecipientIdentifiable"
                  label="Do your records identify who your overseas service contract is with?"
                  value={draft.foreignRecipientIdentifiable}
                  error={errors.foreignRecipientIdentifiable}
                  onChange={(value) =>
                    dispatch({
                      type: 'field-changed',
                      field: 'foreignRecipientIdentifiable',
                      value: value as TriState,
                    })
                  }
                />
                <ChoiceField
                  id="foreignOwnAccount"
                  label="Do you deliver the main service yourself for these overseas contracts?"
                  help="Choose No if you arrange someone else's service as an agent or intermediary."
                  value={draft.foreignOwnAccount}
                  error={errors.foreignOwnAccount}
                  onChange={(value) =>
                    dispatch({
                      type: 'field-changed',
                      field: 'foreignOwnAccount',
                      value: value as TriState,
                    })
                  }
                />
                <ChoiceField
                  id="foreignPlaceOfSupply"
                  label="Have you confirmed that the general GST rule places the service at your overseas client's location?"
                  help={
                    <>
                      GST assigns a location to a service, called its place of
                      supply. An overseas client address alone is not enough.
                      Choose Yes only if your records or adviser confirm that
                      the general rule applies, with no special rule.{' '}
                      <PlaceOfSupplyHelp />
                    </>
                  }
                  value={draft.foreignPlaceOfSupply}
                  error={errors.foreignPlaceOfSupply}
                  onChange={(value) =>
                    dispatch({
                      type: 'field-changed',
                      field: 'foreignPlaceOfSupply',
                      value: value as TriState,
                    })
                  }
                />
                <ChoiceField
                  id="foreignSameEstablishment"
                  label="Are you and the overseas client parts of the same legal entity?"
                  help="For example, an Indian office and an overseas branch of the same entity. Choose No for separate legal entities."
                  value={draft.foreignSameEstablishment}
                  error={errors.foreignSameEstablishment}
                  onChange={(value) =>
                    dispatch({
                      type: 'field-changed',
                      field: 'foreignSameEstablishment',
                      value: value as TriState,
                    })
                  }
                />
              </div>
            </QuestionSection>
            <QuestionSection id="foreign-payments" title="Overseas payments">
              <div className="field-stack">
                <ChoiceField
                  id="foreignPaymentRoute"
                  label="How do your records say these overseas payments were received?"
                  help={
                    <>
                      Use the route confirmed by your bank or payment provider.
                      A payment arriving in rupees may have started in foreign
                      currency. <PaymentRouteHelp />
                    </>
                  }
                  options={[
                    'convertible-foreign-exchange',
                    'rbi-permitted-rupee',
                    'not-sure',
                  ]}
                  value={draft.foreignPaymentRoute}
                  error={errors.foreignPaymentRoute}
                  onChange={(value) =>
                    dispatch({
                      type: 'field-changed',
                      field: 'foreignPaymentRoute',
                      value: value as Draft['foreignPaymentRoute'],
                    })
                  }
                />
                <ChoiceField
                  id="foreignSettledToIndianBank"
                  label="Do these payments reach your own Indian bank account through an authorised route?"
                  help="Confirm the route with your bank or payment provider."
                  value={draft.foreignSettledToIndianBank}
                  error={errors.foreignSettledToIndianBank}
                  onChange={(value) =>
                    dispatch({
                      type: 'field-changed',
                      field: 'foreignSettledToIndianBank',
                      value: value as TriState,
                    })
                  }
                />
                <ChoiceField
                  id="foreignAccountExposure"
                  label="Do these payments involve an overseas account or money held abroad?"
                  help={
                    <>
                      Include virtual accounts, wallets, provider-held balances,
                      rights to money held by a foreign provider, and accounts
                      you can sign on. <ForeignAccountHelp />
                    </>
                  }
                  options={['none', 'possible', 'not-sure']}
                  labels={{ none: 'No', possible: 'Yes or possibly' }}
                  value={draft.foreignAccountExposure}
                  error={errors.foreignAccountExposure}
                  onChange={(value) =>
                    dispatch({
                      type: 'field-changed',
                      field: 'foreignAccountExposure',
                      value: value as Draft['foreignAccountExposure'],
                    })
                  }
                />
                {draft.foreignOperation !== draft.hasForeignOperation && (
                  <ChoiceField
                    id="foreignOperation"
                    label="Does this work involve an office or other business operation outside India?"
                    help="Having overseas clients alone does not count."
                    value={draft.foreignOperation}
                    error={errors.foreignOperation}
                    onChange={(value) =>
                      dispatch({
                        type: 'field-changed',
                        field: 'foreignOperation',
                        value: value as TriState,
                      })
                    }
                  />
                )}
              </div>
            </QuestionSection>
            <QuestionSection
              id="foreign-tax"
              title="Foreign tax and annual totals"
            >
              <div className="field-stack">
                <ChoiceField
                  id="foreignTax"
                  label="Was any foreign tax deducted from these payments?"
                  value={draft.foreignTax}
                  error={errors.foreignTax}
                  onChange={(value) =>
                    dispatch({
                      type: 'field-changed',
                      field: 'foreignTax',
                      value: value as TriState,
                    })
                  }
                />
                <ChoiceField
                  id="foreignTreatyRelief"
                  label="Are you claiming tax relief for foreign tax or under a tax treaty?"
                  help={
                    <>
                      This means reducing Indian tax using tax paid abroad or an
                      agreement between India and another country.{' '}
                      <ForeignTaxReliefHelp />
                    </>
                  }
                  value={draft.foreignTreatyRelief}
                  error={errors.foreignTreatyRelief}
                  onChange={(value) =>
                    dispatch({
                      type: 'field-changed',
                      field: 'foreignTreatyRelief',
                      value: value as TriState,
                    })
                  }
                />
                <ChoiceField
                  id="foreignReceiptsResolved"
                  label="Have you confirmed the full year's gross receipts from these clients in rupees?"
                  help="Use work income before platform fees and tax deductions. Check how refunds, reversed payments and unpaid invoices belong in the annual total under your accounting method."
                  value={draft.foreignReceiptsResolved}
                  error={errors.foreignReceiptsResolved}
                  onChange={(value) =>
                    dispatch({
                      type: 'field-changed',
                      field: 'foreignReceiptsResolved',
                      value: value as TriState,
                    })
                  }
                />
                <ChoiceField
                  id="foreignCurrencyResolved"
                  label="Does that total include all currency conversions and exchange-rate gains or losses?"
                  value={draft.foreignCurrencyResolved}
                  error={errors.foreignCurrencyResolved}
                  onChange={(value) =>
                    dispatch({
                      type: 'field-changed',
                      field: 'foreignCurrencyResolved',
                      value: value as TriState,
                    })
                  }
                />
              </div>
            </QuestionSection>
          </>
        )}
      </QuestionSections>
    </div>
  )
}
