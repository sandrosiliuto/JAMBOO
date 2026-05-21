import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const name = (formData.get('name') as string)?.trim()
    const phone = (formData.get('phone') as string)?.trim()
    const photo = formData.get('photo') as File | null

    if (!name || !phone) {
      return NextResponse.json({ error: 'Nombre y teléfono son obligatorios' }, { status: 400 })
    }

    // ── DEMO MODE (sin variables de entorno) ──────────────────────
    const isDemoMode =
      !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY
    if (isDemoMode) {
      const id = `demo-${crypto.randomUUID()}`
      const response = NextResponse.json({ user: { id, name, photo_url: null } })
      response.cookies.set('party_user_id', id, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 8,
        path: '/',
      })
      return response
    }
    // ─────────────────────────────────────────────────────────────

    const supabase = createServiceClient()
    let photoUrl: string | null = null

    if (photo && photo.size > 0) {
      try {
        const bytes = await photo.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filename = `${crypto.randomUUID()}.jpg`
        const { error: uploadError } = await supabase.storage
          .from('party-photos')
          .upload(filename, buffer, { contentType: 'image/jpeg', cacheControl: '31536000' })
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('party-photos').getPublicUrl(filename)
          photoUrl = publicUrl
        }
      } catch { /* foto no bloqueante */ }
    }

    const { data: user, error } = await supabase
      .from('party_users')
      .insert({ name, phone, photo_url: photoUrl })
      .select('id, name, photo_url')
      .single()

    if (error) {
      return NextResponse.json({ error: `DB: ${error.message}` }, { status: 500 })
    }

    const response = NextResponse.json({ user })
    response.cookies.set('party_user_id', user.id, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })
    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
