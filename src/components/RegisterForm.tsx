'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { compressImage } from '@/lib/compressImage'

export default function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file, { maxSize: 800, quality: 0.82 })
    const compressedFile = new File([compressed], 'photo.jpg', { type: 'image/jpeg' })
    setPhoto(compressedFile)
    setPreview(URL.createObjectURL(compressed))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed) { setError('Acepta los términos para continuar'); return }
    setLoading(true)
    setError('')

    const fd = new FormData()
    fd.append('name', name)
    fd.append('phone', phone)
    if (photo) fd.append('photo', photo)

    const res = await fetch('/api/register', { method: 'POST', body: fd })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Error al registrarte')
      setLoading(false)
      return
    }

    router.push('/discover')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-4 card-border rounded-3xl p-6"
    >
      {/* Foto */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-[#00e5ff]/40 hover:border-[#00e5ff] transition flex items-center justify-center bg-[#080810]"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="foto" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">📷</span>
          )}
        </button>
        <span className="text-xs text-neutral-500">Toca para agregar tu foto</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={handlePhotoChange}
        />
      </div>

      {/* Nombre */}
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          required
          maxLength={30}
          className="w-full px-4 py-3 rounded-xl bg-[#080810] border border-[#2a2a50] focus:border-[#00e5ff] outline-none transition placeholder-neutral-600"
        />
      </div>

      {/* WhatsApp */}
      <div>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="WhatsApp (+34 600 000 000)"
          required
          className="w-full px-4 py-3 rounded-xl bg-[#080810] border border-[#2a2a50] focus:border-[#00e5ff] outline-none transition placeholder-neutral-600"
        />
        <p className="text-xs text-neutral-600 mt-1 ml-1">
          Solo se comparte si hay un match
        </p>
      </div>

      {/* Términos */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 accent-[#00e5ff]"
        />
        <span className="text-xs text-neutral-400">
          Entiendo que mis datos se usan solo durante el evento y se eliminan después.
        </span>
      </label>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading || !name || !phone}
        className="w-full py-3.5 rounded-2xl font-black text-black disabled:opacity-40 transition hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #00e5ff, #ff00c8)' }}
      >
        {loading ? 'Entrando...' : '¡Unirse a la fiesta!'}
      </button>
    </form>
  )
}
