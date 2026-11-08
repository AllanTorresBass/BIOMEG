import 'server-only'

import { hash, verify } from '@node-rs/argon2'

/**
 * Argon2id (algorithm 2) at 19 MiB, 2 passes, 1 lane.
 * The number is the library's Algorithm.Argon2id. A const enum cannot be imported under isolatedModules.
 * The PHC string stores these parameters.
 */
const OPTIONS = {
  memoryCost: 19 * 1024,
  timeCost: 2,
  parallelism: 1,
  algorithm: 2,
} as const

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS)
}

/** A missing or broken hash still spends a hash, so the answer does not arrive faster. */
export async function passwordMatches(encoded: string | null, password: string): Promise<boolean> {
  if (!encoded) {
    await hashPassword(password)
    return false
  }
  try {
    return await verify(encoded, password)
  } catch {
    return false
  }
}
