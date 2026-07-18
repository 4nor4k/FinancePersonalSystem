import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconChevronLeft, IconPlus, IconTrash } from '@tabler/icons-react'
import { useData } from '../context/DataContext'
import { formatBRL } from '../lib/format'
import TrendTriangle from '../components/TrendTriangle'
import SwipeableRow from '../components/SwipeableRow'
import Overlay from '../components/Overlay'

export default function Watchlist() {
  const navigate = useNavigate()
  const { watchlistAtivos, cotacoes, addAtivoWatchlist, removeAtivoWatchlist } = useData()
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

      <p className="text-[11px] text-text-muted mb-3">Deslize um ativo pra parar de acompanhar</p>

      <div className="flex flex-col gap-2">
        {watchlistAtivos.map((ativo) => {
          const cot = cotacoes[ativo.ticker]
          const alta = cot && cot.variacaoPct >= 0
          return (
            <SwipeableRow key={ativo.id} actions={[{ icon: IconTrash, bg: '#2a1e1e', color: '#d97a7a', onClick: () => removeAtivoWatchlist(ativo.id) }]}>
              <div className="p-3.5 flex items-center justify-between">
                <span className="text-sm font-medium">{ativo.ticker}</span>
                {cot ? (
                  <div className="text-right">
                    <p className="text-sm">{formatBRL(cot.preco)}</p>
                    <p className="text-[11px] flex items-center justify-end gap-1 mt-0.5" style={{ color: alta ? '#7fd88f' : '#e2716f' }}>
                      <TrendTriangle up={alta} size={6} />
                      {Math.abs(cot.variacaoPct || 0).toFixed(2)}%
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-text-muted">carregando...</span>
                )}
              </div>
            </SwipeableRow>
          )
        })}
        {watchlistAtivos.length === 0 && (
          <p className="text-xs text-text-muted text-center py-6">Nenhum ativo acompanhado ainda -- adicione com o "+".</p>
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
