import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IconX, IconPlus, IconChevronDown, IconArrowRight, IconCheck } from '@tabler/icons-react'
import { useData } from '../context/DataContext'
import NovaContaModal from '../components/NovaContaModal'
import NovaCategoriaModal from '../components/NovaCategoriaModal'

export default function NovaTransacao() {
  const navigate = useNavigate()
  const location = useLocation()
  const editId = location.state?.editId
  const { contas, categorias, transacoes, addConta, addCategoria, addTransacao, updateTransacao } = useData()

  const transacaoEditando = editId ? transacoes.find((t) => t.id === editId) : null

  const [tipo, setTipo] = useState(transacaoEditando?.tipo || 'despesa')
  const [valor, setValor] = useState(transacaoEditando ? String(transacaoEditando.valor).replace('.', ',') : '')
  const [contaId, setContaId] = useState(transacaoEditando?.conta_id || '')
  const [categoriaId, setCategoriaId] = useState(transacaoEditando?.categoria_id || '')
  const [data, setData] = useState(transacaoEditando?.data || new Date().toISOString().slice(0, 10))
  const [anotacao, setAnotacao] = useState(transacaoEditando?.anotacao || '')
  const [repetirAberto, setRepetirAberto] = useState(false)
  const [repetirTipo, setRepetirTipo] = useState('fixa')
  const [numeroParcelas, setNumeroParcelas] = useState(10)
  const [confirmado, setConfirmado] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [modalConta, setModalConta] = useState(false)
  const [modalCategoria, setModalCategoria] = useState(false)

  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo)

  async function handleConfirm() {
    if (!valor || !contaId) return
    setSalvando(true)

    if (transacaoEditando) {
      await updateTransacao(transacaoEditando.id, {
        tipo,
        valor: Number(valor.replace(',', '.')),
        conta_id: contaId,
        categoria_id: categoriaId || null,
        data,
        anotacao,
      })
    } else {
      await addTransacao({
        tipo,
        valor: Number(valor.replace(',', '.')),
        conta_id: contaId,
        categoria_id: categoriaId || null,
        data,
        anotacao,
        repetir: repetirAberto ? repetirTipo : null,
        numeroParcelas: repetirTipo === 'parcelada' ? Number(numeroParcelas) : undefined,
      })
    }
    setTimeout(() => navigate('/transacoes'), 500)
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-10">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-text-secondary">
          <IconX size={18} />
        </button>
        <span className="text-sm font-medium">{transacaoEditando ? 'Editar transação' : 'Nova transação'}</span>
        <div className="w-[18px]" />
      </div>

      <div className="flex gap-1.5 bg-bg-raised rounded-full p-1 mb-4">
        {['despesa', 'receita'].map((t) => {
          const isActive = t === tipo
          const style = isActive
            ? t === 'despesa'
              ? { background: '#2a1e1e', color: '#e2716f', fontWeight: 500 }
              : { background: '#1e2e24', color: '#7fd88f', fontWeight: 500 }
            : { color: '#8a8a87' }
          return (
            <button
              key={t}
              onClick={() => {
                setTipo(t)
                setCategoriaId('')
              }}
              className="flex-1 text-center text-xs py-2 rounded-full capitalize"
              style={style}
            >
              {t}
            </button>
          )
        })}
      </div>

      <div className="text-center mb-5">
        <p className="text-[11px] text-text-muted mb-1.5">Valor</p>
        <input
          value={valor}
          onChange={(e) => setValor(e.target.value.replace(/[^0-9,]/g, ''))}
          placeholder="0,00"
          inputMode="decimal"
          className="bg-transparent text-center text-4xl font-medium w-full outline-none placeholder:text-text-muted"
        />
      </div>

      <Field label="Conta">
        <select
          value={contaId}
          onChange={(e) => setContaId(e.target.value)}
          className="flex-1 bg-bg-card rounded-lg px-3 py-3 text-sm outline-none"
        >
          <option value="">Selecionar conta</option>
          {contas.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <IconButton onClick={() => setModalConta(true)} />
      </Field>

      <Field label="Categoria">
        <select
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          className="flex-1 bg-bg-card rounded-lg px-3 py-3 text-sm outline-none"
        >
          <option value="">Selecionar categoria</option>
          {categoriasFiltradas.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <IconButton onClick={() => setModalCategoria(true)} />
      </Field>

      <div className="mb-3">
        <p className="text-[11px] text-text-muted mb-1.5">Data</p>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full bg-bg-card rounded-lg px-3 py-3 text-sm outline-none"
        />
      </div>

      <div className="mb-3">
        <p className="text-[11px] text-text-muted mb-1.5">Anotação</p>
        <input
          value={anotacao}
          onChange={(e) => setAnotacao(e.target.value)}
          placeholder="Opcional"
          className="w-full bg-bg-card rounded-lg px-3 py-3 text-sm outline-none placeholder:text-text-muted"
        />
      </div>

      {!transacaoEditando && (
        <div className="bg-bg-card rounded-lg p-3 mb-5">
          <button
            onClick={() => setRepetirAberto((v) => !v)}
            className="w-full flex justify-between items-center"
          >
            <span className="text-sm">Repetir essa transação</span>
            <IconChevronDown size={16} className={`text-text-secondary transition-transform ${repetirAberto ? 'rotate-180' : ''}`} />
          </button>

          {repetirAberto && (
            <div className="mt-3.5">
              <div className="flex gap-1.5 bg-bg-raised rounded-full p-1 mb-3">
                {['fixa', 'parcelada'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setRepetirTipo(t)}
                    className="flex-1 text-center text-xs py-2 rounded-full capitalize"
                    style={t === repetirTipo ? { background: '#333331', color: '#f0f0ee', fontWeight: 500 } : { color: '#8a8a87' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {repetirTipo === 'fixa' ? (
                <p className="text-xs text-text-secondary leading-relaxed">
                  Essa despesa se repete todo mês, sem data pra acabar. Você pode editar ou encerrar quando quiser.
                </p>
              ) : (
                <div>
                  <p className="text-[11px] text-text-muted mb-1.5">Número de parcelas</p>
                  <input
                    type="number"
                    min={2}
                    value={numeroParcelas}
                    onChange={(e) => setNumeroParcelas(e.target.value)}
                    className="w-full bg-bg-raised rounded-lg px-3 py-3 text-sm outline-none"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {transacaoEditando ? (
        <button
          onClick={handleConfirm}
          disabled={!valor || !contaId || salvando}
          className="w-full rounded-full py-3.5 text-sm font-medium"
          style={{ background: 'var(--accent-color)', color: '#1a0d05', opacity: !valor || !contaId ? 0.5 : 1 }}
        >
          Salvar alterações
        </button>
      ) : (
        <SwipeConfirm onConfirm={handleConfirm} confirmado={confirmado} setConfirmado={setConfirmado} disabled={!valor || !contaId || salvando} />
      )}

      {modalConta && (
        <NovaContaModal
          onClose={() => setModalConta(false)}
          addConta={addConta}
          onCreated={(nova) => nova && setContaId(nova.id)}
        />
      )}
      {modalCategoria && (
        <NovaCategoriaModal
          tipoInicial={tipo}
          onClose={() => setModalCategoria(false)}
          addCategoria={addCategoria}
          onCreated={(nova) => nova && setCategoriaId(nova.id)}
        />
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <p className="text-[11px] text-text-muted mb-1.5">{label}</p>
      <div className="flex gap-2">{children}</div>
    </div>
  )
}

function IconButton({ onClick }) {
  return (
    <button onClick={onClick} className="bg-bg-card rounded-lg w-11 flex items-center justify-center text-text-secondary">
      <IconPlus size={16} />
    </button>
  )
}

function SwipeConfirm({ onConfirm, confirmado, setConfirmado, disabled }) {
  const trackRef = useRef(null)
  const handleRef = useRef(null)
  const [left, setLeft] = useState(4)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startLeft = useRef(4)

  function maxLeft() {
    if (!trackRef.current || !handleRef.current) return 200
    return trackRef.current.offsetWidth - handleRef.current.offsetWidth - 4
  }

  function onDown(e) {
    if (confirmado || disabled) return
    dragging.current = true
    startX.current = e.touches ? e.touches[0].clientX : e.clientX
    startLeft.current = left
  }
  function onMove(e) {
    if (!dragging.current) return
    const x = e.touches ? e.touches[0].clientX : e.clientX
    const delta = x - startX.current
    const max = maxLeft()
    setLeft(Math.min(Math.max(startLeft.current + delta, 4), max))
  }
  function onUp() {
    if (!dragging.current) return
    dragging.current = false
    const max = maxLeft()
    const pct = (left - 4) / (max - 4)
    if (pct >= 0.85) {
      setLeft(max)
      setConfirmado(true)
      onConfirm()
    } else {
      setLeft(4)
    }
  }

  return (
    <div>
      <p className="text-[11px] text-text-muted text-center mb-2">
        {disabled ? 'Preencha valor e conta pra continuar' : 'Deslize para confirmar'}
      </p>
      <div
        ref={trackRef}
        className="relative rounded-full h-[52px] overflow-hidden"
        style={{ background: confirmado ? '#2f7a4f' : '#141414', opacity: disabled ? 0.5 : 1 }}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchMove={onMove}
        onTouchEnd={onUp}
      >
        <p className="absolute inset-0 flex items-center justify-center text-sm text-text-muted">
          {confirmado ? 'Transação salva' : 'Salvar transação'}
        </p>
        <div
          ref={handleRef}
          onMouseDown={onDown}
          onTouchStart={onDown}
          className="absolute top-1 w-11 h-11 rounded-full bg-[#e5e5e3] flex items-center justify-center cursor-grab"
          style={{ left }}
        >
          {confirmado ? <IconCheck size={18} color="#101010" /> : <IconArrowRight size={18} color="#101010" />}
        </div>
      </div>
    </div>
  )
}
