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
      {contas.length > 1 && (
        <p className="text-[11px] text-text-muted mb-2.5">Toque no card pra ver a próxima conta</p>
      )}
      <div className="mb-2" style={{ height: 104 }} onClick={handleClick}>
        <div
          className="rounded-2xl p-4 cursor-pointer h-full"
          style={{ background: 'var(--card-tone-2)', border: '0.5px solid #2a2620', ...style }}
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-medium text-text-secondary">{atual.nome}</span>
            <IconWifi size={16} className="text-text-secondary" style={{ transform: 'rotate(90deg)' }} />
          </div>
          <p className="text-xl font-medium mt-5 text-text-primary">{mask(atual.valorExibido)}</p>
          {atual.legenda && <p className="text-[10px] text-text-muted mt-0.5">{atual.legenda}</p>}
        </div>
      </div>
      {contas.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {contas.map((_, i) => (
            <span
              key={i}
              className="rounded-full transition-all"
              style={{ width: i === rot % contas.length ? 12 : 4, height: 4, background: i === rot % contas.length ? 'var(--accent-color)' : '#2a2a28' }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
