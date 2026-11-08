import type { Metadata, Viewport } from 'next'
import { Source_Sans_3 } from 'next/font/google'
import { strings } from '@/lib/strings'
import './globals.css'

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans-3',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: `${strings.brand.name} ${strings.brand.descriptor}`, template: `%s | ${strings.brand.name}` },
  description: 'Sistema del Laboratorio Clínico BIOMEG.',
  manifest: '/site.webmanifest',
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

// A meta tag cannot read a CSS variable, so this one value repeats --color-navy from tokens.css.
export const viewport: Viewport = {
  themeColor: '#203860',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-VE" className={`${sourceSans.variable} bg-background`}>
      {/* ColorZilla adds cz-shortcut-listen to body before React hydrates. */}
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
