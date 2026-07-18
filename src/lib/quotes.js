// Cotações de mercado. Duas fontes:
// - brapi.dev: ações e FIIs da B3 (precisa de um token gratuito)
// - AwesomeAPI: dólar e ouro (pública, sem necessidade de token)

const BRAPI_TOKEN = import.meta.env.VITE_BRAPI_TOKEN

export async function fetchStockQuotes(tickers) {
  if (!tickers || tickers.length === 0) return {}
  try {
    const url = `https://brapi.dev/api/quote/${tickers.join(',')}${BRAPI_TOKEN ? `?token=${BRAPI_TOKEN}` : ''}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Falha ao buscar cotações')
    const data = await res.json()
    const map = {}
    ;(data.results || []).forEach((r) => {
      map[r.symbol] = {
        preco: r.regularMarketPrice,
        variacaoPct: r.regularMarketChangePercent,
      }
    })
    return map
  } catch (e) {
    console.error('Erro ao buscar cotações da brapi:', e)
    return {}
  }
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
