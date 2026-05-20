import Link from 'next/link'

export default function AuthCodeError({
  searchParams,
}: {
  searchParams: { reason?: string }
}) {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">El enlace ya no es válido</h1>
        <p className="text-neutral-400">
          El magic link puede haber expirado o ya haber sido usado. Pide uno nuevo.
        </p>
        {searchParams.reason && (
          <p className="text-xs text-neutral-500 font-mono break-all">
            {searchParams.reason}
          </p>
        )}
        <Link
          href="/login"
          className="inline-block bg-white text-black font-semibold px-6 py-3 rounded-xl"
        >
          Volver a login
        </Link>
      </div>
    </main>
  )
}
