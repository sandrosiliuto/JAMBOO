import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'JAMBOO 🎉',
  description: 'Conoce gente en la fiesta — swipe, match, WhatsApp',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#080810',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#080810] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
