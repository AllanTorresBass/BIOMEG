/* eslint-disable no-console -- a command-line test runner reports to the console. */
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright-core'
import { runMoney } from './money.mjs'
import { runSmoke } from './smoke.mjs'

// Critical flows in the Chrome already installed, against a production build: run `pnpm build` first.
// It starts its own server on its own port and stops only that server.
const PORT = process.env.E2E_PORT ?? '3199'
const BASE = `http://localhost:${PORT}`

// Read from the seed rather than repeated here. These accounts are invented, and refused unless BIOMEG_DEMO=on.
const match = /DEMO_PASSWORD = '([^']*)'/.exec(readFileSync('lib/server/session/store.ts', 'utf8'))
if (!match) throw new Error('The demo password was not found in the session store.')

const server = spawn('pnpm', ['exec', 'next', 'start', '-p', PORT], {
  env: { ...process.env, BIOMEG_DEMO: 'on', BIOMEG_AUTH: 'memory' },
  stdio: 'ignore',
  detached: true,
})
const stop = () => {
  try {
    process.kill(-server.pid)
  } catch {
    // Already gone.
  }
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const up = await fetch(`${BASE}/entrar`).then(() => true, () => false)
    if (up) return
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error('The server did not start.')
}

let failed = 0
try {
  await waitForServer()
  for (const [name, suite] of [['money', runMoney], ['smoke', runSmoke]]) {
    const { results, errors } = await suite(chromium, BASE, match[1])
    console.log(`\n${name}\n${results.join('\n')}`)
    failed += results.filter((line) => line.startsWith('FAIL')).length + errors.length
    if (errors.length > 0) console.log('page errors:', errors)
  }
} finally {
  stop()
}
console.log(failed === 0 ? '\nAll browser checks passed.' : `\n${failed} browser problems.`)
process.exit(failed === 0 ? 0 : 1)
