// Demo sign-in is public knowledge, so it must never reach production (V0-A8).
if (process.env.BIOMEG_DEMO === 'on' && process.env.VERCEL_ENV === 'production') {
  throw new Error('BIOMEG_DEMO cannot be on in a production deployment.')
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ['@node-rs/argon2'],
  async redirects() {
    return [
      {
        source: '/clientes',
        has: [{ type: 'query', key: 'nuevo', value: '1' }],
        destination: '/clientes/nuevo',
        permanent: false,
      },
      {
        source: '/clientes',
        has: [
          { type: 'query', key: 'id', value: '(?<id>[^&]+)' },
          { type: 'query', key: 'saved', value: '1' },
        ],
        destination: '/clientes/:id?saved=1',
        permanent: false,
      },
      {
        source: '/clientes',
        has: [{ type: 'query', key: 'id', value: '(?<id>[^&]+)' }],
        destination: '/clientes/:id',
        permanent: false,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/verificar/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ]
  },
}

export default nextConfig
