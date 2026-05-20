import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Si no hay env vars, no rompemos el middleware: solo seguimos sin sesión.
  if (!url || !key) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[middleware] Falta NEXT_PUBLIC_SUPABASE_URL o _ANON_KEY. Sesión no se refrescará.',
      )
    }
    return NextResponse.next({ request: { headers: request.headers } })
  }

  let response = NextResponse.next({ request: { headers: request.headers } })

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    })

    // Importante: hay que LLAMAR a getUser() para que se refresque el token.
    await supabase.auth.getUser()
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[middleware] Error al refrescar sesión:', e)
    }
  }

  return response
}
