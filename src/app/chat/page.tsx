'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Heart, Instagram, ChevronRight, User } from 'lucide-react'
import { createClient } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'
import Navigation from '@/src/components/Navigation'

export const dynamic = 'force-dynamic'

export default function ChatListPage() {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchMatches = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Fetch matches where user_id_1 = me OR user_id_2 = me
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          created_at,
          user_1:profiles!matches_user_id_1_fkey(id, nickname, instagram_username, user_photos(photo_url, is_primary)),
          user_2:profiles!matches_user_id_2_fkey(id, nickname, instagram_username, user_photos(photo_url, is_primary))
        `)
        .or(`user_id_1.eq.${session.user.id},user_id_2.eq.${session.user.id}`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error(error)
      } else {
        const formatted = (data as any[]).map(m => {
          const otherUser = m.user_1.id === session.user.id ? m.user_2 : m.user_1
          return {
            matchId: m.id,
            userId: otherUser.id,
            nickname: otherUser.nickname,
            instagram: otherUser.instagram_username,
            photo_url: (otherUser.user_photos as any[])?.find((p: any) => p.is_primary)?.photo_url || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167'
          }
        })
        setMatches(formatted)
      }
      setLoading(false)
    }

    fetchMatches()
  }, [supabase])

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="p-8 pb-4">
        <h1 className="text-4xl font-black italic neon-text-fuchsia tracking-tighter uppercase mb-2">Matches</h1>
        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Tus conexiones recientes</p>
      </header>

      <main className="flex-1 overflow-y-auto px-8 pb-32">
        {loading ? (
          <div className="flex items-center justify-center h-40 opacity-20">
            <Heart className="w-10 h-10 animate-pulse" />
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center opacity-30">
            <Heart className="w-16 h-16 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Aún no hay fuego mutuo. <br />¡Seguí swappeando!</p>
          </div>
        ) : (
          <div className="space-y-6 mt-8">
            {matches.map((match, idx) => (
              <motion.div 
                key={match.matchId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => router.push(`/chat/${match.matchId}`)}
                className="glass-card p-5 rounded-[32px] flex items-center gap-5 cursor-pointer hover:border-neon-cyan/50 transition-all group"
              >
                <div className="relative">
                  <img 
                    src={match.photo_url} 
                    alt={match.nickname} 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10 group-hover:border-neon-fuchsia transition-all" 
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neon-cyan rounded-full border-2 border-night flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-black uppercase italic text-lg tracking-tighter">{match.nickname}</h3>
                  <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-black tracking-widest mt-0.5">
                    <Instagram className="w-3 h-3" />
                    <span>@{match.instagram}</span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-gray-600 group-hover:text-neon-cyan transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Navigation />
    </div>
  )
}
