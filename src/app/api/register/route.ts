import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const formData = await req.formData()
  const name = (formData.get('name') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const photo = formData.get('photo') as File | null

  if (!name || !phone) {
    return NextResponse.json({ error: 'name and phone are required' }, { status: 400 })
  }

  const supabase = createServiceClient()
  let photoUrl: string | null = null

  // Subir foto si se proporcionó
  if (photo && photo.size > 0) {
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
      const {
        data: { publicUrl },
      } = supabase.storage.from('party-photos').getPublicUrl(filename)
      photoUrl = publicUrl
    }
  }

  // Insertar usuario
  const { data: user, error } = await supabase
    .from('party_users')
    .insert({ name, phone, photo_url: photoUrl })
    .select('id, name, photo_url')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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
}
