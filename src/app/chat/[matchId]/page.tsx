'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ChevronLeft, ShieldAlert, Instagram, Sparkles, MoreHorizontal } from 'lucide-react'
import { createClient } from '@/src/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function ChatDetailPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [otherUser, setOtherUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [panicMode, setPanicMode] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()
  const { matchId } = useParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const initChat = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // 1. Get Match & Other User
      const { data: match } = await supabase
        .from('matches')
        .select(`
          user_id_1,
          user_id_2,
          user_1:profiles!matches_user_id_1_fkey(nickname, instagram_username, user_photos(photo_url, is_primary)),
          user_2:profiles!matches_user_id_2_fkey(nickname, instagram_username, user_photos(photo_url, is_primary))
        `)
        .eq('id', matchId)
        .single()

      if (match) {
        const other: any = match.user_id_1 === session.user.id ? match.user_2 : match.user_1
        setOtherUser({
          ...other,
          photo_url: (other.user_photos as any[])?.find((p: any) => p.is_primary)?.photo_url || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167'
        })
      }

      // 2. Initial Fetch Messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })

      setMessages(msgs || [])
      setLoading(false)
      setTimeout(scrollToBottom, 100)

      // 3. Realtime Subscription
      const channel = supabase
        .channel(`chat:${matchId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        }, (payload) => {
          setMessages(prev => [...prev, payload.new])
          setTimeout(scrollToBottom, 100)
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    initChat()
  }, [matchId, supabase])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const msg = {
      match_id: matchId,
      sender_id: session.user.id,
      content: newMessage.trim()
    }

    setNewMessage('')
    const { error } = await supabase.from('messages').insert(msg)
    if (error) console.error(error)
  }

  const handlePanic = async () => {
    setPanicMode(true)
    await supabase.auth.signOut()
    setTimeout(() => {
      window.location.href = 'https://www.google.com' // Redir a página genérica
    }, 1000)
  }

  if (loading) return null

  return (
    <div className="flex flex-col h-screen bg-night relative overflow-hidden">
      {/* Panic Overlay */}
      <AnimatePresence>
        {panicMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] bg-white flex items-center justify-center"
          >
            <div className="text-black text-4xl font-black">CERRANDO SESIÓN...</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="p-6 border-b border-white/5 bg-night/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <img src={otherUser?.photo_url} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
            <div>
              <h2 className="font-black italic uppercase tracking-tighter text-sm leading-none">{otherUser?.nickname}</h2>
              <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-neon-cyan mt-1">
                <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse" />
                Online
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handlePanic}
          className="w-10 h-10 rounded-xl bg-neon-fuchsia/10 text-neon-fuchsia flex items-center justify-center hover:bg-neon-fuchsia hover:text-white transition-all shadow-[0_0_15px_rgba(255,0,255,0.1)]"
          title="Botón de pánico"
        >
          <ShieldAlert className="w-5 h-5" />
        </button>
      </header>

      {/* Messages View */}
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => {
          const isMe = msg.sender_id !== otherUser?.id // Simplified me check
          return (
            <motion.div 
              key={msg.id || idx}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[75%] px-5 py-3 rounded-[24px] text-sm font-medium ${
                  isMe 
                    ? 'bg-neon-cyan text-black rounded-tr-none neon-glow-cyan' 
                    : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
                }`}
              >
                {msg.content}
                <div className={`text-[8px] uppercase font-black tracking-widest mt-1 opacity-50 ${isMe ? 'text-black' : 'text-gray-500'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          )
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <footer className="p-6 pt-0">
        <form onSubmit={sendMessage} className="relative">
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribí algo..."
            className="w-full bg-night-card border border-white/10 rounded-2xl px-6 py-4 pr-16 focus:border-neon-cyan outline-none transition-all text-sm"
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-neon-cyan text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all neon-glow-cyan"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-center mt-4 text-gray-700">JAMBOO Match Encrypted Chat</p>
      </footer>
    </div>
  )
}
