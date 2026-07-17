import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

const DEMO_KEY = 'financeiro:demo-mode'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isDemo, setIsDemo] = useState(() => localStorage.getItem(DEMO_KEY) === '1')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  function enterDemo() {
    localStorage.setItem(DEMO_KEY, '1')
    setIsDemo(true)
  }

  async function signOut() {
    localStorage.removeItem(DEMO_KEY)
    setIsDemo(false)
    await supabase.auth.signOut()
  }

  const value = {
    session,
    user: session?.user ?? null,
    isDemo,
    isAuthenticated: !!session || isDemo,
    loading,
    enterDemo,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de um AuthProvider')
  return ctx
}
