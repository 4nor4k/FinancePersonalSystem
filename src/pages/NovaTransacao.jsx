import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IconX, IconPlus, IconChevronDown, IconTrash, IconRepeat } from '@tabler/icons-react'
import { useData } from '../context/DataContext'
import { digitsToCurrencyDisplay, currencyDisplayToNumber, numberToCurrencyDisplay } from '../lib/format'
import NovaContaModal from '../components/NovaContaModal'
import NovaCategoriaModal from '../components/NovaCategoriaModal'
import PickerField from '../components/PickerField'
import Overlay from '../components/Overlay'

export default function NovaTransacao() {
  const navigate = useNavigate()
  const location = useLocation()
  const editId = location.state?.editId
  const { contas, categorias, transacoes, addConta, addCategoria, addTransacao, updateTransacao, excluirTransacao } = useData()

  const transacaoEditando = editId ? transacoes.find((t) => t.id === editId) : null

  const [tipo, setTipo] = useState(transacaoEditando?.tipo || 'despesa')
  const [valor, setValor] = useState(transacaoEditando ? numberToCurrencyDisplay(transacaoEditando.valor) : '')
  const [contaId, setContaId] = useState(transacaoEditando?.conta_id || '')
  const [categoriaId, setCategoriaId] = useState(transacaoEditando?.categoria_id || '')
  const [data, setData] = useState(transacaoEditando?.data || new Date().toISOString().slice(0, 10))
  const [anotacao, setAnotacao] = useState(transacaoEditando?.anotacao || '')
  const [repetirAberto, setRepetirAberto] = useState(false)
  const [repetirTipo, setRepetirTipo] = useState('fixa')
  const [numeroParcelas, setNumeroParcelas] = useState(10)
  const [salvando, setSalvando] = useState(false)
  const [modalConta, setModalConta] = useState(false)
  const [modalCategoria, setModalCategoria] = useState(false)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const [confirmandoEdicao, setConfirmandoEdicao] = useState(false)

  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo)

  async function handleExcluir(modo = 'este') {
    await excluirTransacao(transacaoEditando.id, modo)
    navigate('/transacoes')
  }

  function handleClickExcluir() {
    if (transacaoEditando.recorrencia_id) {
      setConfirmandoExclusao(true)
    } else {
      handleExcluir('este')
    }
  }

  function montarPayloadEdicao() {
    return {
      tipo,
      valor: currencyDisplayToNumber(valor),
      conta_id: contaId,
      categoria_id: categoriaId || null,
      data,
      anotacao,
    }
  }

  async function handleConfirm() {
    if (!valor || !contaId) return

    if (transacaoEditando) {
      if (transacaoEditando.recorrencia_id) {
        setConfirmandoEdicao(true)
        return
      }
      setSalvando(true)
      await updateTransacao(transacaoEditando.id, montarPayloadEdicao())
      navigate('/transacoes')
      return
    }

    setSalvando(true)
    await addTransacao({
      tipo,
      valor: currencyDisplayToNumber(valor),
      conta_id: contaId,
      categoria_id: categoriaId || null,
      data,
      anotacao,
      repetir: repetirAberto ? repetirTipo : null,
      numeroParcelas: repetirTipo === 'parcelada' ? Number(numeroParcelas) : undefined,
    })
    navigate('/transacoes')
  }

  async function handleConfirmarEdicao(modo) {
    setConfirmandoEdicao(false)
    setSalvando(true)
    await updateTransacao(transacaoEditando.id, montarPayloadEdicao(), modo)
    navigate('/transacoes')
  }

  return (
    <div className="max-w-md lg:max-w-xl mx-auto px-4 pt-4 pb-56 lg:px-9 lg:pt-7 lg:pb-10">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-text-secondary">
          <IconX size={18} />
        </button>
        <span className="text-sm font-medium">{transacaoEditando ? 'Editar transação' : 'Nova transação'}</span>
        {transacaoEditando ? (
          <button onClick={handleClickExcluir} className="text-text-secondary">
            <IconTrash size={18} />
          </button>
        ) : (
          <div className="w-[18px]" />
        )}
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
          onChange={(e) => setValor(digitsToCurrencyDisplay(e.target.value))}
          placeholder="0,00"
          inputMode="numeric"
          className="bg-transparent text-center text-4xl font-medium w-full outline-none placeholder:text-text-muted"
        />
      </div>

      <Field label="Conta">
        <PickerField
          placeholder="Selecionar conta"
          options={contas}
          value={contaId}
          onChange={setContaId}
        />
        <IconButton onClick={() => setModalConta(true)} />
      </Field>

      <Field label="Categoria">
        <PickerField
          placeholder="Selecionar categoria"
          options={categoriasFiltradas}
          value={categoriaId}
          onChange={setCategoriaId}
        />
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
        <p className="text-[11px] text-text-muted mb-1.5">Descrição</p>
        <input
          value={anotacao}
          onChange={(e) => setAnotacao(e.target.value)}
          placeholder="Ex: Conta de luz"
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

      <button
        onClick={handleConfirm}
        disabled={!valor || !contaId || salvando}
        className="w-full rounded-full py-3.5 text-sm font-medium"
        style={{ background: 'var(--accent-color)', color: '#1a0d05', opacity: !valor || !contaId ? 0.5 : 1 }}
      >
        {salvando ? 'Salvando...' : transacaoEditando ? 'Salvar alterações' : 'Salvar transação'}
      </button>

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

      {confirmandoEdicao && (
        <Overlay onClose={() => setConfirmandoEdicao(false)}>
          <div className="flex justify-center mb-3.5">
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-bg)' }}>
              <IconRepeat size={20} style={{ color: 'var(--accent-color)' }} />
            </div>
          </div>
          <p className="text-sm font-medium text-center mb-1.5">Essa transação se repete</p>
          <p className="text-xs text-text-secondary text-center mb-5">O que você quer alterar?</p>

          <button
            onClick={() => handleConfirmarEdicao('este')}
            className="w-full bg-bg-raised rounded-xl p-3.5 mb-2 text-left"
          >
            <p className="text-sm">Somente este mês</p>
            <p className="text-[11px] text-text-muted mt-0.5">Os outros meses continuam como estavam</p>
          </button>

          <button
            onClick={() => handleConfirmarEdicao('proximos')}
            className="w-full rounded-xl p-3.5 mb-4 text-left"
            style={{ background: 'var(--accent-bg)' }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--accent-color)' }}>Este e os próximos meses</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--accent-color)', opacity: 0.75 }}>Aplica a mudança às ocorrências futuras ainda em aberto</p>
          </button>

          <button onClick={() => setConfirmandoEdicao(false)} className="w-full text-xs text-text-secondary py-1">
            Cancelar
          </button>
        </Overlay>
      )}

      {confirmandoExclusao && (
        <Overlay onClose={() => setConfirmandoExclusao(false)}>
          <div className="flex justify-center mb-3.5">
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-bg)' }}>
              <IconRepeat size={20} style={{ color: 'var(--accent-color)' }} />
            </div>
          </div>
          <p className="text-sm font-medium text-center mb-1.5">Essa transação se repete</p>
          <p className="text-xs text-text-secondary text-center mb-5">O que você quer excluir?</p>

          <button
            onClick={() => handleExcluir('este')}
            className="w-full bg-bg-raised rounded-xl p-3.5 mb-2 text-left"
          >
            <p className="text-sm">Somente este mês</p>
            <p className="text-[11px] text-text-muted mt-0.5">Os outros meses continuam como estavam</p>
          </button>

          <button
            onClick={() => handleExcluir('proximos')}
            className="w-full rounded-xl p-3.5 mb-4 text-left"
            style={{ background: 'var(--accent-bg)' }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--accent-color)' }}>Este e os próximos meses</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--accent-color)', opacity: 0.75 }}>Remove todas as ocorrências futuras</p>
          </button>

          <button onClick={() => setConfirmandoExclusao(false)} className="w-full text-xs text-text-secondary py-1">
            Cancelar
          </button>
        </Overlay>
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
