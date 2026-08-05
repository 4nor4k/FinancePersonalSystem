import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconChevronLeft, IconPlus, IconEdit, IconGripVertical, IconTrash } from '@tabler/icons-react'
import { useData } from '../context/DataContext'
import { formatBRL, digitsToCurrencyDisplay, currencyDisplayToNumber, numberToCurrencyDisplay } from '../lib/format'
import { COR_PADRAO } from '../lib/colors'
import ColorPicker from '../components/ColorPicker'

const ICONES = [
  'ti-building-bank', 'ti-pig-money', 'ti-credit-card', 'ti-cash', 'ti-wallet', 'ti-coin',
  'ti-currency-dollar', 'ti-receipt', 'ti-building', 'ti-report-money', 'ti-safe', 'ti-currency-real',
]

export default function Contas() {
  const navigate = useNavigate()
  const { contas, transacoes, addConta, updateConta, deleteConta, reordenarContas } = useData()
  const [criando, setCriando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState({ nome: '', tipo: 'comum', limite: '', icone: ICONES[0], cor: COR_PADRAO })

  function saldoConta(conta) {
    const soma = transacoes
      .filter((t) => t.conta_id === conta.id && t.status !== 'pendente')
      .reduce((acc, t) => acc + (t.tipo === 'receita' ? Number(t.valor) || 0 : -(Number(t.valor) || 0)), 0)
    if (conta.tipo === 'cartao_credito') {
      const usado = transacoes
        .filter((t) => t.conta_id === conta.id && t.status === 'pendente' && t.tipo === 'despesa')
        .reduce((acc, t) => acc + (Number(t.valor) || 0), 0)
      return `${formatBRL((conta.limite || 0) - usado)} disponível`
    }
    return formatBRL(soma)
  }

  function contarTransacoes(contaId) {
    return transacoes.filter((t) => t.conta_id === contaId).length
  }

  function handleExcluirConta(conta) {
    const qtd = contarTransacoes(conta.id)
    const aviso =
      qtd > 0
        ? `Excluir "${conta.nome}"? Isso também apaga ${qtd} transação${qtd > 1 ? 'ões' : ''} lançada${qtd > 1 ? 's' : ''} nessa conta. Essa ação não pode ser desfeita.`
        : `Excluir "${conta.nome}"? Essa ação não pode ser desfeita.`
    if (confirm(aviso)) {
      deleteConta(conta.id)
      setEditandoId(null)
    }
  }

  async function handleCriar() {
    if (!form.nome.trim()) return
    await addConta({
      nome: form.nome,
      tipo: form.tipo,
      limite: form.tipo === 'cartao_credito' ? currencyDisplayToNumber(form.limite) : null,
      icone: form.icone,
      cor: form.cor,
    })
    setForm({ nome: '', tipo: 'comum', limite: '', icone: ICONES[0], cor: COR_PADRAO })
    setCriando(false)
  }

  return (
    <div className="max-w-md lg:max-w-2xl mx-auto px-4 pt-4 pb-56 lg:px-9 lg:pt-7 lg:pb-10">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-text-secondary">
          <IconChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium">Contas</span>
        <button onClick={() => setCriando((v) => !v)} className="text-text-secondary">
          <IconPlus size={18} />
        </button>
      </div>

      {criando && (
        <div className="bg-bg-card rounded-xl p-3.5 mb-4">
          <input
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            placeholder="Nome da conta"
            className="w-full bg-bg-raised rounded-lg px-3 py-2.5 text-sm outline-none mb-3 placeholder:text-text-muted"
          />
          <div className="flex gap-1.5 bg-bg-raised rounded-full p-1 mb-3">
            {['comum', 'cartao_credito'].map((t) => (
              <button
                key={t}
                onClick={() => setForm((f) => ({ ...f, tipo: t }))}
                className="flex-1 text-center text-xs py-2 rounded-full"
                style={t === form.tipo ? { background: '#333331', color: '#f0f0ee', fontWeight: 500 } : { color: '#8a8a87' }}
              >
                {t === 'comum' ? 'Comum' : 'Cartão de crédito'}
              </button>
            ))}
          </div>
          {form.tipo === 'cartao_credito' && (
            <input
              value={form.limite}
              onChange={(e) => setForm((f) => ({ ...f, limite: digitsToCurrencyDisplay(e.target.value) }))}
              placeholder="Limite (ex: 2.000,00)"
              inputMode="numeric"
              className="w-full bg-bg-raised rounded-lg px-3 py-2.5 text-sm outline-none mb-3 placeholder:text-text-muted"
            />
          )}
          <p className="text-[11px] text-text-muted mb-1.5">Ícone</p>
          <div className="grid grid-cols-6 gap-2 mb-4">
            {ICONES.map((ic) => (
              <button
                key={ic}
                onClick={() => setForm((f) => ({ ...f, icone: ic }))}
                className="aspect-square rounded-lg flex items-center justify-center"
                style={{ background: ic === form.icone ? '#232323' : '#1a1a1a' }}
              >
                <i className={`ti ${ic}`} style={{ fontSize: 16, color: ic === form.icone ? '#e5e5e3' : '#8a8a87' }} />
              </button>
            ))}
          </div>
          <p className="text-[11px] text-text-muted mb-1.5">Cor</p>
          <ColorPicker value={form.cor} onChange={(cor) => setForm((f) => ({ ...f, cor }))} />
          <button onClick={handleCriar} className="w-full rounded-lg py-2.5 text-sm font-medium mt-4" style={{ background: '#e5e5e3', color: '#0a0a0a' }}>
            Salvar conta
          </button>
        </div>
      )}

      {contas.length > 1 && (
        <p className="text-[11px] text-text-muted mb-2">Segure a alça e arraste pra reordenar</p>
      )}

      <ReorderableList
        contas={contas}
        editandoId={editandoId}
        onToggleEditar={(id) => setEditandoId(editandoId === id ? null : id)}
        onUpdate={updateConta}
        onDelete={handleExcluirConta}
        saldoConta={saldoConta}
        onReorder={reordenarContas}
      />
      {contas.length === 0 && (
        <p className="text-xs text-text-muted text-center py-6">Nenhuma conta ainda.</p>
      )}
    </div>
  )
}

// Estratégia deliberadamente simples: durante o arrasto, só o item sendo
// segurado se move visualmente (segue o dedo). Nada de reordenar a lista em
// tempo real -- isso é o que causava o bug de "não muda". A posição final só
// é calculada UMA VEZ, quando você solta o dedo, comparando com a posição
// medida de cada item no momento em que o arrasto começou.
function ReorderableList({ contas, editandoId, onToggleEditar, onUpdate, onDelete, saldoConta, onReorder }) {
  const itemRefs = useRef([])
  const [dragInfo, setDragInfo] = useState(null)

  function handlePointerDown(e, index) {
    if (editandoId) return
    const startP = e.touches ? e.touches[0] : e
    const startY = startP.clientY
    const rects = itemRefs.current.map((el) => el?.getBoundingClientRect())
    setDragInfo({ index, offset: 0 })

    function onMove(ev) {
      ev.preventDefault?.()
      const p = ev.touches ? ev.touches[0] : ev
      setDragInfo({ index, offset: p.clientY - startY })
    }

    function onUp(ev) {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchend', onUp)

      const p = ev.changedTouches ? ev.changedTouches[0] : ev
      const finalY = p.clientY

      let targetIndex = index
      let menorDistancia = Infinity
      rects.forEach((r, i) => {
        if (!r) return
        const centro = r.top + r.height / 2
        const distancia = Math.abs(finalY - centro)
        if (distancia < menorDistancia) {
          menorDistancia = distancia
          targetIndex = i
        }
      })

      setDragInfo(null)

      if (targetIndex !== index) {
        const novaOrdem = [...contas]
        const [movida] = novaOrdem.splice(index, 1)
        novaOrdem.splice(targetIndex, 0, movida)
        onReorder(novaOrdem.map((c) => c.id))
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchend', onUp)
  }

  return (
    <div className="flex flex-col gap-2">
      {contas.map((c, i) => (
        <div
          key={c.id}
          ref={(el) => (itemRefs.current[i] = el)}
          style={{
            transform: dragInfo?.index === i ? `translateY(${dragInfo.offset}px)` : 'none',
            position: 'relative',
            zIndex: dragInfo?.index === i ? 10 : 1,
            boxShadow: dragInfo?.index === i ? '0 10px 24px rgba(0,0,0,0.45)' : 'none',
            transition: dragInfo?.index === i ? 'none' : 'transform 0.15s ease',
          }}
        >
          <ContaItem
            conta={c}
            editando={editandoId === c.id}
            onToggleEditar={() => onToggleEditar(c.id)}
            onUpdate={onUpdate}
            onDelete={onDelete}
            saldoLabel={saldoConta(c)}
            onDragHandleDown={(e) => handlePointerDown(e, i)}
          />
        </div>
      ))}
    </div>
  )
}

function ContaItem({ conta: c, editando, onToggleEditar, onUpdate, onDelete, saldoLabel, onDragHandleDown }) {
  const [limiteEdit, setLimiteEdit] = useState(numberToCurrencyDisplay(c.limite))

  function salvarLimite() {
    onUpdate(c.id, { limite: currencyDisplayToNumber(limiteEdit) })
  }

  return (
    <div className="bg-bg-card rounded-xl overflow-hidden">
      <div className="p-3 flex items-center">
        <button
          onMouseDown={onDragHandleDown}
          onTouchStart={onDragHandleDown}
          className="text-text-muted mr-1.5 cursor-grab touch-none"
        >
          <IconGripVertical size={16} />
        </button>
        <div className="w-8.5 h-8.5 rounded-lg flex items-center justify-center mr-3" style={{ background: '#1a1a1a' }}>
          <i className={`ti ${c.icone || 'ti-building-bank'}`} style={{ fontSize: 15, color: c.cor || '#8a8a87' }} />
        </div>
        <div className="flex-1">
          <p className="text-sm">{c.nome}</p>
          <p className="text-[11px] text-text-secondary mt-0.5">
            {c.tipo === 'cartao_credito' ? 'Cartão de crédito' : 'Comum'}
          </p>
        </div>
        <span className="text-sm mr-2">{saldoLabel}</span>
        <button onClick={onToggleEditar} className="text-text-muted">
          <IconEdit size={15} />
        </button>
      </div>
      {editando && (
        <div className="px-3 pb-3">
          <p className="text-[11px] text-text-muted mb-1.5">Nome</p>
          <input
            value={c.nome}
            onChange={(e) => onUpdate(c.id, { nome: e.target.value })}
            className="w-full bg-bg-raised rounded-lg px-3 py-2.5 text-sm outline-none mb-3"
          />
          {c.tipo === 'cartao_credito' && (
            <>
              <p className="text-[11px] text-text-muted mb-1.5">Limite</p>
              <div className="flex gap-2 mb-3">
                <input
                  value={limiteEdit}
                  onChange={(e) => setLimiteEdit(digitsToCurrencyDisplay(e.target.value))}
                  inputMode="numeric"
                  className="flex-1 bg-bg-raised rounded-lg px-3 py-2.5 text-sm outline-none"
                />
                <button onClick={salvarLimite} className="px-4 rounded-lg text-xs font-medium" style={{ background: 'var(--accent-bg)', color: 'var(--accent-color)' }}>
                  Salvar
                </button>
              </div>
            </>
          )}
          <p className="text-[11px] text-text-muted mb-1.5">Ícone</p>
          <div className="grid grid-cols-6 gap-2 mb-3">
            {ICONES.map((ic) => (
              <button
                key={ic}
                onClick={() => onUpdate(c.id, { icone: ic })}
                className="aspect-square rounded-lg flex items-center justify-center"
                style={{ background: ic === c.icone ? '#232323' : '#1a1a1a' }}
              >
                <i className={`ti ${ic}`} style={{ fontSize: 15, color: ic === c.icone ? '#e5e5e3' : '#8a8a87' }} />
              </button>
            ))}
          </div>
          <p className="text-[11px] text-text-muted mb-1.5">Cor</p>
          <ColorPicker value={c.cor} onChange={(cor) => onUpdate(c.id, { cor })} />

          <button
            onClick={() => onDelete(c)}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium mt-4"
            style={{ background: '#1e1414', color: '#e2716f' }}
          >
            <IconTrash size={14} />
            Excluir conta
          </button>
        </div>
      )}
    </div>
  )
}
