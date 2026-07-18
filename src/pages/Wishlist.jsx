import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconChevronLeft, IconPlus, IconPhoto, IconPhotoPlus, IconX, IconTrash, IconShoppingBag } from '@tabler/icons-react'
import { useData } from '../context/DataContext'
import { formatBRL } from '../lib/format'

export default function Wishlist() {
  const navigate = useNavigate()
  const { wishlist, categorias, contas, addWishlistItem, deleteWishlistItem, comprarWishlistItem } = useData()
  const [criando, setCriando] = useState(false)
  const [comprando, setComprando] = useState(null)
  const [form, setForm] = useState({ nome: '', preco: '', link_produto: '', link_imagem: '', meta_data: '' })
  const [compraForm, setCompraForm] = useState({ conta_id: '', categoria_id: '' })

  async function handleAdicionar() {
    if (!form.nome.trim()) return
    await addWishlistItem({
      nome: form.nome,
      preco: Number(form.preco) || 0,
      link_produto: form.link_produto,
      link_imagem: form.link_imagem,
      meta_data: form.meta_data || null,
    })
    setForm({ nome: '', preco: '', link_produto: '', link_imagem: '', meta_data: '' })
    setCriando(false)
  }

  async function handleComprar() {
    if (!compraForm.conta_id) return
    await comprarWishlistItem(comprando, {
      tipo: 'despesa',
      conta_id: compraForm.conta_id,
      categoria_id: compraForm.categoria_id || null,
      valor: comprando.preco,
    })
    setComprando(null)
  }

  const hoje = new Date().toISOString().slice(0, 10)

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-56">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-text-secondary">
          <IconChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium">Lista de desejos</span>
        <button onClick={() => setCriando(true)} style={{ color: 'var(--accent-color)' }}>
          <IconPlus size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {wishlist.map((item) => {
          const vencido = item.meta_data && item.meta_data < hoje
          return (
            <div key={item.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-tone-2)', border: '0.5px solid #2a2620' }}>
              <div className="relative aspect-square bg-bg-raised">
                {item.link_imagem ? (
                  <img src={item.link_imagem} alt={item.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <IconPhoto size={26} className="text-text-muted" />
                  </div>
                )}
                <button
                  onClick={() => deleteWishlistItem(item.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/55 flex items-center justify-center"
                >
                  <IconTrash size={13} color="#e5e5e3" />
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium truncate mb-0.5">{item.nome}</p>
                <p className="text-[10px] mb-2" style={{ color: vencido ? '#e2716f' : '#7a7a77' }}>
                  {item.meta_data
                    ? `${vencido ? 'Vencida ' : ''}${item.meta_data.slice(8, 10)}/${item.meta_data.slice(5, 7)}`
                    : 'Sem meta'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{formatBRL(item.preco)}</span>
                  <button
                    onClick={() => setComprando(item)}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--accent-color)' }}
                  >
                    <IconShoppingBag size={14} color="#1a0d05" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        {wishlist.length === 0 && (
          <p className="text-xs text-text-muted text-center py-6 col-span-2">Sua lista de desejos está vazia.</p>
        )}
      </div>

      {criando && (
        <Overlay onClose={() => setCriando(false)}>
          <p className="text-sm font-medium text-center mb-4">Novo desejo</p>
          <div className="w-full h-24 bg-bg-raised rounded-xl mb-3.5 flex flex-col items-center justify-center gap-1.5">
            {form.link_imagem ? (
              <img src={form.link_imagem} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <>
                <IconPhotoPlus size={22} className="text-text-muted" />
                <span className="text-[11px] text-text-muted">Colar link da imagem abaixo</span>
              </>
            )}
          </div>
          <LabeledInput label="Nome" value={form.nome} onChange={(v) => setForm((f) => ({ ...f, nome: v }))} placeholder="Ex: Fone bluetooth" />
          <LabeledInput label="Preço estimado" value={form.preco} onChange={(v) => setForm((f) => ({ ...f, preco: v.replace(/[^0-9.]/g, '') }))} placeholder="0,00" />
          <LabeledInput label="Link do produto" value={form.link_produto} onChange={(v) => setForm((f) => ({ ...f, link_produto: v }))} placeholder="https://..." />
          <LabeledInput label="Link da imagem" value={form.link_imagem} onChange={(v) => setForm((f) => ({ ...f, link_imagem: v }))} placeholder="https://..." />
          <div className="mb-4">
            <p className="text-[11px] text-text-muted mb-1.5">Meta de compra</p>
            <input type="date" value={form.meta_data} onChange={(e) => setForm((f) => ({ ...f, meta_data: e.target.value }))} className="w-full bg-bg-raised rounded-lg px-3 py-3 text-sm outline-none" />
          </div>
          <button onClick={handleAdicionar} className="w-full rounded-lg py-3 text-sm font-medium" style={{ background: '#e5e5e3', color: '#0a0a0a' }}>
            Adicionar à lista
          </button>
        </Overlay>
      )}

      {comprando && (
        <Overlay onClose={() => setComprando(null)}>
          <p className="text-sm font-medium text-center mb-1">Comprar {comprando.nome}</p>
          <p className="text-xs text-text-secondary text-center mb-4">{formatBRL(comprando.preco)}</p>
          <div className="mb-3">
            <p className="text-[11px] text-text-muted mb-1.5">Conta</p>
            <select value={compraForm.conta_id} onChange={(e) => setCompraForm((f) => ({ ...f, conta_id: e.target.value }))} className="w-full bg-bg-raised rounded-lg px-3 py-3 text-sm outline-none">
              <option value="">Selecionar conta</option>
              {contas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <p className="text-[11px] text-text-muted mb-1.5">Categoria</p>
            <select value={compraForm.categoria_id} onChange={(e) => setCompraForm((f) => ({ ...f, categoria_id: e.target.value }))} className="w-full bg-bg-raised rounded-lg px-3 py-3 text-sm outline-none">
              <option value="">Selecionar categoria</option>
              {categorias.filter((c) => c.tipo === 'despesa').map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <button onClick={handleComprar} className="w-full rounded-lg py-3 text-sm font-medium" style={{ background: 'var(--accent-color)', color: '#1a0d05' }}>
            Confirmar compra
          </button>
        </Overlay>
      )}
    </div>
  )
}

function LabeledInput({ label, value, onChange, placeholder }) {
  return (
    <div className="mb-3">
      <p className="text-[11px] text-text-muted mb-1.5">{label}</p>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-bg-raised rounded-lg px-3 py-3 text-sm outline-none placeholder:text-text-muted" />
    </div>
  )
}

function Overlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" onClick={onClose}>
      <div className="w-full max-w-md bg-bg-base rounded-t-3xl p-5 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end mb-1">
          <button onClick={onClose} className="text-text-secondary"><IconX size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
