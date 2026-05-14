'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Instagram, User, Heart, ChevronRight, Check, Flame } from 'lucide-react'
import { createClient } from '@/src/lib/supabase'
import { useRouter } from 'next/navigation'

const PURPOSES = [
  { id: 'Algo serio', label: 'Algo serio', icon: '💎' },
  { id: 'Algo casual', label: 'Algo casual', icon: '🔥' },
  { id: 'Amistad', label: 'Amistad', icon: '🤝' },
]

const GENDERS = [
  { id: 'Hombres', label: 'Hombres' },
  { id: 'Mujeres', label: 'Mujeres' },
  { id: 'Todos', label: 'Todos' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    nickname: '',
    instagram: '',
    bio: '',
    gender_preference: 'Todos',
    purpose: 'Algo casual',
    age_min: 18,
    age_max: 40,
  })

  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) router.push('/')
    }
    checkAuth()
  }, [router, supabase])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      let photoUrl = ''
      if (photo) {
        const fileExt = photo.name.split('.').pop()
        const fileName = `${session.user.id}-${Math.random()}.${fileExt}`
        const { data, error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, photo)

        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName)
        
        photoUrl = publicUrl
      }

      // 1. Create Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          nickname: formData.nickname,
          instagram_username: formData.instagram.replace('@', ''),
          bio: formData.bio,
          gender_preference: formData.gender_preference,
          purpose: formData.purpose,
          // age_range_preference: `[${formData.age_min},${formData.age_max}]`, // Postgres range type
        })

      if (profileError) throw profileError

      // 2. Add Primary Photo
      if (photoUrl) {
        await supabase.from('user_photos').insert({
          user_id: session.user.id,
          photo_url: photoUrl,
          is_primary: true
        })
      }

      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      alert('Error al guardar el perfil. Revisá la consola.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 flex flex-col pt-12">
      <div className="flex justify-between items-center mb-12">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all ${step >= s ? 'w-8 bg-neon-cyan' : 'w-4 bg-white/10'}`} 
            />
          ))}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Paso {step}/3</span>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1"
          >
            <h1 className="text-4xl font-black italic mb-2 tracking-tighter uppercase">Lo básico</h1>
            <p className="text-gray-500 text-xs mb-8 uppercase tracking-widest font-bold">Contanos quién sos</p>

            <div className="space-y-8">
              <div className="flex justify-center">
                <div 
                  className="relative w-40 h-40 rounded-[32px] border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5 cursor-pointer overflow-hidden group"
                  onClick={() => document.getElementById('photo-input')?.click()}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-10 h-10 text-white/20 group-hover:text-neon-cyan transition-colors" />
                  )}
                  <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] font-black uppercase tracking-widest">Cambiar</span>
                  </div>
                  <input id="photo-input" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-2">Apodo</label>
                  <input 
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                    placeholder="Ej: Alex"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-neon-cyan outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-2">Instagram</label>
                  <div className="relative">
                    <Instagram className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="text"
                      value={formData.instagram}
                      onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                      placeholder="@usuario"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-14 py-4 focus:border-neon-cyan outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                disabled={!formData.nickname || !formData.instagram || !photo}
                className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                Continuar <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1"
          >
            <h1 className="text-4xl font-black italic mb-2 tracking-tighter uppercase">Qué buscás</h1>
            <p className="text-gray-500 text-xs mb-8 uppercase tracking-widest font-bold">Definamos el vibe</p>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-2">Me interesa conocer...</label>
                <div className="grid grid-cols-3 gap-3">
                  {GENDERS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setFormData({...formData, gender_preference: g.id})}
                      className={`py-6 rounded-2xl border transition-all text-xs font-black uppercase tracking-tighter ${formData.gender_preference === g.id ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan' : 'border-white/5 bg-white/5 text-white/40'}`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-2">Propósito</label>
                <div className="space-y-3">
                  {PURPOSES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setFormData({...formData, purpose: p.id})}
                      className={`w-full p-5 rounded-2xl border transition-all flex items-center justify-between ${formData.purpose === p.id ? 'border-neon-fuchsia bg-neon-fuchsia/10 text-neon-fuchsia' : 'border-white/5 bg-white/5 text-white/40'}`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-2xl">{p.icon}</span>
                        <span className="text-sm font-black uppercase tracking-widest">{p.label}</span>
                      </span>
                      {formData.purpose === p.id && <Check className="w-5 h-5" />}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setStep(3)}
                className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 group"
              >
                Casi listo <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1"
          >
            <h1 className="text-4xl font-black italic mb-2 tracking-tighter uppercase">Un toque más</h1>
            <p className="text-gray-500 text-xs mb-8 uppercase tracking-widest font-bold">Bio y confirmación</p>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-2">Sobre vos</label>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Contanos algo interesante..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-neon-cyan outline-none transition-all resize-none text-sm"
                />
              </div>

              <div className="glass-card p-6 rounded-[32px] space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-neon-cyan">Resumen de tu vibe</h3>
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-wider">{formData.purpose}</div>
                  <div className="px-3 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-wider">{formData.gender_preference}</div>
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-neon-cyan text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 neon-glow-cyan disabled:opacity-50"
              >
                {loading ? 'Preparando todo...' : '¡A swappear!'} <Flame className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
