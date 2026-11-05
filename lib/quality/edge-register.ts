/**
 * Edge cases the finished stages already test. A later stage is absent until its test names the id.
 * The register does not change a clinical rule. It only fails the build when a claimed id has no test.
 */
export const EDGE_REGISTER = [
  { id: 'E-13', testFile: 'tests/payments.test.ts' },
  { id: 'E-16', testFile: 'tests/clients.test.ts' },
  { id: 'E-27', testFile: 'tests/results.test.ts' },
  { id: 'E-28', testFile: 'tests/results.test.ts' },
  { id: 'E-29', testFile: 'tests/results.test.ts' },
  { id: 'E-30', testFile: 'tests/release.test.ts' },
  { id: 'E-47', testFile: 'tests/payments.test.ts' },
  { id: 'E-48', testFile: 'tests/payments.test.ts' },
  { id: 'E-49', testFile: 'tests/payments.test.ts' },
  { id: 'E-50', testFile: 'tests/fiscal.test.ts' },
  { id: 'E-51', testFile: 'tests/office.test.ts' },
  { id: 'E-52', testFile: 'tests/office.test.ts' },
  { id: 'E-62', testFile: 'tests/delivery.test.ts' },
] as const
