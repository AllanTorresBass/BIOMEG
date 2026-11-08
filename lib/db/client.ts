import 'server-only'

import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg'

/**
 * Hosted Neon pool (Gate B Received). Staff sign-in uses it. Clinical stores stay in memory until V0-27.
 * Do not import this module from Client Components.
 */

declare global {
  // eslint-disable-next-line no-var
  var __biomegPgPool: Pool | undefined
  // eslint-disable-next-line no-var
  var __biomegPgPoolVersion: number | undefined
}

/** Bump when the pool configuration changes, so a hot reload drops the old pool. */
const POOL_VERSION = 2

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
  }
  return new Pool({
    connectionString,
    max: 10,
    ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: true } : undefined,
  })
}

export function getPool(): Pool {
  if (!globalThis.__biomegPgPool || globalThis.__biomegPgPoolVersion !== POOL_VERSION) {
    void globalThis.__biomegPgPool?.end()
    globalThis.__biomegPgPool = createPool()
    globalThis.__biomegPgPoolVersion = POOL_VERSION
  }
  return globalThis.__biomegPgPool
}

/** The Neon pooler rejects search_path as a startup parameter, so each transaction sets it. */
async function begin(client: PoolClient): Promise<void> {
  await client.query('BEGIN')
  await client.query('SET LOCAL search_path TO biomeg, public')
}

export async function getClient(): Promise<PoolClient> {
  return getPool().connect()
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getClient()
  try {
    await begin(client)
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return withTransaction((client) => client.query<T>(text, params))
}
