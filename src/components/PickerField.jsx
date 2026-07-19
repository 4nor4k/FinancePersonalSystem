import { useState } from 'react'
import { IconChevronDown, IconCheck } from '@tabler/icons-react'
import Overlay from './Overlay'

export default function PickerField({ placeholder, options, value, onChange }) {
  const [aberto, setAberto] = useState(false)
  const selecionado = options.find((o) => o.id === value)

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="flex-1 bg-bg-card rounded-lg px-3 py-3 text-sm outline-none flex items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 truncate">
          {selecionado?.icone && (
            <i className={`ti ${selecionado.icone}`} style={{ fontSize: 14, color: selecionado.cor || '#8a8a87' }} />
          )}
          <span className={selecionado ? 'text-text-primary' : 'text-text-muted'}>
            {selecionado ? selecionado.nome : placeholder}
          </span>
        </span>
        <IconChevronDown size={15} className="text-text-secondary flex-shrink-0" />
      </button>

      {aberto && (
        <Overlay onClose={() => setAberto(false)}>
          <p className="text-sm font-medium text-center mb-4">{placeholder}</p>
          <div className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto">
            {options.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  onChange(o.id)
                  setAberto(false)
                }}
                className="flex items-center gap-2.5 px-2 py-3 rounded-lg text-left"
                style={{ background: o.id === value ? 'var(--accent-bg)' : 'transparent' }}
              >
                {o.icone && (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#1a1a1a' }}>
                    <i className={`ti ${o.icone}`} style={{ fontSize: 14, color: o.cor || '#8a8a87' }} />
                  </div>
                )}
                <span className="text-sm flex-1" style={{ color: o.id === value ? 'var(--accent-color)' : '#e5e5e3' }}>
                  {o.nome}
                </span>
                {o.id === value && <IconCheck size={16} style={{ color: 'var(--accent-color)' }} />}
              </button>
            ))}
            {options.length === 0 && (
              <p className="text-xs text-text-muted text-center py-4">Nenhuma opção ainda.</p>
            )}
          </div>
        </Overlay>
      )}
    </>
  )
}
