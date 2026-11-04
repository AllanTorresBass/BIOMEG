import 'server-only'

/** Starting value. Small groups are hidden so a person cannot be identified. Adjust after the pilot. */
export const AGGREGATE_MIN_GROUP_SIZE = 5

/** status_only: keep the worklist status and drop every value field. */
export function applyStatusOnly<T extends Record<string, unknown>, K extends keyof T>(
  row: T,
  valueKeys: readonly K[],
): Omit<T, K> {
  const copy = { ...row }
  for (const key of valueKeys) delete copy[key]
  return copy
}

/** clinical_text_masked: free text on clinical events can hold a value, so it is hidden. */
export function applyClinicalTextMask(text: string | null): string | null {
  return text === null ? null : '[oculto]'
}

/** aggregates_only: totals only, with groups under the minimum suppressed. */
export function applyAggregatesOnly(
  groups: readonly { label: string; count: number }[],
  minGroupSize: number = AGGREGATE_MIN_GROUP_SIZE,
): { groups: { label: string; count: number }[]; suppressedGroups: number } {
  const shown = groups.filter((group) => group.count >= minGroupSize)
  return { groups: shown, suppressedGroups: groups.length - shown.length }
}

/** released_sections_labeled_partial: released sections only, and a flag so the page can say so. */
export function applyReleasedSectionsPartial<S extends { released: boolean }>(
  sections: readonly S[],
): { sections: S[]; partial: boolean } {
  const released = sections.filter((section) => section.released)
  return { sections: released, partial: released.length < sections.length }
}

/** date_and_number_until_released: no exam names before release. */
export function applyDateAndNumberUntilReleased<T extends { orderNumber: string; date: string }>(
  visit: T,
): { orderNumber: string; date: string } {
  return { orderNumber: visit.orderNumber, date: visit.date }
}
