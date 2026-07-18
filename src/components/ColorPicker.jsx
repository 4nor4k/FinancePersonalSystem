import { useState } from 'react'
import { IconTrash } from '@tabler/icons-react'
import { getPaleta, addCorPaleta, removeCorPaleta } from '../lib/colors'

export default function ColorPicker({ value, onChange }) {
  const [paleta, setPaleta] = useState(getPaleta())
  const [adicionarPaleta, setAdicionarPaleta] = useState(true)
  const [removendo, setRemovendo] = useState(false)

  function handlePickColor(cor) {
    onChange(cor)
    if (adicionarPaleta) {
      addCorPaleta(cor)
      setPaleta(getPaleta())
    }
  }

  function handleRemoverDaPaleta(cor) {
    removeCorPaleta(cor)
    setPaleta(getPaleta())
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <label className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer" style={{ background: value }}>
          <input
            type="color"
            value={value}
            onChange={(e) => handlePickColor(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </label>
        <div>
          <p className="text-[11px] text-text-muted">Toque no quadrado pra escolher qualquer cor</p>
          <p className="text-xs font-mono text-text-secondary mt-0.5">{value}</p>
        </div>
      </div>

      <label className="flex items-center gap-2 mb-3.5">
        <input
          type="checkbox"
          checked={adicionarPaleta}
          onChange={(e) => setAdicionarPaleta(e.target.checked)}
          className="w-3.5 h-3.5"
        />
        <span className="text-[11px] text-text-secondary">Adicionar essa cor à paleta ao escolher</span>
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
                  onClick={() => (removendo ? handleRemoverDaPaleta(cor) : onChange(cor))}
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
