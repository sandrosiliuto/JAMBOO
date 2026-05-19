import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://njwzdaqzaquvtrqjjnoz.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qd3pkYXF6YXF1dnRycWpqbm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NzM1MjgsImV4cCI6MjA5NDM0OTUyOH0.O0x45pjiUTh64C10ia-LBlV9rhUijqCqi5DrtDokQYM'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
