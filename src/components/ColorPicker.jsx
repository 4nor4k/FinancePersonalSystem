import { useState } from 'react'
import { IconTrash } from '@tabler/icons-react'
import { getPaleta, addCorPaleta, removeCorPaleta } from '../lib/colors'
import ColorWheel from './ColorWheel'

export default function ColorPicker({ value, onChange }) {
  const [paleta, setPaleta] = useState(getPaleta())
  const [adicionarPaleta, setAdicionarPaleta] = useState(true)
  const [removendo, setRemovendo] = useState(false)
  const [corAtual, setCorAtual] = useState(value)

  function handleCommit() {
    if (adicionarPaleta) {
      addCorPaleta(corAtual)
      setPaleta(getPaleta())
    }
  }

  function handleRemoverDaPaleta(cor) {
    removeCorPaleta(cor)
    setPaleta(getPaleta())
  }

  function handleChange(cor) {
    setCorAtual(cor)
    onChange(cor)
  }

  return (
    <div>
      <div className="flex justify-center mb-3">
        <ColorWheel value={value} onChange={handleChange} onCommit={handleCommit} />
      </div>
      <p className="text-xs font-mono text-text-secondary text-center mb-3">{corAtual}</p>

      <label className="flex items-center justify-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={adicionarPaleta}
          onChange={(e) => setAdicionarPaleta(e.target.checked)}
          className="w-3.5 h-3.5"
        />
        <span className="text-[11px] text-text-secondary">Adicionar essa cor à paleta ao soltar</span>
      </label>

      {paleta.length > 0 && (
        <div className="mb-1">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] text-text-muted">Sua paleta</p>
            <button onClick={() => setRemovendo((v) => !v)} className="text-[10px] text-text-muted">
              {removendo ? 'concluir' : 'editar'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {paleta.map((cor) => (
              <div key={cor} className="relative">
                <button
                  onClick={() => (removendo ? handleRemoverDaPaleta(cor) : handleChange(cor))}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: removendo ? '#1e1414' : cor, border: cor === value && !removendo ? '2px solid #e5e5e3' : '2px solid transparent' }}
                >
                  {removendo && <IconTrash size={12} color="#e2716f" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
