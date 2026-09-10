import { chromium, expect } from '@playwright/test'
import type { Locator } from '@playwright/test'
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import assert from 'node:assert/strict'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { exampleProfile } from '../src/routes/check/model'
import { sessionFromProfile } from '../src/routes/check/session'
import { RECOVERY_KEY, recoveryFromSession } from '../src/recovery-draft'
import { parseProfile } from '../src/evaluation'
import { TAX_YEAR } from '../src/rules'
import {
  browserTime,
  encodeClip,
  setRecordingDate,
  startCapture,
  trackPointer,
  viewport,
} from './browser-recorder'
import { humanPath } from './human-cursor'
import { compactPitchRecordings, type PitchRecording } from './pitch-media'

const { values } = parseArgs({
  options: { url: { type: 'string', default: 'http://127.0.0.1:5173' } },
})
const exec = promisify(execFile)
await mkdir('video/out', { recursive: true })
const directory = await mkdtemp('video/out/pitch-')
const media = 'public/pitch'
await mkdir(media, { recursive: true })
const parsed = parseProfile({
  ...exampleProfile,
  clients: {
    kind: 'mixed',
    delivery: 'both',
    platform: {
      ownAccount: 'yes',
      recipientIdentifiable: 'yes',
      grossBeforeFees: 'yes',
      notEmploymentCommissionBrokerageRoyaltyLicensingAgency: 'yes',
      foreignFeeGstTreatment: 'not-applicable',
      reverseCharge: 'none',
      rcmLiabilityDate: null,
    },
    foreign: {
      workPerformedInIndia: 'yes',
      recipientIdentifiable: 'yes',
      ownAccount: 'yes',
      ordinaryPlaceOfSupply: 'yes',
      sameEstablishment: 'no',
      paymentRoute: 'convertible-foreign-exchange',
      settledToIndianBank: 'yes',
      accountExposure: 'none',
      foreignOperation: 'no',
      foreignTax: 'no',
      treatyRelief: 'no',
      receiptsResolved: 'yes',
      currencyResolved: 'yes',
    },
  },
  otherIncome: {
    ...exampleProfile.otherIncome,
    salary: {
      kind: 'domestic',
      confirmed: 'yes',
      grossSalary: 300000,
      employerNps: { kind: 'none' },
    },
    additionalIncome: {
      kind: 'domestic',
      confirmed: 'yes',
      dividends: 12000,
      mutualFundDistributions: 5000,
      postOfficeInterest: 2000,
      incomeTaxRefundInterest: 0,
    },
    rentalIncome: {
      kind: 'domestic',
      confirmed: 'yes',
      gstConfirmed: 'yes',
      rentalAnnualValue: 180000,
      rentalMunicipalTaxes: 10000,
      rentalInterest: 30000,
    },
    equityGains: {
      kind: 'domestic',
      confirmed: 'yes',
      shortTermGains: 25000,
      longTermGains: 80000,
      shortTermLosses: 0,
      longTermLosses: 0,
    },
  },
  gst: { ...exampleProfile.gst, aggregateTurnover: 2090000 },
})
assert.ok(parsed.valid, 'The synthetic recording profile must validate.')
const recovery = recoveryFromSession(
  sessionFromProfile(parsed.profile, { kind: 'personal' }, '2026-09-10'),
  TAX_YEAR,
)
assert.ok(recovery)
const browser = await chromium.launch({
  args: ['--force-device-scale-factor=2'],
})
const context = await browser.newContext({
  viewport,
  deviceScaleFactor: 2,
  locale: 'en-IN',
  timezoneId: 'Asia/Kolkata',
  reducedMotion: 'no-preference',
})
const page = await context.newPage()
await setRecordingDate(page, '2026-09-10T12:00:00+05:30')
const events = await trackPointer(page)
const errors: string[] = []
page.on('pageerror', (error) => errors.push(error.message))
const clips: PitchRecording[] = []
let active: Awaited<ReturnType<typeof startCapture>> | undefined
let movement = 0
const wait = (ms: number) => page.waitForTimeout(ms)
const button = (name: string) => page.getByRole('button', { name, exact: true })
const card = () => page.locator('.attention-card')
async function ready() {
  await page.locator('main h1').waitFor()
  await page.evaluate(() => document.fonts.ready)
  await wait(250)
}
async function visit(route: string) {
  await page.goto(new URL(route, values.url).href)
  await ready()
}
async function reveal(locator: Locator) {
  await locator.evaluate((el) =>
    scrollTo({
      top: Math.max(0, scrollY + el.getBoundingClientRect().top - 90),
      behavior: 'instant',
    }),
  )
  await wait(180)
}
async function click(locator: Locator) {
  const bounds = await locator.boundingBox()
  assert.ok(bounds)
  if (bounds.y < 55 || bounds.y + bounds.height > 800) await reveal(locator)
  const box = await locator.boundingBox()
  assert.ok(box)
  const target = {
    x: box.x + Math.min(box.width / 2, 230),
    y: box.y + box.height / 2,
  }
  const points = humanPath(
    events.at(-1) ?? { x: 1100, y: 720 },
    target,
    `pitch-${movement++}`,
    35,
  )
  for (const point of points) {
    await page.mouse.move(point.x, point.y)
    await wait(9)
  }
  await locator.click({
    position: { x: Math.min(box.width / 2, 230), y: box.height / 2 },
  })
  await wait(250)
}
async function shot(id: string, title: string, run: () => Promise<void>) {
  await page.mouse.move(1200, 710)
  await page.evaluate(() => window.__mnfFlushPointer())
  active = await startCapture(context, page, path.join(directory, id), events)
  const start = await browserTime(page)
  await run()
  await wait(600)
  const end = await browserTime(page)
  await wait(150)
  await page.evaluate(() => window.__mnfFlushPointer())
  active.assertHealthy()
  await active.stop()
  const frames = Math.max(1, Math.round((end - start) * 30))
  const video = `${media}/${id}.mp4`
  const cursor = await encodeClip(
    active.source,
    { start, end, duration: frames / 30 },
    frames,
    video,
  )
  await exec('ffmpeg', [
    '-v',
    'error',
    '-y',
    '-sseof',
    '-0.1',
    '-i',
    video,
    '-frames:v',
    '1',
    `${media}/${id}.jpg`,
  ])
  clips.push({
    id,
    title,
    frames,
    cursor,
    video: `/pitch/${id}.mp4`,
    poster: `/pitch/${id}.jpg`,
  })
  active = undefined
  await writeFile(
    path.join(directory, 'recordings.json'),
    JSON.stringify(clips),
  )
  console.log(`Recorded ${id}`)
}
async function incomeSection(name: string, id: string) {
  const target = button(name)
  await reveal(target)
  await shot(id, name, async () => {
    await click(target)
    await reveal(target)
    const fields: Record<string, string> = {
      salary: 'grossSalary',
      interest: 'dividends',
      rent: 'rentalAnnualValue',
      equity: 'shortTermGains',
    }
    await reveal(
      page
        .locator('.field')
        .filter({ has: page.locator(`#${fields[id]}`) })
        .last(),
    )
  })
}

try {
  await visit('/')
  await page.evaluate(({ key, draft }) => sessionStorage.setItem(key, draft), {
    key: RECOVERY_KEY,
    draft: JSON.stringify(recovery),
  })
  await visit('/check/clients')
  await reveal(page.locator('#clientKind'))
  await shot(
    'clients',
    'Clients here, overseas and through platforms',
    async () => {},
  )
  await visit('/check/income')
  await incomeSection('Salary', 'salary')
  await incomeSection('Interest and dividends', 'interest')
  await incomeSection('Rental income', 'rent')
  await incomeSection('Domestic equity gains and losses', 'equity')
  await visit('/check/review')
  await shot('calculate', 'Review the details', async () => {
    await click(button('Calculate my plan'))
    await ready()
  })
  await card().waitFor()
  await reveal(card())
  await shot('action', 'The next action, date and estimate', async () => {})
  const reasons = card().locator('summary').filter({ hasText: /Why/ }).first()
  await shot('why', 'Why this applies', async () => {
    await click(reasons)
    await reveal(reasons)
  })
  const sources = card()
    .locator('summary')
    .filter({ hasText: /[Ss]ources/ })
    .first()
  await reveal(sources)
  await shot('sources', 'Official sources beside the answer', async () => {
    await click(sources)
    await reveal(sources)
  })
  await reveal(page.locator('.tax-summary'))
  await shot('calculation', 'Inspect the calculation', async () => {
    await click(
      page.getByText('How this estimate was calculated', { exact: true }),
    )
    await reveal(page.locator('.calculation-list'))
  })
  await reveal(page.getByRole('heading', { name: 'Your agenda', exact: true }))
  await shot('agenda', 'The other supported actions', async () => {})
  await visit('/plan')
  await reveal(button('Save data in this browser'))
  await shot('save', 'Save in this browser', async () => {
    await click(button('Save data in this browser'))
    await click(
      page
        .getByRole('dialog')
        .getByRole('button', { name: 'Save data', exact: true }),
    )
  })
  await visit('/')
  await shot('return', 'Pick up where you left off', async () => {
    await click(
      page.getByRole('link', {
        name: 'Continue your saved workspace',
        exact: true,
      }),
    )
    await ready()
    await reveal(card())
  })
  const outstanding = (
    await page.locator('.tax-summary h2').innerText()
  ).replace(/[^0-9]/g, '')
  assert.ok(Number(outstanding) > 0)
  await shot('payment', 'Update the amount paid', async () => {
    await click(
      card().getByRole('button', { name: 'Update amount paid', exact: true }),
    )
    const input = page.getByLabel('Total advance tax already paid')
    await reveal(input)
    await click(input)
    await input.fill(outstanding)
    await click(button('Update and recalculate'))
    await reveal(card())
  })
  await expect(card()).toContainText('No estimated amount left')
  await shot('complete', 'Record completion. See what remains.', async () => {
    await click(
      card().getByRole('button', { name: 'Mark completed', exact: true }),
    )
    await reveal(card())
  })
  await expect(card()).not.toContainText('No estimated amount left')
  assert.deepEqual(errors, [], 'Recording must have no application errors.')
  await mkdir('src/routes/pitch', { recursive: true })
  const compact = await compactPitchRecordings(clips)
  await writeFile(
    'src/routes/pitch/recordings.json',
    JSON.stringify(compact, null, 2) + '\n',
  )
  for (const clip of clips) {
    await rm(`public${clip.video}`)
    await rm(`public${clip.poster}`)
  }
  console.log(`Pitch recordings ready in ${media}`)
} finally {
  if (active) await active.stop()
  await browser.close()
}
