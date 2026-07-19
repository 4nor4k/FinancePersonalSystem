import { useState } from 'react'
import { IconTrash, IconCheck } from '@tabler/icons-react'
import { getPaleta, addCorPaleta, removeCorPaleta } from '../lib/colors'
import ColorWheel from './ColorWheel'

export default function ColorPicker({ value, onChange }) {
  const [paleta, setPaleta] = useState(getPaleta())
  const [removendo, setRemovendo] = useState(false)
  const [salvo, setSalvo] = useState(false)

  function handleSalvarCor() {
    addCorPaleta(value)
    setPaleta(getPaleta())
    setSalvo(true)
    setTimeout(() => setSalvo(false), 1200)
  }

  function handleRemoverDaPaleta(cor) {
    removeCorPaleta(cor)
    setPaleta(getPaleta())
  }

  return (
    <div>
      <div className="flex justify-center mb-3">
        <ColorWheel value={value} onChange={onChange} />
      </div>
      <p className="text-xs font-mono text-text-secondary text-center mb-3">{value}</p>

      <button
        onClick={handleSalvarCor}
        className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium mb-4"
        style={{ background: salvo ? '#1e2e24' : 'var(--accent-bg)', color: salvo ? '#7fd88f' : 'var(--accent-color)' }}
      >
        {salvo ? <IconCheck size={14} /> : null}
        {salvo ? 'Cor salva na paleta' : 'Salvar cor na paleta'}
      </button>

      {paleta.length > 0 && (
        <div className="mb-1">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] text-text-muted">Sua paleta</p>
            <button onClick={() => setRemovendo((v) => !v)} className="text-[10px] text-text-muted">
              {removendo ? 'concluir' : 'excluir cores'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {paleta.map((cor) => (
              <button
                key={cor}
                onClick={() => (removendo ? handleRemoverDaPaleta(cor) : onChange(cor))}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: removendo ? '#1e1414' : cor, border: cor === value && !removendo ? '2px solid #e5e5e3' : '2px solid transparent' }}
              >
                {removendo && <IconTrash size={12} color="#e2716f" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
