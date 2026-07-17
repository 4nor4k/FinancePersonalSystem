import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'
import {
  mockPerfis,
  mockContas,
  mockCategorias,
  mockRecorrencias,
  mockTransacoes,
  mockNotas,
  mockWishlist,
} from '../lib/mockData'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const { isDemo, user } = useAuth()

  const [perfis, setPerfis] = useState([])
  const [contas, setContas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [recorrencias, setRecorrencias] = useState([])
  const [transacoes, setTransacoes] = useState([])
  const [notas, setNotas] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [activeProfileId, setActiveProfileId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [valuesHidden, setValuesHiddenState] = useState(
    () => localStorage.getItem('financeiro:valores-ocultos') !== '0'
  )
  function setValuesHidden(hidden) {
    localStorage.setItem('financeiro:valores-ocultos', hidden ? '1' : '0')
    setValuesHiddenState(hidden)
  }
  const [calcExpr, setCalcExpr] = useState('')

  // Carrega os dados: mock em memória no modo demo, ou do Supabase quando logado de verdade.
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      if (isDemo) {
        setPerfis(mockPerfis)
        setContas(mockContas)
        setCategorias(mockCategorias)
        setRecorrencias(mockRecorrencias)
        setTransacoes(mockTransacoes)
        setNotas(mockNotas)
        setWishlist(mockWishlist)
        setActiveProfileId(mockPerfis[0].id)
        setLoading(false)
        return
      }

      if (!user) {
        setLoading(false)
        return
      }

      const [p, c, cat, rec, t, n, w] = await Promise.all([
        supabase.from('perfis').select('*').order('criado_em'),
        supabase.from('contas').select('*'),
        supabase.from('categorias').select('*'),
        supabase.from('recorrencias').select('*'),
        supabase.from('transacoes').select('*').order('data'),
        supabase.from('notas').select('*').order('atualizado_em', { ascending: false }),
        supabase.from('wishlist_itens').select('*'),
      ])

      if (cancelled) return

      let perfisData = p.data || []

      // Primeiro acesso: cria um perfil "Pessoal" padrão pra não abrir vazio.
      if (perfisData.length === 0) {
        const { data: novo } = await supabase
          .from('perfis')
          .insert({ usuario_id: user.id, nome: 'Pessoal', cor: '#ff8a3d', cor_bg: '#2e1c10' })
          .select()
          .single()
        if (novo) perfisData = [novo]
      }

      setPerfis(perfisData)
      setContas(c.data || [])
      setCategorias(cat.data || [])
      setRecorrencias(rec.data || [])
      setTransacoes(t.data || [])
      setNotas(n.data || [])
      setWishlist(w.data || [])
      setActiveProfileId(perfisData[0]?.id ?? null)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [isDemo, user])

  const activeProfile = perfis.find((p) => p.id === activeProfileId) || perfis[0]

  useEffect(() => {
    if (!activeProfile) return
    document.documentElement.style.setProperty('--accent-color', activeProfile.cor)
    document.documentElement.style.setProperty('--accent-bg', activeProfile.cor_bg)
  }, [activeProfile])

  // ---------- Perfis ----------
  const addProfile = useCallback(
    async (nome, cor = '#ff8a3d') => {
      const cor_bg = cor + '22'
      if (isDemo) {
        const novo = { id: 'p-' + Date.now(), nome, cor, cor_bg }
        setPerfis((prev) => [...prev, novo])
        return novo
      }
      const { data } = await supabase
        .from('perfis')
        .insert({ usuario_id: user.id, nome, cor, cor_bg })
        .select()
        .single()
      if (data) setPerfis((prev) => [...prev, data])
      return data
    },
    [isDemo, user]
  )

  const updateProfile = useCallback(
    async (id, patch) => {
      setPerfis((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
      if (!isDemo) await supabase.from('perfis').update(patch).eq('id', id)
    },
    [isDemo]
  )

  // ---------- Contas ----------
  const addConta = useCallback(
    async ({ nome, tipo, limite, icone, cor }) => {
      const payload = {
        nome,
        tipo,
        limite: limite ?? null,
        icone: icone || (tipo === 'cartao_credito' ? 'ti-credit-card' : 'ti-building-bank'),
        cor: cor || '#8a8a87',
      }
      if (isDemo) {
        const nova = { id: 'c-' + Date.now(), perfil_id: activeProfileId, ...payload }
        setContas((prev) => [...prev, nova])
        return nova
      }
      const { data } = await supabase
        .from('contas')
        .insert({ perfil_id: activeProfileId, ...payload })
        .select()
        .single()
      if (data) setContas((prev) => [...prev, data])
      return data
    },
    [isDemo, activeProfileId]
  )

  const updateConta = useCallback(
    async (id, patch) => {
      setContas((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
      if (!isDemo) await supabase.from('contas').update(patch).eq('id', id)
    },
    [isDemo]
  )

  // ---------- Categorias ----------
  const addCategoria = useCallback(
    async ({ nome, tipo, icone, cor }) => {
      if (isDemo) {
        const nova = { id: 'cat-' + Date.now(), perfil_id: activeProfileId, nome, tipo, icone, cor }
        setCategorias((prev) => [...prev, nova])
        return nova
      }
      const { data } = await supabase
        .from('categorias')
        .insert({ perfil_id: activeProfileId, nome, tipo, icone, cor })
        .select()
        .single()
      if (data) setCategorias((prev) => [...prev, data])
      return data
    },
    [isDemo, activeProfileId]
  )

  // ---------- Transações ----------
  const addTransacao = useCallback(
    async (payload) => {
      const base = {
        perfil_id: activeProfileId,
        tipo: 'despesa',
        status: 'pendente',
        data: new Date().toISOString().slice(0, 10),
        ...payload,
      }

      // Recorrência: gera as ocorrências futuras de uma vez (simplificado --
      // fixa gera 12 meses à frente, parcelada gera o número de parcelas).
      if (payload.repetir === 'fixa' || payload.repetir === 'parcelada') {
        const numeroParcelas = payload.repetir === 'parcelada' ? payload.numeroParcelas || 2 : 12
        const recorrenciaId = 'rec-' + Date.now()
        const recorrencia = {
          id: recorrenciaId,
          perfil_id: activeProfileId,
          tipo: payload.repetir,
          valor_original: base.valor,
          data_inicio: base.data,
          numero_parcelas: payload.repetir === 'parcelada' ? numeroParcelas : null,
          ativa: true,
        }

        if (!isDemo) {
          const { data } = await supabase.from('recorrencias').insert(recorrencia).select().single()
          if (data) recorrencia.id = data.id
        }
        setRecorrencias((prev) => [...prev, recorrencia])

        const novas = []
        const [ano, mes, dia] = base.data.split('-').map(Number)
        for (let i = 0; i < numeroParcelas; i++) {
          const d = new Date(ano, mes - 1 + i, dia)
          novas.push({
            id: 't-' + Date.now() + '-' + i,
            perfil_id: activeProfileId,
            conta_id: base.conta_id,
            categoria_id: base.categoria_id,
            recorrencia_id: recorrencia.id,
            tipo: base.tipo,
            valor: base.valor,
            data: d.toISOString().slice(0, 10),
            anotacao: base.anotacao || '',
            status: 'pendente',
            parcela_atual: payload.repetir === 'parcelada' ? i + 1 : null,
          })
        }

        if (!isDemo) {
          const { data } = await supabase.from('transacoes').insert(novas).select()
          if (data) return setTransacoes((prev) => [...prev, ...data])
        }
        setTransacoes((prev) => [...prev, ...novas])
        return novas
      }

      if (isDemo) {
        const nova = { id: 't-' + Date.now(), ...base }
        setTransacoes((prev) => [...prev, nova])
        return nova
      }
      const { data } = await supabase.from('transacoes').insert(base).select().single()
      if (data) setTransacoes((prev) => [...prev, data])
      return data
    },
    [isDemo, activeProfileId]
  )

  const consolidarTransacao = useCallback(
    async (id) => {
      const t = transacoes.find((x) => x.id === id)
      if (!t) return
      const novoStatus = t.tipo === 'receita' ? 'recebido' : 'pago'
      setTransacoes((prev) => prev.map((x) => (x.id === id ? { ...x, status: novoStatus } : x)))
      if (!isDemo) await supabase.from('transacoes').update({ status: novoStatus }).eq('id', id)
    },
    [isDemo, transacoes]
  )

  const updateTransacao = useCallback(
    async (id, patch) => {
      setTransacoes((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
      if (!isDemo) await supabase.from('transacoes').update(patch).eq('id', id)
    },
    [isDemo]
  )

  const excluirTransacao = useCallback(
    async (id, modo = 'este') => {
      const alvo = transacoes.find((x) => x.id === id)
      if (!alvo) return

      if (modo === 'proximos' && alvo.recorrencia_id) {
        const idsRemover = transacoes
          .filter((x) => x.recorrencia_id === alvo.recorrencia_id && x.data >= alvo.data)
          .map((x) => x.id)
        setTransacoes((prev) => prev.filter((x) => !idsRemover.includes(x.id)))
        if (!isDemo) await supabase.from('transacoes').delete().in('id', idsRemover)
        return
      }

      setTransacoes((prev) => prev.filter((x) => x.id !== id))
      if (!isDemo) await supabase.from('transacoes').delete().eq('id', id)
    },
    [isDemo, transacoes]
  )

  // ---------- Notas ----------
  const addNota = useCallback(
    async (titulo = 'Nova nota') => {
      if (isDemo) {
        const nova = { id: 'n-' + Date.now(), usuario_id: 'demo', titulo, conteudo: '', atualizado_em: new Date().toISOString() }
        setNotas((prev) => [nova, ...prev])
        return nova
      }
      const { data } = await supabase.from('notas').insert({ usuario_id: user.id, titulo, conteudo: '' }).select().single()
      if (data) setNotas((prev) => [data, ...prev])
      return data
    },
    [isDemo, user]
  )

  const updateNota = useCallback(
    async (id, patch) => {
      setNotas((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch, atualizado_em: new Date().toISOString() } : n)))
      if (!isDemo) await supabase.from('notas').update(patch).eq('id', id)
    },
    [isDemo]
  )

  const deleteNota = useCallback(
    async (id) => {
      setNotas((prev) => prev.filter((n) => n.id !== id))
      if (!isDemo) await supabase.from('notas').delete().eq('id', id)
    },
    [isDemo]
  )

  // ---------- Wishlist ----------
  const addWishlistItem = useCallback(
    async (item) => {
      if (isDemo) {
        const novo = { id: 'w-' + Date.now(), perfil_id: activeProfileId, ...item }
        setWishlist((prev) => [...prev, novo])
        return novo
      }
      const { data } = await supabase
        .from('wishlist_itens')
        .insert({ perfil_id: activeProfileId, ...item })
        .select()
        .single()
      if (data) setWishlist((prev) => [...prev, data])
      return data
    },
    [isDemo, activeProfileId]
  )

  const deleteWishlistItem = useCallback(
    async (id) => {
      setWishlist((prev) => prev.filter((w) => w.id !== id))
      if (!isDemo) await supabase.from('wishlist_itens').delete().eq('id', id)
    },
    [isDemo]
  )

  const comprarWishlistItem = useCallback(
    async (item, transacaoPayload) => {
      await addTransacao({ ...transacaoPayload, valor: transacaoPayload.valor ?? item.preco })
      setWishlist((prev) => prev.filter((w) => w.id !== item.id))
      if (!isDemo) await supabase.from('wishlist_itens').delete().eq('id', item.id)
    },
    [isDemo, addTransacao]
  )

  const value = {
    loading,
    valuesHidden,
    setValuesHidden,
    calcExpr,
    setCalcExpr,
    perfis,
    activeProfile,
    activeProfileId,
    setActiveProfileId,
    addProfile,
    updateProfile,
    contas: contas.filter((c) => c.perfil_id === activeProfileId),
    addConta,
    updateConta,
    categorias: categorias.filter((c) => c.perfil_id === activeProfileId),
    addCategoria,
    recorrencias,
    transacoes: transacoes.filter((t) => t.perfil_id === activeProfileId),
    addTransacao,
    updateTransacao,
    consolidarTransacao,
    excluirTransacao,
    notas,
    addNota,
    updateNota,
    deleteNota,
    wishlist: wishlist.filter((w) => w.perfil_id === activeProfileId),
    addWishlistItem,
    deleteWishlistItem,
    comprarWishlistItem,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData precisa estar dentro de um DataProvider')
  return ctx
}
