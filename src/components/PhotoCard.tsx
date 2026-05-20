'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type Photo = {
  id: string
  storage_path: string
  caption: string | null
  author_name: string
  author_avatar: string | null
  likes_count: number
}

export default function PhotoCard({
  photo,
  initiallyLiked,
  isLoggedIn,
}: {
  photo: Photo
  initiallyLiked: boolean
  isLoggedIn: boolean
}) {
  const router = useRouter()
  const [liked, setLiked] = useState(initiallyLiked)
  const [count, setCount] = useState(photo.likes_count)
  const [pending, setPending] = useState(false)

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${photo.storage_path}`

  async function toggleLike() {
    if (!isLoggedIn) {
      router.push('/login?next=/')
      return
    }
    if (pending) return
    setPending(true)

    // Optimistic UI
    const next = !liked
    setLiked(next)
    setCount((c) => c + (next ? 1 : -1))

    const res = await fetch('/api/likes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ photoId: photo.id, like: next }),
    })

    if (!res.ok) {
      // Revert
      setLiked(!next)
      setCount((c) => c + (next ? -1 : 1))
    }
    setPending(false)
  }

  return (
    <article className="relative group rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
      <div className="relative aspect-square">
        <Image
          src={publicUrl}
          alt={photo.caption ?? `Foto de ${photo.author_name}`}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="p-2 flex items-center justify-between text-sm">
        <span className="text-neutral-400 truncate">{photo.author_name}</span>
        <button
          onClick={toggleLike}
          disabled={pending}
          className={
            'flex items-center gap-1 px-2 py-1 rounded-lg border transition ' +
            (liked
              ? 'border-pink-500 text-pink-400'
              : 'border-neutral-700 text-neutral-300 hover:border-neutral-500')
          }
          aria-pressed={liked}
          aria-label={liked ? 'Quitar like' : 'Dar like'}
        >
          <span>{liked ? '♥' : '♡'}</span>
          <span>{count}</span>
        </button>
      </div>
    </article>
  )
}
