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

    const supabase = createServiceClient()
    let photoUrl: string | null = null

    // Subir foto si se proporcionó
    if (photo && photo.size > 0) {
      try {
        const bytes = await photo.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filename = `${crypto.randomUUID()}.jpg`

        const { error: uploadError } = await supabase.storage
          .from('party-photos')
          .upload(filename, buffer, {
            contentType: 'image/jpeg',
            cacheControl: '31536000',
            upsert: false,
          })

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('party-photos')
            .getPublicUrl(filename)
          photoUrl = publicUrl
        }
        // Si falla la foto, continuamos sin foto (no bloqueamos el registro)
      } catch { /* upload error no fatal */ }
    }

    // Insertar usuario
    const { data: user, error } = await supabase
      .from('party_users')
      .insert({ name, phone, photo_url: photoUrl })
      .select('id, name, photo_url')
      .single()

    if (error) {
      console.error('DB insert error:', error)
      return NextResponse.json(
        { error: `Error de base de datos: ${error.message}` },
        { status: 500 },
      )
    }

    // Setear cookie de sesión (8 horas — una noche)
    const response = NextResponse.json({ user })
    response.cookies.set('party_user_id', user.id, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })
    return response
  } catch (err) {
    console.error('Register fatal error:', err)
    const message = err instanceof Error ? err.message : 'Error interno del servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
