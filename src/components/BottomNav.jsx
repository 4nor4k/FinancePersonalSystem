import { NavLink, useNavigate } from 'react-router-dom'
import { IconHome, IconDeviceGamepad2, IconPlus, IconCalculator, IconNotes } from '@tabler/icons-react'

const linkClass = ({ isActive }) =>
  `flex items-center justify-center ${isActive ? 'text-text-primary' : 'text-text-muted'}`

export default function BottomNav() {
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-[30px] left-0 right-0 h-[76px]">
      <nav className="absolute left-4 right-4 bottom-0 bg-bg-card rounded-full px-5 py-3.5 flex items-center justify-around">
        <NavLink to="/" end className={linkClass}>
          <IconHome size={20} stroke={1.75} />
        </NavLink>
        <NavLink to="/minigame" className={linkClass}>
          <IconDeviceGamepad2 size={20} stroke={1.75} />
        </NavLink>
        <span className="w-5" />
        <NavLink to="/calculadora" className={linkClass}>
          <IconCalculator size={20} stroke={1.75} />
        </NavLink>
        <NavLink to="/notas" className={linkClass}>
          <IconNotes size={20} stroke={1.75} />
        </NavLink>
      </nav>
      <button
        onClick={() => navigate('/transacoes/nova')}
        aria-label="Nova transação"
        className="absolute left-1/2 -translate-x-1/2 bottom-3.5 w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: 'var(--accent-color)',
          boxShadow: '0 0 22px 2px color-mix(in srgb, var(--accent-color) 50%, transparent)',
        }}
      >
        <IconPlus size={24} color="#1a0d05" />
      </button>
    </div>
  )
}
