import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mitra Muda — Platform Talenta Pelajar Indonesia',
  description: 'Platform pemberdayaan talenta pelajar Indonesia. Dapatkan penghasilan dari karya tanpa syarat KTP atau rekening bank. Terhubung dengan UMKM yang membutuhkan talenta muda.',
  keywords: ['pelajar', 'UMKM', 'freelance', 'marketplace', 'talenta muda', 'Indonesia'],
  openGraph: {
    title: 'Mitra Muda',
    description: 'Platform pemberdayaan talenta pelajar Indonesia',
    locale: 'id_ID',
    type: 'website',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={plusJakarta.variable} data-scroll-behavior="smooth">
      <body className="min-h-screen bg-neutral-50 antialiased">
        {children}
      </body>
    </html>
  )
}
