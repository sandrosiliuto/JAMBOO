'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { compressImage } from '@/lib/compressImage'

export default function ProfileForm({
  userId,
  initialName,
  initialAvatarUrl,
}: {
  userId: string
  initialName: string
  initialAvatarUrl: string | null
}) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setLoading(true)
    setMsg(null)
    try {
      const compressed = await compressImage(f, { maxSize: 512, quality: 0.85 })
      const supabase = createClient()
      const path = `${userId}/avatar-${Date.now()}.jpg`
      const { error: upErr } = await supabase.storage
        .from('photos')
        .upload(path, compressed, { contentType: 'image/jpeg', upsert: true })
      if (upErr) throw upErr
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${path}`
      setAvatarUrl(publicUrl)
    } catch (err: any) {
      setMsg(err?.message ?? 'Error al subir avatar')
    } finally {
      setLoading(false)
    }
  }

  async function save() {
    setLoading(true)
    setMsg(null)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ name, avatar_url: avatarUrl })
      .eq('id', userId)
    setLoading(false)
    if (error) setMsg(error.message)
    else {
      setMsg('Guardado ✓')
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-neutral-800" />
        )}
        <label className="text-sm bg-neutral-800 px-3 py-2 rounded-lg cursor-pointer">
          Cambiar foto
          <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
        </label>
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tu nombre"
        maxLength={40}
        className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 outline-none focus:border-neutral-600"
      />

      <button
        onClick={save}
        disabled={loading}
        className="w-full bg-white text-black font-semibold py-3 rounded-xl disabled:opacity-50"
      >
        {loading ? 'Guardando…' : 'Guardar'}
      </button>
      {msg && <p className="text-sm text-neutral-400">{msg}</p>}
    </div>
  )
}
