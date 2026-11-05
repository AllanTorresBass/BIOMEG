import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const serverOnlyPaths = [
  { group: ['@/lib/server', '@/lib/server/*'], message: 'Server code cannot be imported from the browser layers.' },
  { group: ['@/lib/auth', '@/lib/auth/*'], message: 'Auth code is server-only.' },
  { group: ['@/lib/db', '@/lib/db/*'], message: 'Data access is server-only.' },
]

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'docs/**', 'next-env.d.ts'] },
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['components/**', 'hooks/**', 'stores/**', 'lib/services/**'],
    rules: { 'no-restricted-imports': ['error', { patterns: serverOnlyPaths }] },
  },
  {
    files: ['lib/server/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['@/lib/services', '@/lib/services/*'], message: 'Server code cannot import browser services.' }] },
      ],
    },
  },
  {
    files: ['components/**', 'hooks/**'],
    rules: {
      'no-restricted-globals': ['error', { name: 'fetch', message: 'Call a service, not fetch, from components and hooks.' }],
    },
  },
]

export default config
