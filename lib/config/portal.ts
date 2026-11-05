/** Starting values for the patient portal. They are adjusted after the pilot, from the audit log. */
export const PORTAL_SETTINGS = {
  codeLength: 6,
  codeMinutes: 10,
  maxWrongCodes: 5,
  /** Failed sign-ins on one cédula before a pause. The count never says which field was wrong. */
  maxFailedAttempts: 5,
  /** Failed sign-ins from one address. Higher, because a clinic or a carrier can share an address. A working value. */
  maxFailedByAddress: 20,
  pauseMinutes: 15,
  idleMinutes: 15,
  sessionHours: 3,
} as const

export const PORTAL_COOKIE = 'biomeg_portal'
export const PORTAL_CHALLENGE_COOKIE = 'biomeg_portal_code'
