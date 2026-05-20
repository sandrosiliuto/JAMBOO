import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import ProfileForm from '@/components/ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/profile')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <section className="max-w-md mx-auto mt-8 space-y-4">
      <h1 className="text-2xl font-bold">Mi perfil</h1>
      <ProfileForm
        userId={user.id}
        initialName={profile?.name ?? ''}
        initialAvatarUrl={profile?.avatar_url ?? null}
      />
    </section>
  )
}
