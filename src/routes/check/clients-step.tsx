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
        description="Tell us where your clients are based and whether you work with them directly or through a platform. We'll only ask follow-up questions that apply."
      />
      <div className="question-sections">
        <section
          className="question-section"
          aria-labelledby="client-arrangement"
        >
          <h2 id="client-arrangement">Your clients</h2>
          <div className="field-stack">
            <ChoiceField
              id="clientKind"
              label="Where are your clients based?"
              options={['domestic', 'foreign', 'mixed', 'not-sure']}
              labels={{ mixed: 'Both domestic and foreign clients' }}
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
        </section>

        {hasPlatformWork(draft) && (
          <section className="question-section" aria-labelledby="platform-work">
            <h2 id="platform-work">Platform work</h2>
            <div className="field-stack">
              <ChoiceField
                id="platformOwnAccount"
                label="Do you provide the main service yourself, rather than act as an agent or intermediary?"
                value={draft.platformOwnAccount}
                unsupportedOptions={['no']}
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
                label="Do your records identify the person or business you contract with?"
                value={draft.platformRecipientIdentifiable}
                unsupportedOptions={['no']}
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
                label="Do your records show the client's full payment before platform fees and withholding?"
                value={draft.platformGrossBeforeFees}
                unsupportedOptions={['no']}
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
                label="Is this income from services you provide, rather than employment, commission, brokerage, royalties, licensing, or agency work?"
                value={draft.platformIncomeCharacter}
                unsupportedOptions={['no']}
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
                label="Is there a fee from a foreign platform?"
                options={['not-applicable', 'known', 'not-sure']}
                labels={{
                  'not-applicable': 'No foreign platform fee',
                  known: 'Yes, and I know its GST treatment',
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
                id="platformNoRecipientReverseCharge"
                label="Have you confirmed that the platform fee does not require you to pay GST under reverse charge?"
                help="Under reverse charge, you pay the GST instead of the platform."
                value={draft.platformNoRecipientReverseCharge}
                unsupportedOptions={['no']}
                error={errors.platformNoRecipientReverseCharge}
                onChange={(value) =>
                  dispatch({
                    type: 'field-changed',
                    field: 'platformNoRecipientReverseCharge',
                    value: value as TriState,
                  })
                }
              />
            </div>
          </section>
        )}

        {hasForeignClients(draft) && (
          <section
            className="question-section"
            aria-labelledby="foreign-clients"
          >
            <h2 id="foreign-clients">Foreign clients</h2>
            <div className="field-stack">
              <ChoiceField
                id="foreignWorkInIndia"
                label="Do you perform all the work for these clients from India?"
                value={draft.foreignWorkInIndia}
                unsupportedOptions={['no']}
                error={errors.foreignWorkInIndia}
                onChange={(value) =>
                  dispatch({
                    type: 'field-changed',
                    field: 'foreignWorkInIndia',
                    value: value as TriState,
                  })
                }
              />
              <ChoiceField
                id="foreignRecipientIdentifiable"
                label="Do your records identify the overseas person or business you contract with?"
                value={draft.foreignRecipientIdentifiable}
                unsupportedOptions={['no']}
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
                label="For these overseas contracts, do you provide the main service yourself rather than act as an agent or intermediary?"
                value={draft.foreignOwnAccount}
                unsupportedOptions={['no']}
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
                label="Have you confirmed that the ordinary cross-border place-of-supply rule applies?"
                help="Choose Not sure unless your records or adviser confirm this."
                value={draft.foreignPlaceOfSupply}
                unsupportedOptions={['no']}
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
                label="Are you and the overseas client part of the same business or legal entity?"
                help="Choose No if you and the client are separate businesses."
                value={draft.foreignSameEstablishment}
                unsupportedOptions={['yes']}
                error={errors.foreignSameEstablishment}
                onChange={(value) =>
                  dispatch({
                    type: 'field-changed',
                    field: 'foreignSameEstablishment',
                    value: value as TriState,
                  })
                }
              />
              <ChoiceField
                id="foreignPaymentRoute"
                label="Which payment route do your records confirm?"
                help="Choose Not sure if your bank or payment records do not state the route."
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
                label="Do these payments settle in your own Indian bank account through an authorised route?"
                value={draft.foreignSettledToIndianBank}
                unsupportedOptions={['no']}
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
                label="Do these payments involve a foreign account, wallet, provider-held balance, or signing authority?"
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
              <ChoiceField
                id="foreignOperation"
                label="Apart from having overseas clients, does this work involve a business operation outside India?"
                value={draft.foreignOperation}
                unsupportedOptions={['yes']}
                error={errors.foreignOperation}
                onChange={(value) =>
                  dispatch({
                    type: 'field-changed',
                    field: 'foreignOperation',
                    value: value as TriState,
                  })
                }
              />
              <ChoiceField
                id="foreignTax"
                label="Was tax withheld outside India?"
                value={draft.foreignTax}
                unsupportedOptions={['yes']}
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
                label="Are you claiming relief for foreign tax or under a tax treaty?"
                value={draft.foreignTreatyRelief}
                unsupportedOptions={['yes']}
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
                label="Do your records show one complete annual total in rupees for these receipts?"
                help="This amount should already account for fees, withholding, refunds, chargebacks, receivables, and your accounting method."
                value={draft.foreignReceiptsResolved}
                unsupportedOptions={['no']}
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
                label="Does that total include all currency conversions and exchange-rate effects?"
                value={draft.foreignCurrencyResolved}
                unsupportedOptions={['no']}
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
          </section>
        )}
      </div>
    </div>
  )
}
