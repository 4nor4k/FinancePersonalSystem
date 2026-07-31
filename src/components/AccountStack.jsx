import { useRef, useState } from 'react'
import { IconWifi } from '@tabler/icons-react'

export default function AccountStack({ contas, mask }) {
  const [rot, setRot] = useState(0)
  const [fase, setFase] = useState('parado') // 'parado' | 'saindo' | 'entrando'
  const timeoutRef = useRef(null)

  if (contas.length === 0) {
    return (
      <div className="bg-bg-card rounded-2xl p-4 mb-6 text-center">
        <p className="text-sm text-text-muted">Nenhuma conta ainda -- crie uma pelo botão "+".</p>
      </div>
    )
  }

  const atual = contas[rot % contas.length]

  function handleClick() {
    if (contas.length <= 1 || fase !== 'parado') return
    setFase('saindo')
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setRot((r) => r + 1)
      setFase('entrando')
      requestAnimationFrame(() => requestAnimationFrame(() => setFase('parado')))
    }, 260)
  }

  const style =
    fase === 'saindo'
      ? { transform: 'translateY(-40px) translateX(10px) rotate(10deg)', opacity: 0, transition: 'transform 0.26s cubic-bezier(.4,0,1,.6), opacity 0.26s ease' }
      : fase === 'entrando'
      ? { transform: 'translateY(16px)', opacity: 0, transition: 'none' }
      : { transform: 'translateY(0)', opacity: 1, transition: 'transform 0.28s cubic-bezier(.2,.7,.3,1), opacity 0.28s ease' }

  return (
    <div>
      {/* Mobile/tablet: um card por vez, toca pra girar -- economiza espaço vertical */}
      <div className="lg:hidden">
        {contas.length > 1 && (
          <p className="text-[11px] text-text-muted mb-2.5">Toque no card pra ver a próxima conta</p>
        )}
        <div className="mb-4" style={{ height: 104 }} onClick={handleClick}>
          <div
            className="rounded-2xl p-4 cursor-pointer h-full"
            style={{ background: 'var(--accent-color)', ...style }}
          >
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-medium" style={{ color: '#1a0d05', opacity: 0.75 }}>{atual.nome}</span>
              <IconWifi size={16} style={{ color: '#1a0d05', opacity: 0.75, transform: 'rotate(90deg)' }} />
            </div>
            <p className="text-xl font-medium mt-5" style={{ color: '#1a0d05' }}>{mask(atual.valorExibido)}</p>
            {atual.legenda && <p className="text-[10px] mt-0.5" style={{ color: '#1a0d05', opacity: 0.65 }}>{atual.legenda}</p>}
          </div>
        </div>
      </div>

      {/* Desktop: espaço sobra, mostra todas as contas lado a lado de uma vez */}
      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-3 lg:mb-6">
        {contas.map((c, i) => (
          <div
            key={c.id}
            className="rounded-2xl p-4"
            style={i === 0 ? { background: 'var(--accent-color)' } : { background: 'var(--bg-card)' }}
          >
            <div className="flex justify-between items-start">
              <span
                className="text-[11px] font-medium"
                style={i === 0 ? { color: '#1a0d05', opacity: 0.75 } : { color: 'var(--text-secondary)' }}
              >
                {c.nome}
              </span>
              <IconWifi size={16} style={i === 0 ? { color: '#1a0d05', opacity: 0.75, transform: 'rotate(90deg)' } : { color: 'var(--text-secondary)', transform: 'rotate(90deg)' }} />
            </div>
            <p className="text-xl font-medium mt-5" style={i === 0 ? { color: '#1a0d05' } : { color: 'var(--text-primary)' }}>
              {mask(c.valorExibido)}
            </p>
            {c.legenda && (
              <p className="text-[10px] mt-0.5" style={i === 0 ? { color: '#1a0d05', opacity: 0.65 } : { color: 'var(--text-muted)' }}>
                {c.legenda}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
