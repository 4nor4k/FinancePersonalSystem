import { useEffect, useRef, useState } from 'react'
import { hsvToRgb, rgbToHsv, rgbToHex, hexToRgb } from '../lib/colorMath'

const SIZE = 200

export default function ColorWheel({ value, onChange, onCommit }) {
  const canvasRef = useRef(null)
  const draggingRef = useRef(false)
  const [hsv, setHsv] = useState(() => {
    const [r, g, b] = hexToRgb(value)
    return rgbToHsv(r, g, b)
  })

  // Se o valor mudar de fora (ex: escolheu um da paleta salva), resincroniza.
  useEffect(() => {
    const [r, g, b] = hexToRgb(value)
    setHsv(rgbToHsv(r, g, b))
  }, [value])

  // Desenha o disco de matiz/saturação uma vez.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = SIZE, h = SIZE
    const cx = w / 2, cy = h / 2, radius = w / 2
    const img = ctx.createImageData(w, h)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = x - cx, dy = y - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        const idx = (y * w + x) * 4
        if (dist <= radius) {
          let angle = (Math.atan2(dy, dx) * 180) / Math.PI
          if (angle < 0) angle += 360
          const sat = Math.min(1, dist / radius)
          const [r, g, b] = hsvToRgb(angle, sat, 1)
          img.data[idx] = r
          img.data[idx + 1] = g
          img.data[idx + 2] = b
          img.data[idx + 3] = 255
        }
      }
    }
    ctx.putImageData(img, 0, 0)
  }, [])

  function updateFromPointer(clientX, clientY) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scale = SIZE / rect.width
    const x = (clientX - rect.left) * scale
    const y = (clientY - rect.top) * scale
    const cx = SIZE / 2, cy = SIZE / 2, radius = SIZE / 2
    const dx = x - cx, dy = y - cy
    const dist = Math.min(radius, Math.sqrt(dx * dx + dy * dy))
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI
    if (angle < 0) angle += 360
    const sat = dist / radius
    const novoHsv = [angle, sat, hsv[2]]
    setHsv(novoHsv)
    const [r, g, b] = hsvToRgb(novoHsv[0], novoHsv[1], novoHsv[2])
    onChange(rgbToHex(r, g, b))
  }

  function onDown(e) {
    draggingRef.current = true
    const p = e.touches ? e.touches[0] : e
    updateFromPointer(p.clientX, p.clientY)
  }
  function onMove(e) {
    if (!draggingRef.current) return
    const p = e.touches ? e.touches[0] : e
    updateFromPointer(p.clientX, p.clientY)
  }
  function onUp() {
    if (draggingRef.current) onCommit?.()
    draggingRef.current = false
  }

  function handleValueChange(novoV) {
    const novoHsv = [hsv[0], hsv[1], novoV]
    setHsv(novoHsv)
    const [r, g, b] = hsvToRgb(novoHsv[0], novoHsv[1], novoHsv[2])
    onChange(rgbToHex(r, g, b))
  }

  const [hue, sat, val] = hsv
  const cx = SIZE / 2 + Math.cos((hue * Math.PI) / 180) * sat * (SIZE / 2)
  const cy = SIZE / 2 + Math.sin((hue * Math.PI) / 180) * sat * (SIZE / 2)
  const [valEndR, valEndG, valEndB] = hsvToRgb(hue, sat, 1)

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: SIZE, height: SIZE, opacity: val }}>
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          className="rounded-full touch-none"
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          onTouchStart={onDown}
          onTouchMove={onMove}
          onTouchEnd={onUp}
        />
        <div
          className="absolute w-5 h-5 rounded-full border-2 border-white pointer-events-none"
          style={{ left: cx - 10, top: cy - 10, boxShadow: '0 0 0 1px rgba(0,0,0,0.4)' }}
        />
      </div>

      <div className="w-full mt-4 mb-1">
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(val * 100)}
          onChange={(e) => handleValueChange(Number(e.target.value) / 100)}
          onMouseUp={() => onCommit?.()}
          onTouchEnd={() => onCommit?.()}
          className="w-full"
          style={{
            accentColor: value,
            background: `linear-gradient(to right, #000, rgb(${valEndR},${valEndG},${valEndB}))`,
          }}
        />
      </div>
      <p className="text-[10px] text-text-muted">Brilho</p>
    </div>
  )
}
