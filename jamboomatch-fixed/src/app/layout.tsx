import type { Metadata } from 'next'
import { Inter, Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-display' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'JAMBOO Match',
  description: 'La aplicación de citas definitiva para JAMBOO.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} ${outfit.variable} ${mono.variable} font-sans min-h-screen bg-night selection:bg-neon-cyan/30`}>
        <div className="max-w-md mx-auto min-h-screen relative border-x border-white/5">
          {children}
        </div>
      </body>
    </html>
  )
}
