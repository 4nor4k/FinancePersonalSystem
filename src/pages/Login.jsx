import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { IconWallet } from '@tabler/icons-react'

export default function Login() {
  const { enterDemo } = useAuth()
  const [mode, setMode] = useState('entrar') // 'entrar' | 'criar'
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    const action =
      mode === 'entrar'
        ? supabase.auth.signInWithPassword({ email, password: senha })
        : supabase.auth.signUp({ email, password: senha })
    const { error } = await action
    if (error) setErro(error.message)
    setCarregando(false)
  }

  return (
    <div className="noise-bg min-h-screen flex flex-col justify-center px-6 max-w-sm mx-auto">
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: 'var(--accent-bg)' }}
        >
          <IconWallet size={26} style={{ color: 'var(--accent-color)' }} />
        </div>
        <h1 className="text-lg font-medium">Financeiro</h1>
        <p className="text-xs text-text-secondary mt-1">Pessoal e empresa, no mesmo lugar</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-4">
        <input
          type="email"
          required
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-bg-card rounded-xl px-4 py-3 text-sm outline-none placeholder:text-text-muted"
        />
        <input
          type="password"
          required
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="bg-bg-card rounded-xl px-4 py-3 text-sm outline-none placeholder:text-text-muted"
        />

        {erro && <p className="text-xs text-red-400">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="rounded-xl py-3 text-sm font-medium mt-1"
          style={{ background: 'var(--accent-color)', color: '#1a0d05' }}
        >
          {carregando ? 'Aguarde...' : mode === 'entrar' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === 'entrar' ? 'criar' : 'entrar')}
        className="text-xs text-text-secondary mb-8"
      >
        {mode === 'entrar' ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-px bg-bg-card flex-1" />
        <span className="text-[11px] text-text-muted">ou</span>
        <div className="h-px bg-bg-card flex-1" />
      </div>

      <button
        onClick={enterDemo}
        className="bg-bg-card rounded-xl py-3 text-sm text-text-primary font-medium"
      >
        Visualizar modo demo
      </button>
      <p className="text-[11px] text-text-muted text-center mt-2">
        Explore o app com dados de exemplo, sem criar conta
      </p>
    </div>
  )
}
