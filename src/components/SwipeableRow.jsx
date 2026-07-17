import { useRef, useState } from 'react'

// Componente genérico: o conteúdo (children) fica por cima, e as ações
// (actions) ficam escondidas atrás, reveladas ao arrastar o item pra esquerda.
export default function SwipeableRow({ children, actions }) {
  const [offset, setOffset] = useState(0)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startOffset = useRef(0)

  const actionsWidth = actions.length * 56

  function onDown(e) {
    dragging.current = true
    startX.current = e.touches ? e.touches[0].clientX : e.clientX
    startOffset.current = offset
  }
  function onMove(e) {
    if (!dragging.current) return
    const x = e.touches ? e.touches[0].clientX : e.clientX
    const delta = x - startX.current
    let novo = startOffset.current + delta
    novo = Math.max(-actionsWidth, Math.min(0, novo))
    setOffset(novo)
  }
  function onUp() {
    if (!dragging.current) return
    dragging.current = false
    setOffset(offset < -actionsWidth / 2 ? -actionsWidth : 0)
  }

  return (
    <div className="relative rounded-xl overflow-hidden">
      <div className="absolute right-0 top-0 bottom-0 flex">
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={() => {
              a.onClick()
              setOffset(0)
            }}
            className="w-14 flex items-center justify-center"
            style={{ background: a.bg, color: a.color }}
          >
            <a.icon size={17} />
          </button>
        ))}
      </div>
      <div
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={onDown}
        onTouchMove={onMove}
        onTouchEnd={onUp}
        className="relative bg-bg-card"
        style={{ transform: `translateX(${offset}px)`, transition: dragging.current ? 'none' : 'transform 0.2s' }}
      >
        {children}
      </div>
    </div>
  )
}
