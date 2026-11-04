/** The threshold in docs/product/04-edges.md (P-03), the same one MediLab uses. */
export const SIMILAR_NAME_THRESHOLD = 0.85

/** Trigrams the way pg_trgm builds them: two spaces before each word, one after. */
function trigrams(value: string): Set<string> {
  const grams = new Set<string>()
  for (const word of value.split(' ').filter(Boolean)) {
    const padded = `  ${word} `
    for (let index = 0; index <= padded.length - 3; index += 1) {
      grams.add(padded.slice(index, index + 3))
    }
  }
  return grams
}

/** Shared trigrams over all trigrams, from 0 to 1. Takes the normalized name key. */
export function nameSimilarity(a: string, b: string): number {
  const left = trigrams(a)
  const right = trigrams(b)
  if (left.size === 0 || right.size === 0) return 0
  let shared = 0
  for (const gram of left) if (right.has(gram)) shared += 1
  return shared / (left.size + right.size - shared)
}
