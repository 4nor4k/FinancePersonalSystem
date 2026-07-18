import { IconTrash, IconBackspace } from '@tabler/icons-react'
import { useData } from '../context/DataContext'

const KEYS = [
  ['(', ')', '%', 'back'],
  ['7', '8', '9', '/'],
  ['4', '5', '6', '*'],
  ['1', '2', '3', '-'],
  ['0', ',', '+', '='],
]

const LABEL = { '*': 'X', '/': '÷', '-': '−' }

function safeEval(str) {
  if (!str) return '0'
  let clean = str.replace(/,/g, '.')
  if (!/^[0-9+\-*/().%\s]+$/.test(clean)) return '0'
  clean = clean.replace(/(\d+(\.\d+)?)%/g, '($1/100)')
  try {
    const val = Function('"use strict";return (' + clean + ')')()
    if (typeof val !== 'number' || !isFinite(val)) return '0'
    return String(Math.round(val * 10000) / 10000)
  } catch {
    return '...'
  }
}

export default function Calculadora() {
  // O estado vive no contexto global (DataContext), não aqui na página --
  // por isso o cálculo continua na tela mesmo trocando de rota.
  const { calcExpr: expr, setCalcExpr: setExpr } = useData()

  const result = safeEval(expr)

  function pressKey(k) {
    if (k === 'back') return setExpr((e) => e.slice(0, -1))
    if (k === '=') return setExpr(safeEval(expr).replace('.', ','))
    setExpr((e) => e + k)
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-56">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-medium">Calculadora</span>
        <button onClick={() => setExpr('')} className="text-text-secondary">
          <IconTrash size={18} />
        </button>
      </div>

      <div className="bg-bg-card rounded-2xl p-5 mb-4 min-h-[110px] flex flex-col justify-end">
        <p className="text-sm text-text-secondary text-right mb-2 break-all">
          {expr ? expr.replace(/\*/g, ' X ').replace(/\//g, ' ÷ ') : '0'}
        </p>
        <p className="text-4xl font-medium text-right break-all">{result}</p>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {KEYS.flat().map((k) => {
          const isOp = ['(', ')', '%', '/', '*', '-', '+'].includes(k)
          const isEquals = k === '='
          return (
            <button
              key={k}
              onClick={() => pressKey(k)}
              className="aspect-square rounded-full text-xl flex items-center justify-center"
              style={
                isEquals
                  ? { background: 'var(--accent-color)', color: '#1a0d05' }
                  : isOp || k === 'back'
                  ? { background: '#141414', color: k === 'back' ? '#8a8a87' : 'var(--accent-color)' }
                  : { background: '#1a1a1a', color: '#e5e5e3' }
              }
            >
              {k === 'back' ? <IconBackspace size={18} /> : LABEL[k] || k}
            </button>
          )
        })}
      </div>

      <p className="text-[10px] text-text-muted text-center mt-3.5">
        O cálculo continua salvo ao trocar de tela — só some ao tocar na lixeira
      </p>
    </div>
  )
}
