import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'JAMBOO Fiesta',
  description: 'Comparte las fotos de la fiesta',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="es">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-neutral-900">
          <nav className="max-w-5xl mx-auto flex items-center justify-between p-4">
            <Link href="/" className="font-bold text-xl">
              JAMBOO
            </Link>
            <div className="flex items-center gap-3 text-sm">
              <Link href="/upload" className="px-3 py-1.5 rounded-lg bg-white text-black font-semibold">
                Subir foto
              </Link>
              {user ? (
                <>
                  <Link href="/profile" className="px-3 py-1.5 rounded-lg border border-neutral-700">
                    Mi perfil
                  </Link>
                  <form action="/auth/logout" method="post">
                    <button className="px-3 py-1.5 rounded-lg border border-neutral-800 text-neutral-400">
                      Salir
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="px-3 py-1.5 rounded-lg border border-neutral-700">
                  Entrar
                </Link>
              )}
            </div>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto p-4">{children}</main>
      </body>
    </html>
  )
}
