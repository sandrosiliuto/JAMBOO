import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import UploadForm from '@/components/UploadForm'

export default async function UploadPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/upload')

  return (
    <section className="max-w-md mx-auto mt-8 space-y-4">
      <h1 className="text-2xl font-bold">Sube una foto</h1>
      <UploadForm userId={user.id} />
    </section>
  )
}
