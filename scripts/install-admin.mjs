import { randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { Algorithm, hash, verify } from '@node-rs/argon2'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv() {
  const text = readFileSync(resolve(root, '.env'), 'utf8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 1) continue
    const key = trimmed.slice(0, eq)
    if (!process.env[key]) process.env[key] = trimmed.slice(eq + 1)
  }
}

function safe(error) {
  const message = error instanceof Error ? error.message : String(error)
  return message.replace(/postgres(?:ql)?:\/\/\S+/gi, 'postgresql://[redacted]')
}

async function runFile(client, name) {
  const sql = readFileSync(resolve(root, 'lib/db/migrations', name), 'utf8')
  await client.query(sql)
}

loadEnv()

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const client = new pg.Client({ connectionString })

try {
  await client.connect()
  const present = await client.query(`SELECT to_regclass('biomeg.users') AS users`)
  if (!present.rows[0]?.users) {
    await runFile(client, '001_init.sql')
    await runFile(client, '002_superadmin_user.sql')
  }
  await runFile(client, '003_staff_auth.sql')

  const admin = await client.query(
    `SELECT id, password_hash FROM biomeg.users WHERE username = 'superadmin'`,
  )
  if (admin.rowCount === 0) {
    await runFile(client, '002_superadmin_user.sql')
  }
  const row = admin.rows[0] ?? (await client.query(`SELECT id, password_hash FROM biomeg.users WHERE username = 'superadmin'`)).rows[0]
  if (!row) {
    console.error('superadmin row is missing after install')
    process.exit(1)
  }
  if (row.password_hash) {
    console.log('superadmin already has a password. Nothing was changed.')
    process.exit(0)
  }

  const password = randomBytes(18).toString('base64url')
  const encoded = await hash(password, {
    memoryCost: 19 * 1024,
    timeCost: 2,
    parallelism: 1,
    algorithm: Algorithm.Argon2id,
  })
  const matched = await verify(encoded, password)
  if (!matched) {
    console.error('the new hash did not verify')
    process.exit(1)
  }
  const updated = await client.query(
    `UPDATE biomeg.users
     SET password_hash = $2,
         must_change_password = true,
         password_expires_at = now() + interval '24 hours',
         updated_at = now()
     WHERE id = $1 AND password_hash IS NULL`,
    [row.id, encoded],
  )
  if (updated.rowCount !== 1) {
    console.error('password was not stored')
    process.exit(1)
  }
  console.log(`INSTALL_USER=superadmin`)
  console.log(`INSTALL_PASSWORD=${password}`)
  console.log('Change this password at the first sign-in. It expires in 24 hours.')
} catch (error) {
  console.error(safe(error))
  process.exit(1)
} finally {
  await client.end()
}
