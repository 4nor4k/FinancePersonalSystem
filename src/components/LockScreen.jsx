import { useState } from 'react'
import { IconFingerprint, IconLock } from '@tabler/icons-react'
import { verificarBiometria } from '../lib/biometria'

export default function LockScreen({ onUnlock }) {
  const [erro, setErro] = useState(false)
  const [tentando, setTentando] = useState(false)

  async function handleDesbloquear() {
    setErro(false)
    setTentando(true)
    try {
      const ok = await verificarBiometria()
      if (ok) onUnlock()
      else setErro(true)
    } catch {
      setErro(true)
    }
    setTentando(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 max-w-sm mx-auto text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'var(--accent-bg)' }}>
        <IconLock size={26} style={{ color: 'var(--accent-color)' }} />
      </div>
      <p className="text-sm font-medium mb-1.5">Financeiro bloqueado</p>
      <p className="text-xs text-text-secondary mb-8">Use a biometria do aparelho pra continuar</p>

      <button
        onClick={handleDesbloquear}
        disabled={tentando}
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'var(--accent-color)', opacity: tentando ? 0.6 : 1 }}
      >
        <IconFingerprint size={28} color="#1a0d05" />
      </button>

      {erro && <p className="text-xs" style={{ color: '#e2716f' }}>Não foi possível verificar. Toca de novo pra tentar.</p>}
    </div>
  )
}
