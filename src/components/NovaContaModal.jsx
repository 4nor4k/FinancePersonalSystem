import { useState } from 'react'
import Overlay from './Overlay'

const CORES = ['#ff8a3d', '#d9b56a', '#7fd88f', '#6ab8d9', '#a892e0', '#8a8a87']
const ICONES = ['ti-building-bank', 'ti-pig-money', 'ti-credit-card', 'ti-cash', 'ti-wallet', 'ti-coin']

export default function NovaContaModal({ onClose, onCreated, addConta }) {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('comum')
  const [limite, setLimite] = useState('')
  const [icone, setIcone] = useState(ICONES[0])
  const [cor, setCor] = useState(CORES[0])

  async function handleCriar() {
    if (!nome.trim()) return
    const nova = await addConta({
      nome,
      tipo,
      limite: tipo === 'cartao_credito' ? Number(limite) || 0 : null,
      icone,
      cor,
    })
    onCreated?.(nova)
    onClose()
  }

  return (
    <Overlay onClose={onClose}>
      <p className="text-sm font-medium text-center mb-4">Nova conta</p>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome da conta"
        className="w-full bg-bg-raised rounded-lg px-3 py-3 text-sm outline-none mb-3 placeholder:text-text-muted"
      />
      <div className="flex gap-1.5 bg-bg-raised rounded-full p-1 mb-3">
        {['comum', 'cartao_credito'].map((t) => (
          <button
            key={t}
            onClick={() => setTipo(t)}
            className="flex-1 text-center text-xs py-2 rounded-full"
            style={t === tipo ? { background: '#333331', color: '#f0f0ee', fontWeight: 500 } : { color: '#8a8a87' }}
          >
            {t === 'comum' ? 'Comum' : 'Cartão de crédito'}
          </button>
        ))}
      </div>
      {tipo === 'cartao_credito' && (
        <input
          value={limite}
          onChange={(e) => setLimite(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="Limite (ex: 2000)"
          inputMode="numeric"
          className="w-full bg-bg-raised rounded-lg px-3 py-3 text-sm outline-none mb-3 placeholder:text-text-muted"
        />
      )}
      <p className="text-[11px] text-text-muted mb-1.5">Ícone</p>
      <div className="grid grid-cols-6 gap-2 mb-3">
        {ICONES.map((ic) => (
          <button
            key={ic}
            onClick={() => setIcone(ic)}
            className="aspect-square rounded-lg flex items-center justify-center"
            style={{ background: ic === icone ? '#232323' : '#1a1a1a' }}
          >
            <i className={`ti ${ic}`} style={{ fontSize: 16, color: ic === icone ? '#e5e5e3' : '#8a8a87' }} />
          </button>
        ))}
      </div>
      <p className="text-[11px] text-text-muted mb-1.5">Cor</p>
      <div className="flex gap-2 mb-5">
        {CORES.map((c) => (
          <button
            key={c}
            onClick={() => setCor(c)}
            className="w-7 h-7 rounded-full"
            style={{ background: c, border: c === cor ? '2px solid #e5e5e3' : '2px solid transparent' }}
          />
        ))}
      </div>
      <button onClick={handleCriar} className="w-full rounded-lg py-3 text-sm font-medium" style={{ background: '#e5e5e3', color: '#0a0a0a' }}>
        Criar conta
      </button>
    </Overlay>
  )
}
