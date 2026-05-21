'use client'

import { useState } from 'react'

export default function AdminPage() {
  const [pw, setPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [error, setError] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch(`/api/admin/users?pw=${encodeURIComponent(pw)}`)
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
      setAuthed(true)
    } else {
      setError('Contraseña incorrecta')
    }
    setLoading(false)
  }

  async function deleteAll() {
    if (!confirm('¿Borrar TODOS los usuarios? Esta acción no se puede deshacer.')) return
    setDeleting(true)
    const res = await fetch(`/api/admin/delete-all?pw=${encodeURIComponent(pw)}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setUsers([])
      setDeleted(true)
    }
    setDeleting(false)
  }

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="card-border rounded-3xl p-8 w-full max-w-sm space-y-5">
          <h1 className="text-2xl font-black text-center">🔐 Panel Admin</h1>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Contraseña"
              required
              className="w-full px-4 py-3 rounded-xl bg-[#080810] border border-[#2a2a50] focus:border-[#00e5ff] outline-none transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-[#00e5ff] text-black disabled:opacity-50 transition hover:opacity-90"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6 pt-4">
        <h1 className="text-2xl font-black">🎉 Panel Admin</h1>
        <span className="text-neutral-400 text-sm">{users.length} asistentes</span>
      </div>

      {deleted ? (
        <div className="text-center py-16 space-y-3">
          <div className="text-5xl">🧹</div>
          <p className="text-xl font-bold">Todos los datos eliminados</p>
          <p className="text-neutral-400">¡Hasta la próxima fiesta!</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-8">
            {users.map((u) => (
              <div
                key={u.id}
                className="card-border rounded-2xl p-4 flex items-center gap-4"
              >
                {u.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={u.photo_url}
                    alt={u.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#2a2a50]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#2a2a50] flex items-center justify-center text-xl">
                    🙂
                  </div>
                )}
                <div>
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-sm text-neutral-400">{u.phone}</p>
                </div>
                <span className="ml-auto text-xs text-neutral-600">
                  {new Date(u.created_at).toLocaleTimeString('es', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={deleteAll}
            disabled={deleting}
            className="w-full py-4 rounded-2xl font-bold bg-red-600 hover:bg-red-500 disabled:opacity-50 transition"
          >
            {deleting ? 'Eliminando...' : '🗑️ Finalizar Evento y Borrar Todos los Datos'}
          </button>
        </>
      )}
    </main>
  )
}
