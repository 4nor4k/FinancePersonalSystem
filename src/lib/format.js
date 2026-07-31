export function formatBRL(v) {
  return (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Usado pra mostrar prévia de notas sem os códigos HTML aparecendo como texto
export function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

// Campo de valor "estilo POS": você digita só os números e os últimos dois
// viram centavos automaticamente (ex: digitar 12345 mostra R$ 123,45).
// Funciona tanto digitando quanto apagando, porque sempre reprocessa a
// string inteira a partir dos dígitos que sobraram.
export function digitsToCurrencyDisplay(raw) {
  const digits = (raw || '').replace(/\D/g, '')
  if (!digits) return ''
  const valor = parseInt(digits, 10) / 100
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function currencyDisplayToNumber(display) {
  if (!display) return 0
  return Number(display.replace(/\./g, '').replace(',', '.')) || 0
}

export function numberToCurrencyDisplay(num) {
  if (!num && num !== 0) return ''
  return Number(num).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Só aceita URLs http/https antes de usar em src/href -- evita protocolos
// tipo javascript: ou data: em links colados pelo próprio usuário.
export function isUrlSegura(url) {
  if (!url) return false
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol)
  } catch {
    return false
  }
}
