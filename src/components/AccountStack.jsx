import { useRef, useState } from 'react'
import { IconWifi } from '@tabler/icons-react'

const ROLE_STYLE = [
  { translateY: 0, rotate: 0, scale: 1, z: 3, bg: 'var(--accent-color)', text: '#1a0d05', shadow: '0 0 34px 2px color-mix(in srgb, var(--accent-color) 35%, transparent)' },
  { translateY: 6, rotate: 3, scale: 0.97, z: 2, bg: 'var(--card-tone-2)', text: '#e5e5e3', shadow: 'none', border: '0.5px solid #2a2620' },
  { translateY: 14, rotate: -6, scale: 0.94, z: 1, bg: 'var(--card-tone-3)', text: 'transparent', shadow: 'none' },
]

export default function AccountStack({ contas, mask }) {
  const [rot, setRot] = useState(0)
  const [flying, setFlying] = useState(null)
  const timeoutRef = useRef(null)

  if (contas.length === 0) {
    return (
      <div className="bg-bg-card rounded-2xl p-4 mb-6 text-center">
        <p className="text-sm text-text-muted">Nenhuma conta ainda -- crie uma pelo botão "+".</p>
      </div>
    )
  }

  function handleClick() {
    if (contas.length <= 1) return
    const frontIndex = rot % contas.length
    setFlying(frontIndex)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setFlying(null)
      setRot((r) => r + 1)
    }, 300)
  }

  return (
    <div>
      {contas.length > 1 && (
        <p className="text-[11px] text-text-muted mb-2.5">Toque no card pra ver a próxima conta</p>
      )}
      <div className="relative mb-2" style={{ height: 106 }} onClick={handleClick}>
        {contas.map((conta, i) => {
          const role = (i - rot + contas.length * 100) % contas.length
          const isFlying = flying === i
          const roleStyle = ROLE_STYLE[Math.min(role, 2)]
          const transform = isFlying
            ? 'translateY(-46px) translateX(10px) rotate(14deg) scale(0.92)'
            : `translateY(${roleStyle.translateY}px) rotate(${roleStyle.rotate}deg) scale(${roleStyle.scale})`
          const hidden = role > 2 && !isFlying

          return (
            <div
              key={conta.id}
              className="absolute inset-x-0 top-0 rounded-2xl p-4 cursor-pointer"
              style={{
                height: 104,
                zIndex: isFlying ? 4 : roleStyle.z,
                background: roleStyle.bg,
                boxShadow: roleStyle.shadow,
                border: roleStyle.border || 'none',
                transform,
                opacity: hidden ? 0 : isFlying ? 0 : 1,
                transition: isFlying
                  ? 'transform 0.3s cubic-bezier(.4,0,1,.6), opacity 0.3s ease'
                  : 'transform 0.32s cubic-bezier(.2,.7,.3,1), opacity 0.2s ease',
              }}
            >
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-medium" style={{ color: role === 0 ? '#5c2f0f' : roleStyle.text, opacity: role === 2 ? 0 : 1 }}>
                  {conta.nome}
                </span>
                <IconWifi size={16} style={{ color: role === 0 ? '#5c2f0f' : roleStyle.text, opacity: role === 2 ? 0 : 1, transform: 'rotate(90deg)' }} />
              </div>
              <p className="text-xl font-medium mt-5" style={{ color: role === 0 ? '#1a0d05' : roleStyle.text, opacity: role === 2 ? 0 : 1 }}>
                {mask(conta.valorExibido)}
              </p>
              {conta.legenda && (
                <p className="text-[10px] mt-0.5" style={{ color: role === 0 ? '#5c2f0f' : roleStyle.text, opacity: role === 2 ? 0 : 1 }}>
                  {conta.legenda}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
