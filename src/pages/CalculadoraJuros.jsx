import { useNavigate } from 'react-router-dom'
import { IconChevronLeft, IconTrendingUp } from '@tabler/icons-react'

export default function CalculadoraJuros() {
  const navigate = useNavigate()
  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-56">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="text-text-secondary">
          <IconChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium">Juros compostos</span>
        <div className="w-5" />
      </div>
      <div className="flex flex-col items-center text-center mt-16">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--accent-bg)' }}>
          <IconTrendingUp size={24} style={{ color: 'var(--accent-color)' }} />
        </div>
        <p className="text-sm font-medium mb-1.5">Em breve</p>
        <p className="text-xs text-text-muted max-w-[240px]">
          Uma calculadora de juros compostos pra simular seus investimentos, ainda por implementar.
        </p>
      </div>
    </div>
  )
}
