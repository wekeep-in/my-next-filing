import { formatDate } from '@/lib/format'
import { currentRules } from '@/rules'

export const taxYearShort = currentRules.taxPeriod.replace('Tax Year ', '')
export const taxYearDateRange = `${formatDate(currentRules.effectiveStart)} to ${formatDate(currentRules.effectiveEnd)}`
