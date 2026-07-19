import { useState } from 'react'
import Overlay from './Overlay'
import ColorPicker from './ColorPicker'
import { COR_PADRAO } from '../lib/colors'
import { digitsToCurrencyDisplay, currencyDisplayToNumber } from '../lib/format'

const ICONES = [
  'ti-building-bank', 'ti-pig-money', 'ti-credit-card', 'ti-cash', 'ti-wallet', 'ti-coin',
  'ti-currency-dollar', 'ti-receipt', 'ti-building', 'ti-report-money', 'ti-safe', 'ti-currency-real',
]

export default function NovaContaModal({ onClose, onCreated, addConta }) {
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('comum')
  const [limite, setLimite] = useState('')
  const [icone, setIcone] = useState(ICONES[0])
  const [cor, setCor] = useState(COR_PADRAO)

  async function handleCriar() {
    if (!nome.trim()) return
    const nova = await addConta({
      nome,
      tipo,
      limite: tipo === 'cartao_credito' ? currencyDisplayToNumber(limite) : null,
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
          onChange={(e) => setLimite(digitsToCurrencyDisplay(e.target.value))}
          placeholder="Limite (ex: 2.000,00)"
          inputMode="numeric"
          className="w-full bg-bg-raised rounded-lg px-3 py-3 text-sm outline-none mb-3 placeholder:text-text-muted"
        />
      )}
      <p className="text-[11px] text-text-muted mb-1.5">Ícone</p>
      <div className="grid grid-cols-6 gap-2 mb-4">
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
      <ColorPicker value={cor} onChange={setCor} />
      <button onClick={handleCriar} className="w-full rounded-lg py-3 text-sm font-medium mt-4" style={{ background: '#e5e5e3', color: '#0a0a0a' }}>
        Criar conta
      </button>
    </Overlay>
  )
}
