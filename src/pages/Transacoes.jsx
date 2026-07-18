import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconChevronLeft, IconChevronRight, IconAdjustments, IconArrowDown, IconArrowUp, IconCheck, IconEdit, IconTrash } from '@tabler/icons-react'
import { useData } from '../context/DataContext'
import { formatBRL } from '../lib/format'
import SwipeableRow from '../components/SwipeableRow'

export default function Transacoes() {
  const navigate = useNavigate()
  const { transacoes, categorias, contas, consolidarTransacao, excluirTransacao } = useData()
  const [filtroTipo, setFiltroTipo] = useState('todas')
  const [mesRef, setMesRef] = useState(new Date().toISOString().slice(0, 7))
  const [ordenacao, setOrdenacao] = useState('data')

  function mudarMes(delta) {
    const [ano, mes] = mesRef.split('-').map(Number)
    const d = new Date(ano, mes - 1 + delta, 1)
    setMesRef(d.toISOString().slice(0, 7))
  }

  const filtradas = useMemo(() => {
    let lista = transacoes.filter((t) => t.data.slice(0, 7) === mesRef)
    if (filtroTipo !== 'todas') lista = lista.filter((t) => t.tipo === filtroTipo)
    lista = [...lista].sort((a, b) => {
      if (ordenacao === 'valor') return b.valor - a.valor
      if (ordenacao === 'categoria') return (a.categoria_id || '').localeCompare(b.categoria_id || '')
      return a.data.localeCompare(b.data)
    })
    return lista
  }, [transacoes, filtroTipo, mesRef, ordenacao])

  const totalDespesas = transacoes
    .filter((t) => t.data.slice(0, 7) === mesRef && t.tipo === 'despesa')
    .reduce((a, t) => a + t.valor, 0)
  const totalReceitas = transacoes
    .filter((t) => t.data.slice(0, 7) === mesRef && t.tipo === 'receita')
    .reduce((a, t) => a + t.valor, 0)

  const [nomeMes, ano] = new Date(mesRef + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).split(' de ')

  async function handleExcluir(t) {
    if (t.recorrencia_id) {
      const escolha = confirm('Excluir apenas este mês? OK = só este, Cancelar = este e os próximos')
      await excluirTransacao(t.id, escolha ? 'este' : 'proximos')
    } else {
      await excluirTransacao(t.id, 'este')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-56">
      <div className="flex items-center justify-between mb-3.5">
        <button onClick={() => navigate(-1)} className="text-text-secondary">
          <IconChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium">Transações</span>
        <IconAdjustments size={18} className="text-text-secondary" />
      </div>

      <div className="flex items-center justify-between bg-bg-card rounded-lg px-3.5 py-2.5 mb-3">
        <button onClick={() => mudarMes(-1)} className="text-text-secondary"><IconChevronLeft size={16} /></button>
        <span className="text-sm font-medium capitalize">{nomeMes} {ano}</span>
        <button onClick={() => mudarMes(1)} className="text-text-secondary"><IconChevronRight size={16} /></button>
      </div>

      <div className="flex gap-2 mb-3.5">
        <FilterBtn active={filtroTipo === 'todas'} onClick={() => setFiltroTipo('todas')}>Todas</FilterBtn>
        <FilterBtn active={filtroTipo === 'despesa'} onClick={() => setFiltroTipo('despesa')} color="#d97a7a" bg="#2a1e1e">
          <IconArrowDown size={14} /> Despesas
        </FilterBtn>
        <FilterBtn active={filtroTipo === 'receita'} onClick={() => setFiltroTipo('receita')} color="#7fd88f" bg="#1e2e24">
          <IconArrowUp size={14} /> Receitas
        </FilterBtn>
      </div>

      <div className="flex gap-2 mb-3.5">
        <div className="flex-1 bg-bg-card rounded-xl p-2.5">
          <p className="text-[11px] text-text-secondary mb-0.5">Despesas</p>
          <p className="text-sm font-medium" style={{ color: '#e2716f' }}>{formatBRL(totalDespesas)}</p>
        </div>
        <div className="flex-1 bg-bg-card rounded-xl p-2.5">
          <p className="text-[11px] text-text-secondary mb-0.5">Receitas</p>
          <p className="text-sm font-medium" style={{ color: '#7fd88f' }}>{formatBRL(totalReceitas)}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <span className="text-[11px] text-text-muted">Ordenar por</span>
        <select
          value={ordenacao}
          onChange={(e) => setOrdenacao(e.target.value)}
          className="bg-transparent text-[11px] text-text-muted outline-none"
        >
          <option value="data">vencimento</option>
          <option value="valor">valor</option>
          <option value="categoria">categoria</option>
        </select>
      </div>
      <p className="text-[10px] text-text-muted mb-2.5">Deslize um item pra pagar, editar ou excluir</p>

      <div className="flex flex-col gap-2">
        {filtradas.length === 0 && (
          <p className="text-xs text-text-muted text-center py-6">Nenhuma transação nesse mês.</p>
        )}
        {filtradas.map((t) => {
          const cat = categorias.find((c) => c.id === t.categoria_id)
          const conta = contas.find((c) => c.id === t.conta_id)
          const vencido = t.status === 'pendente' && t.data < new Date().toISOString().slice(0, 10)
          const statusLabel = t.status === 'pendente' ? (vencido ? 'vencido' : 'pendente') : t.status
          const statusColor =
            t.status === 'pago' || t.status === 'recebido'
              ? { bg: '#1e2e24', text: '#7fd88f' }
              : vencido
              ? { bg: '#2a2320', text: '#d99b6a' }
              : { bg: '#232323', text: '#8a8a87' }

          const acoes = [
            { icon: IconEdit, bg: '#232323', color: '#8a8a87', onClick: () => navigate('/transacoes/nova', { state: { editId: t.id } }) },
            { icon: IconTrash, bg: '#2a1e1e', color: '#d97a7a', onClick: () => handleExcluir(t) },
          ]
          if (t.status === 'pendente') {
            acoes.unshift({ icon: IconCheck, bg: '#1e2e24', color: '#7fd88f', onClick: () => consolidarTransacao(t.id) })
          }

          return (
            <SwipeableRow key={t.id} actions={acoes}>
              <div className="relative p-3 pl-4 flex items-center justify-between">
                <span
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 rounded-full"
                  style={{
                    height: '60%',
                    background: t.tipo === 'despesa' ? '#e2716f' : '#7fd88f',
                    boxShadow: `0 0 8px 1px ${t.tipo === 'despesa' ? 'rgba(226,113,111,0.65)' : 'rgba(127,216,143,0.65)'}`,
                  }}
                />
                <div>
                  <p className="text-sm">
                    {t.anotacao || cat?.nome || 'Sem categoria'}
                    {t.parcela_atual ? ` · parcela ${t.parcela_atual}` : ''}
                  </p>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    {t.anotacao && cat?.nome ? `${cat.nome} · ` : ''}{conta?.nome} · {t.data.slice(8, 10)}/{t.data.slice(5, 7)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: statusColor.bg, color: statusColor.text }}
                  >
                    {statusLabel}
                  </span>
                  <span className="text-sm">{formatBRL(t.valor)}</span>
                </div>
              </div>
            </SwipeableRow>
          )
        })}
      </div>
    </div>
  )
}

function FilterBtn({ active, onClick, children, color, bg }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-1 text-xs py-2.5 rounded-lg"
      style={
        active
          ? { background: bg || '#333331', color: color || '#f0f0ee', fontWeight: 500 }
          : { background: '#141414', color: '#8a8a87' }
      }
    >
      {children}
    </button>
  )
}
