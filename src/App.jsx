import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import BottomNav from './components/BottomNav'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NovaTransacao from './pages/NovaTransacao'
import Transacoes from './pages/Transacoes'
import Contas from './pages/Contas'
import Categorias from './pages/Categorias'
import Configuracoes from './pages/Configuracoes'
import Calculadora from './pages/Calculadora'
import Notas from './pages/Notas'
import Wishlist from './pages/Wishlist'
import Minigame from './pages/Minigame'

export default function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen bg-bg-base" />
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transacoes" element={<Transacoes />} />
        <Route path="/transacoes/nova" element={<NovaTransacao />} />
        <Route path="/contas" element={<Contas />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/calculadora" element={<Calculadora />} />
        <Route path="/notas" element={<Notas />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/minigame" element={<Minigame />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}
