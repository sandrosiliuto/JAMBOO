'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, X, Heart, Sparkles, MessageCircle } from 'lucide-react'
import { createClient } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'
import SwipeCard from '@/src/components/SwipeCard'
import Navigation from '@/src/components/Navigation'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchUser, setMatchUser] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
        return
      }

      // 1. Get current profile to know preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!profile) {
        router.push('/onboarding')
        return
      }

      // 2. Get my swipes to exclude them
      const { data: mySwipes } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', session.user.id)
      
      const swipedIds = mySwipes?.map(s => s.swiped_id) || []

      // 3. Build query — only add the NOT IN filter if there are swiped IDs
      let query = supabase
        .from('profiles')
        .select('*, user_photos(*)')
        .neq('id', session.user.id)
        .limit(20)

      // BUG FIX: avoid invalid SQL when swipedIds is empty
      if (swipedIds.length > 0) {
        query = query.not('id', 'in', `(${swipedIds.join(',')})`)
      }

      const { data: potentialMatches, error } = await query

      if (error) {
        console.error(error)
      } else {
        const formatted = (potentialMatches as any[]).map(u => ({
          ...u,
          photo_url: (u.user_photos as any[])?.find((p: any) => p.is_primary)?.photo_url || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167'
        }))
        setUsers(formatted.sort(() => Math.random() - 0.5))
      }
      setLoading(false)
    }

    fetchUsers()
  }, [supabase, router])

  const handleSwipe = async (direction: 'left' | 'right') => {
    const targetUser = users[currentIndex]
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // 1. Save Swipe
    await supabase.from('swipes').insert({
      swiper_id: session.user.id,
      swiped_id: targetUser.id,
      direction: direction === 'right' ? 'like' : 'nope'
    })

    // 2. If Like, check for mutual match
    if (direction === 'right') {
      const { data: mutualLike } = await supabase
        .from('swipes')
        .select('*')
        .eq('swiper_id', targetUser.id)
        .eq('swiped_id', session.user.id)
        .eq('direction', 'like')
        .single()

      if (mutualLike) {
        // MATCH!
        await supabase.from('matches').insert({
          user_id_1: session.user.id,
          user_id_2: targetUser.id
        })
        setMatchUser(targetUser)
      }
    }

    setCurrentIndex(prev => prev + 1)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="p-8 flex items-center justify-between z-30">
        <h1 className="text-3xl font-black italic neon-text-cyan tracking-tighter uppercase">Jamboo</h1>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl glass-card flex items-center justify-center text-neon-fuchsia">
            <Flame className="w-5 h-5" />
          </div>
        </div>
      </header>

      <main className="flex-1 relative px-4 flex items-center justify-center">
        {loading ? (
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ repeat: Infinity }}
            className="flex flex-col items-center gap-4 text-neon-cyan opacity-50"
          >
            <Flame className="w-12 h-12" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Cargando fiesta...</span>
          </motion.div>
        ) : (
          <div className="relative w-full h-[70vh]">
            <AnimatePresence>
              {currentIndex < users.length ? (
                <SwipeCard 
                  key={users[currentIndex].id}
                  user={users[currentIndex]}
                  onSwipe={handleSwipe}
                />
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center p-12"
                >
                  <Sparkles className="w-20 h-20 text-neon-fuchsia mb-6 animate-pulse" />
                  <h3 className="text-3xl font-black uppercase italic mb-4 tracking-tighter">¡FIESTA TOTAL!</h3>
                  <p className="text-gray-600 font-black uppercase text-[10px] tracking-[0.2em] leading-relaxed">
                    Has visto a todos los invitados. <br />¡Ve a por una copa y vuelve luego!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Manual Controls */}
      {currentIndex < users.length && !loading && (
        <div className="flex justify-center gap-10 pb-32 z-30">
          <button 
            onClick={() => handleSwipe('left')}
            className="w-20 h-20 rounded-full glass-card flex items-center justify-center text-neon-fuchsia hover:scale-110 active:scale-90 transition-all shadow-xl border-neon-fuchsia/20"
          >
            <X className="w-10 h-10" />
          </button>
          <button 
            onClick={() => handleSwipe('right')}
            className="w-20 h-20 rounded-full glass-card flex items-center justify-center text-neon-cyan hover:scale-110 active:scale-90 transition-all shadow-xl border-neon-cyan/20"
          >
            <Flame className="w-10 h-10" />
          </button>
        </div>
      )}

      {/* Match Modal */}
      <AnimatePresence>
        {matchUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="glass-card border-2 border-neon-fuchsia p-10 rounded-[50px] text-center max-w-sm w-full relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-neon-fuchsia/20 to-transparent pointer-events-none" />
              
              <Flame className="w-20 h-20 text-neon-fuchsia mx-auto mb-6 animate-bounce" />
              <h2 className="text-6xl font-black italic text-white mb-4 neon-text-fuchsia tracking-tighter uppercase">Match!</h2>
              <p className="text-gray-500 font-black uppercase text-[10px] tracking-[0.2em] mb-10">¡A {matchUser.nickname} también le gustas!</p>
              
              <div className="relative w-56 h-56 mx-auto mb-10">
                <img src={matchUser.photo_url} alt={matchUser.nickname} className="w-full h-full object-cover rounded-[40px] border-4 border-neon-fuchsia shadow-[0_0_30px_rgba(255,0,255,0.6)]" />
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => {
                    setMatchUser(null)
                    router.push('/chat')
                  }}
                  className="w-full bg-neon-fuchsia text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] neon-glow-fuchsia hover:bg-opacity-80 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" /> Enviar mensaje
                </button>
                <button 
                  onClick={() => setMatchUser(null)}
                  className="text-gray-600 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors"
                >
                  Seguir buscando
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navigation />
    </div>
  )
}
