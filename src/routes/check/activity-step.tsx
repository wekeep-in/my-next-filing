import type { QuestionnaireDispatch } from '@/routes/check/session'
import { activityOptions, isBusinessPath } from '@/routes/check/model'
import type { Activity, TriState } from '@/evaluation'
import { CheckHeading, ChoiceField, SelectField } from '@/routes/check/fields'
import type { Draft, DraftPath } from '@/routes/check/model'

export function ActivityStep({
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
        title="Tell us about your work"
        description="Choose the option that best describes your work. Then tell us which tax method you use."
      />
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
        help="Choose the method in your records or the one confirmed by your tax adviser. We cannot estimate your tax without a confirmed method."
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
        <div className="field-stack path-follow-up">
          <ChoiceField
            id="notGoodsCarriage"
            label="Does your practice provide services rather than transport goods?"
            value={draft.notGoodsCarriage}
            unsupportedOptions={['no']}
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
            unsupportedOptions={['no']}
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
            unsupportedOptions={['no']}
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
            unsupportedOptions={['applies']}
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
  )
}
