import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconChevronLeft, IconPlus, IconEdit, IconGripVertical } from '@tabler/icons-react'
import { useData } from '../context/DataContext'
import { formatBRL, digitsToCurrencyDisplay, currencyDisplayToNumber, numberToCurrencyDisplay } from '../lib/format'
import { COR_PADRAO } from '../lib/colors'
import ColorPicker from '../components/ColorPicker'

const ICONES = ['ti-building-bank', 'ti-pig-money', 'ti-credit-card', 'ti-cash', 'ti-wallet', 'ti-coin']

export default function Contas() {
  const navigate = useNavigate()
  const { contas, transacoes, addConta, updateConta, reordenarContas } = useData()
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
    <div className="max-w-md mx-auto px-4 pt-4 pb-56">
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
        saldoConta={saldoConta}
        onReorder={reordenarContas}
      />
      {contas.length === 0 && (
        <p className="text-xs text-text-muted text-center py-6">Nenhuma conta ainda.</p>
      )}
    </div>
  )
}

function ReorderableList({ contas, editandoId, onToggleEditar, onUpdate, saldoConta, onReorder }) {
  const [ordem, setOrdem] = useState(contas)
  const itemRefs = useRef([])
  const dragState = useRef(null)
  const [dragging, setDragging] = useState(null)

  useEffect(() => {
    if (!dragState.current) setOrdem(contas)
  }, [contas])

  function swap(i, j) {
    setOrdem((prev) => {
      const copy = [...prev]
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
      return copy
    })
  }

  function handlePointerMove(e) {
    if (!dragState.current) return
    e.preventDefault?.()
    const p = e.touches ? e.touches[0] : e
    const offset = p.clientY - dragState.current.startY
    setDragging({ index: dragState.current.index, offset })

    const currentIndex = dragState.current.index
    const el = itemRefs.current[currentIndex]
    if (!el) return
    const rect = el.getBoundingClientRect()
    const middleY = rect.top + rect.height / 2 + offset

    if (currentIndex > 0) {
      const aboveRect = itemRefs.current[currentIndex - 1]?.getBoundingClientRect()
      if (aboveRect && middleY < aboveRect.top + aboveRect.height / 2) {
        swap(currentIndex, currentIndex - 1)
        dragState.current.index = currentIndex - 1
        return
      }
    }
    if (currentIndex < ordem.length - 1) {
      const belowRect = itemRefs.current[currentIndex + 1]?.getBoundingClientRect()
      if (belowRect && middleY > belowRect.top + belowRect.height / 2) {
        swap(currentIndex, currentIndex + 1)
        dragState.current.index = currentIndex + 1
      }
    }
  }

  function handlePointerUp() {
    window.removeEventListener('mousemove', handlePointerMove)
    window.removeEventListener('touchmove', handlePointerMove)
    window.removeEventListener('mouseup', handlePointerUp)
    window.removeEventListener('touchend', handlePointerUp)
    if (dragState.current) {
      onReorder(ordem.map((c) => c.id))
    }
    dragState.current = null
    setDragging(null)
  }

  function handlePointerDown(e, index) {
    if (editandoId) return
    const p = e.touches ? e.touches[0] : e
    dragState.current = { index, startY: p.clientY }
    setDragging({ index, offset: 0 })
    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('touchmove', handlePointerMove, { passive: false })
    window.addEventListener('mouseup', handlePointerUp)
    window.addEventListener('touchend', handlePointerUp)
  }

  return (
    <div className="flex flex-col gap-2">
      {ordem.map((c, i) => (
        <div
          key={c.id}
          ref={(el) => (itemRefs.current[i] = el)}
          style={{
            transform: dragging?.index === i ? `translateY(${dragging.offset}px)` : 'none',
            position: 'relative',
            zIndex: dragging?.index === i ? 10 : 1,
            transition: dragging?.index === i ? 'none' : 'transform 0.15s ease',
          }}
        >
          <ContaItem
            conta={c}
            editando={editandoId === c.id}
            onToggleEditar={() => onToggleEditar(c.id)}
            onUpdate={onUpdate}
            saldoLabel={saldoConta(c)}
            onDragHandleDown={(e) => handlePointerDown(e, i)}
          />
        </div>
      ))}
    </div>
  )
}

function ContaItem({ conta: c, editando, onToggleEditar, onUpdate, saldoLabel, onDragHandleDown }) {
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
        </div>
      )}
    </div>
  )
}
