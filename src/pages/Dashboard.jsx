import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconMenu2, IconEye, IconEyeOff, IconPhoto, IconChevronRight, IconChevronLeft } from '@tabler/icons-react'
import { useData } from '../context/DataContext'
import { formatBRL, isUrlSegura } from '../lib/format'
import AccountStack from '../components/AccountStack'
import TrendTriangle from '../components/TrendTriangle'
import SideMenu from '../components/SideMenu'

const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export default function Dashboard() {
  const {
    activeProfile,
    contas,
    categorias,
    transacoes,
    notas,
    wishlist,
    watchlistAtivos,
    cotacoes,
    mercado,
    objetivos,
    valuesHidden,
    setValuesHidden,
  } = useData()

  const mask = (value) => (valuesHidden ? '••••' : value)
  const [menuAberto, setMenuAberto] = useState(false)
  const [mesRef, setMesRef] = useState(new Date().toISOString().slice(0, 7))

  function mudarMes(delta) {
    const [ano, mes] = mesRef.split('-').map(Number)
    const d = new Date(ano, mes - 1 + delta, 1)
    setMesRef(d.toISOString().slice(0, 7))
  }

  const anoAtual = Number(mesRef.slice(0, 4))
  const [nomeMes, anoLabel] = new Date(mesRef + '-02')
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .split(' de ')

  const saldoPorConta = useMemo(() => {
    const map = {}
    contas.forEach((c) => (map[c.id] = 0))
    transacoes.forEach((t) => {
      if (t.status === 'pendente') return
      const sinal = t.tipo === 'receita' ? 1 : -1
      map[t.conta_id] = (map[t.conta_id] || 0) + sinal * (Number(t.valor) || 0)
    })
    return map
  }, [contas, transacoes])

  const saldoTotal = contas
    .filter((c) => c.tipo !== 'cartao_credito')
    .reduce((acc, c) => acc + (saldoPorConta[c.id] || 0), 0)

  const limiteUsadoPorConta = useMemo(() => {
    const map = {}
    contas
      .filter((c) => c.tipo === 'cartao_credito')
      .forEach((c) => {
        map[c.id] = transacoes
          .filter((t) => t.conta_id === c.id && t.status === 'pendente' && t.tipo === 'despesa')
          .reduce((acc, t) => acc + (Number(t.valor) || 0), 0)
      })
    return map
  }, [contas, transacoes])

  const contasParaStack = contas.map((c) => ({
    id: c.id,
    nome: c.nome,
    valorExibido:
      c.tipo === 'cartao_credito'
        ? formatBRL((c.limite || 0) - (limiteUsadoPorConta[c.id] || 0))
        : formatBRL(saldoPorConta[c.id] || 0),
    legenda: c.tipo === 'cartao_credito' ? 'disponível' : null,
  }))

  // Categorias e valores do mês selecionado (não mais o histórico inteiro)
  const despesasPorCategoria = useMemo(() => {
    const map = {}
    transacoes
      .filter((t) => t.tipo === 'despesa' && t.data.slice(0, 7) === mesRef)
      .forEach((t) => {
        map[t.categoria_id] = (map[t.categoria_id] || 0) + (Number(t.valor) || 0)
      })
    return Object.entries(map)
      .map(([catId, valor]) => ({ categoria: categorias.find((c) => c.id === catId), valor }))
      .filter((x) => x.categoria)
      .sort((a, b) => b.valor - a.valor)
  }, [transacoes, categorias, mesRef])

  const totalCategorias = despesasPorCategoria.reduce((acc, x) => acc + x.valor, 0) || 1

  const balancoPorMes = useMemo(() => {
    const despesas = Array(12).fill(0)
    const receitas = Array(12).fill(0)
    transacoes
      .filter((t) => t.data && t.data.slice(0, 4) === String(anoAtual))
      .forEach((t) => {
        const mesIdx = Number(t.data.slice(5, 7)) - 1
        if (mesIdx < 0 || mesIdx > 11) return
        if (t.tipo === 'despesa') despesas[mesIdx] += Number(t.valor) || 0
        else receitas[mesIdx] += Number(t.valor) || 0
      })
    return despesas
      .map((despesa, idx) => ({ idx, despesa, receita: receitas[idx] }))
      .filter((m) => m.despesa > 0 || m.receita > 0)
  }, [transacoes, anoAtual])
  const maiorValorMes = Math.max(...balancoPorMes.flatMap((m) => [m.despesa, m.receita]), 1)
  const mesAtualIdx = Number(mesRef.slice(5, 7)) - 1

  const proximasTransacoes = transacoes
    .filter((t) => t.tipo === 'despesa' && t.status === 'pendente' && t.data.slice(0, 7) === mesRef)
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 3)

  const despesasMes = transacoes
    .filter((t) => t.tipo === 'despesa' && t.data.slice(0, 7) === mesRef)
    .reduce((acc, t) => acc + (Number(t.valor) || 0), 0)

  const receitasMes = transacoes
    .filter((t) => t.tipo === 'receita' && t.data.slice(0, 7) === mesRef)
    .reduce((acc, t) => acc + (Number(t.valor) || 0), 0)

  return (
    <div className="noise-bg max-w-md lg:max-w-none mx-auto px-4 pt-4 pb-56 lg:px-9 lg:pt-7 lg:pb-10">
      <div className="grid grid-cols-[1fr_auto_1fr] lg:flex lg:items-center lg:justify-between items-center mb-5 pt-1">
        <div className="flex flex-col">
          <span className="text-[11px] text-text-muted">USD</span>
          {mercado.usd ? (
            <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: mercado.usd.variacaoPct >= 0 ? '#7fd88f' : '#e2716f' }}>
              {formatBRL(mercado.usd.preco)} <TrendTriangle up={mercado.usd.variacaoPct >= 0} size={7} />
            </span>
          ) : (
            <span className="text-sm font-medium text-text-muted">...</span>
          )}
        </div>
        <div className="flex items-center gap-1 bg-bg-card rounded-full px-1 py-1">
          <button onClick={() => mudarMes(-1)} className="text-text-secondary p-1.5">
            <IconChevronLeft size={15} />
          </button>
          <span className="text-xs font-medium capitalize px-1 min-w-[92px] text-center">
            {nomeMes} {anoLabel}
          </span>
          <button onClick={() => mudarMes(1)} className="text-text-secondary p-1.5">
            <IconChevronRight size={15} />
          </button>
        </div>
        <div className="flex justify-end lg:hidden">
          <button onClick={() => setMenuAberto(true)} className="text-text-secondary">
            <IconMenu2 size={20} />
          </button>
        </div>
      </div>

      {menuAberto && <SideMenu onClose={() => setMenuAberto(false)} />}

      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-6 lg:items-start">
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-sm text-text-secondary">Saldo atual</span>
              <button onClick={() => setValuesHidden(!valuesHidden)} className="text-text-muted">
                {valuesHidden ? <IconEyeOff size={15} /> : <IconEye size={15} />}
              </button>
            </div>
            <span className="text-[42px] font-medium tracking-tight text-text-primary block leading-none">
              {mask(formatBRL(saldoTotal))}
            </span>
          </div>

          <AccountStack contas={contasParaStack} mask={mask} />

          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div className="bg-bg-card rounded-2xl p-4">
              <p className="text-xs text-text-secondary mb-2">Receitas</p>
              <p className="text-xl font-medium" style={{ color: '#7fd88f' }}>{mask(formatBRL(receitasMes))}</p>
            </div>
            <div className="bg-bg-card rounded-2xl p-4">
              <p className="text-xs text-text-secondary mb-2">Despesas</p>
              <p className="text-xl font-medium">{mask(formatBRL(despesasMes))}</p>
            </div>
          </div>

          <ChartsCarousel
            despesasPorCategoria={despesasPorCategoria}
            totalCategorias={totalCategorias}
            balancoPorMes={balancoPorMes}
            maiorValorMes={maiorValorMes}
            mesAtualIdx={mesAtualIdx}
            anoAtual={anoAtual}
            mask={mask}
          />

          <div className="flex items-center justify-between mb-2.5 mt-6">
            <p className="text-sm text-text-secondary">
              {mesRef === new Date().toISOString().slice(0, 7) ? 'Próximas transações' : 'Transações pendentes'}
            </p>
            <Link to="/transacoes" className="text-xs text-text-secondary flex items-center gap-0.5">
              Ver todas <IconChevronRight size={13} />
            </Link>
          </div>
          <div className="bg-bg-card rounded-2xl overflow-hidden mb-6 lg:mb-0">
            {proximasTransacoes.length === 0 && (
              <p className="text-sm text-text-muted p-4">Nenhuma transação pendente.</p>
            )}
            {proximasTransacoes.map((t, i) => {
              const cat = categorias.find((c) => c.id === t.categoria_id)
              const vencido = t.data < new Date().toISOString().slice(0, 10)
              return (
                <Link
                  to="/transacoes"
                  key={t.id}
                  className={`flex items-center justify-between px-4 py-3.5 ${
                    i < proximasTransacoes.length - 1 ? 'border-b border-bg-raised' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: vencido ? '#e2716f' : 'var(--accent-color)' }} />
                    <span className="text-sm">
                      {t.anotacao || cat?.nome || 'Sem categoria'} · {t.data.slice(8, 10)}/{t.data.slice(5, 7)}
                    </span>
                  </div>
                  <span className="text-sm text-text-secondary">{mask(formatBRL(t.valor))}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {objetivos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-sm text-text-secondary">Objetivos</p>
                <Link to="/objetivos" className="text-xs text-text-secondary flex items-center gap-0.5">
                  Ver todos <IconChevronRight size={13} />
                </Link>
              </div>
              <div className={objetivos.slice(0, 3).length === 1 ? 'grid grid-cols-1 gap-2.5' : 'grid grid-cols-2 lg:grid-cols-1 gap-2.5'}>
                {objetivos.slice(0, 3).map((o) => {
                  const pct = Math.min(100, Math.round(((o.valor_atual || 0) / o.valor_meta) * 100))
                  return (
                    <Link to="/objetivos" key={o.id} className="bg-bg-card rounded-2xl p-3">
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#1a1a1a' }}>
                          <i className={`ti ${o.icone}`} style={{ fontSize: 14, color: o.cor }} />
                        </div>
                        <p className="text-xs truncate">{o.nome}</p>
                      </div>
                      <div className="h-1.5 bg-bg-raised rounded-full overflow-hidden mb-1.5">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: o.cor }} />
                      </div>
                      <p className="text-[11px] text-text-secondary">{mask(formatBRL(o.valor_atual || 0))} <span style={{ color: o.cor }}>· {pct}%</span></p>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {!activeProfile?.ocultar_extras && watchlistAtivos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-sm text-text-secondary">Cotações</p>
                <Link to="/cotacoes" className="text-xs text-text-secondary flex items-center gap-0.5">
                  Ver todas <IconChevronRight size={13} />
                </Link>
              </div>
              <div className={watchlistAtivos.slice(0, 4).length === 1 ? 'grid grid-cols-1 gap-2.5' : 'grid grid-cols-2 gap-2.5'}>
                {watchlistAtivos.slice(0, 4).map((ativo) => {
                  const cot = cotacoes[ativo.ticker]
                  const alta = cot && cot.variacaoPct >= 0
                  const corFundo = alta ? '#17301f' : '#301717'
                  const corTexto = alta ? '#7fd88f' : '#e2716f'
                  return (
                    <Link to="/cotacoes" key={ativo.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-tone-2)' }}>
                      <div className="p-3">
                        <p className="text-[11px] text-text-secondary mb-1">{ativo.ticker}</p>
                        {cot ? (
                          <p className="text-sm font-medium">{formatBRL(cot.preco)}</p>
                        ) : (
                          <p className="text-xs text-text-muted">carregando...</p>
                        )}
                      </div>
                      {cot && (
                        <div className="px-3 py-1.5 flex items-center gap-1" style={{ background: corFundo }}>
                          <TrendTriangle up={alta} size={6} />
                          <span className="text-[11px] font-medium" style={{ color: corTexto }}>
                            {Math.abs(cot.variacaoPct || 0).toFixed(2)}%
                          </span>
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {!activeProfile?.ocultar_extras && wishlist.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-sm text-text-secondary">Lista de desejos</p>
                <Link to="/wishlist" className="text-xs text-text-secondary flex items-center gap-0.5">
                  Ver todas <IconChevronRight size={13} />
                </Link>
              </div>
              <div className={wishlist.slice(0, 2).length === 1 ? 'grid grid-cols-1 gap-2.5' : 'grid grid-cols-2 gap-2.5'}>
                {wishlist.slice(0, 2).map((item) => (
                  <Link to="/wishlist" key={item.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-tone-2)' }}>
                    <div className="aspect-square bg-bg-raised flex items-center justify-center overflow-hidden">
                      {isUrlSegura(item.link_imagem) ? (
                        <img src={item.link_imagem} alt={item.nome} className="w-full h-full object-cover" />
                      ) : (
                        <IconPhoto size={22} className="text-text-muted" />
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium truncate mb-1">{item.nome}</p>
                      <p className="text-sm font-medium">{mask(formatBRL(item.preco || 0))}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {notas.length > 0 && (
            <div>
              <p className="text-sm text-text-secondary mb-2.5">Notas</p>
              <div className={notas.slice(0, 2).length === 1 ? 'grid grid-cols-1 gap-2.5' : 'grid grid-cols-2 lg:grid-cols-1 gap-2.5'}>
                {notas.slice(0, 2).map((n) => (
                  <Link to="/notas" key={n.id} className="bg-bg-card rounded-2xl p-3">
                    <p className="text-sm font-medium mb-1 truncate">{n.titulo}</p>
                    <p className="text-xs text-text-secondary line-clamp-2">{n.conteudo?.replace(/<[^>]*>/g, ' ')}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ChartsCarousel({ despesasPorCategoria, totalCategorias, balancoPorMes, maiorValorMes, mesAtualIdx, anoAtual, mask }) {
  const trackRef = useRef(null)
  const [pagina, setPagina] = useState(0)

  function handleScroll() {
    const el = trackRef.current
    if (!el) return
    setPagina(Math.round(el.scrollLeft / el.offsetWidth))
  }

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex lg:grid lg:grid-cols-2 gap-3 overflow-x-auto lg:overflow-visible snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        <div className="min-w-full lg:min-w-0 snap-center bg-bg-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-secondary">Balanço de {anoAtual}</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
                <span className="w-2 h-2 rounded-full" style={{ background: '#7fd88f' }} /> receitas
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
                <span className="w-2 h-2 rounded-full" style={{ background: '#e2716f' }} /> despesas
              </span>
            </div>
          </div>
          {balancoPorMes.length === 0 ? (
            <p className="text-sm text-text-muted">Sem transações registradas em {anoAtual} ainda.</p>
          ) : (
            <>
              <div className="flex items-end gap-2 h-20">
                {balancoPorMes.map(({ idx, despesa, receita }) => (
                  <div key={idx} className="flex-1 flex items-end justify-center gap-0.5 h-full">
                    <div
                      className="flex-1 max-w-[10px]"
                      style={{
                        height: `${Math.max((receita / maiorValorMes) * 100, receita > 0 ? 4 : 0)}%`,
                        background: '#7fd88f',
                        borderRadius: '4px 4px 1px 1px',
                        opacity: idx === mesAtualIdx ? 1 : 0.75,
                      }}
                    />
                    <div
                      className="flex-1 max-w-[10px]"
                      style={{
                        height: `${Math.max((despesa / maiorValorMes) * 100, despesa > 0 ? 4 : 0)}%`,
                        background: '#e2716f',
                        borderRadius: '4px 4px 1px 1px',
                        opacity: idx === mesAtualIdx ? 1 : 0.75,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 mt-2">
                {balancoPorMes.map(({ idx }) => (
                  <span
                    key={idx}
                    className="flex-1 text-center text-[9px]"
                    style={{ color: idx === mesAtualIdx ? 'var(--accent-color)' : '#5c5c59', fontWeight: idx === mesAtualIdx ? 500 : 400 }}
                  >
                    {MESES_ABREV[idx]}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="min-w-full lg:min-w-0 snap-center bg-bg-card rounded-2xl p-4">
          <p className="text-sm text-text-secondary mb-4">Despesas por categoria no mês</p>
          {despesasPorCategoria.length === 0 ? (
            <p className="text-sm text-text-muted">Sem despesas nesse mês.</p>
          ) : (
            <div className="flex items-center gap-4">
              <Donut fatias={despesasPorCategoria} total={totalCategorias} />
              <div className="flex-1 flex flex-col gap-2 max-h-[168px] overflow-y-auto pr-1">
                {despesasPorCategoria.map(({ categoria, valor }) => (
                  <div key={categoria.id} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: categoria.cor }} />
                    <span className="text-xs text-text-secondary truncate flex-1">{categoria.nome}</span>
                    <span className="text-xs flex-shrink-0">{mask(formatBRL(valor))}</span>
                    <span className="text-[11px] text-text-muted flex-shrink-0 w-9 text-right">
                      {Math.round((valor / totalCategorias) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex lg:hidden justify-center gap-1.5 mt-3">
        {[0, 1].map((i) => (
          <span
            key={i}
            className="rounded-full transition-all"
            style={{ width: i === pagina ? 14 : 5, height: 5, background: i === pagina ? 'var(--accent-color)' : '#2a2a28' }}
          />
        ))}
      </div>
    </div>
  )
}

function Donut({ fatias, total }) {
  let acumulado = 0
  const raio = 34
  const circ = 2 * Math.PI * raio
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="flex-shrink-0">
      <circle cx="44" cy="44" r={raio} fill="none" stroke="var(--card-tone-2)" strokeWidth="13" />
      {fatias.map(({ categoria, valor }) => {
        const frac = valor / total
        const dash = frac * circ
        const offset = circ - acumulado
        acumulado += dash
        return (
          <circle
            key={categoria.id}
            cx="44"
            cy="44"
            r={raio}
            fill="none"
            stroke={categoria.cor}
            strokeWidth="13"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={offset}
            transform="rotate(-90 44 44)"
          />
        )
      })}
    </svg>
  )
}
