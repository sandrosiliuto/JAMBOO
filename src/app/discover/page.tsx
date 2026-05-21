import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase-server'
import SwipeDeck from '@/components/SwipeDeck'

export const dynamic = 'force-dynamic'

// Perfiles de demo para preview sin Supabase
const DEMO_USERS = [
  { id: 'demo-p1', name: 'María 💃', photo_url: null },
  { id: 'demo-p2', name: 'Carlos 🎸', photo_url: null },
  { id: 'demo-p3', name: 'Ana 🌟', photo_url: null },
  { id: 'demo-p4', name: 'Javier 🎉', photo_url: null },
  { id: 'demo-p5', name: 'Sofía 🦋', photo_url: null },
]

export default async function DiscoverPage() {
  const cookieStore = await cookies()
  const currentUserId = cookieStore.get('party_user_id')?.value
  if (!currentUserId) redirect('/')

  const isDemoMode =
    !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY

  // ── DEMO MODE ─────────────────────────────────────────────────
  if (isDemoMode) {
    const myName = cookieStore.get('party_user_name')?.value ?? 'tú'
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a50]">
          <span className="font-black text-xl text-gradient">JAMBOO</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-400">Hola, {myName}</span>
            <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 px-2 py-0.5 rounded-full">
              ⚡ Demo
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <SwipeDeck users={DEMO_USERS} currentUserId={currentUserId} isDemo />
        </div>
      </div>
    )
  }
  // ──────────────────────────────────────────────────────────────

  const supabase = createServiceClient()

  const { data: swipes } = await supabase
    .from('swipes')
    .select('swiped_id')
    .eq('swiper_id', currentUserId)

  const swipedIds = (swipes ?? []).map((s) => s.swiped_id)

  let query = supabase
    .from('party_users')
    .select('id, name, photo_url')
    .neq('id', currentUserId)
    .order('created_at', { ascending: false })

  if (swipedIds.length > 0) {
    query = query.not('id', 'in', `(${swipedIds.join(',')})`)
  }

  const { data: users } = await query

  const { data: me } = await supabase
    .from('party_users')
    .select('name')
    .eq('id', currentUserId)
    .single()

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a50]">
        <span className="font-black text-xl text-gradient">JAMBOO</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-400">Hola, {me?.name ?? '...'}</span>
          <form action="/api/logout" method="post">
            <button className="text-xs text-neutral-600 hover:text-neutral-300 transition">
              Salir
            </button>
          </form>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <SwipeDeck users={users ?? []} currentUserId={currentUserId} />
      </div>
    </div>
  )
}
