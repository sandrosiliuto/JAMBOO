'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Instagram, Settings, LogOut, Check, ChevronRight, ShieldCheck, Heart, Sparkles, User, Edit2, Flame } from 'lucide-react'
import { createClient } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'
import Navigation from '@/src/components/Navigation'

const INTERESTS = ['Techno', 'House', 'Reggaeton', 'VIP', 'After', 'Cócteles', 'Glow', 'Moda']

export const dynamic = 'force-dynamic'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStep, setVerificationStep] = useState(0)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data } = await supabase
        .from('profiles')
        .select('*, user_photos(*)')
        .eq('id', session.user.id)
        .single()

      if (data) {
        setProfile({
          ...data,
          photo_url: (data.user_photos as any[])?.find((p: any) => p.is_primary)?.photo_url || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167'
        })
      }
      setLoading(false)
    }

    fetchProfile()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const startVerification = () => {
    setIsVerifying(true)
    setVerificationStep(1)
  }

  const completeVerification = async () => {
    setVerificationStep(2) // Simulación de carga
    setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await supabase.from('profiles').update({ is_verified: true }).eq('id', session.user.id)
        setProfile((prev: any) => ({ ...prev, is_verified: true }))
      }
      setVerificationStep(3)
    }, 2000)
  }

  if (loading) return null

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="p-8 flex items-center justify-between">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase">Tu Perfil</h1>
        <button onClick={handleLogout} className="text-gray-600 hover:text-neon-fuchsia">
          <LogOut className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-8 pb-32">
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className={`w-44 h-44 rounded-[48px] overflow-hidden border-4 ${profile?.is_verified ? 'border-neon-cyan neon-glow-cyan' : 'border-white/10'}`}>
              <img src={profile?.photo_url} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <button className="absolute bottom-[-10px] right-[-10px] w-12 h-12 bg-neon-fuchsia rounded-2xl flex items-center justify-center neon-glow-fuchsia hover:scale-110 active:scale-95 transition-all">
              <Camera className="w-5 h-5 text-white" />
            </button>
            {profile?.is_verified && (
              <div className="absolute top-[-10px] left-[-10px] bg-neon-cyan text-black px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1 neon-glow-cyan">
                <Check className="w-3 h-3" /> Verificado
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{profile?.nickname}</h2>
            <div className="flex items-center justify-center gap-1.5 text-gray-500 text-[10px] font-black tracking-widest mt-3">
              <Instagram className="w-3 h-3" />
              <span>@{profile?.instagram_username}</span>
            </div>
          </div>

          <div className="w-full mt-12 space-y-8">
            {!profile?.is_verified && (
              <button 
                onClick={startVerification}
                className="w-full glass-card p-5 rounded-[32px] border-neon-cyan/20 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-neon-cyan/10 text-neon-cyan flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white">Verificá tu perfil</div>
                    <div className="text-[8px] uppercase tracking-wider text-gray-500 font-bold mt-1">Obtené tu insignia oficial</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-neon-cyan transition-colors" />
              </button>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between ml-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Bio</h3>
                <button className="text-neon-cyan scale-75"><Edit2 className="w-4 h-4" /></button>
              </div>
              <div className="glass-card p-6 rounded-[32px] text-sm text-gray-400 font-medium leading-relaxed">
                {profile?.bio || "No tenés bio todavía. ¡Agregá una para tener más matches!"}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Tus Intereses</h3>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(tag => (
                  <div key={tag} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-wider text-white/50">
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Buscas</h3>
              <div className="glass-card p-5 rounded-[32px] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neon-fuchsia/10 text-neon-fuchsia flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{profile?.purpose}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-800" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isVerifying && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col p-8"
          >
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              {verificationStep === 1 && (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-8">
                  <div className="relative w-64 h-64 mx-auto">
                    <div className="absolute inset-0 border-[6px] border-neon-cyan rounded-[60px] animate-pulse" />
                    <img src={profile?.photo_url} className="w-full h-full object-cover rounded-[50px] p-2" />
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
                      <div className="w-full h-1 bg-neon-cyan/50 animate-[scan_2s_infinite]" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black italic uppercase italic tracking-tighter mb-4">Verificación Selfie</h2>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                      Imitá el gesto de tu foto <br /> para confirmar tu identidad.
                    </p>
                  </div>
                  <button 
                    onClick={completeVerification}
                    className="w-full bg-neon-cyan text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs neon-glow-cyan"
                  >
                    Tomar Foto
                  </button>
                </motion.div>
              )}

              {verificationStep === 2 && (
                <div className="space-y-6">
                  <Flame className="w-20 h-20 text-neon-cyan mx-auto animate-bounce" />
                  <h3 className="text-xl font-black uppercase tracking-widest">Comparando con IA...</h3>
                </div>
              )}

              {verificationStep === 3 && (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="space-y-8">
                  <div className="w-24 h-24 bg-neon-cyan rounded-full mx-auto flex items-center justify-center neon-glow-cyan">
                    <Check className="w-12 h-12 text-black" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black italic uppercase italic tracking-tighter mb-4 text-neon-cyan">¡VERIFICADO!</h2>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                      Tu perfil ahora tiene <br /> la insignia oficial de JAMBOO.
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsVerifying(false)}
                    className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs"
                  >
                    Volver a mi perfil
                  </button>
                </motion.div>
              )}
            </div>
            {verificationStep === 1 && (
              <button onClick={() => setIsVerifying(false)} className="text-gray-600 font-black uppercase text-[10px] tracking-widest py-8">
                Cancelar
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Navigation />
      
      <style jsx>{`
        @keyframes scan {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  )
}
