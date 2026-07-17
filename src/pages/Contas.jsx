import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconChevronLeft, IconPlus, IconEdit } from '@tabler/icons-react'
import { useData } from '../context/DataContext'
import { formatBRL } from '../lib/format'

const CORES = ['#ff8a3d', '#d9b56a', '#7fd88f', '#6ab8d9', '#a892e0', '#8a8a87']
const ICONES = ['ti-building-bank', 'ti-pig-money', 'ti-credit-card', 'ti-cash', 'ti-wallet', 'ti-coin']

export default function Contas() {
  const navigate = useNavigate()
  const { contas, transacoes, addConta, updateConta } = useData()
  const [criando, setCriando] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState({ nome: '', tipo: 'comum', limite: '', icone: ICONES[0], cor: CORES[0] })

  function saldoConta(conta) {
    const soma = transacoes
      .filter((t) => t.conta_id === conta.id && t.status !== 'pendente')
      .reduce((acc, t) => acc + (t.tipo === 'receita' ? t.valor : -t.valor), 0)
    if (conta.tipo === 'cartao_credito') {
      const usado = transacoes
        .filter((t) => t.conta_id === conta.id && t.status === 'pendente' && t.tipo === 'despesa')
        .reduce((acc, t) => acc + t.valor, 0)
      return `${formatBRL((conta.limite || 0) - usado)} disponível`
    }
    return formatBRL(soma)
  }

  async function handleCriar() {
    if (!form.nome.trim()) return
    await addConta({
      nome: form.nome,
      tipo: form.tipo,
      limite: form.tipo === 'cartao_credito' ? Number(form.limite) || 0 : null,
      icone: form.icone,
      cor: form.cor,
    })
    setForm({ nome: '', tipo: 'comum', limite: '', icone: ICONES[0], cor: CORES[0] })
    setCriando(false)
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28">
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
              onChange={(e) => setForm((f) => ({ ...f, limite: e.target.value.replace(/[^0-9]/g, '') }))}
              placeholder="Limite (ex: 2000)"
              inputMode="numeric"
              className="w-full bg-bg-raised rounded-lg px-3 py-2.5 text-sm outline-none mb-3 placeholder:text-text-muted"
            />
          )}
          <p className="text-[11px] text-text-muted mb-1.5">Ícone</p>
          <div className="grid grid-cols-6 gap-2 mb-3">
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
          <div className="flex gap-2 mb-3.5">
            {CORES.map((c) => (
              <button
                key={c}
                onClick={() => setForm((f) => ({ ...f, cor: c }))}
                className="w-7 h-7 rounded-full"
                style={{ background: c, border: c === form.cor ? '2px solid #e5e5e3' : '2px solid transparent' }}
              />
            ))}
          </div>
          <button onClick={handleCriar} className="w-full rounded-lg py-2.5 text-sm font-medium" style={{ background: '#e5e5e3', color: '#0a0a0a' }}>
            Salvar conta
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {contas.map((c) => (
          <div key={c.id} className="bg-bg-card rounded-xl overflow-hidden">
            <div className="p-3 flex items-center">
              <div className="w-8.5 h-8.5 rounded-lg flex items-center justify-center mr-3" style={{ background: '#1a1a1a' }}>
                <i className={`ti ${c.icone || 'ti-building-bank'}`} style={{ fontSize: 15, color: c.cor || '#8a8a87' }} />
              </div>
              <div className="flex-1">
                <p className="text-sm">{c.nome}</p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  {c.tipo === 'cartao_credito' ? 'Cartão de crédito' : 'Comum'}
                </p>
              </div>
              <span className="text-sm mr-2">{saldoConta(c)}</span>
              <button onClick={() => setEditandoId(editandoId === c.id ? null : c.id)} className="text-text-muted">
                <IconEdit size={15} />
              </button>
            </div>
            {editandoId === c.id && (
              <div className="px-3 pb-3">
                <p className="text-[11px] text-text-muted mb-1.5">Ícone</p>
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {ICONES.map((ic) => (
                    <button
                      key={ic}
                      onClick={() => updateConta(c.id, { icone: ic })}
                      className="aspect-square rounded-lg flex items-center justify-center"
                      style={{ background: ic === c.icone ? '#232323' : '#1a1a1a' }}
                    >
                      <i className={`ti ${ic}`} style={{ fontSize: 15, color: ic === c.icone ? '#e5e5e3' : '#8a8a87' }} />
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-text-muted mb-1.5">Cor</p>
                <div className="flex gap-2">
                  {CORES.map((cor) => (
                    <button
                      key={cor}
                      onClick={() => updateConta(c.id, { cor })}
                      className="w-6 h-6 rounded-full"
                      style={{ background: cor, border: cor === c.cor ? '2px solid #e5e5e3' : '2px solid transparent' }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {contas.length === 0 && (
          <p className="text-xs text-text-muted text-center py-6">Nenhuma conta ainda.</p>
        )}
      </div>
    </div>
  )
}
