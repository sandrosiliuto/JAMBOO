# JAMBOO Match 🔥

App de citas con estética neon brutalista. Swipe, match y chat en tiempo real.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (Auth, Database, Storage, Realtime)
- **Tailwind CSS v4**
- **Framer Motion**

## Setup Local

1. Clona el repo e instala dependencias:
```bash
npm install
```

2. Copia el archivo de entorno:
```bash
cp .env.example .env.local
```

3. Rellena las variables en `.env.local` con tus credenciales de Supabase.

4. Arranca el servidor de desarrollo:
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Variables de Entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon pública de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service role (solo backend) |

## Deploy en Vercel

Ver `DEPLOY.md` para instrucciones completas.
