import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconChevronLeft, IconPlus, IconX } from '@tabler/icons-react'
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
    <div className="max-w-md mx-auto px-4 pt-4 pb-56">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-text-secondary">
          <IconChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium">Cotações</span>
        <button onClick={() => setAdicionando(true)} style={{ color: 'var(--accent-color)' }}>
          <IconPlus size={20} />
        </button>
      </div>

      <p className="text-[11px] text-text-muted mb-3">Toque no "x" pra parar de acompanhar um ativo</p>

      {cotacoesErro && (
        <div className="bg-[#1e1414] rounded-xl p-3 mb-3">
          <p className="text-xs" style={{ color: '#e2716f' }}>Não foi possível buscar as cotações</p>
          <p className="text-[11px] text-text-muted mt-1">{cotacoesErro}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {watchlistAtivos.map((ativo) => {
          const cot = cotacoes[ativo.ticker]
          const alta = cot && cot.variacaoPct >= 0
          const corFundo = alta ? '#17301f' : '#301717'
          const corTexto = alta ? '#7fd88f' : '#e2716f'
          return (
            <div key={ativo.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-tone-2)' }}>
              <div className="p-3.5 relative">
                <button
                  onClick={() => removeAtivoWatchlist(ativo.id)}
                  className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-black/40 flex items-center justify-center"
                >
                  <IconX size={11} color="#e5e5e3" />
                </button>
                <p className="text-[11px] text-text-secondary mb-1.5 pr-5">{ativo.ticker}</p>
                {cot ? (
                  <p className="text-lg font-medium">{formatBRL(cot.preco)}</p>
                ) : (
                  <p className="text-xs text-text-muted">{cotacoesErro ? 'indisponível' : 'carregando...'}</p>
                )}
              </div>
              {cot && (
                <div className="px-3.5 py-2.5 flex items-center justify-between" style={{ background: corFundo }}>
                  <span className="text-xs font-medium flex items-center gap-1" style={{ color: corTexto }}>
                    <TrendTriangle up={alta} size={6} />
                    {Math.abs(cot.variacaoPct || 0).toFixed(2)}%
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.25)', color: corTexto }}>
                    {alta ? 'alta' : 'baixa'}
                  </span>
                </div>
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
