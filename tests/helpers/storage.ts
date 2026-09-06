export class TestStorage implements Storage {
  private readonly values = new Map<string, string>()
  readsFail = false
  writesFail = false
  removal: 'normal' | 'fail' | 'throw-after' | 'unverified' = 'normal'
  writes = 0
  get length() {
    return this.values.size
  }
  clear() {
    throw new Error('Storage must never be cleared')
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }
  getItem(key: string) {
    if (this.readsFail) throw new Error('unavailable')
    return this.values.get(key) ?? null
  }
  setItem(key: string, value: string) {
    if (this.writesFail) throw new Error('quota')
    this.writes++
    this.values.set(key, value)
  }
  removeItem(key: string) {
    if (this.removal === 'fail') throw new Error('denied')
    this.values.delete(key)
    if (this.removal === 'unverified') this.readsFail = true
    if (this.removal === 'throw-after') throw new Error('removed')
  }
}
