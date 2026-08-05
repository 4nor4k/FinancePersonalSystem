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
  mockObjetivos,
  mockWatchlist,
} from '../lib/mockData'
import { fetchStockQuotes, fetchCambioOuro } from '../lib/quotes'

const DataContext = createContext(null)

// Antes, erros do Supabase eram ignorados silenciosamente (só pegávamos
// "data" e nunca checávamos "error"), o que causava bugs tipo "criei mas
// não aparece". Esse helper garante que todo erro apareça no console e
// avise o usuário, em vez de falhar em silêncio.
function reportError(error, contexto) {
  if (!error) return false
  console.error(`Erro em ${contexto}:`, error)
  alert(`Não foi possível completar a ação (${contexto}). Detalhe: ${error.message || error}`)
  return true
}

export function DataProvider({ children }) {
  const { isDemo, user } = useAuth()

  const [perfis, setPerfis] = useState([])
  const [contas, setContas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [recorrencias, setRecorrencias] = useState([])
  const [transacoes, setTransacoes] = useState([])
  const [notas, setNotas] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [objetivos, setObjetivos] = useState([])
  const [watchlistAtivos, setWatchlistAtivos] = useState([])
  const [cotacoes, setCotacoes] = useState({})
  const [cotacoesErro, setCotacoesErro] = useState(null)
  const [mercado, setMercado] = useState({ usd: null, ouro: null })
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

  // Filtros da tela de Transações -- vivem aqui (e não como useState local na
  // página) pra sobreviverem quando você navega pra editar uma transação e
  // volta. Antes isso resetava tudo porque a página desmontava.
  const [filtrosTransacoes, setFiltrosTransacoes] = useState({
    tipo: 'despesa',
    contaId: '',
    categoriaId: '',
    mesRef: new Date().toISOString().slice(0, 7),
    ordenacao: 'data',
  })

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
        setObjetivos(mockObjetivos)
        setWatchlistAtivos(mockWatchlist)
        setActiveProfileId(mockPerfis[0].id)
        setLoading(false)
        return
      }

      if (!user) {
        setLoading(false)
        return
      }

      const [p, c, cat, rec, t, n, w, o, wl] = await Promise.all([
        supabase.from('perfis').select('*').order('criado_em'),
        supabase.from('contas').select('*'),
        supabase.from('categorias').select('*'),
        supabase.from('recorrencias').select('*'),
        supabase.from('transacoes').select('*').order('data'),
        supabase.from('notas').select('*').order('atualizado_em', { ascending: false }),
        supabase.from('wishlist_itens').select('*'),
        supabase.from('objetivos').select('*'),
        supabase.from('watchlist_ativos').select('*'),
      ])

      if (cancelled) return
      ;[p, c, cat, rec, t, n, w, o, wl].forEach((r) => reportError(r.error, 'carregar dados'))

      let perfisData = p.data || []

      // Primeiro acesso: cria um perfil "Pessoal" padrão pra não abrir vazio.
      if (perfisData.length === 0) {
        const { data: novo, error } = await supabase
          .from('perfis')
          .insert({ usuario_id: user.id, nome: 'Pessoal', cor: '#f5f5f3', cor_bg: '#2a2a28' })
          .select()
          .single()
        reportError(error, 'criar perfil inicial')
        if (novo) perfisData = [novo]
      }

      setPerfis(perfisData)
      setContas(c.data || [])
      setCategorias(cat.data || [])
      setRecorrencias(rec.data || [])
      setTransacoes(t.data || [])
      setNotas(n.data || [])
      setWishlist(w.data || [])
      setObjetivos(o.data || [])
      setWatchlistAtivos(wl.data || [])
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

  // Dólar e ouro -- não dependem de perfil, busca uma vez e atualiza a cada 1 minuto
  useEffect(() => {
    let ativo = true
    function carregar() {
      fetchCambioOuro().then((res) => {
        if (ativo) setMercado(res)
      })
    }
    carregar()
    const intervalo = setInterval(carregar, 60000)
    return () => {
      ativo = false
      clearInterval(intervalo)
    }
  }, [])

  // Cotações das ações/FIIs da watchlist do perfil ativo -- também a cada 1 minuto
  const tickersDoPerfilAtivo = watchlistAtivos
    .filter((w) => w.perfil_id === activeProfileId)
    .map((w) => w.ticker)
  const tickersKey = tickersDoPerfilAtivo.join(',')

  useEffect(() => {
    if (!tickersKey) {
      setCotacoes({})
      setCotacoesErro(null)
      return
    }
    let ativo = true
    function carregar() {
      fetchStockQuotes(tickersKey.split(',')).then(({ data, erro }) => {
        if (!ativo) return
        setCotacoes(data)
        setCotacoesErro(erro)
      })
    }
    carregar()
    const intervalo = setInterval(carregar, 60000)
    return () => {
      ativo = false
      clearInterval(intervalo)
    }
  }, [tickersKey])

  // ---------- Perfis ----------
  const addProfile = useCallback(
    async (nome, cor = '#f5f5f3') => {
      const cor_bg = cor + '22'
      if (isDemo) {
        const novo = { id: 'p-' + Date.now(), nome, cor, cor_bg, ocultar_extras: false }
        setPerfis((prev) => [...prev, novo])
        return novo
      }
      const { data, error } = await supabase
        .from('perfis')
        .insert({ usuario_id: user.id, nome, cor, cor_bg })
        .select()
        .single()
      if (reportError(error, 'criar perfil')) return null
      if (data) setPerfis((prev) => [...prev, data])
      return data
    },
    [isDemo, user]
  )

  const updateProfile = useCallback(
    async (id, patch) => {
      const anterior = perfis.find((p) => p.id === id)
      setPerfis((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
      if (!isDemo) {
        const { error } = await supabase.from('perfis').update(patch).eq('id', id)
        if (reportError(error, 'atualizar perfil') && anterior) {
          setPerfis((prev) => prev.map((p) => (p.id === id ? anterior : p)))
        }
      }
    },
    [isDemo, perfis]
  )

  // ---------- Contas ----------
  const addConta = useCallback(
    async ({ nome, tipo, limite, icone, cor }) => {
      const contasDoperfil = contas.filter((c) => c.perfil_id === activeProfileId)
      const proximaOrdem = contasDoperfil.length
        ? Math.max(...contasDoperfil.map((c) => c.ordem ?? 0)) + 1
        : 0
      const payload = {
        nome,
        tipo,
        limite: limite ?? null,
        icone: icone || (tipo === 'cartao_credito' ? 'ti-credit-card' : 'ti-building-bank'),
        cor: cor || '#8a8a87',
        ordem: proximaOrdem,
      }
      if (isDemo) {
        const nova = { id: 'c-' + Date.now(), perfil_id: activeProfileId, ...payload }
        setContas((prev) => [...prev, nova])
        return nova
      }
      const { data, error } = await supabase
        .from('contas')
        .insert({ perfil_id: activeProfileId, ...payload })
        .select()
        .single()
      if (reportError(error, 'criar conta')) return null
      if (data) setContas((prev) => [...prev, data])
      return data
    },
    [isDemo, activeProfileId, contas]
  )

  const reordenarContas = useCallback(
    async (idsOrdenados) => {
      const anterior = contas
      setContas((prev) =>
        prev.map((c) => {
          const novaOrdem = idsOrdenados.indexOf(c.id)
          return novaOrdem === -1 ? c : { ...c, ordem: novaOrdem }
        })
      )
      if (!isDemo) {
        const resultados = await Promise.all(
          idsOrdenados.map((id, idx) => supabase.from('contas').update({ ordem: idx }).eq('id', id))
        )
        const houveErro = resultados.some((r) => reportError(r.error, 'reordenar contas'))
        if (houveErro) setContas(anterior)
      }
    },
    [isDemo, contas]
  )

  const updateConta = useCallback(
    async (id, patch) => {
      const anterior = contas.find((c) => c.id === id)
      setContas((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
      if (!isDemo) {
        const { error } = await supabase.from('contas').update(patch).eq('id', id)
        if (reportError(error, 'atualizar conta') && anterior) {
          setContas((prev) => prev.map((c) => (c.id === id ? anterior : c)))
        }
      }
    },
    [isDemo, contas]
  )

  // Exclui a conta e, junto, todas as transações ligadas a ela -- o banco
  // tem "on delete cascade" em transacoes.conta_id, então apagar a conta lá
  // já apaga as transações; aqui só espelhamos isso no estado local.
  const deleteConta = useCallback(
    async (id) => {
      const contaAnterior = contas.find((c) => c.id === id)
      const transacoesRemovidas = transacoes.filter((t) => t.conta_id === id)
      setContas((prev) => prev.filter((c) => c.id !== id))
      setTransacoes((prev) => prev.filter((t) => t.conta_id !== id))
      if (!isDemo) {
        const { error } = await supabase.from('contas').delete().eq('id', id)
        if (reportError(error, 'excluir conta')) {
          if (contaAnterior) setContas((prev) => [...prev, contaAnterior])
          setTransacoes((prev) => [...prev, ...transacoesRemovidas])
        }
      }
    },
    [isDemo, contas, transacoes]
  )

  // ---------- Categorias ----------
  const addCategoria = useCallback(
    async ({ nome, tipo, icone, cor }) => {
      if (isDemo) {
        const nova = { id: 'cat-' + Date.now(), perfil_id: activeProfileId, nome, tipo, icone, cor }
        setCategorias((prev) => [...prev, nova])
        return nova
      }
      const { data, error } = await supabase
        .from('categorias')
        .insert({ perfil_id: activeProfileId, nome, tipo, icone, cor })
        .select()
        .single()
      if (reportError(error, 'criar categoria')) return null
      if (data) setCategorias((prev) => [...prev, data])
      return data
    },
    [isDemo, activeProfileId]
  )

  const updateCategoria = useCallback(
    async (id, patch) => {
      const anterior = categorias.find((c) => c.id === id)
      setCategorias((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
      if (!isDemo) {
        const { error } = await supabase.from('categorias').update(patch).eq('id', id)
        if (reportError(error, 'atualizar categoria') && anterior) {
          setCategorias((prev) => prev.map((c) => (c.id === id ? anterior : c)))
        }
      }
    },
    [isDemo, categorias]
  )

  const deleteCategoria = useCallback(
    async (id) => {
      const anterior = categorias.find((c) => c.id === id)
      setCategorias((prev) => prev.filter((c) => c.id !== id))
      if (!isDemo) {
        const { error } = await supabase.from('categorias').delete().eq('id', id)
        if (reportError(error, 'excluir categoria') && anterior) {
          setCategorias((prev) => [...prev, anterior])
        }
      }
    },
    [isDemo, categorias]
  )

  // ---------- Transações ----------
  const addTransacao = useCallback(
    async (payload) => {
      // repetir/numeroParcelas são só controle da tela -- não são colunas
      // da tabela, então tiramos eles antes de montar o que vai pro banco.
      const { repetir, numeroParcelas, ...resto } = payload
      const base = {
        perfil_id: activeProfileId,
        tipo: 'despesa',
        status: 'pendente',
        data: new Date().toISOString().slice(0, 10),
        ...resto,
      }

      // Recorrência: gera as ocorrências futuras de uma vez (simplificado --
      // fixa gera 12 meses à frente, parcelada gera o número de parcelas).
      if (repetir === 'fixa' || repetir === 'parcelada') {
        const numParcelas = repetir === 'parcelada' ? numeroParcelas || 2 : 12
        let recorrenciaId = 'rec-' + Date.now()
        const recorrenciaBase = {
          tipo: repetir,
          valor_original: base.valor,
          data_inicio: base.data,
          numero_parcelas: repetir === 'parcelada' ? numParcelas : null,
          ativa: true,
        }

        if (!isDemo) {
          const { data, error } = await supabase
            .from('recorrencias')
            .insert({ perfil_id: activeProfileId, ...recorrenciaBase })
            .select()
            .single()
          if (reportError(error, 'criar recorrência')) return null
          if (data) recorrenciaId = data.id
        }
        setRecorrencias((prev) => [...prev, { id: recorrenciaId, perfil_id: activeProfileId, ...recorrenciaBase }])

        const novas = []
        const [ano, mes, dia] = base.data.split('-').map(Number)
        for (let i = 0; i < numParcelas; i++) {
          // new Date(ano, mes, dia) estoura pro mês seguinte quando o dia não
          // existe nele (ex: dia 31 + 1 mês num mês de 30 dias). Por isso
          // travamos no último dia válido do mês de destino, em vez de deixar
          // o overflow bagunçar a sequência de datas.
          const ultimoDiaDoMesAlvo = new Date(ano, mes + i, 0).getDate()
          const d = new Date(ano, mes - 1 + i, Math.min(dia, ultimoDiaDoMesAlvo))
          novas.push({
            id: 't-' + Date.now() + '-' + i,
            perfil_id: activeProfileId,
            conta_id: base.conta_id,
            categoria_id: base.categoria_id,
            recorrencia_id: recorrenciaId,
            tipo: base.tipo,
            valor: base.valor,
            data: d.toISOString().slice(0, 10),
            anotacao: base.anotacao || '',
            status: 'pendente',
            parcela_atual: repetir === 'parcelada' ? i + 1 : null,
          })
        }

        if (!isDemo) {
          // Tira o "id" fake local -- o banco gera o UUID real sozinho.
          const paraInserir = novas.map(({ id, ...rest }) => rest)
          const { data, error } = await supabase.from('transacoes').insert(paraInserir).select()
          if (reportError(error, 'criar transações recorrentes')) return null
          if (data) {
            setTransacoes((prev) => [...prev, ...data])
            return data
          }
        }
        setTransacoes((prev) => [...prev, ...novas])
        return novas
      }

      if (isDemo) {
        const nova = { id: 't-' + Date.now(), ...base }
        setTransacoes((prev) => [...prev, nova])
        return nova
      }
      const { data, error } = await supabase.from('transacoes').insert(base).select().single()
      if (reportError(error, 'criar transação')) return null
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
      if (!isDemo) {
        const { error } = await supabase.from('transacoes').update({ status: novoStatus }).eq('id', id)
        if (reportError(error, 'consolidar transação')) {
          setTransacoes((prev) => prev.map((x) => (x.id === id ? t : x)))
        }
      }
    },
    [isDemo, transacoes]
  )

  const updateTransacao = useCallback(
    async (id, patch, modo = 'este') => {
      const anterior = transacoes.find((x) => x.id === id)
      setTransacoes((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
      if (!isDemo) {
        const { error } = await supabase.from('transacoes').update(patch).eq('id', id)
        if (reportError(error, 'editar transação') && anterior) {
          setTransacoes((prev) => prev.map((x) => (x.id === id ? anterior : x)))
        }
      }

      // "Este e os próximos": propaga a edição pras ocorrências futuras que
      // ainda estão em aberto -- menos a data, que é específica de cada uma.
      if (modo === 'proximos' && anterior?.recorrencia_id) {
        const { data: _data, ...patchFuturo } = patch
        const alvos = transacoes.filter(
          (x) =>
            x.id !== id &&
            x.recorrencia_id === anterior.recorrencia_id &&
            x.data >= anterior.data &&
            x.status === 'pendente'
        )
        if (alvos.length === 0) return
        const idsAlvos = alvos.map((x) => x.id)
        setTransacoes((prev) => prev.map((x) => (idsAlvos.includes(x.id) ? { ...x, ...patchFuturo } : x)))
        if (!isDemo) {
          const { error } = await supabase.from('transacoes').update(patchFuturo).in('id', idsAlvos)
          if (reportError(error, 'editar transações futuras')) {
            setTransacoes((prev) =>
              prev.map((x) => alvos.find((a) => a.id === x.id) || x)
            )
          }
        }
      }
    },
    [isDemo, transacoes]
  )

  const excluirTransacao = useCallback(
    async (id, modo = 'este') => {
      const alvo = transacoes.find((x) => x.id === id)
      if (!alvo) return

      if (modo === 'proximos' && alvo.recorrencia_id) {
        const removidas = transacoes.filter(
          (x) => x.recorrencia_id === alvo.recorrencia_id && x.data >= alvo.data
        )
        const idsRemover = removidas.map((x) => x.id)
        setTransacoes((prev) => prev.filter((x) => !idsRemover.includes(x.id)))
        if (!isDemo) {
          const { error } = await supabase.from('transacoes').delete().in('id', idsRemover)
          if (reportError(error, 'excluir transações')) {
            setTransacoes((prev) => [...prev, ...removidas])
          }
        }
        return
      }

      setTransacoes((prev) => prev.filter((x) => x.id !== id))
      if (!isDemo) {
        const { error } = await supabase.from('transacoes').delete().eq('id', id)
        if (reportError(error, 'excluir transação')) {
          setTransacoes((prev) => [...prev, alvo])
        }
      }
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
      const { data, error } = await supabase.from('notas').insert({ usuario_id: user.id, titulo, conteudo: '' }).select().single()
      if (reportError(error, 'criar nota')) return null
      if (data) setNotas((prev) => [data, ...prev])
      return data
    },
    [isDemo, user]
  )

  const updateNota = useCallback(
    async (id, patch) => {
      const anterior = notas.find((n) => n.id === id)
      setNotas((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch, atualizado_em: new Date().toISOString() } : n)))
      if (!isDemo) {
        const { error } = await supabase.from('notas').update(patch).eq('id', id)
        if (reportError(error, 'salvar nota') && anterior) {
          setNotas((prev) => prev.map((n) => (n.id === id ? anterior : n)))
        }
      }
    },
    [isDemo, notas]
  )

  const deleteNota = useCallback(
    async (id) => {
      const anterior = notas.find((n) => n.id === id)
      setNotas((prev) => prev.filter((n) => n.id !== id))
      if (!isDemo) {
        const { error } = await supabase.from('notas').delete().eq('id', id)
        if (reportError(error, 'excluir nota') && anterior) {
          setNotas((prev) => [anterior, ...prev])
        }
      }
    },
    [isDemo, notas]
  )

  // ---------- Wishlist ----------
  const addWishlistItem = useCallback(
    async (item) => {
      if (isDemo) {
        const novo = { id: 'w-' + Date.now(), perfil_id: activeProfileId, ...item }
        setWishlist((prev) => [...prev, novo])
        return novo
      }
      const { data, error } = await supabase
        .from('wishlist_itens')
        .insert({ perfil_id: activeProfileId, ...item })
        .select()
        .single()
      if (reportError(error, 'adicionar à lista de desejos')) return null
      if (data) setWishlist((prev) => [...prev, data])
      return data
    },
    [isDemo, activeProfileId]
  )

  const updateWishlistItem = useCallback(
    async (id, patch) => {
      const anterior = wishlist.find((w) => w.id === id)
      setWishlist((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)))
      if (!isDemo) {
        const { error } = await supabase.from('wishlist_itens').update(patch).eq('id', id)
        if (reportError(error, 'atualizar item da lista de desejos') && anterior) {
          setWishlist((prev) => prev.map((w) => (w.id === id ? anterior : w)))
        }
      }
    },
    [isDemo, wishlist]
  )

  const deleteWishlistItem = useCallback(
    async (id) => {
      const anterior = wishlist.find((w) => w.id === id)
      setWishlist((prev) => prev.filter((w) => w.id !== id))
      if (!isDemo) {
        const { error } = await supabase.from('wishlist_itens').delete().eq('id', id)
        if (reportError(error, 'excluir item da lista de desejos') && anterior) {
          setWishlist((prev) => [...prev, anterior])
        }
      }
    },
    [isDemo, wishlist]
  )

  const comprarWishlistItem = useCallback(
    async (item, transacaoPayload) => {
      await addTransacao({ ...transacaoPayload, valor: transacaoPayload.valor ?? item.preco })
      setWishlist((prev) => prev.filter((w) => w.id !== item.id))
      if (!isDemo) {
        const { error } = await supabase.from('wishlist_itens').delete().eq('id', item.id)
        if (reportError(error, 'remover item comprado')) {
          setWishlist((prev) => [...prev, item])
        }
      }
    },
    [isDemo, addTransacao]
  )

  // ---------- Objetivos ----------
  const addObjetivo = useCallback(
    async ({ nome, valorMeta, icone, cor, metaData }) => {
      const payload = {
        nome,
        valor_meta: valorMeta,
        valor_atual: 0,
        icone: icone || 'ti-target',
        cor: cor || '#f5f5f3',
        meta_data: metaData || null,
      }
      if (isDemo) {
        const novo = { id: 'o-' + Date.now(), perfil_id: activeProfileId, ...payload }
        setObjetivos((prev) => [...prev, novo])
        return novo
      }
      const { data, error } = await supabase
        .from('objetivos')
        .insert({ perfil_id: activeProfileId, ...payload })
        .select()
        .single()
      if (reportError(error, 'criar objetivo')) return null
      if (data) setObjetivos((prev) => [...prev, data])
      return data
    },
    [isDemo, activeProfileId]
  )

  const updateObjetivo = useCallback(
    async (id, patch) => {
      const anterior = objetivos.find((o) => o.id === id)
      setObjetivos((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))
      if (!isDemo) {
        const { error } = await supabase.from('objetivos').update(patch).eq('id', id)
        if (reportError(error, 'atualizar objetivo') && anterior) {
          setObjetivos((prev) => prev.map((o) => (o.id === id ? anterior : o)))
        }
      }
    },
    [isDemo, objetivos]
  )

  const deleteObjetivo = useCallback(
    async (id) => {
      const anterior = objetivos.find((o) => o.id === id)
      setObjetivos((prev) => prev.filter((o) => o.id !== id))
      if (!isDemo) {
        const { error } = await supabase.from('objetivos').delete().eq('id', id)
        if (reportError(error, 'excluir objetivo') && anterior) {
          setObjetivos((prev) => [...prev, anterior])
        }
      }
    },
    [isDemo, objetivos]
  )

  // Aportar: soma o valor no progresso do objetivo e, opcionalmente, já
  // registra a saída como uma despesa de verdade numa conta (mesma lógica
  // de "comprar" da wishlist).
  const aportarObjetivo = useCallback(
    async (objetivo, valorAporte, transacaoPayload) => {
      const novoValor = (Number(objetivo.valor_atual) || 0) + valorAporte
      await updateObjetivo(objetivo.id, { valor_atual: novoValor })
      if (transacaoPayload) {
        await addTransacao({ ...transacaoPayload, tipo: 'despesa', valor: valorAporte })
      }
    },
    [updateObjetivo, addTransacao]
  )

  // ---------- Watchlist de cotações ----------
  const addAtivoWatchlist = useCallback(
    async (ticker) => {
      const tickerLimpo = ticker.trim().toUpperCase()
      if (!tickerLimpo) return null
      if (isDemo) {
        const novo = { id: 'wl-' + Date.now(), perfil_id: activeProfileId, ticker: tickerLimpo }
        setWatchlistAtivos((prev) => [...prev, novo])
        return novo
      }
      const { data, error } = await supabase
        .from('watchlist_ativos')
        .insert({ perfil_id: activeProfileId, ticker: tickerLimpo })
        .select()
        .single()
      if (reportError(error, 'adicionar ativo')) return null
      if (data) setWatchlistAtivos((prev) => [...prev, data])
      return data
    },
    [isDemo, activeProfileId]
  )

  const removeAtivoWatchlist = useCallback(
    async (id) => {
      const anterior = watchlistAtivos.find((w) => w.id === id)
      setWatchlistAtivos((prev) => prev.filter((w) => w.id !== id))
      if (!isDemo) {
        const { error } = await supabase.from('watchlist_ativos').delete().eq('id', id)
        if (reportError(error, 'remover ativo') && anterior) {
          setWatchlistAtivos((prev) => [...prev, anterior])
        }
      }
    },
    [isDemo, watchlistAtivos]
  )

  const value = {
    loading,
    valuesHidden,
    setValuesHidden,
    calcExpr,
    setCalcExpr,
    filtrosTransacoes,
    setFiltrosTransacoes,
    perfis,
    activeProfile,
    activeProfileId,
    setActiveProfileId,
    addProfile,
    updateProfile,
    contas: contas
      .filter((c) => c.perfil_id === activeProfileId)
      .sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999)),
    addConta,
    updateConta,
    deleteConta,
    reordenarContas,
    categorias: categorias.filter((c) => c.perfil_id === activeProfileId),
    addCategoria,
    updateCategoria,
    deleteCategoria,
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
    updateWishlistItem,
    deleteWishlistItem,
    comprarWishlistItem,
    objetivos: objetivos.filter((o) => o.perfil_id === activeProfileId),
    addObjetivo,
    updateObjetivo,
    deleteObjetivo,
    aportarObjetivo,
    watchlistAtivos: watchlistAtivos.filter((w) => w.perfil_id === activeProfileId),
    cotacoes,
    cotacoesErro,
    mercado,
    addAtivoWatchlist,
    removeAtivoWatchlist,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData precisa estar dentro de um DataProvider')
  return ctx
}
