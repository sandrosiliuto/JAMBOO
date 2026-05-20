import { createClient } from '@/lib/supabase-server'
import PhotoCard from '@/components/PhotoCard'

export const revalidate = 0 // siempre fresco

export default async function HomePage() {
  const supabase = await createClient()

  // Modo visita: cualquiera puede leer (RLS lo permite)
  const { data: photos, error } = await supabase
    .from('photos_with_stats')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(60)

  // Saber qué fotos ha likeado el usuario actual (si está logueado)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let likedIds = new Set<string>()
  if (user && photos?.length) {
    const { data: myLikes } = await supabase
      .from('likes')
      .select('photo_id')
      .eq('user_id', user.id)
      .in(
        'photo_id',
        photos.map((p) => p.id),
      )
    likedIds = new Set((myLikes ?? []).map((l) => l.photo_id))
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Error cargando fotos: {error.message}
      </div>
    )
  }

  if (!photos?.length) {
    return (
      <div className="p-12 text-center text-neutral-400">
        <h1 className="text-2xl font-bold mb-2 text-neutral-200">
          Aún no hay fotos
        </h1>
        <p>¡Sé el primero en subir una!</p>
      </div>
    )
  }

  return (
    <section>
      <h1 className="text-3xl font-bold my-4">La fiesta</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {photos.map((p) => (
          <PhotoCard
            key={p.id}
            photo={p}
            initiallyLiked={likedIds.has(p.id)}
            isLoggedIn={!!user}
          />
        ))}
      </div>
    </section>
  )
}
