import 'server-only'

import { headers } from 'next/headers'

/** The address the app is served from. The QR needs it absolute so a phone camera can open it. */
export async function requestOrigin(): Promise<string | null> {
  try {
    const list = await headers()
    const host = list.get('x-forwarded-host') ?? list.get('host')
    if (!host) return null
    const protocol = list.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
    return `${protocol}://${host}`
  } catch {
    return null
  }
}
