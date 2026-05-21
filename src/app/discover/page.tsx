import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase-server'
import SwipeDeck from '@/components/SwipeDeck'

export const dynamic = 'force-dynamic'

export default async function DiscoverPage() {
  const cookieStore = await cookies()
  const currentUserId = cookieStore.get('party_user_id')?.value
  if (!currentUserId) redirect('/')

  const supabase = createServiceClient()

  // IDs ya swipeados por el usuario actual
  const { data: swipes } = await supabase
    .from('swipes')
    .select('swiped_id')
    .eq('swiper_id', currentUserId)

  const swipedIds = (swipes ?? []).map((s) => s.swiped_id)

  // Usuarios que aún no ha visto (sin teléfono)
  let query = supabase
    .from('party_users')
    .select('id, name, photo_url')
    .neq('id', currentUserId)
    .order('created_at', { ascending: false })

  if (swipedIds.length > 0) {
    query = query.not('id', 'in', `(${swipedIds.join(',')})`)
  }

  const { data: users } = await query

  // Nombre del usuario actual para el header
  const { data: me } = await supabase
    .from('party_users')
    .select('name')
    .eq('id', currentUserId)
    .single()

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
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

      {/* Deck */}
      <div className="flex-1 overflow-hidden">
        <SwipeDeck users={users ?? []} currentUserId={currentUserId} />
      </div>
    </div>
  )
}
