const STEP_UP_ENDPOINT = '/api/v1/session/step-up'

/** Asks the server to check the password again. Resolves true only when the server accepts it. */
export async function verifyStepUp(password: string): Promise<boolean> {
  try {
    const response = await fetch(STEP_UP_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    return response.ok
  } catch {
    return false
  }
}
