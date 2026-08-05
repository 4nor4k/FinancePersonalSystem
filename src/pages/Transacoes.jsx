import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconChevronLeft, IconChevronRight, IconAdjustments, IconArrowDown, IconArrowUp, IconCheck, IconEdit, IconTrash, IconRepeat, IconPlus } from '@tabler/icons-react'
import { useData } from '../context/DataContext'
import { formatBRL } from '../lib/format'
import SwipeableRow from '../components/SwipeableRow'
import Overlay from '../components/Overlay'
import PickerField from '../components/PickerField'

export default function Transacoes() {
  const navigate = useNavigate()
  const { transacoes, categorias, contas, consolidarTransacao, excluirTransacao } = useData()
  const [filtroTipo, setFiltroTipo] = useState('todas')
  const [filtroContaId, setFiltroContaId] = useState('')
  const [filtroCategoriaId, setFiltroCategoriaId] = useState('')
  const [mesRef, setMesRef] = useState(new Date().toISOString().slice(0, 7))
  const [ordenacao, setOrdenacao] = useState('data')
  const [excluindo, setExcluindo] = useState(null)
  const [modalFiltros, setModalFiltros] = useState(false)

  const filtrosAtivos = !!filtroContaId || !!filtroCategoriaId

  function mudarMes(delta) {
    const [ano, mes] = mesRef.split('-').map(Number)
    const d = new Date(ano, mes - 1 + delta, 1)
    setMesRef(d.toISOString().slice(0, 7))
  }

  const filtradas = useMemo(() => {
    let lista = transacoes.filter((t) => t.data.slice(0, 7) === mesRef)
    if (filtroTipo !== 'todas') lista = lista.filter((t) => t.tipo === filtroTipo)
    if (filtroContaId) lista = lista.filter((t) => t.conta_id === filtroContaId)
    if (filtroCategoriaId) lista = lista.filter((t) => t.categoria_id === filtroCategoriaId)
    lista = [...lista].sort((a, b) => {
      if (ordenacao === 'valor') return b.valor - a.valor
      if (ordenacao === 'categoria') return (a.categoria_id || '').localeCompare(b.categoria_id || '')
      return a.data.localeCompare(b.data)
    })
    return lista
  }, [transacoes, filtroTipo, filtroContaId, filtroCategoriaId, mesRef, ordenacao])

  // Resumo com base na mesma lista que aparece na tela -- então reflete
  // automaticamente o mês e todos os filtros ativos (tipo, conta, categoria).
  const totalDespesas = filtradas
    .filter((t) => t.tipo === 'despesa')
    .reduce((a, t) => a + (Number(t.valor) || 0), 0)
  const totalReceitas = filtradas
    .filter((t) => t.tipo === 'receita')
    .reduce((a, t) => a + (Number(t.valor) || 0), 0)
  const totalPago = filtradas
    .filter((t) => t.status === 'pago' || t.status === 'recebido')
    .reduce((a, t) => a + (Number(t.valor) || 0), 0)
  const totalPendente = filtradas
    .filter((t) => t.status === 'pendente')
    .reduce((a, t) => a + (Number(t.valor) || 0), 0)

  const [nomeMes, ano] = new Date(mesRef + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).split(' de ')

  function handleExcluir(t) {
    if (t.recorrencia_id) {
      setExcluindo(t)
    } else {
      excluirTransacao(t.id, 'este')
    }
  }

  async function confirmarExclusao(modo) {
    await excluirTransacao(excluindo.id, modo)
    setExcluindo(null)
  }

  const linhas = filtradas.map((t) => {
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
    return { t, cat, conta, vencido, statusLabel, statusColor }
  })

  return (
    <div className="max-w-md lg:max-w-none mx-auto px-4 pt-4 pb-56 lg:px-9 lg:pt-7 lg:pb-10">
      <div className="flex items-center justify-between mb-3.5">
        <button onClick={() => navigate(-1)} className="text-text-secondary">
          <IconChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium">Transações</span>
        <button onClick={() => setModalFiltros(true)} className="relative lg:hidden">
          <IconAdjustments size={18} style={{ color: filtrosAtivos ? 'var(--accent-color)' : '#8a8a87' }} />
          {filtrosAtivos && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: 'var(--accent-color)' }} />
          )}
        </button>
        <button
          onClick={() => navigate('/transacoes/nova')}
          className="hidden lg:flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg"
          style={{ background: 'var(--accent-color)', color: '#1a0d05' }}
        >
          <IconPlus size={14} /> Nova transação
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-[236px_1fr] lg:gap-5 lg:items-start">
        {/* Painel de filtros -- fixo ao lado no desktop, some no mobile (vira modal) */}
        <div className="hidden lg:flex lg:flex-col lg:gap-4 bg-bg-card rounded-2xl p-4">
          <div className="flex items-center justify-between bg-bg-raised rounded-lg px-2 py-2">
            <button onClick={() => mudarMes(-1)} className="text-text-secondary p-1"><IconChevronLeft size={15} /></button>
            <span className="text-xs font-medium capitalize">{nomeMes} {ano}</span>
            <button onClick={() => mudarMes(1)} className="text-text-secondary p-1"><IconChevronRight size={15} /></button>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1.5">Tipo</p>
            <div className="flex gap-1.5 bg-bg-raised rounded-full p-1">
              {['todas', 'despesa', 'receita'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFiltroTipo(t)}
                  className="flex-1 text-center text-[11px] py-1.5 rounded-full capitalize"
                  style={
                    filtroTipo === t
                      ? t === 'despesa'
                        ? { background: '#2a1e1e', color: '#d97a7a', fontWeight: 500 }
                        : t === 'receita'
                        ? { background: '#1e2e24', color: '#7fd88f', fontWeight: 500 }
                        : { background: '#333331', color: '#f0f0ee', fontWeight: 500 }
                      : { color: '#8a8a87' }
                  }
                >
                  {t === 'todas' ? 'Todas' : t === 'despesa' ? 'Despesas' : 'Receitas'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1.5">Conta</p>
            <PickerField placeholder="Todas as contas" options={contas} value={filtroContaId} onChange={setFiltroContaId} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1.5">Categoria</p>
            <PickerField placeholder="Todas as categorias" options={categorias} value={filtroCategoriaId} onChange={setFiltroCategoriaId} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1.5">Ordenar por</p>
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
              className="w-full bg-bg-raised rounded-lg px-3 py-2.5 text-xs outline-none"
            >
              <option value="data">Vencimento</option>
              <option value="valor">Valor</option>
              <option value="categoria">Categoria</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[10px] uppercase tracking-wide text-text-muted">
              {filtrosAtivos || filtroTipo !== 'todas' ? 'Resumo do filtro' : 'Resumo do mês'}
            </p>
            <div className="bg-bg-raised rounded-lg px-3 py-2.5 flex items-center justify-between">
              <span className="text-[11px] text-text-secondary">Despesas</span>
              <span className="text-xs font-medium" style={{ color: '#e2716f' }}>{formatBRL(totalDespesas)}</span>
            </div>
            <div className="bg-bg-raised rounded-lg px-3 py-2.5 flex items-center justify-between">
              <span className="text-[11px] text-text-secondary">Receitas</span>
              <span className="text-xs font-medium" style={{ color: '#7fd88f' }}>{formatBRL(totalReceitas)}</span>
            </div>
            <div className="bg-bg-raised rounded-lg px-3 py-2.5 flex items-center justify-between">
              <span className="text-[11px] text-text-secondary">Pago / recebido</span>
              <span className="text-xs font-medium">{formatBRL(totalPago)}</span>
            </div>
            <div className="bg-bg-raised rounded-lg px-3 py-2.5 flex items-center justify-between">
              <span className="text-[11px] text-text-secondary">Pendente</span>
              <span className="text-xs font-medium" style={{ color: '#d99b6a' }}>{formatBRL(totalPendente)}</span>
            </div>
          </div>

          {filtrosAtivos && (
            <button
              onClick={() => {
                setFiltroContaId('')
                setFiltroCategoriaId('')
              }}
              className="text-[11px] text-text-secondary"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Coluna principal */}
        <div>
          <div className="lg:hidden flex items-center justify-between bg-bg-card rounded-lg px-3.5 py-2.5 mb-3">
            <button onClick={() => mudarMes(-1)} className="text-text-secondary"><IconChevronLeft size={16} /></button>
            <span className="text-sm font-medium capitalize">{nomeMes} {ano}</span>
            <button onClick={() => mudarMes(1)} className="text-text-secondary"><IconChevronRight size={16} /></button>
          </div>

          <div className="lg:hidden flex gap-2 mb-3.5">
            <FilterBtn active={filtroTipo === 'todas'} onClick={() => setFiltroTipo('todas')}>Todas</FilterBtn>
            <FilterBtn active={filtroTipo === 'despesa'} onClick={() => setFiltroTipo('despesa')} color="#d97a7a" bg="#2a1e1e">
              <IconArrowDown size={14} /> Despesas
            </FilterBtn>
            <FilterBtn active={filtroTipo === 'receita'} onClick={() => setFiltroTipo('receita')} color="#7fd88f" bg="#1e2e24">
              <IconArrowUp size={14} /> Receitas
            </FilterBtn>
          </div>

          <p className="lg:hidden text-[10px] uppercase tracking-wide text-text-muted mb-1.5">
            {filtrosAtivos || filtroTipo !== 'todas' ? 'Resumo do filtro' : 'Resumo do mês'}
          </p>
          <div className="lg:hidden grid grid-cols-2 gap-2 mb-3.5">
            <div className="bg-bg-card rounded-xl p-2.5">
              <p className="text-[11px] text-text-secondary mb-0.5">Despesas</p>
              <p className="text-sm font-medium" style={{ color: '#e2716f' }}>{formatBRL(totalDespesas)}</p>
            </div>
            <div className="bg-bg-card rounded-xl p-2.5">
              <p className="text-[11px] text-text-secondary mb-0.5">Receitas</p>
              <p className="text-sm font-medium" style={{ color: '#7fd88f' }}>{formatBRL(totalReceitas)}</p>
            </div>
            <div className="bg-bg-card rounded-xl p-2.5">
              <p className="text-[11px] text-text-secondary mb-0.5">Pago / recebido</p>
              <p className="text-sm font-medium">{formatBRL(totalPago)}</p>
            </div>
            <div className="bg-bg-card rounded-xl p-2.5">
              <p className="text-[11px] text-text-secondary mb-0.5">Pendente</p>
              <p className="text-sm font-medium" style={{ color: '#d99b6a' }}>{formatBRL(totalPendente)}</p>
            </div>
          </div>

          <div className="lg:hidden flex justify-between items-center mb-2">
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
          <p className="lg:hidden text-[10px] text-text-muted mb-2.5">Deslize um item pra pagar, editar ou excluir</p>

          {/* Lista mobile: swipe pra revelar ações */}
          <div className="lg:hidden flex flex-col gap-2">
            {linhas.length === 0 && (
              <p className="text-xs text-text-muted text-center py-6">Nenhuma transação nesse mês.</p>
            )}
            {linhas.map(({ t, cat, conta, statusLabel, statusColor }) => {
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
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5" style={{ height: '60%', width: 4 }}>
                      <span
                        className="flex-1 rounded-full"
                        style={{
                          background: t.tipo === 'despesa' ? '#e2716f' : '#7fd88f',
                          boxShadow: `0 0 8px 1px ${t.tipo === 'despesa' ? 'rgba(226,113,111,0.65)' : 'rgba(127,216,143,0.65)'}`,
                        }}
                      />
                      <span
                        className="flex-1 rounded-full"
                        style={{
                          background: cat?.cor || '#5c5c59',
                          boxShadow: `0 0 8px 1px ${cat?.cor ? `${cat.cor}a6` : 'rgba(92,92,89,0.65)'}`,
                        }}
                      />
                    </div>
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

          {/* Lista desktop: tabela com ações reveladas no hover */}
          <div className="hidden lg:block bg-bg-card rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[20px_1.6fr_1fr_1fr_84px_88px_100px] gap-2.5 px-4 py-3 text-[10px] uppercase tracking-wide text-text-muted border-b border-bg-raised">
              <span />
              <span>Descrição</span>
              <span>Categoria</span>
              <span>Conta</span>
              <span>Data</span>
              <span>Status</span>
              <span className="text-right">Valor</span>
            </div>
            {linhas.length === 0 && (
              <p className="text-xs text-text-muted text-center py-8">Nenhuma transação nesse mês.</p>
            )}
            {linhas.map(({ t, cat, conta, statusLabel, statusColor }) => (
              <div
                key={t.id}
                className="group relative grid grid-cols-[20px_1.6fr_1fr_1fr_84px_88px_100px] gap-2.5 items-center px-4 py-3 border-b border-bg-raised last:border-b-0 hover:bg-bg-raised"
              >
                <span className="w-2 h-2 rounded-full" style={{ background: t.tipo === 'despesa' ? '#e2716f' : '#7fd88f' }} />
                <span className="text-xs truncate">
                  {t.anotacao || cat?.nome || 'Sem categoria'}
                  {t.parcela_atual ? ` · parcela ${t.parcela_atual}` : ''}
                </span>
                <span className="text-xs text-text-secondary truncate">{cat?.nome || '—'}</span>
                <span className="text-xs text-text-secondary truncate">{conta?.nome}</span>
                <span className="text-xs text-text-secondary">{t.data.slice(8, 10)}/{t.data.slice(5, 7)}</span>
                <span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{ background: statusColor.bg, color: statusColor.text }}
                  >
                    {statusLabel}
                  </span>
                </span>
                <span className="text-xs text-right group-hover:opacity-0 transition-opacity">{formatBRL(t.valor)}</span>

                {/* Ações -- aparecem sobre a coluna de valor só no hover */}
                <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity bg-bg-raised pl-2">
                  {t.status === 'pendente' && (
                    <button
                      onClick={() => consolidarTransacao(t.id)}
                      className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: '#1e2e24', color: '#7fd88f' }}
                      aria-label="Marcar como pago"
                    >
                      <IconCheck size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/transacoes/nova', { state: { editId: t.id } })}
                    className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: '#232323', color: '#8a8a87' }}
                    aria-label="Editar"
                  >
                    <IconEdit size={12} />
                  </button>
                  <button
                    onClick={() => handleExcluir(t)}
                    className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: '#2a1e1e', color: '#d97a7a' }}
                    aria-label="Excluir"
                  >
                    <IconTrash size={12} />
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {excluindo && (
        <Overlay onClose={() => setExcluindo(null)}>
          <div className="flex justify-center mb-3.5">
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-bg)' }}>
              <IconRepeat size={20} style={{ color: 'var(--accent-color)' }} />
            </div>
          </div>
          <p className="text-sm font-medium text-center mb-1.5">Essa transação se repete</p>
          <p className="text-xs text-text-secondary text-center mb-5">
            {excluindo.anotacao || categorias.find((c) => c.id === excluindo.categoria_id)?.nome} · o que você quer excluir?
          </p>

          <button
            onClick={() => confirmarExclusao('este')}
            className="w-full bg-bg-raised rounded-xl p-3.5 mb-2 text-left"
          >
            <p className="text-sm">Somente este mês</p>
            <p className="text-[11px] text-text-muted mt-0.5">Os outros meses continuam como estavam</p>
          </button>

          <button
            onClick={() => confirmarExclusao('proximos')}
            className="w-full rounded-xl p-3.5 mb-4 text-left"
            style={{ background: 'var(--accent-bg)' }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--accent-color)' }}>Este e os próximos meses</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--accent-color)', opacity: 0.75 }}>Remove todas as ocorrências futuras</p>
          </button>

          <button onClick={() => setExcluindo(null)} className="w-full text-xs text-text-secondary py-1">
            Cancelar
          </button>
        </Overlay>
      )}

      {modalFiltros && (
        <Overlay onClose={() => setModalFiltros(false)}>
          <p className="text-sm font-medium text-center mb-4">Filtrar transações</p>

          <p className="text-[11px] text-text-muted mb-1.5">Conta</p>
          <div className="mb-4">
            <PickerField
              placeholder="Todas as contas"
              options={contas}
              value={filtroContaId}
              onChange={setFiltroContaId}
            />
          </div>

          <p className="text-[11px] text-text-muted mb-1.5">Categoria</p>
          <div className="mb-5">
            <PickerField
              placeholder="Todas as categorias"
              options={categorias}
              value={filtroCategoriaId}
              onChange={setFiltroCategoriaId}
            />
          </div>

          <button
            onClick={() => setModalFiltros(false)}
            className="w-full rounded-lg py-3 text-sm font-medium mb-2"
            style={{ background: 'var(--accent-color)', color: '#1a0d05' }}
          >
            Aplicar
          </button>
          {filtrosAtivos && (
            <button
              onClick={() => {
                setFiltroContaId('')
                setFiltroCategoriaId('')
              }}
              className="w-full text-xs text-text-secondary py-1"
            >
              Limpar filtros
            </button>
          )}
        </Overlay>
      )}
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
