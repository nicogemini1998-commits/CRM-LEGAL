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
  description: 'Plataforma LegalTech premium para despachos de abogados. Análisis de contratos, generación de escritos y gestión de expedientes con IA. Por Cliender.',
  keywords: 'software abogados, IA legal, legaltech españa, gestión expedientes, generación contratos, análisis jurídico IA',
  authors: [{ name: 'Cliender', url: 'https://cliender.com' }],
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
