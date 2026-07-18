import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { IconMailCheck } from '@tabler/icons-react'
import logo from '../assets/logo.svg'

const EMAIL_KEY = 'financeiro:last-email'

export default function Login() {
  const { enterDemo } = useAuth()
  const [mode, setMode] = useState('entrar') // 'entrar' | 'criar'
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_KEY) || '')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [cadastroEnviado, setCadastroEnviado] = useState(false)

  function handleEmailChange(v) {
    setEmail(v)
    localStorage.setItem(EMAIL_KEY, v)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    const action =
      mode === 'entrar'
        ? supabase.auth.signInWithPassword({ email, password: senha })
        : supabase.auth.signUp({ email, password: senha })
    const { error } = await action
    setCarregando(false)
    if (error) {
      setErro(error.message)
      return
    }
    if (mode === 'criar') {
      setCadastroEnviado(true)
    }
  }

  if (cadastroEnviado) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-6 max-w-sm mx-auto text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'var(--accent-bg)' }}
        >
          <IconMailCheck size={26} style={{ color: 'var(--accent-color)' }} />
        </div>
        <h1 className="text-lg font-medium mb-2">Confirme seu email</h1>
        <p className="text-sm text-text-secondary mb-1">Enviamos um link de confirmação para</p>
        <p className="text-sm font-medium mb-6">{email}</p>
        <p className="text-xs text-text-muted mb-8">
          Verifique sua caixa de entrada (e a pasta de spam) e toque no link pra ativar sua conta.
        </p>
        <button
          onClick={() => {
            setCadastroEnviado(false)
            setMode('entrar')
          }}
          className="text-xs text-text-secondary"
        >
          Voltar pro login
        </button>
      </div>
    )
  }

  return (
    <div className="noise-bg min-h-screen flex flex-col justify-center px-6 max-w-sm mx-auto">
      <div className="flex flex-col items-center mb-8">
        <img src={logo} alt="Financeiro" className="w-14 h-14 mb-3" />
        <h1 className="text-lg font-medium">Financeiro</h1>
        <p className="text-xs text-text-secondary mt-1">Pessoal e empresa, no mesmo lugar</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-4">
        <input
          type="email"
          required
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          className="bg-bg-card rounded-xl px-4 py-3 text-sm outline-none placeholder:text-text-muted"
        />
        <input
          type="password"
          inputMode="numeric"
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
