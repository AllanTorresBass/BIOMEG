/** Starting values. They are adjusted after the pilot, from the data in the audit log. */
export const SESSION_SETTINGS = {
  maxFailedAttempts: 5,
  pauseMinutes: 15,
  idleLockMinutes: 10,
  stepUpFreshSeconds: 120,
  minPasswordLength: 10,
} as const

export const SESSION_COOKIE = 'biomeg_session'
export const WORKSTATION_COOKIE = 'biomeg_ws'
