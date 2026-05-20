'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  if (sent) {
    return (
      <div className="max-w-sm mx-auto mt-16 p-8 text-center space-y-3 bg-neutral-900 rounded-2xl border border-neutral-800">
        <h1 className="text-2xl font-bold">Revisa tu email</h1>
        <p className="text-neutral-400">
          Te hemos enviado un enlace mágico a <span className="font-mono">{email}</span>.
          Haz clic en él y volverás aquí ya con sesión iniciada.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto mt-16 p-8 space-y-4 bg-neutral-900 rounded-2xl border border-neutral-800">
      <h1 className="text-2xl font-bold">Entra a la fiesta</h1>
      <p className="text-neutral-400 text-sm">
        Te mandamos un enlace por email. Sin contraseña, sin líos.
      </p>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 outline-none focus:border-neutral-600"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Enviando…' : 'Enviar enlace mágico'}
        </button>
      </form>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  )
}
