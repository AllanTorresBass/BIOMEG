import 'server-only'

import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg'

/**
 * Hosted Neon pool (Gate B Received). Memory stores remain the live path until V0-27.
 * Do not import this module from Client Components.
 */

declare global {
  // eslint-disable-next-line no-var
  var __biomegPgPool: Pool | undefined
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
  }
  return new Pool({
    connectionString,
    max: 10,
    // Keep BIOMEG tables out of public (shared Neon DB may host other apps).
    options: '-c search_path=biomeg,public',
    ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: true } : undefined,
  })
}

export function getPool(): Pool {
  if (!globalThis.__biomegPgPool) {
    globalThis.__biomegPgPool = createPool()
  }
  return globalThis.__biomegPgPool
}

export async function getClient(): Promise<PoolClient> {
  return getPool().connect()
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getClient()
  try {
    await client.query('BEGIN')
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
  return getPool().query<T>(text, params)
}
