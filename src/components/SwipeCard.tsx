'use client'

import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export type CardUser = { id: string; name: string; photo_url: string | null }

interface Props {
  user: CardUser
  isTop: boolean
  stackDepth: number
  onLike: () => void
  onPass: () => void
}

export default function SwipeCard({ user, isTop, stackDepth, onLike, onPass }: Props) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-22, 22])
  const likeOpacity = useTransform(x, [30, 100], [0, 1])
  const passOpacity = useTransform(x, [-100, -30], [1, 0])

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x > 110) onLike()
    else if (info.offset.x < -110) onPass()
  }

  const scaleBack = 1 - stackDepth * 0.05
  const yBack = stackDepth * 10

  if (!isTop) {
    return (
      <div
        className="absolute inset-0 rounded-3xl bg-[#13132a] border border-[#2a2a50]"
        style={{
          transform: `scale(${scaleBack}) translateY(${yBack}px)`,
          zIndex: -stackDepth,
        }}
      />
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        key={user.id}
        className="absolute inset-0 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{ x, rotate, zIndex: 10 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        onDragEnd={handleDragEnd}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        whileTap={{ cursor: 'grabbing' }}
      >
        {/* Photo / placeholder */}
        <div className="relative w-full h-full bg-[#13132a]">
          {user.photo_url ? (
            <Image
              src={user.photo_url}
              alt={user.name}
              fill
              sizes="(max-width: 480px) 90vw, 380px"
              className="object-cover pointer-events-none"
              priority
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-neutral-500">
              <span className="text-7xl">🎉</span>
              <span className="text-sm">Sin foto aún</span>
            </div>
          )}

          {/* Bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

          {/* LIKE stamp */}
          <motion.div
            className="absolute top-8 left-6 border-[3px] border-green-400 text-green-400 font-black text-3xl px-4 py-1.5 rounded-xl"
            style={{ opacity: likeOpacity, rotate: -15 }}
          >
            LIKE
          </motion.div>

          {/* NOPE stamp */}
          <motion.div
            className="absolute top-8 right-6 border-[3px] border-red-400 text-red-400 font-black text-3xl px-4 py-1.5 rounded-xl"
            style={{ opacity: passOpacity, rotate: 15 }}
          >
            NOPE
          </motion.div>

          {/* Name */}
          <div className="absolute bottom-0 inset-x-0 p-5 pointer-events-none">
            <h2 className="text-3xl font-black text-white drop-shadow">{user.name}</h2>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
