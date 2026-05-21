'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

interface MatchedUser {
  id: string
  name: string
  photo_url: string | null
  phone: string
}

export default function MatchModal({
  matchedUser,
  onClose,
}: {
  matchedUser: MatchedUser
  onClose: () => void
}) {
  useEffect(() => {
    // Confeti doble desde los lados
    const end = Date.now() + 2000
    const colors = ['#00e5ff', '#ff00c8', '#ffffff', '#ffdd00']
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors })
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [])

  const cleanPhone = matchedUser.phone.replace(/[\s\-()]/g, '')
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hola ${matchedUser.name}, hemos hecho match en la fiesta! 😄`,
  )}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
      <div
        className="w-full max-w-sm rounded-3xl p-8 text-center space-y-5 border"
        style={{
          background: 'linear-gradient(145deg, #13132a, #1a1a3a)',
          borderColor: 'rgba(0,229,255,0.25)',
          boxShadow: '0 0 60px rgba(0,229,255,0.15)',
        }}
      >
        <div className="text-5xl animate-bounce">🎉</div>

        <h1 className="text-4xl font-black text-white">¡Es un Match!</h1>

        {/* Avatar */}
        <div className="flex justify-center">
          {matchedUser.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={matchedUser.photo_url}
              alt={matchedUser.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-[#00e5ff] glow-cyan"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-[#2a2a50] flex items-center justify-center text-5xl border-4 border-[#00e5ff]">
              🙂
            </div>
          )}
        </div>

        <p className="text-xl text-white font-semibold">
          ¡A ti y a{' '}
          <span className="text-gradient font-black">{matchedUser.name}</span> os gustáis!
        </p>

        {/* WhatsApp button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-white text-lg transition hover:opacity-90"
          style={{ background: '#25D366' }}
        >
          💬 Chatear por WhatsApp
        </a>

        <button
          onClick={onClose}
          className="text-sm text-neutral-500 hover:text-neutral-300 transition"
        >
          Seguir conociendo gente →
        </button>
      </div>
    </div>
  )
}
