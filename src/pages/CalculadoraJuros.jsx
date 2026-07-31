import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconChevronLeft } from '@tabler/icons-react'
import { formatBRL } from '../lib/format'

export default function CalculadoraJuros() {
  const navigate = useNavigate()
  const [valorInicial, setValorInicial] = useState('1000')
  const [aporteMensal, setAporteMensal] = useState('200')
  const [taxa, setTaxa] = useState('1')
  const [prazo, setPrazo] = useState('5')
  const [unidadePrazo, setUnidadePrazo] = useState('anos')

  const resultado = useMemo(() => {
    const pv = Number(valorInicial) || 0
    const pmt = Number(aporteMensal) || 0
    const i = (Number(taxa) || 0) / 100
    const n = (Number(prazo) || 0) * (unidadePrazo === 'anos' ? 12 : 1)

    let montante = pv
    for (let mes = 0; mes < n; mes++) {
      montante = montante * (1 + i) + pmt
    }

    const totalInvestido = pv + pmt * n
    const jurosGanhos = montante - totalInvestido

    return { montante, totalInvestido, jurosGanhos: Math.max(0, jurosGanhos) }
  }, [valorInicial, aporteMensal, taxa, prazo, unidadePrazo])

  const pctJuros = resultado.montante > 0 ? Math.round((resultado.jurosGanhos / resultado.montante) * 100) : 0

  return (
    <div className="max-w-md lg:max-w-2xl mx-auto px-4 pt-4 pb-56 lg:px-9 lg:pt-7 lg:pb-10">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="text-text-secondary">
          <IconChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium">Juros compostos</span>
        <div className="w-5" />
      </div>

      <div className="bg-bg-card rounded-2xl p-5 mb-4 text-center">
        <p className="text-xs text-text-secondary mb-1.5">Valor final estimado</p>
        <p className="text-3xl font-medium" style={{ color: 'var(--accent-color)' }}>{formatBRL(resultado.montante)}</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-6">
        <div className="bg-bg-card rounded-xl p-3.5">
          <p className="text-[11px] text-text-secondary mb-1">Total investido</p>
          <p className="text-base font-medium">{formatBRL(resultado.totalInvestido)}</p>
        </div>
        <div className="bg-bg-card rounded-xl p-3.5">
          <p className="text-[11px] text-text-secondary mb-1">Juros ganhos</p>
          <p className="text-base font-medium" style={{ color: '#7fd88f' }}>{formatBRL(resultado.jurosGanhos)}</p>
        </div>
      </div>

      <div className="h-2.5 bg-bg-card rounded-full overflow-hidden flex mb-1.5">
        <div className="h-full" style={{ width: `${100 - pctJuros}%`, background: '#5c5c59' }} />
        <div className="h-full" style={{ width: `${pctJuros}%`, background: '#7fd88f' }} />
      </div>
      <div className="flex items-center justify-between mb-6">
        <span className="text-[11px] text-text-muted">Investido</span>
        <span className="text-[11px] text-text-muted">Juros ({pctJuros}%)</span>
      </div>

      <div className="flex flex-col gap-3">
        <Campo label="Valor inicial" value={valorInicial} onChange={setValorInicial} prefixo="R$" />
        <Campo label="Aporte mensal" value={aporteMensal} onChange={setAporteMensal} prefixo="R$" />
        <Campo label="Taxa de juros (% ao mês)" value={taxa} onChange={setTaxa} sufixo="%" />
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] text-text-muted">Prazo</p>
            <div className="flex gap-1 bg-bg-raised rounded-full p-0.5">
              {['meses', 'anos'].map((u) => (
                <button
                  key={u}
                  onClick={() => setUnidadePrazo(u)}
                  className="text-[10px] px-2.5 py-1 rounded-full capitalize"
                  style={u === unidadePrazo ? { background: '#333331', color: '#f0f0ee', fontWeight: 500 } : { color: '#8a8a87' }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-bg-card rounded-xl px-3.5 py-3 flex items-center gap-2">
            <input
              value={prazo}
              onChange={(e) => setPrazo(e.target.value.replace(/[^0-9.]/g, ''))}
              inputMode="decimal"
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <span className="text-xs text-text-muted">{unidadePrazo}</span>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-text-muted text-center mt-5 leading-relaxed">
        Simulação com juros compostos, aporte mensal fixo e taxa constante.
        Não considera inflação, impostos ou taxas de administração.
      </p>
    </div>
  )
}

function Campo({ label, value, onChange, prefixo, sufixo }) {
  return (
    <div>
      <p className="text-[11px] text-text-muted mb-1.5">{label}</p>
      <div className="bg-bg-card rounded-xl px-3.5 py-3 flex items-center gap-2">
        {prefixo && <span className="text-sm text-text-muted">{prefixo}</span>}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
          inputMode="decimal"
          className="flex-1 bg-transparent text-sm outline-none"
        />
        {sufixo && <span className="text-xs text-text-muted">{sufixo}</span>}
      </div>
    </div>
  )
}
