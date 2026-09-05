// On /check/receipts?example=1 in an isolated browser tab with a personal Recovery draft:
// await (await import('/scripts/verify-questionnaire.ts')).verifyQuestionnaire()
export async function verifyQuestionnaire() {
  const check = (condition: boolean, message: string) => {
    if (!condition) throw new Error(message)
  }
  const wait = () => new Promise((resolve) => setTimeout(resolve, 100))
  const recoveryKey = 'my-next-filing:recovery-draft'
  const stored = sessionStorage.getItem(recoveryKey)
  check(Boolean(stored), 'Seed a synthetic personal Recovery draft first')
  const input = document.querySelector<HTMLInputElement>('#declaredProfit')!
  check(
    Boolean(input) && location.search === '?example=1',
    'Open fictional receipts first',
  )
  const original = input.value
  const button = (label: string) =>
    [...document.querySelectorAll<HTMLButtonElement>('button')].find(
      (item) => item.textContent === label,
    )!
  const edit = async (value: string) => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )!.set!.call(input, value)
    input.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        inputType: 'insertFromPaste',
        data: value,
      }),
    )
    await wait()
  }
  await edit('100')
  check(
    Boolean(document.getElementById('declaredProfit-unsupported')),
    'Show the profit warning before Continue',
  )
  check(button('Continue').disabled, 'Block an unsupported plan at receipts')
  for (const invalid of ['abc', '1e6', '-100', '12.5']) {
    await edit(invalid)
    check(
      input.value === '100',
      'Reject invalid pasted amounts without changing the value',
    )
  }
  await edit('')
  input.focus()
  input.blur()
  await wait()
  check(
    Boolean(document.getElementById('declaredProfit-error')),
    'Explain an empty amount on blur',
  )
  await edit(original)
  check(!button('Continue').disabled, 'Allow a corrected amount')
  button('Start over').click()
  await wait()
  check(location.search === '?example=1', 'Start over must stay fictional')
  check(
    sessionStorage.getItem(recoveryKey) === stored,
    'Example reset must preserve personal Recovery',
  )
  button('Return to your estimate').click()
  await wait()
  check(location.search === '', 'Return must clear fictional mode')
  history.back()
  await wait()
  check(
    location.search === '?example=1' &&
      document.body.innerText.includes('Fictional example.'),
    'Browser Back must restore fictional mode before route guards run',
  )
  history.forward()
  await wait()
  check(
    location.search === '' &&
      !document.body.innerText.includes('Fictional example.'),
    'Browser Forward must restore personal mode',
  )
  check(
    sessionStorage.getItem(recoveryKey) === stored,
    'History must preserve personal Recovery',
  )
  return 'Questionnaire input, example isolation, and history checks passed.'
}
