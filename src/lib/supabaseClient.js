import { createClient } from '@supabase/supabase-js'

// Essas duas variáveis vêm do .env (local) ou das variáveis de ambiente
// configuradas na Vercel. Nunca colocamos os valores direto aqui no código.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase não configurado ainda: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. O modo demo continua funcionando normalmente, mas login/cadastro reais não vão funcionar até isso ser configurado.'
  )
}

// Se as variáveis não estiverem definidas, usamos valores de placeholder
// só pra createClient não travar o app inteiro (o que apareceria como tela
// preta/branca em branco). O modo demo não depende disso pra funcionar.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)
