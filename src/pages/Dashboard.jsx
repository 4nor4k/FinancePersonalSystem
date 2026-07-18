import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconMenu2, IconEye, IconEyeOff, IconPhoto, IconChevronRight } from '@tabler/icons-react'
import { useData } from '../context/DataContext'
import { formatBRL } from '../lib/format'
import AccountStack from '../components/AccountStack'
import TrendTriangle from '../components/TrendTriangle'
import SideMenu from '../components/SideMenu'

const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export default function Dashboard() {
  const {
    perfis,
    activeProfile,
    setActiveProfileId,
    contas,
    categorias,
    transacoes,
    notas,
    wishlist,
    valuesHidden,
    setValuesHidden,
  } = useData()

  const mask = (value) => (valuesHidden ? '••••' : value)
  const [menuAberto, setMenuAberto] = useState(false)

  const mesAtual = new Date().toISOString().slice(0, 7)
  const anoAtual = new Date().getFullYear()

  const saldoPorConta = useMemo(() => {
    const map = {}
    contas.forEach((c) => (map[c.id] = 0))
    transacoes.forEach((t) => {
      if (t.status === 'pendente') return
      const sinal = t.tipo === 'receita' ? 1 : -1
      map[t.conta_id] = (map[t.conta_id] || 0) + sinal * t.valor
    })
    return map
  }, [contas, transacoes])

  const saldoTotal = contas
    .filter((c) => c.tipo !== 'cartao_credito')
    .reduce((acc, c) => acc + (saldoPorConta[c.id] || 0), 0)

  const cartao = contas.find((c) => c.tipo === 'cartao_credito')
  const limiteUsado = cartao
    ? transacoes
        .filter((t) => t.conta_id === cartao.id && t.status === 'pendente' && t.tipo === 'despesa')
        .reduce((acc, t) => acc + t.valor, 0)
    : 0

  const contasParaStack = contas.map((c) => ({
    id: c.id,
    nome: c.nome,
    valorExibido:
      c.tipo === 'cartao_credito' ? formatBRL((c.limite || 0) - limiteUsado) : formatBRL(saldoPorConta[c.id] || 0),
    legenda: c.tipo === 'cartao_credito' ? 'disponível' : null,
  }))

  const despesasPorCategoria = useMemo(() => {
    const map = {}
    transacoes
      .filter((t) => t.tipo === 'despesa')
      .forEach((t) => {
        map[t.categoria_id] = (map[t.categoria_id] || 0) + t.valor
      })
    return Object.entries(map)
      .map(([catId, valor]) => ({ categoria: categorias.find((c) => c.id === catId), valor }))
      .filter((x) => x.categoria)
      .sort((a, b) => b.valor - a.valor)
  }, [transacoes, categorias])

  const totalCategorias = despesasPorCategoria.reduce((acc, x) => acc + x.valor, 0) || 1

  const despesasPorMes = useMemo(() => {
    const valores = Array(12).fill(0)
    transacoes
      .filter((t) => t.tipo === 'despesa' && t.data.slice(0, 4) === String(anoAtual))
      .forEach((t) => {
        const mesIdx = Number(t.data.slice(5, 7)) - 1
        valores[mesIdx] += t.valor
      })
    return valores
  }, [transacoes, anoAtual])
  const maiorMes = Math.max(...despesasPorMes, 1)
  const mesAtualIdx = new Date().getMonth()

  const proximasTransacoes = transacoes
    .filter((t) => t.tipo === 'despesa' && t.status === 'pendente')
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 3)

  const despesasMes = transacoes
    .filter((t) => t.tipo === 'despesa' && t.data.slice(0, 7) === mesAtual)
    .reduce((acc, t) => acc + t.valor, 0)

  return (
    <div className="noise-bg max-w-md mx-auto px-4 pt-4 pb-56">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center mb-5 pt-1">
        <div className="flex flex-col">
          <span className="text-[11px] text-text-muted">USD</span>
          <span className="text-sm font-medium text-green-400 flex items-center gap-1.5">
            R$ 5,42 <TrendTriangle up size={7} />
          </span>
        </div>
        <div className="flex justify-center">
          <div className="flex items-center gap-2 bg-bg-card rounded-full p-1.5">
            {perfis.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProfileId(p.id)}
                className="text-sm px-4 py-2 rounded-full font-medium transition-colors"
                style={
                  activeProfile && p.id === activeProfile.id
                    ? { background: p.cor_bg, color: p.cor }
                    : { color: '#8a8a87' }
                }
              >
                {p.nome}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={() => setMenuAberto(true)} className="text-text-secondary">
            <IconMenu2 size={20} />
          </button>
        </div>
      </div>

      {menuAberto && <SideMenu onClose={() => setMenuAberto(false)} />}

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

      <div className="bg-bg-card rounded-2xl p-4 mb-4">
        <p className="text-sm text-text-secondary mb-2.5">Despesas do mês</p>
        <p className="text-2xl font-medium text-text-primary">{mask(formatBRL(despesasMes))}</p>
      </div>

      <ChartsCarousel
        despesasPorCategoria={despesasPorCategoria}
        totalCategorias={totalCategorias}
        despesasPorMes={despesasPorMes}
        maiorMes={maiorMes}
        mesAtualIdx={mesAtualIdx}
        anoAtual={anoAtual}
        mask={mask}
      />

      <div className="flex items-center justify-between mb-2.5 mt-6">
        <p className="text-sm text-text-secondary">Próximas transações</p>
        <Link to="/transacoes" className="text-xs text-text-secondary flex items-center gap-0.5">
          Ver todas <IconChevronRight size={13} />
        </Link>
      </div>
      <div className="bg-bg-card rounded-2xl overflow-hidden mb-6">
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
                  {cat?.nome || 'Sem categoria'} · {t.data.slice(8, 10)}/{t.data.slice(5, 7)}
                </span>
              </div>
              <span className="text-sm text-text-secondary">{mask(formatBRL(t.valor))}</span>
            </Link>
          )
        })}
      </div>

      {activeProfile?.nome !== 'Nebulus' && wishlist.length > 0 && (
        <>
          <p className="text-sm text-text-secondary mb-2.5">Lista de desejos</p>
          <div className="flex gap-2.5 mb-6">
            {wishlist.slice(0, 2).map((item) => (
              <Link to="/wishlist" key={item.id} className="flex-1 bg-bg-card rounded-2xl p-2.5">
                <div className="w-full h-16 bg-bg-raised rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                  {item.link_imagem ? (
                    <img src={item.link_imagem} alt={item.nome} className="w-full h-full object-cover" />
                  ) : (
                    <IconPhoto size={20} className="text-text-muted" />
                  )}
                </div>
                <p className="text-xs truncate">{item.nome}</p>
                <p className="text-xs text-text-secondary mt-0.5">{mask(formatBRL(item.preco || 0))}</p>
              </Link>
            ))}
          </div>
        </>
      )}

      {notas.length > 0 && (
        <>
          <p className="text-sm text-text-secondary mb-2.5">Notas</p>
          <div className="grid grid-cols-2 gap-2.5">
            {notas.slice(0, 2).map((n) => (
              <Link to="/notas" key={n.id} className="bg-bg-card rounded-2xl p-3">
                <p className="text-sm font-medium mb-1 truncate">{n.titulo}</p>
                <p className="text-xs text-text-secondary line-clamp-2">{n.conteudo?.replace(/<[^>]*>/g, ' ')}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ChartsCarousel({ despesasPorCategoria, totalCategorias, despesasPorMes, maiorMes, mesAtualIdx, anoAtual, mask }) {
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
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        <div className="min-w-full snap-center bg-bg-card rounded-2xl p-4">
          <p className="text-sm text-text-secondary mb-4">Despesas ao longo de {anoAtual}</p>
          <div className="flex items-end gap-2 h-20">
            {despesasPorMes.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full"
                  style={{
                    height: `${Math.max((v / maiorMes) * 100, 4)}%`,
                    background: i === mesAtualIdx ? 'var(--accent-color)' : '#232323',
                    borderRadius: '6px 6px 2px 2px',
                    boxShadow: i === mesAtualIdx ? '0 0 16px 0 color-mix(in srgb, var(--accent-color) 45%, transparent)' : 'none',
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 mt-2">
            {MESES_ABREV.map((m, i) => (
              <span key={m} className="flex-1 text-center text-[9px]" style={{ color: i === mesAtualIdx ? 'var(--accent-color)' : '#5c5c59', fontWeight: i === mesAtualIdx ? 500 : 400 }}>
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="min-w-full snap-center bg-bg-card rounded-2xl p-4">
          <p className="text-sm text-text-secondary mb-4">Despesas por categoria</p>
          {despesasPorCategoria.length === 0 ? (
            <p className="text-sm text-text-muted">Sem despesas registradas ainda.</p>
          ) : (
            <div className="flex items-center gap-4">
              <Donut fatias={despesasPorCategoria} total={totalCategorias} />
              <div className="flex-1 flex flex-col gap-2">
                {despesasPorCategoria.slice(0, 4).map(({ categoria, valor }) => (
                  <div key={categoria.id} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: categoria.cor }} />
                    <span className="text-xs text-text-secondary truncate flex-1">{categoria.nome}</span>
                    <span className="text-xs">{mask(formatBRL(valor))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
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
      {fatias.slice(0, 5).map(({ categoria, valor }, i) => {
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
            style={i === 0 ? { filter: 'drop-shadow(0 0 6px color-mix(in srgb, ' + categoria.cor + ' 55%, transparent))' } : undefined}
          />
        )
      })}
    </svg>
  )
}
