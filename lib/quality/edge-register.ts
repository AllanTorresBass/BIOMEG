/**
 * Edge cases the finished stages already test. A later stage is absent until its test names the id.
 * The register does not change a clinical rule. It only fails the build when a claimed id has no test.
 * Stage 6 ids (hash chain, Argon2id, hosted hardening) stay out until Gate B opens those tests.
 */
export const EDGE_REGISTER = [
  { id: 'E-13', testFile: 'tests/payments.test.ts' },
  { id: 'E-16', testFile: 'tests/clients.test.ts' },
  { id: 'E-18', testFile: 'tests/client-lifecycle.test.ts' },
  { id: 'E-27', testFile: 'tests/results.test.ts' },
  { id: 'E-28', testFile: 'tests/results.test.ts' },
  { id: 'E-29', testFile: 'tests/results.test.ts' },
  { id: 'E-30', testFile: 'tests/release.test.ts' },
  { id: 'E-31', testFile: 'tests/correction.test.ts' },
  { id: 'E-33', testFile: 'tests/portal.test.ts' },
  { id: 'E-34', testFile: 'tests/correction.test.ts' },
  { id: 'E-37', testFile: 'tests/order-state.test.ts' },
  { id: 'E-38', testFile: 'tests/delivery.test.ts' },
  { id: 'E-40', testFile: 'tests/portal.test.ts' },
  { id: 'E-41', testFile: 'tests/portal.test.ts' },
  { id: 'E-43', testFile: 'tests/verification.test.ts' },
  { id: 'E-44', testFile: 'tests/verification.test.ts' },
  { id: 'E-45', testFile: 'tests/verification.test.ts' },
  { id: 'E-47', testFile: 'tests/payments.test.ts' },
  { id: 'E-48', testFile: 'tests/payments.test.ts' },
  { id: 'E-49', testFile: 'tests/payments.test.ts' },
  { id: 'E-50', testFile: 'tests/fiscal.test.ts' },
  { id: 'E-51', testFile: 'tests/office.test.ts' },
  { id: 'E-52', testFile: 'tests/office.test.ts' },
  { id: 'E-62', testFile: 'tests/delivery.test.ts' },
  { id: 'E-63', testFile: 'tests/verification.test.ts' },
  { id: 'P-01', testFile: 'tests/clients.test.ts' },
  { id: 'P-03', testFile: 'tests/clients.test.ts' },
  { id: 'M-02', testFile: 'tests/client-lifecycle.test.ts' },
] as const
