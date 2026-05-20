import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// POST /api/likes  body: { photoId: string, like: boolean }
export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

  const { photoId, like } = (await req.json()) as { photoId: string; like: boolean }
  if (!photoId) return NextResponse.json({ error: 'photoId required' }, { status: 400 })

  if (like) {
    const { error } = await supabase
      .from('likes')
      .upsert({ user_id: user.id, photo_id: photoId }, { onConflict: 'user_id,photo_id' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('photo_id', photoId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
