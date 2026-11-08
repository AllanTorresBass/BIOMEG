/** Starting values. They are adjusted after the pilot, from the data in the audit log. */
export const SESSION_SETTINGS = {
  maxFailedAttempts: 5,
  pauseMinutes: 15,
  idleLockMinutes: 10,
  /** A staff session ends this long after sign-in. Step-up does not extend it. */
  maxSessionHours: 12,
  stepUpFreshSeconds: 120,
  /** Fifteen characters until a second factor exists. Twelve would be enough with one. */
  minPasswordLength: 15,
} as const

export const SESSION_COOKIE = 'biomeg_session'
export const WORKSTATION_COOKIE = 'biomeg_ws'
