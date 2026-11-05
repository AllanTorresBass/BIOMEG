/** Requests per minute from one address. Staff save a result on each cell, so their limit is high. Working values. */
export const API_LIMITS = {
  staffPerMinute: 600,
  portalPerMinute: 30,
  downloadsPerMinute: 60,
} as const
