import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  IconEdit,
  IconPlus,
  IconHome2,
  IconCreditCard,
  IconCategory2,
  IconArrowsExchange,
  IconCalculator,
  IconTarget,
  IconChartCandle,
  IconGift,
  IconNotes,
  IconDeviceGamepad2,
  IconLogout,
} from '@tabler/icons-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { COR_PADRAO } from '../lib/colors'
import ColorPicker from './ColorPicker'
import Overlay from './Overlay'
import logo from '../assets/logo.svg'

const NAV_ITEMS = [
  { label: 'Visão geral', icon: IconHome2, path: '/', end: true },
  { label: 'Transações', icon: IconArrowsExchange, path: '/transacoes' },
  { label: 'Contas', icon: IconCreditCard, path: '/contas' },
  { label: 'Categorias', icon: IconCategory2, path: '/categorias' },
  { label: 'Objetivos', icon: IconTarget, path: '/objetivos' },
  { label: 'Cotações', icon: IconChartCandle, path: '/cotacoes' },
  { label: 'Lista de desejos', icon: IconGift, path: '/wishlist' },
  { label: 'Notas', icon: IconNotes, path: '/notas' },
  { label: 'Juros compostos', icon: IconCalculator, path: '/juros-compostos' },
  { label: 'Minigame', icon: IconDeviceGamepad2, path: '/minigame' },
]

// Barra lateral fixa pra telas grandes -- espelha os controles do SideMenu
// (perfis, sair) só que sempre visível, sem overlay.
export default function Sidebar() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { perfis, activeProfile, setActiveProfileId, updateProfile, addProfile } = useData()
  const [editando, setEditando] = useState(null)
  const [criandoAberto, setCriandoAberto] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novaCor, setNovaCor] = useState(COR_PADRAO)

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
    setNovaCor(COR_PADRAO)
    setCriandoAberto(false)
  }

  async function handleSair() {
    if (confirm('Sair da conta?')) {
      await signOut()
      navigate('/')
    }
  }

  return (
    <aside className="hidden lg:flex w-[232px] shrink-0 h-screen sticky top-0 flex-col gap-5 px-3.5 py-5 border-r border-bg-raised">
      <div className="flex items-center gap-2.5 px-1.5">
        <img src={logo} alt="" className="w-6 h-6" />
        <span className="text-[13.5px] font-semibold tracking-tight">Financeiro</span>
      </div>

      <div className="bg-bg-card border border-bg-raised rounded-xl p-1 flex flex-col gap-0.5">
        {perfis.map((p) => (
          <div key={p.id} className="flex items-center gap-1">
            <button
              onClick={() => setActiveProfileId(p.id)}
              className={`flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs ${
                p.id === activeProfile?.id ? 'bg-bg-raised text-text-primary' : 'text-text-secondary'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.cor }} />
              <span className="truncate">{p.nome}</span>
            </button>
            <button onClick={() => setEditando({ ...p })} className="text-text-muted p-1.5 flex-shrink-0">
              <IconEdit size={13} />
            </button>
          </div>
        ))}
        <button
          onClick={() => setCriandoAberto(true)}
          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-text-secondary"
        >
          Adicionar perfil <IconPlus size={13} />
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
        <span className="text-[10px] uppercase tracking-wide text-text-muted px-2.5 mb-1.5">Navegar</span>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] ${
                isActive ? 'bg-bg-card text-text-primary' : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={16} className="flex-shrink-0" style={{ color: isActive ? 'var(--accent-color)' : undefined }} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleSair}
          className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[#1e1414] text-[#e2716f] text-xs"
        >
          <IconLogout size={15} /> Sair da conta
        </button>
      </div>

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
          <ColorPicker value={editando.cor} onChange={(cor) => setEditando({ ...editando, cor })} />
          <button
            onClick={() => setEditando({ ...editando, ocultar_extras: !editando.ocultar_extras })}
            className="w-full flex items-center justify-between mt-4"
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
          <button onClick={salvarEdicao} className="w-full rounded-lg py-3 text-sm font-medium mt-4" style={{ background: '#e5e5e3', color: '#0a0a0a' }}>
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
            placeholder="Ex: Empresa"
            className="w-full bg-bg-raised rounded-lg px-3 py-3 text-sm outline-none mb-4 placeholder:text-text-muted"
          />
          <p className="text-[11px] text-text-muted mb-1.5">Cor de destaque</p>
          <ColorPicker value={novaCor} onChange={setNovaCor} />
          <button onClick={criarPerfil} className="w-full rounded-lg py-3 text-sm font-medium mt-4" style={{ background: '#e5e5e3', color: '#0a0a0a' }}>
            Criar perfil
          </button>
        </Overlay>
      )}
    </aside>
  )
}
