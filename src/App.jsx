import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { biometriaAtiva } from './lib/biometria'
import BottomNav from './components/BottomNav'
import Sidebar from './components/Sidebar'
import LockScreen from './components/LockScreen'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NovaTransacao from './pages/NovaTransacao'
import Transacoes from './pages/Transacoes'
import Contas from './pages/Contas'
import Categorias from './pages/Categorias'
import Calculadora from './pages/Calculadora'
import CalculadoraJuros from './pages/CalculadoraJuros'
import Objetivos from './pages/Objetivos'
import Watchlist from './pages/Watchlist'
import Notas from './pages/Notas'
import Wishlist from './pages/Wishlist'
import Minigame from './pages/Minigame'

export default function App() {
  const { isAuthenticated, loading } = useAuth()
  const [desbloqueado, setDesbloqueado] = useState(() => !biometriaAtiva())

  if (loading) {
    return <div className="min-h-screen bg-bg-base" />
  }

  if (!isAuthenticated) {
    return <Login />
  }

  if (!desbloqueado) {
    return <LockScreen onUnlock={() => setDesbloqueado(true)} />
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary lg:flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transacoes" element={<Transacoes />} />
          <Route path="/transacoes/nova" element={<NovaTransacao />} />
          <Route path="/contas" element={<Contas />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/juros-compostos" element={<CalculadoraJuros />} />
          <Route path="/objetivos" element={<Objetivos />} />
          <Route path="/cotacoes" element={<Watchlist />} />
          <Route path="/calculadora" element={<Calculadora />} />
          <Route path="/notas" element={<Notas />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/minigame" element={<Minigame />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
