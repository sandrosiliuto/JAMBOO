'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Instagram, Sparkles, Flame, Heart, LogIn, Mail } from 'lucide-react'
import { createClient } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single()

        if (profile) {
          router.push('/dashboard')
        } else {
          router.push('/onboarding')
        }
      }
    }
    checkUser()
  }, [router, supabase])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      setMessage('¡Checkeá tu mail! Te enviamos un link mágico.')
    } catch (err: any) {
      setMessage(err.message || 'Ocurrió un error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-fuchsia/10 blur-[100px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center z-10"
      >
        <div className="mb-12">
          <motion.h1 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-7xl font-black italic mb-2 tracking-tighter neon-text-cyan flex items-center justify-center gap-2"
          >
            JAMBOO <Sparkles className="w-8 h-8 text-neon-fuchsia" />
          </motion.h1>
          <p className="text-neon-fuchsia font-black tracking-[0.4em] uppercase text-[10px]">Match & Connect</p>
        </div>

        <div className="glass-card p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan to-neon-fuchsia opacity-50" />
          
          <h2 className="text-2xl font-black mb-8 uppercase tracking-tight italic">
            {isLogin ? 'Bienvenido de vuelta' : 'Entra a la fiesta'}
          </h2>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black ml-4">Tu Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hola@ejemplo.com"
                  required
                  className="w-full bg-night-card border border-white/10 rounded-2xl px-12 py-4 focus:border-neon-cyan outline-none transition-all text-sm"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-neon-cyan text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all neon-glow-cyan active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Obtener Link Mágico'}
            </button>
          </form>

          {message && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-[10px] font-bold text-neon-cyan uppercase tracking-wider"
            >
              {message}
            </motion.p>
          )}

          <div className="mt-8 pt-8 border-t border-white/5">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
            >
              {isLogin ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Inicia sesión'}
            </button>
          </div>
        </div>

        <div className="mt-12 opacity-30 flex items-center justify-center gap-6">
          <Flame className="w-5 h-5" />
          <Heart className="w-5 h-5" />
          <Sparkles className="w-5 h-5" />
        </div>
      </motion.div>
    </div>
  )
}
