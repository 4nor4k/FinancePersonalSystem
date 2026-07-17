import { createClient } from '@supabase/supabase-js'

// Essas duas variáveis vêm do .env (local) ou das variáveis de ambiente
// configuradas na Vercel. Nunca colocamos os valores direto aqui no código.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase não configurado ainda: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
