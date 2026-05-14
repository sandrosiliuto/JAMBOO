'use client'

import React from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { Sparkles, Info, Heart, X, Flame } from 'lucide-react'

interface UserProfile {
  id: string
  nickname: string
  bio: string
  purpose: string
  photo_url: string
}

interface SwipeCardProps {
  user: UserProfile
  onSwipe: (direction: 'left' | 'right') => void
}

export default function SwipeCard({ user, onSwipe }: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-30, 30])
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])
  
  const likeOpacity = useTransform(x, [50, 150], [0, 1])
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1])

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('right')
    } else if (info.offset.x < -100) {
      onSwipe('left')
    }
  }

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className="relative w-full h-full rounded-[48px] overflow-hidden bg-night-card shadow-2xl border border-white/10 group">
        <img 
          src={user.photo_url} 
          alt={user.nickname} 
          className="w-full h-full object-cover pointer-events-none select-none transition-transform duration-700 group-hover:scale-105" 
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none" />
        
        {/* Indicators */}
        <motion.div 
          style={{ opacity: likeOpacity }}
          className="absolute top-12 left-12 border-4 border-neon-cyan text-neon-cyan px-6 py-2 rounded-2xl font-black text-4xl -rotate-12 uppercase tracking-tighter neon-glow-cyan pointer-events-none"
        >
          FIRE
        </motion.div>
        
        <motion.div 
          style={{ opacity: nopeOpacity }}
          className="absolute top-12 right-12 border-4 border-neon-fuchsia text-neon-fuchsia px-6 py-2 rounded-2xl font-black text-4xl rotate-12 uppercase tracking-tighter neon-glow-fuchsia pointer-events-none"
        >
          NEXT
        </motion.div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 w-full p-10 space-y-4 pointer-events-none">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase neon-text-cyan">{user.nickname}</h2>
              {Math.random() > 0.5 && (
                <div className="bg-neon-cyan text-black px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                  <Sparkles className="w-3 h-3" /> Verificado
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-neon-fuchsia/20 text-neon-fuchsia border border-neon-fuchsia/30 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                {user.purpose}
              </span>
              <span className="bg-white/5 text-white/40 border border-white/10 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                A 2km de distancia
              </span>
            </div>
          </div>
          
          <p className="text-gray-300 text-sm line-clamp-2 font-medium leading-relaxed max-w-[90%]">
            {user.bio || "Este usuario prefiere mantener el misterio... ¡Dále FIRE para conocerlo!"}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
