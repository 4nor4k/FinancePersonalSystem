import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconChevronLeft, IconPlus, IconEdit, IconTrash, IconX } from '@tabler/icons-react'
import { useData } from '../context/DataContext'
import { formatBRL, digitsToCurrencyDisplay, currencyDisplayToNumber, numberToCurrencyDisplay } from '../lib/format'
import { COR_PADRAO } from '../lib/colors'
import ColorPicker from '../components/ColorPicker'
import Overlay from '../components/Overlay'

const ICONES = ['ti-shield', 'ti-car', 'ti-home', 'ti-trending-up', 'ti-briefcase', 'ti-plane', 'ti-heart', 'ti-gift', 'ti-school', 'ti-pig-money', 'ti-target', 'ti-dots']

export default function Objetivos() {
  const navigate = useNavigate()
  const { objetivos, contas, categorias, addObjetivo, updateObjetivo, deleteObjetivo, aportarObjetivo } = useData()
  const [criando, setCriando] = useState(false)
  const [editando, setEditando] = useState(null)
  const [aportando, setAportando] = useState(null)

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-56">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-text-secondary">
          <IconChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium">Objetivos</span>
        <button onClick={() => setCriando(true)} style={{ color: 'var(--accent-color)' }}>
          <IconPlus size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {objetivos.map((o) => {
          const pct = Math.min(100, Math.round(((o.valor_atual || 0) / o.valor_meta) * 100))
          const hoje = new Date().toISOString().slice(0, 10)
          const vencido = o.meta_data && o.meta_data < hoje && pct < 100
          return (
            <div key={o.id} className="bg-bg-card rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1a1a1a' }}>
                    <i className={`ti ${o.icone}`} style={{ fontSize: 17, color: o.cor }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{o.nome}</p>
                    {o.meta_data && (
                      <p className="text-[11px] mt-0.5" style={{ color: vencido ? '#e2716f' : '#7a7a77' }}>
                        Meta{vencido ? ' vencida' : ''}: {o.meta_data.slice(8, 10)}/{o.meta_data.slice(5, 7)}/{o.meta_data.slice(0, 4)}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={() => setEditando({ ...o })} className="text-text-muted">
                  <IconEdit size={15} />
                </button>
              </div>

              <div className="h-2 bg-bg-raised rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: o.cor, boxShadow: `0 0 8px 0 color-mix(in srgb, ${o.cor} 50%, transparent)` }}
                />
              </div>

              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-text-secondary">
                  {formatBRL(o.valor_atual || 0)} <span className="text-text-muted">de {formatBRL(o.valor_meta)}</span>
                </p>
                <span className="text-xs font-medium" style={{ color: o.cor }}>{pct}%</span>
              </div>

              <button
                onClick={() => setAportando(o)}
                className="w-full rounded-lg py-2.5 text-xs font-medium"
                style={{ background: `${o.cor}22`, color: o.cor }}
              >
                Aportar
              </button>
            </div>
          )
        })}
        {objetivos.length === 0 && (
          <p className="text-xs text-text-muted text-center py-6">Nenhum objetivo ainda -- crie o primeiro com o "+".</p>
        )}
      </div>

      {criando && (
        <ObjetivoForm
          onClose={() => setCriando(false)}
          onSave={(dados) => addObjetivo(dados)}
        />
      )}

      {editando && (
        <ObjetivoForm
          objetivo={editando}
          onClose={() => setEditando(null)}
          onSave={(dados) => updateObjetivo(editando.id, {
            nome: dados.nome,
            valor_meta: dados.valorMeta,
            icone: dados.icone,
            cor: dados.cor,
            meta_data: dados.metaData || null,
          })}
          onDelete={() => {
            if (confirm('Excluir esse objetivo?')) {
              deleteObjetivo(editando.id)
              setEditando(null)
            }
          }}
        />
      )}

      {aportando && (
        <AportarModal
          objetivo={aportando}
          contas={contas}
          categorias={categorias}
          onClose={() => setAportando(null)}
          onAportar={aportarObjetivo}
        />
      )}
    </div>
  )
}

function ObjetivoForm({ objetivo, onClose, onSave, onDelete }) {
  const [nome, setNome] = useState(objetivo?.nome || '')
  const [valorMeta, setValorMeta] = useState(objetivo?.valor_meta ? numberToCurrencyDisplay(objetivo.valor_meta) : '')
  const [icone, setIcone] = useState(objetivo?.icone || ICONES[0])
  const [cor, setCor] = useState(objetivo?.cor || COR_PADRAO)
  const [metaData, setMetaData] = useState(objetivo?.meta_data || '')

  async function handleSalvar() {
    if (!nome.trim() || !valorMeta) return
    await onSave({ nome, valorMeta: currencyDisplayToNumber(valorMeta), icone, cor, metaData })
    onClose()
  }

  return (
    <Overlay onClose={onClose}>
      <p className="text-sm font-medium text-center mb-4">{objetivo ? 'Editar objetivo' : 'Novo objetivo'}</p>

      <p className="text-[11px] text-text-muted mb-1.5">Nome</p>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Ex: Reserva de emergência"
        className="w-full bg-bg-raised rounded-lg px-3 py-3 text-sm outline-none mb-3 placeholder:text-text-muted"
      />

      <p className="text-[11px] text-text-muted mb-1.5">Valor da meta</p>
      <input
        value={valorMeta}
        onChange={(e) => setValorMeta(digitsToCurrencyDisplay(e.target.value))}
        placeholder="0,00"
        inputMode="numeric"
        className="w-full bg-bg-raised rounded-lg px-3 py-3 text-sm outline-none mb-3 placeholder:text-text-muted"
      />

      <p className="text-[11px] text-text-muted mb-1.5">Ícone</p>
      <div className="grid grid-cols-6 gap-2 mb-3">
        {ICONES.map((ic) => (
          <button
            key={ic}
            onClick={() => setIcone(ic)}
            className="aspect-square rounded-lg flex items-center justify-center"
            style={{ background: ic === icone ? '#232323' : '#1a1a1a' }}
          >
            <i className={`ti ${ic}`} style={{ fontSize: 16, color: ic === icone ? '#e5e5e3' : '#8a8a87' }} />
          </button>
        ))}
      </div>

      <p className="text-[11px] text-text-muted mb-1.5">Cor</p>
      <ColorPicker value={cor} onChange={setCor} />

      <p className="text-[11px] text-text-muted mb-1.5 mt-4">Meta de data (opcional)</p>
      <input
        type="date"
        value={metaData}
        onChange={(e) => setMetaData(e.target.value)}
        className="w-full bg-bg-raised rounded-lg px-3 py-3 text-sm outline-none mb-5"
      />

      <button onClick={handleSalvar} className="w-full rounded-lg py-3 text-sm font-medium mb-2.5" style={{ background: '#e5e5e3', color: '#0a0a0a' }}>
        {objetivo ? 'Salvar alterações' : 'Criar objetivo'}
      </button>

      {objetivo && (
        <button onClick={onDelete} className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium" style={{ background: '#1e1414', color: '#e2716f' }}>
          <IconTrash size={14} />
          Excluir objetivo
        </button>
      )}
    </Overlay>
  )
}

function AportarModal({ objetivo, contas, categorias, onClose, onAportar }) {
  const [valor, setValor] = useState('')
  const [registrarTransacao, setRegistrarTransacao] = useState(true)
  const [contaId, setContaId] = useState('')
  const [categoriaId, setCategoriaId] = useState('')

  async function handleConfirmar() {
    const v = currencyDisplayToNumber(valor)
    if (!v) return
    const payload = registrarTransacao && contaId ? { conta_id: contaId, categoria_id: categoriaId || null } : null
    await onAportar(objetivo, v, payload)
    onClose()
  }

  return (
    <Overlay onClose={onClose}>
      <p className="text-sm font-medium text-center mb-1">Aportar em {objetivo.nome}</p>
      <p className="text-xs text-text-secondary text-center mb-5">
        {formatBRL(objetivo.valor_atual || 0)} de {formatBRL(objetivo.valor_meta)}
      </p>

      <p className="text-[11px] text-text-muted mb-1.5">Valor do aporte</p>
      <input
        value={valor}
        onChange={(e) => setValor(digitsToCurrencyDisplay(e.target.value))}
        placeholder="0,00"
        inputMode="numeric"
        className="w-full bg-bg-raised rounded-lg px-3 py-3 text-sm outline-none mb-4"
      />

      <button
        onClick={() => setRegistrarTransacao((v) => !v)}
        className="w-full flex items-center justify-between mb-3"
      >
        <span className="text-xs text-text-secondary">Registrar também como despesa</span>
        <div className="w-9 h-5 rounded-full relative" style={{ background: registrarTransacao ? 'var(--accent-bg)' : '#1a1a1a' }}>
          <div
            className="w-4 h-4 rounded-full absolute top-0.5 transition-all"
            style={{ background: registrarTransacao ? 'var(--accent-color)' : '#5c5c59', left: registrarTransacao ? 18 : 2 }}
          />
        </div>
      </button>

      {registrarTransacao && (
        <>
          <p className="text-[11px] text-text-muted mb-1.5">Conta</p>
          <select
            value={contaId}
            onChange={(e) => setContaId(e.target.value)}
            className="w-full bg-bg-raised rounded-lg px-3 py-3 text-sm outline-none mb-3"
          >
            <option value="">Selecionar conta</option>
            {contas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>

          <p className="text-[11px] text-text-muted mb-1.5">Categoria (opcional)</p>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="w-full bg-bg-raised rounded-lg px-3 py-3 text-sm outline-none mb-4"
          >
            <option value="">Sem categoria</option>
            {categorias.filter((c) => c.tipo === 'despesa').map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </>
      )}

      <button
        onClick={handleConfirmar}
        className="w-full rounded-lg py-3 text-sm font-medium mt-1"
        style={{ background: 'var(--accent-color)', color: '#1a0d05' }}
      >
        Confirmar aporte
      </button>
    </Overlay>
  )
}
