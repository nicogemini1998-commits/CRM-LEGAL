import type { Metadata } from 'next'
import { Instrument_Serif, Geist, Geist_Mono } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument',
  display: 'swap',
})

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'IURALEX — La IA que entiende el derecho español',
  description: 'Plataforma LegalTech premium para despachos de abogados españoles. Análisis de contratos, generación de escritos y gestión de expedientes con IA. Desarrollado por Cliender Tech — soluciones SaaS+IA para profesionales en España.',
  keywords: 'software abogados, IA legal, legaltech españa, gestión expedientes, generación contratos, análisis jurídico IA, Cliender Tech',
  authors: [{ name: 'Cliender Tech', url: 'https://cliender.com' }],
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/icon-cliender.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon-cliender.svg' }],
    shortcut: ['/icon-cliender.svg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'IURALEX',
  },
  formatDetection: { telephone: false },
  themeColor: '#FAFAF9',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    title: 'IURALEX — La IA que entiende el derecho español',
    description: 'Plataforma LegalTech premium para despachos de abogados españoles. Por Cliender.',
    type: 'website',
    locale: 'es_ES',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${instrument.variable} ${geist.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
