/** Starting values for the public verification page, from R-149 and E-63. The request limit is a working value. */
export const VERIFICATION_SETTINGS = {
  requestsPerMinute: 30,
  valueCheckDays: 90,
  maxWrongCodes: 5,
  pauseMinutes: 15,
} as const
