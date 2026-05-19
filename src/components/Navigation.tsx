'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flame, MessageCircle, User, Heart } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', icon: Flame, label: 'Descubrir', href: '/dashboard' },
  { id: 'matches', icon: Heart, label: 'Matches', href: '/matches' },
  { id: 'chat', icon: MessageCircle, label: 'Chats', href: '/chat' },
  { id: 'profile', icon: User, label: 'Perfil', href: '/profile' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-24 bg-black/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-4 z-40">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link 
            key={item.id} 
            href={item.href}
            className={`flex flex-col items-center gap-1.5 transition-all ${isActive ? 'text-neon-cyan scale-110' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <item.icon className="w-6 h-6" />
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isActive ? 'opacity-100' : 'opacity-0'}`}>
              {item.label}
            </span>
            {isActive && (
              <div className="absolute -bottom-2 w-1 h-1 bg-neon-cyan rounded-full neon-glow-cyan" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
