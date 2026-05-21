# JAMBOO Fiesta 🎉

App para conocer gente en la fiesta: swipe, match y chat por WhatsApp — todo en una noche.

## Stack
- **Next.js 15** (App Router, TypeScript)
- **Supabase** (PostgreSQL + Storage)
- **Tailwind CSS v4** + **Framer Motion** + **canvas-confetti**

## Setup local

```bash
cp .env.example .env.local
# Rellena las variables con tus credenciales de Supabase
npm install
npm run dev
```

## Variables de entorno

| Variable | Dónde encontrarla |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role |
| `ADMIN_PASSWORD` | Elige una contraseña para el panel `/admin` |

## Base de datos

Ejecuta los tres archivos en orden en el **SQL Editor de Supabase**:

1. `sql/001_schema.sql` — tablas y trigger
2. `sql/002_rls.sql` — políticas RLS
3. `sql/003_storage.sql` — políticas del bucket (crea el bucket `party-photos` primero con **Public: ON**)

## Despliegue en Vercel

1. Conecta el repo `sandrosiliuto/JAMBOO` en [vercel.com/new](https://vercel.com/new)
2. Framework: **Next.js** (detectado automáticamente)
3. Agrega las 4 variables de entorno en **Settings → Environment Variables**
4. Haz clic en **Deploy**

## Rutas

| Ruta | Descripción |
|---|---|
| `/` | Registro: nombre, foto, WhatsApp |
| `/discover` | Deck de swipe — requiere registro |
| `/admin` | Panel del organizador — protegido por contraseña |

## Privacidad

- El número de WhatsApp **nunca** se expone en selects públicos (RLS).
- Solo se revela en el momento exacto del match, vía API route con service role.
- El organizador puede borrar todos los datos desde `/admin` al terminar la noche.
