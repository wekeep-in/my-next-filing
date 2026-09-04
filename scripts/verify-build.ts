import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = 'dist'
const textFiles: string[] = []

function collect(path: string) {
  for (const entry of readdirSync(path)) {
    const child = join(path, entry)
    if (statSync(child).isDirectory()) collect(child)
    else if (/\.(?:html|js|css|json|txt)$/.test(child)) textFiles.push(child)
  }
}

collect(root)
const text = textFiles.map((path) => readFileSync(path, 'utf8')).join('\n')
const forbidden = [
  /\bG-[A-Z0-9]{10}\b/,
  /\bgtag\b/i,
  /googletagmanager/i,
  /sendBeacon/i,
  /localStorage\.clear/i,
]

if (forbidden.some((pattern) => pattern.test(text))) {
  process.stderr.write('Generated assets contain a forbidden runtime marker.\n')
  process.exitCode = 1
}

const index = readFileSync(join(root, 'index.html'), 'utf8')
if (/<script[^>]+src=["']https?:\/\//i.test(index)) {
  process.stderr.write('Generated HTML contains a remote executable script.\n')
  process.exitCode = 1
}

const headers = readFileSync(join(root, '_headers'), 'utf8')
for (const required of [
  'Content-Security-Policy:',
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "object-src 'none'",
  'Referrer-Policy: no-referrer',
  'X-Content-Type-Options: nosniff',
  'X-Frame-Options: DENY',
  'Permissions-Policy:',
]) {
  if (!headers.includes(required)) {
    process.stderr.write(`Missing required static header: ${required}\n`)
    process.exitCode = 1
  }
}

if (process.exitCode === undefined)
  process.stdout.write('Generated bundle and static header checks passed.\n')
