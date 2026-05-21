'use client'

import { useState, useCallback } from 'react'
import SwipeCard, { type CardUser } from './SwipeCard'
import MatchModal from './MatchModal'

interface MatchedUser {
  id: string
  name: string
  photo_url: string | null
  phone: string
}

const DEMO_MATCH: MatchedUser = {
  id: 'demo-match',
  name: 'María 💃',
  photo_url: null,
  phone: '+34 600 000 000',
}

export default function SwipeDeck({
  users,
  currentUserId,
  isDemo = false,
}: {
  users: CardUser[]
  currentUserId: string
  isDemo?: boolean
}) {
  const [index, setIndex] = useState(0)
  const [matchData, setMatchData] = useState<MatchedUser | null>(null)
  const [demoLikes, setDemoLikes] = useState(0)

  const handleSwipe = useCallback(
    async (liked: boolean) => {
      const user = users[index]
      if (!user) return

      setIndex((i) => i + 1)

      // ── DEMO MODE: simular match en el 2º like ─────────────────
      if (isDemo && liked) {
        setDemoLikes((prev) => {
          const next = prev + 1
          if (next === 2) {
            setTimeout(() => setMatchData(DEMO_MATCH), 300)
          }
          return next
        })
        return
      }
      // ───────────────────────────────────────────────────────────

      if (liked) {
        try {
          const res = await fetch('/api/swipe', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ swiperId: currentUserId, swipedId: user.id, liked: true }),
          })
          const data = await res.json()
          if (data.matched) setMatchData(data.matchedUser)
        } catch (err) {
          console.error('swipe error', err)
        }
      } else {
        fetch('/api/swipe', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ swiperId: currentUserId, swipedId: user.id, liked: false }),
        }).catch(console.error)
      }
    },
    [index, users, currentUserId, isDemo],
  )

  const visible = users.slice(index, index + 3)

  if (index >= users.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 space-y-4">
        <div className="text-6xl">🎊</div>
        <h2 className="text-2xl font-black">¡Has visto a todos!</h2>
        <p className="text-neutral-500 text-sm">
          Vuelve más tarde si se unen nuevos asistentes.
        </p>
        {isDemo && (
          <p className="text-yellow-400 text-xs mt-2">
            ⚡ Modo demo — conecta Supabase para datos reales
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
      {/* Card stack */}
      <div
        className="relative"
        style={{ width: 'min(380px, 90vw)', height: 'min(520px, 65vh)' }}
      >
        {[...visible].reverse().map((user, revIdx) => {
          const depth = visible.length - 1 - revIdx
          return (
            <SwipeCard
              key={user.id}
              user={user}
              isTop={depth === 0}
              stackDepth={depth}
              onLike={() => handleSwipe(true)}
              onPass={() => handleSwipe(false)}
            />
          )
        })}
      </div>

      {/* Botones */}
      <div className="flex items-center gap-10">
        <button
          onClick={() => handleSwipe(false)}
          aria-label="Pasar"
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2 border-red-500/40 hover:border-red-400 hover:scale-110 transition bg-[#13132a]"
        >
          ✕
        </button>
        <button
          onClick={() => handleSwipe(true)}
          aria-label="Like"
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl border-2 hover:scale-110 transition"
          style={{
            borderColor: 'rgba(255,0,200,0.5)',
            background: 'linear-gradient(135deg,rgba(255,0,200,0.1),rgba(0,229,255,0.1))',
          }}
        >
          ♥
        </button>
        <div className="w-16 h-16 flex items-center justify-center text-neutral-600 text-sm text-center leading-tight">
          {users.length - index}<br />left
        </div>
      </div>

      <p className="text-xs text-neutral-700">Desliza o usa los botones</p>

      {matchData && (
        <MatchModal matchedUser={matchData} onClose={() => setMatchData(null)} />
      )}
    </div>
  )
}
