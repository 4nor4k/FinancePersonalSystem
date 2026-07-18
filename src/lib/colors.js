// Paleta de cores do usuário -- começa vazia. Cada cor que você escolhe (com
// a opção "adicionar à paleta" marcada) fica salva aqui pra reaproveitar
// rapidamente da próxima vez, em qualquer seletor de cor do app (perfil,
// conta, categoria, objetivo). Fica salvo no navegador (local).

const PALETA_KEY = 'financeiro:paleta-cores'

export function getPaleta() {
  try {
    const salvo = JSON.parse(localStorage.getItem(PALETA_KEY))
    return Array.isArray(salvo) ? salvo : []
  } catch {
    return []
  }
}

export function addCorPaleta(cor) {
  const paleta = getPaleta()
  if (paleta.includes(cor)) return
  paleta.push(cor)
  localStorage.setItem(PALETA_KEY, JSON.stringify(paleta))
}

export function removeCorPaleta(cor) {
  const paleta = getPaleta().filter((c) => c !== cor)
  localStorage.setItem(PALETA_KEY, JSON.stringify(paleta))
}

// Mantido só pra dar um valor inicial neutro a formulários que precisam de
// uma cor padrão antes do usuário escolher a dele.
export const COR_PADRAO = '#f5f5f3'
