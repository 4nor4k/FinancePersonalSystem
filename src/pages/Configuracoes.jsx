import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconChevronLeft, IconUser, IconEdit, IconPlus, IconLogout, IconX } from '@tabler/icons-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'

const CORES = ['#ff8a3d', '#4fce7a', '#5ab8e0', '#c084e0', '#e05a8a', '#e0d15a']

export default function Configuracoes() {
  const navigate = useNavigate()
  const { user, isDemo, signOut } = useAuth()
  const { perfis, updateProfile, addProfile } = useData()
  const [editando, setEditando] = useState(null) // perfil sendo editado
  const [criandoAberto, setCriandoAberto] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novaCor, setNovaCor] = useState(CORES[0])

  function abrirEdicao(perfil) {
    setEditando({ ...perfil })
  }

  async function salvarEdicao() {
    if (!editando.nome.trim()) return
    await updateProfile(editando.id, {
      nome: editando.nome,
      cor: editando.cor,
      cor_bg: editando.cor + '22',
      ocultar_extras: editando.ocultar_extras,
    })
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
      navigate('/')
    }
  }

  return (
    <div className="max-w-md lg:max-w-2xl mx-auto px-4 pt-4 pb-28 lg:px-9 lg:pt-7 lg:pb-10">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate(-1)} className="text-text-secondary">
          <IconChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium">Configurações</span>
        <div className="w-5" />
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-bg)' }}>
          <IconUser size={22} style={{ color: 'var(--accent-color)' }} />
        </div>
        <div>
          <p className="text-sm font-medium">{isDemo ? 'Modo demo' : user?.email?.split('@')[0]}</p>
          <p className="text-xs text-text-secondary mt-0.5">{isDemo ? 'Dados de exemplo' : user?.email}</p>
        </div>
      </div>

      <p className="text-[11px] text-text-secondary mb-2">Perfis</p>
      <div className="bg-bg-card rounded-xl overflow-hidden mb-3">
        {perfis.map((p, i) => (
          <button
            key={p.id}
            onClick={() => abrirEdicao(p)}
            className={`w-full px-3.5 py-3 flex items-center justify-between ${i < perfis.length - 1 ? 'border-b border-bg-raised' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full" style={{ background: p.cor }} />
              <span className="text-sm">{p.nome}</span>
            </div>
            <IconEdit size={15} className="text-text-muted" />
          </button>
        ))}
      </div>

      <button
        onClick={() => setCriandoAberto(true)}
        className="w-full bg-bg-card rounded-xl px-3.5 py-3 flex items-center justify-between mb-6"
      >
        <span className="text-sm">Adicionar novo perfil</span>
        <IconPlus size={16} className="text-text-secondary" />
      </button>

      <button
        onClick={handleSair}
        className="w-full bg-[#1e1414] text-[#e2716f] rounded-xl py-3.5 text-sm font-medium flex items-center justify-center gap-2"
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
          <div className="flex gap-2.5 mb-5">
            {CORES.map((cor) => (
              <button
                key={cor}
                onClick={() => setEditando({ ...editando, cor })}
                className="w-8 h-8 rounded-full"
                style={{ background: cor, border: cor === editando.cor ? '2px solid #e5e5e3' : '2px solid transparent' }}
              />
            ))}
          </div>
          <button
            onClick={() => setEditando({ ...editando, ocultar_extras: !editando.ocultar_extras })}
            className="w-full flex items-center justify-between mb-5"
          >
            <div className="text-left">
              <span className="text-xs block">Perfil discreto</span>
              <span className="text-[10px] text-text-muted">Esconde cotações e lista de desejos no dashboard</span>
            </div>
            <div className="w-9 h-5 rounded-full relative flex-shrink-0" style={{ background: editando.ocultar_extras ? 'var(--accent-bg)' : '#1a1a1a' }}>
              <div
                className="w-4 h-4 rounded-full absolute top-0.5 transition-all"
                style={{ background: editando.ocultar_extras ? 'var(--accent-color)' : '#5c5c59', left: editando.ocultar_extras ? 18 : 2 }}
              />
            </div>
          </button>
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
          <div className="flex gap-2.5 mb-5">
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
