import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconChevronLeft, IconPlus, IconEdit, IconTrash } from '@tabler/icons-react'
import { useData } from '../context/DataContext'
import { COR_PADRAO } from '../lib/colors'
import ColorPicker from '../components/ColorPicker'

const ICONES = [
  'ti-home', 'ti-car', 'ti-shopping-cart', 'ti-device-laptop', 'ti-tools', 'ti-heart', 'ti-plane', 'ti-school', 'ti-paw', 'ti-gift', 'ti-cash', 'ti-dots',
  'ti-bolt', 'ti-droplet', 'ti-wifi', 'ti-pizza', 'ti-medical-cross', 'ti-golf',
]

export default function Categorias() {
  const navigate = useNavigate()
  const { categorias, addCategoria, updateCategoria, deleteCategoria } = useData()
  const [tipo, setTipo] = useState('despesa')
  const [criando, setCriando] = useState(false)
  const [nome, setNome] = useState('')
  const [icone, setIcone] = useState(ICONES[0])
  const [cor, setCor] = useState(COR_PADRAO)
  const [editandoId, setEditandoId] = useState(null)

  const filtradas = categorias.filter((c) => c.tipo === tipo)

  async function handleSalvar() {
    if (!nome.trim()) return
    await addCategoria({ nome, tipo, icone, cor })
    setNome('')
    setCriando(false)
  }

  async function handleExcluir(id) {
    if (confirm('Excluir essa categoria? Transações que já usam ela continuam existindo.')) {
      await deleteCategoria(id)
      setEditandoId(null)
    }
  }

  return (
    <div className="max-w-md lg:max-w-2xl mx-auto px-4 pt-4 pb-56 lg:px-9 lg:pt-7 lg:pb-10">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-text-secondary">
          <IconChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium">Categorias</span>
        <button onClick={() => setCriando((v) => !v)} className="text-text-secondary">
          <IconPlus size={18} />
        </button>
      </div>

      <div className="flex gap-1.5 bg-bg-raised rounded-full p-1 mb-4">
        {['despesa', 'receita'].map((t) => (
          <button
            key={t}
            onClick={() => setTipo(t)}
            className="flex-1 text-center text-xs py-2 rounded-full capitalize"
            style={t === tipo ? { background: '#333331', color: '#f0f0ee', fontWeight: 500 } : { color: '#8a8a87' }}
          >
            {t}
          </button>
        ))}
      </div>

      {criando && (
        <div className="bg-bg-card rounded-xl p-3.5 mb-4">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome da categoria"
            className="w-full bg-bg-raised rounded-lg px-3 py-2.5 text-sm outline-none mb-3 placeholder:text-text-muted"
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
          <button
            onClick={handleSalvar}
            className="w-full rounded-lg py-2.5 text-sm font-medium mt-4"
            style={{ background: '#e5e5e3', color: '#0a0a0a' }}
          >
            Salvar categoria
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {filtradas.map((c) => (
          <div key={c.id} className="bg-bg-card rounded-xl overflow-hidden">
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#1a1a1a' }}>
                  <i className={`ti ${c.icone}`} style={{ fontSize: 15, color: c.cor }} />
                </div>
                <span className="text-sm">{c.nome}</span>
              </div>
              <button onClick={() => setEditandoId(editandoId === c.id ? null : c.id)} className="text-text-muted">
                <IconEdit size={15} />
              </button>
            </div>

            {editandoId === c.id && (
              <div className="px-3 pb-3">
                <input
                  value={c.nome}
                  onChange={(e) => updateCategoria(c.id, { nome: e.target.value })}
                  className="w-full bg-bg-raised rounded-lg px-3 py-2.5 text-sm outline-none mb-3"
                />
                <p className="text-[11px] text-text-muted mb-1.5">Ícone</p>
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {ICONES.map((ic) => (
                    <button
                      key={ic}
                      onClick={() => updateCategoria(c.id, { icone: ic })}
                      className="aspect-square rounded-lg flex items-center justify-center"
                      style={{ background: ic === c.icone ? '#232323' : '#1a1a1a' }}
                    >
                      <i className={`ti ${ic}`} style={{ fontSize: 15, color: ic === c.icone ? '#e5e5e3' : '#8a8a87' }} />
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-text-muted mb-1.5">Cor</p>
                <ColorPicker value={c.cor} onChange={(cor) => updateCategoria(c.id, { cor })} />
                <button
                  onClick={() => handleExcluir(c.id)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-medium mt-4"
                  style={{ background: '#1e1414', color: '#e2716f' }}
                >
                  <IconTrash size={14} />
                  Excluir categoria
                </button>
              </div>
            )}
          </div>
        ))}
        {filtradas.length === 0 && (
          <p className="text-xs text-text-muted text-center py-6">Nenhuma categoria de {tipo} ainda.</p>
        )}
      </div>
    </div>
  )
}
