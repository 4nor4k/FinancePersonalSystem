// Cotações de mercado. Duas fontes:
// - brapi.dev: ações e FIIs da B3 (precisa de um token gratuito)
// - AwesomeAPI: dólar e ouro (pública, sem necessidade de token)

const BRAPI_TOKEN = import.meta.env.VITE_BRAPI_TOKEN

export async function fetchStockQuotes(tickers) {
  if (!tickers || tickers.length === 0) return { data: {}, erro: null }

  const resultados = await Promise.all(
    tickers.map(async (ticker) => {
      try {
        const url = `https://brapi.dev/api/quote/${ticker}${BRAPI_TOKEN ? `?token=${BRAPI_TOKEN}` : ''}`
        const res = await fetch(url)
        const data = await res.json()
        if (!res.ok) {
          const msg = data?.message || data?.error || `Erro ${res.status}`
          console.error(`Erro da brapi (${ticker}):`, msg, data)
          return { ticker, erro: msg }
        }
        const r = (data.results || [])[0]
        if (!r) return { ticker, erro: 'Ticker não encontrado' }
        return { ticker, preco: r.regularMarketPrice, variacaoPct: r.regularMarketChangePercent }
      } catch (e) {
        console.error(`Erro ao buscar ${ticker}:`, e)
        return { ticker, erro: e.message || 'Falha de conexão' }
      }
    })
  )

  const map = {}
  const falhas = []
  resultados.forEach((r) => {
    if (r.erro) falhas.push(`${r.ticker}: ${r.erro}`)
    else map[r.ticker] = { preco: r.preco, variacaoPct: r.variacaoPct }
  })

  return { data: map, erro: falhas.length > 0 ? falhas.join(' · ') : null }
}

export async function fetchCambioOuro() {
  try {
    const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,XAU-BRL')
    if (!res.ok) throw new Error('Falha ao buscar câmbio')
    const data = await res.json()
    return {
      usd: data.USDBRL ? { preco: Number(data.USDBRL.bid), variacaoPct: Number(data.USDBRL.pctChange) } : null,
      ouro: data.XAUBRL ? { preco: Number(data.XAUBRL.bid), variacaoPct: Number(data.XAUBRL.pctChange) } : null,
    }
  } catch (e) {
    console.error('Erro ao buscar câmbio/ouro:', e)
    return { usd: null, ouro: null }
  }
}
