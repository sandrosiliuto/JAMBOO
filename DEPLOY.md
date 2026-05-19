# 🚀 Guía de Deploy: GitHub + Vercel

## Paso 1 — Subir a GitHub

### Si es tu primer repositorio:

```bash
# 1. Inicializa el repositorio
git init

# 2. Añade todos los archivos
git add .

# 3. Primer commit
git commit -m "feat: initial commit - JAMBOO Match"

# 4. Crea el repo en GitHub (sin README, sin .gitignore)
# Ve a https://github.com/new → crea repo vacío llamado "jamboomatch"

# 5. Conecta y sube
git remote add origin https://github.com/TU_USUARIO/jamboomatch.git
git branch -M main
git push -u origin main
```

### Si ya tienes el repo:

```bash
git add .
git commit -m "fix: clean dependencies and Next.js config"
git push
```

---

## Paso 2 — Configurar Vercel

### Opción A: Desde la web (recomendado)

1. Ve a **https://vercel.com** e inicia sesión con tu cuenta de GitHub.
2. Pulsa **"Add New… → Project"**.
3. Selecciona el repositorio **jamboomatch**.
4. Vercel detecta automáticamente que es un proyecto Next.js.
5. **MUY IMPORTANTE** — Antes de hacer deploy, añade las variables de entorno:

| Nombre | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Tu URL de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu clave anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Tu clave service role |

6. Pulsa **Deploy** ✅

### Opción B: Desde la CLI

```bash
# Instala Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy desde la raíz del proyecto
vercel

# Para producción
vercel --prod
```

---

## Paso 3 — Configurar Supabase para el dominio de Vercel

Una vez que Vercel te dé la URL (ej: `https://jamboomatch.vercel.app`):

1. Ve a tu proyecto en **https://supabase.com/dashboard**
2. **Authentication → URL Configuration**
3. Añade en **Site URL**: `https://jamboomatch.vercel.app`
4. Añade en **Redirect URLs**: `https://jamboomatch.vercel.app/auth/callback`

Sin esto, el magic link de email no funciona.

---

## Paso 4 — Deploy automático

A partir de ahora, cada `git push` a `main` triggerea un deploy automático en Vercel. 🎉

---

## Esquema de Base de Datos Supabase

Ejecuta este SQL en el **SQL Editor** de Supabase:

```sql
-- Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  nickname text not null,
  instagram_username text,
  bio text,
  gender_preference text default 'Todos',
  purpose text default 'Algo casual',
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Photos
create table public.user_photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  photo_url text not null,
  is_primary boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Swipes
create table public.swipes (
  id uuid default gen_random_uuid() primary key,
  swiper_id uuid references public.profiles on delete cascade not null,
  swiped_id uuid references public.profiles on delete cascade not null,
  direction text check (direction in ('like', 'nope')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(swiper_id, swiped_id)
);

-- Matches
create table public.matches (
  id uuid default gen_random_uuid() primary key,
  user_id_1 uuid references public.profiles on delete cascade not null,
  user_id_2 uuid references public.profiles on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Messages
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches on delete cascade not null,
  sender_id uuid references public.profiles on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.user_photos enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;

-- Policies básicas
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile." on public.profiles for update using (auth.uid() = id);

create policy "Photos are viewable by everyone." on public.user_photos for select using (true);
create policy "Users can manage their own photos." on public.user_photos for all using (auth.uid() = user_id);

create policy "Users can manage their swipes." on public.swipes for all using (auth.uid() = swiper_id);
create policy "Users can view swipes on them." on public.swipes for select using (auth.uid() = swiped_id);

create policy "Users can view their matches." on public.matches for select using (auth.uid() = user_id_1 or auth.uid() = user_id_2);
create policy "System can insert matches." on public.matches for insert with check (auth.uid() = user_id_1);

create policy "Match users can view messages." on public.messages for select using (
  exists (select 1 from public.matches where id = match_id and (user_id_1 = auth.uid() or user_id_2 = auth.uid()))
);
create policy "Match users can send messages." on public.messages for insert with check (auth.uid() = sender_id);
```

### Storage bucket para fotos

En Supabase → **Storage → New bucket**:
- Name: `photos`
- Public: ✅ Activado

```sql
-- Policy para el bucket de fotos
create policy "Anyone can view photos" on storage.objects for select using (bucket_id = 'photos');
create policy "Authenticated users can upload photos" on storage.objects for insert with check (bucket_id = 'photos' and auth.role() = 'authenticated');
```
