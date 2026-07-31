import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconChevronLeft, IconPlus, IconX, IconChartCandle } from '@tabler/icons-react'
import { useData } from '../context/DataContext'
import { formatBRL } from '../lib/format'
import TrendTriangle from '../components/TrendTriangle'
import Overlay from '../components/Overlay'

export default function Watchlist() {
  const navigate = useNavigate()
  const { watchlistAtivos, cotacoes, cotacoesErro, addAtivoWatchlist, removeAtivoWatchlist } = useData()
  const [adicionando, setAdicionando] = useState(false)
  const [ticker, setTicker] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleAdicionar() {
    if (!ticker.trim()) return
    setSalvando(true)
    await addAtivoWatchlist(ticker)
    setSalvando(false)
    setTicker('')
    setAdicionando(false)
  }

  return (
    <div className="max-w-md lg:max-w-2xl mx-auto px-4 pt-4 pb-56 lg:px-9 lg:pt-7 lg:pb-10">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-text-secondary">
          <IconChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium">Cotações</span>
        <button onClick={() => setAdicionando(true)} style={{ color: 'var(--accent-color)' }}>
          <IconPlus size={20} />
        </button>
      </div>

      {cotacoesErro && (
        <div className="bg-[#1e1414] rounded-xl p-3 mb-3">
          <p className="text-xs" style={{ color: '#e2716f' }}>Não foi possível buscar as cotações</p>
          <p className="text-[11px] text-text-muted mt-1">{cotacoesErro}</p>
        </div>
      )}

      <div className={watchlistAtivos.length === 1 ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-2 gap-3'}>
        {watchlistAtivos.map((ativo) => {
          const cot = cotacoes[ativo.ticker]
          const alta = cot && cot.variacaoPct >= 0
          const corTexto = alta ? '#7fd88f' : '#e2716f'
          return (
            <div key={ativo.id} className="relative rounded-2xl p-4" style={{ background: 'var(--card-tone-2)' }}>
              <button
                onClick={() => removeAtivoWatchlist(ativo.id)}
                className="absolute top-2.5 left-2.5 w-5 h-5 rounded-full bg-black/40 flex items-center justify-center"
              >
                <IconX size={11} color="#e5e5e3" />
              </button>
              {cot && (
                <span className="absolute top-3 right-3 text-[11px] font-medium flex items-center gap-1" style={{ color: corTexto }}>
                  <TrendTriangle up={alta} size={6} />
                  {Math.abs(cot.variacaoPct || 0).toFixed(2)}%
                </span>
              )}
              <p className="text-xs text-text-secondary text-center mt-4 mb-2">{ativo.ticker}</p>
              <div className="flex justify-center my-2">
                <IconChartCandle size={38} stroke={1.5} className="text-text-muted" />
              </div>
              {cot ? (
                <p className="text-base font-medium text-center">{formatBRL(cot.preco)}</p>
              ) : (
                <p className="text-xs text-text-muted text-center">{cotacoesErro ? 'indisponível' : 'carregando...'}</p>
              )}
            </div>
          )
        })}
        {watchlistAtivos.length === 0 && (
          <p className="text-xs text-text-muted text-center py-6 col-span-2">Nenhum ativo acompanhado ainda -- adicione com o "+".</p>
        )}
      </div>

      {adicionando && (
        <Overlay onClose={() => setAdicionando(false)}>
          <p className="text-sm font-medium text-center mb-4">Acompanhar ativo</p>
          <p className="text-[11px] text-text-muted mb-1.5">Ticker (ex: PETR4, HGLG11)</p>
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="PETR4"
            className="w-full bg-bg-raised rounded-lg px-3 py-3 text-sm outline-none mb-5 uppercase placeholder:text-text-muted placeholder:normal-case"
          />
          <button
            onClick={handleAdicionar}
            disabled={salvando}
            className="w-full rounded-lg py-3 text-sm font-medium"
            style={{ background: 'var(--accent-color)', color: '#1a0d05', opacity: salvando ? 0.6 : 1 }}
          >
            {salvando ? 'Adicionando...' : 'Adicionar'}
          </button>
        </Overlay>
      )}
    </div>
  )
}
