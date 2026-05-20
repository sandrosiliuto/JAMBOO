'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { compressImage } from '@/lib/compressImage'

export default function UploadForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)

    try {
      // 1. Comprimir antes de subir (target 1280px, ~80% quality)
      const compressed = await compressImage(file, { maxSize: 1280, quality: 0.8 })

      // 2. Subir a Storage bucket "photos" en carpeta {userId}/
      const supabase = createClient()
      const ext = 'jpg'
      const path = `${userId}/${crypto.randomUUID()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('photos')
        .upload(path, compressed, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false,
        })
      if (upErr) throw upErr

      // 3. Crear fila en la tabla photos
      const { error: dbErr } = await supabase.from('photos').insert({
        user_id: userId,
        storage_path: path,
        caption: caption || null,
      })
      if (dbErr) throw dbErr

      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Error al subir')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        type="file"
        accept="image/*"
        onChange={onFile}
        className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white file:text-black file:font-semibold"
      />
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Preview" className="w-full rounded-xl" />
      )}
      <input
        type="text"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Pie de foto (opcional)"
        maxLength={140}
        className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 outline-none focus:border-neutral-600"
      />
      <button
        type="submit"
        disabled={!file || loading}
        className="w-full bg-white text-black font-semibold py-3 rounded-xl disabled:opacity-50"
      >
        {loading ? 'Subiendo…' : 'Subir foto'}
      </button>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </form>
  )
}
