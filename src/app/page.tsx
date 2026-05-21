import RegisterForm from '@/components/RegisterForm'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-black text-gradient">JAMBOO</h1>
        <p className="text-neutral-400 mt-1 text-sm tracking-widest uppercase">
          La fiesta empieza aquí
        </p>
      </div>

      <RegisterForm />

      <p className="mt-8 text-xs text-neutral-600 text-center max-w-xs">
        Tus datos solo se usan esta noche y se eliminan al terminar el evento.
      </p>
    </main>
  )
}
