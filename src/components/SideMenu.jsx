import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconX,
  IconEdit,
  IconPlus,
  IconWallet,
  IconTag,
  IconArrowsExchange,
  IconCalculator,
  IconTarget,
  IconLogout,
  IconUser,
} from '@tabler/icons-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import Overlay from './Overlay'
import { CORES } from '../lib/colors'


const NAV_ITEMS = [
  { label: 'Contas', icon: IconWallet, path: '/contas' },
  { label: 'Categorias', icon: IconTag, path: '/categorias' },
  { label: 'Transações', icon: IconArrowsExchange, path: '/transacoes' },
  { label: 'Calculadora de juros compostos', icon: IconCalculator, path: '/juros-compostos' },
  { label: 'Objetivos', icon: IconTarget, path: '/objetivos' },
]

export default function SideMenu({ onClose }) {
  const navigate = useNavigate()
  const { user, isDemo, signOut } = useAuth()
  const { perfis, activeProfile, setActiveProfileId, updateProfile, addProfile } = useData()
  const [editando, setEditando] = useState(null)
  const [criandoAberto, setCriandoAberto] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novaCor, setNovaCor] = useState(CORES[0])

  function irPara(path) {
    onClose()
    navigate(path)
  }

  async function salvarEdicao() {
    if (!editando.nome.trim()) return
    await updateProfile(editando.id, { nome: editando.nome, cor: editando.cor, cor_bg: editando.cor + '22' })
    setEditando(null)
  }

  async function criarPerfil() {
    if (!novoNome.trim()) return
    await addProfile(novoNome.trim(), novaCor)
    setNovoNome('')
    setNovaCor(CORES[0])
    setCriandoAberto(false)
  }

  async function handleSair() {
    if (confirm('Sair da conta?')) {
      await signOut()
      onClose()
      navigate('/')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-bg-base flex flex-col px-4 pt-5 pb-6">
      <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-bg)' }}>
              <IconUser size={17} style={{ color: 'var(--accent-color)' }} />
            </div>
            <div>
              <p className="text-xs font-medium">{isDemo ? 'Modo demo' : user?.email?.split('@')[0]}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-secondary">
            <IconX size={18} />
          </button>
        </div>

        <p className="text-[11px] text-text-secondary mb-2">Perfis</p>
        <div className="bg-bg-card rounded-xl overflow-hidden mb-2">
          {perfis.map((p, i) => (
            <div key={p.id} className={i < perfis.length - 1 ? 'border-b border-bg-raised' : ''}>
              <div className="px-3 py-2.5 flex items-center justify-between">
                <button
                  onClick={() => setActiveProfileId(p.id)}
                  className="flex items-center gap-2 flex-1"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: p.cor, boxShadow: p.id === activeProfile?.id ? `0 0 6px 1px color-mix(in srgb, ${p.cor} 60%, transparent)` : 'none' }}
                  />
                  <span className="text-xs" style={{ color: p.id === activeProfile?.id ? '#e5e5e3' : '#8a8a87' }}>
                    {p.nome}
                  </span>
                </button>
                <button onClick={() => setEditando({ ...p })} className="text-text-muted">
                  <IconEdit size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setCriandoAberto(true)}
          className="w-full bg-bg-card rounded-xl px-3 py-2.5 flex items-center justify-between mb-6"
        >
          <span className="text-xs text-text-secondary">Adicionar perfil</span>
          <IconPlus size={14} className="text-text-secondary" />
        </button>

        <p className="text-[11px] text-text-secondary mb-2">Navegar</p>
        <div className="flex flex-col gap-1 mb-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => irPara(item.path)}
              className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-bg-card text-left"
            >
              <item.icon size={18} className="text-text-secondary flex-shrink-0" />
              <span className="text-sm flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-bg-raised text-text-muted">{item.badge}</span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleSair}
          className="w-full bg-[#1e1414] text-[#e2716f] rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 mt-6"
        >
          <IconLogout size={16} />
          Sair da conta
        </button>

        {editando && (
        <Overlay onClose={() => setEditando(null)}>
          <p className="text-sm font-medium text-center mb-4">Editar perfil</p>
          <p className="text-[11px] text-text-muted mb-1.5">Nome</p>
          <input
            value={editando.nome}
            onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
            className="w-full bg-bg-raised rounded-lg px-3 py-3 text-sm outline-none mb-4"
          />
          <p className="text-[11px] text-text-muted mb-1.5">Cor de destaque</p>
          <p className="text-[10px] text-text-muted mb-3">Muda o tema do app inteiro quando esse perfil está ativo</p>
          <div className="flex flex-wrap gap-2.5 mb-5">
            {CORES.map((cor) => (
              <button
                key={cor}
                onClick={() => setEditando({ ...editando, cor })}
                className="w-8 h-8 rounded-full"
                style={{ background: cor, border: cor === editando.cor ? '2px solid #e5e5e3' : '2px solid transparent' }}
              />
            ))}
          </div>
          <button onClick={salvarEdicao} className="w-full rounded-lg py-3 text-sm font-medium" style={{ background: '#e5e5e3', color: '#0a0a0a' }}>
            Salvar
          </button>
        </Overlay>
      )}

      {criandoAberto && (
        <Overlay onClose={() => setCriandoAberto(false)}>
          <p className="text-sm font-medium text-center mb-4">Novo perfil</p>
          <p className="text-[11px] text-text-muted mb-1.5">Nome</p>
          <input
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            placeholder="Ex: Nebulus"
            className="w-full bg-bg-raised rounded-lg px-3 py-3 text-sm outline-none mb-4 placeholder:text-text-muted"
          />
          <p className="text-[11px] text-text-muted mb-1.5">Cor de destaque</p>
          <div className="flex flex-wrap gap-2.5 mb-5">
            {CORES.map((cor) => (
              <button
                key={cor}
                onClick={() => setNovaCor(cor)}
                className="w-8 h-8 rounded-full"
                style={{ background: cor, border: cor === novaCor ? '2px solid #e5e5e3' : '2px solid transparent' }}
              />
            ))}
          </div>
          <button onClick={criarPerfil} className="w-full rounded-lg py-3 text-sm font-medium" style={{ background: '#e5e5e3', color: '#0a0a0a' }}>
            Criar perfil
          </button>
        </Overlay>
      )}
    </div>
  )
}
