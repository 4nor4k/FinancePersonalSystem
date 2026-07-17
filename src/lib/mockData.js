// Dados de exemplo usados no modo demo -- dá pra navegar o app inteiro
// sem precisar de conta ou Supabase configurado.
//
// As datas são calculadas relativas a hoje (não fixas), pra funcionar bem
// independente de quando o app é testado.

const hoje = new Date()

function dataRelativa(diasOffset) {
  const d = new Date(hoje)
  d.setDate(d.getDate() + diasOffset)
  return d.toISOString().slice(0, 10)
}

function dataNoMes(mesesAtras, dia) {
  const d = new Date(hoje.getFullYear(), hoje.getMonth() - mesesAtras, dia)
  return d.toISOString().slice(0, 10)
}

export const mockPerfis = [
  { id: 'p-pessoal', nome: 'Pessoal', cor: '#ff8a3d', cor_bg: '#2e1c10' },
  { id: 'p-empresa', nome: 'Nebulus', cor: '#4fce7a', cor_bg: '#17301f' },
]

export const mockContas = [
  { id: 'c-corrente', perfil_id: 'p-pessoal', nome: 'Conta corrente', tipo: 'comum', limite: null, icone: 'ti-building-bank', cor: '#8a8a87' },
  { id: 'c-poupanca', perfil_id: 'p-pessoal', nome: 'Poupança', tipo: 'comum', limite: null, icone: 'ti-pig-money', cor: '#8a8a87' },
  { id: 'c-cartao', perfil_id: 'p-pessoal', nome: 'Cartão Nubank', tipo: 'cartao_credito', limite: 2000, icone: 'ti-credit-card', cor: '#c084e0' },
  { id: 'c-empresa', perfil_id: 'p-empresa', nome: 'Conta PJ', tipo: 'comum', limite: null, icone: 'ti-building-bank', cor: '#8a8a87' },
]

export const mockCategorias = [
  { id: 'cat-moradia', perfil_id: 'p-pessoal', nome: 'Moradia', tipo: 'despesa', icone: 'ti-home', cor: '#ff8a3d' },
  { id: 'cat-assinaturas', perfil_id: 'p-pessoal', nome: 'Assinaturas', tipo: 'despesa', icone: 'ti-device-laptop', cor: '#c96a2e' },
  { id: 'cat-eletronicos', perfil_id: 'p-pessoal', nome: 'Eletrônicos', tipo: 'despesa', icone: 'ti-device-gamepad-2', cor: '#7a4a25' },
  { id: 'cat-alimentacao', perfil_id: 'p-pessoal', nome: 'Alimentação', tipo: 'despesa', icone: 'ti-shopping-cart', cor: '#d9b56a' },
  { id: 'cat-renda', perfil_id: 'p-pessoal', nome: 'Renda', tipo: 'receita', icone: 'ti-cash', cor: '#4fce7a' },
  { id: 'cat-fornecedor', perfil_id: 'p-empresa', nome: 'Fornecedores', tipo: 'despesa', icone: 'ti-truck', cor: '#4fce7a' },
  { id: 'cat-vendas', perfil_id: 'p-empresa', nome: 'Vendas', tipo: 'receita', icone: 'ti-trending-up', cor: '#4fce7a' },
]

export const mockRecorrencias = [
  { id: 'rec-aluguel', perfil_id: 'p-pessoal', tipo: 'fixa', valor_original: 1200, data_inicio: dataNoMes(6, 5), numero_parcelas: null, ativa: true },
  { id: 'rec-cartao-3', perfil_id: 'p-pessoal', tipo: 'parcelada', valor_original: 100, data_inicio: dataNoMes(2, 12), numero_parcelas: 10, ativa: true },
]

// Despesas distribuídas nos últimos meses, pra popular o gráfico anual
const despesasHistorico = [
  { mes: 6, dia: 5, cat: 'cat-moradia', conta: 'c-corrente', valor: 1200 },
  { mes: 5, dia: 5, cat: 'cat-moradia', conta: 'c-corrente', valor: 1200 },
  { mes: 4, dia: 5, cat: 'cat-moradia', conta: 'c-corrente', valor: 1200 },
  { mes: 3, dia: 5, cat: 'cat-moradia', conta: 'c-corrente', valor: 1200 },
  { mes: 5, dia: 18, cat: 'cat-alimentacao', conta: 'c-corrente', valor: 420 },
  { mes: 4, dia: 22, cat: 'cat-alimentacao', conta: 'c-corrente', valor: 380 },
  { mes: 3, dia: 14, cat: 'cat-alimentacao', conta: 'c-corrente', valor: 510 },
  { mes: 2, dia: 20, cat: 'cat-alimentacao', conta: 'c-corrente', valor: 340 },
  { mes: 1, dia: 10, cat: 'cat-eletronicos', conta: 'c-cartao', valor: 100 },
  { mes: 4, dia: 8, cat: 'cat-assinaturas', conta: 'c-corrente', valor: 120 },
  { mes: 2, dia: 8, cat: 'cat-assinaturas', conta: 'c-corrente', valor: 120 },
]

export const mockTransacoes = [
  ...despesasHistorico.map((d, i) => ({
    id: 'th' + i,
    perfil_id: 'p-pessoal',
    conta_id: d.conta,
    categoria_id: d.cat,
    recorrencia_id: d.cat === 'cat-moradia' ? 'rec-aluguel' : null,
    tipo: 'despesa',
    valor: d.valor,
    data: dataNoMes(d.mes, d.dia),
    anotacao: '',
    status: d.mes === 0 ? 'pendente' : 'pago',
    parcela_atual: null,
  })),
  { id: 't1', perfil_id: 'p-pessoal', conta_id: 'c-corrente', categoria_id: 'cat-moradia', recorrencia_id: 'rec-aluguel', tipo: 'despesa', valor: 1200, data: dataNoMes(0, 5), anotacao: '', status: 'pendente', parcela_atual: null },
  { id: 't2', perfil_id: 'p-pessoal', conta_id: 'c-corrente', categoria_id: 'cat-assinaturas', recorrencia_id: null, tipo: 'despesa', valor: 120, data: dataRelativa(3), anotacao: 'Internet + streaming', status: 'pendente', parcela_atual: null },
  { id: 't3', perfil_id: 'p-pessoal', conta_id: 'c-cartao', categoria_id: 'cat-eletronicos', recorrencia_id: 'rec-cartao-3', tipo: 'despesa', valor: 100, data: dataRelativa(5), anotacao: 'Fone bluetooth', status: 'pendente', parcela_atual: 3 },
  { id: 't4', perfil_id: 'p-pessoal', conta_id: 'c-corrente', categoria_id: 'cat-renda', recorrencia_id: null, tipo: 'receita', valor: 4200, data: dataNoMes(0, 1), anotacao: 'Salário', status: 'recebido', parcela_atual: null },
  { id: 't5', perfil_id: 'p-pessoal', conta_id: 'c-corrente', categoria_id: 'cat-alimentacao', recorrencia_id: null, tipo: 'despesa', valor: 340, data: dataRelativa(-10), anotacao: '', status: 'pago', parcela_atual: null },
  { id: 't6', perfil_id: 'p-empresa', conta_id: 'c-empresa', categoria_id: 'cat-vendas', recorrencia_id: null, tipo: 'receita', valor: 8500, data: dataNoMes(0, 3), anotacao: '', status: 'recebido', parcela_atual: null },
  { id: 't7', perfil_id: 'p-empresa', conta_id: 'c-empresa', categoria_id: 'cat-fornecedor', recorrencia_id: null, tipo: 'despesa', valor: 2100, data: dataRelativa(7), anotacao: '', status: 'pendente', parcela_atual: null },
]

export const mockNotas = [
  { id: 'n1', usuario_id: 'demo', titulo: 'Ideias projeto', conteudo: 'Rever fluxo de recorrência e testar o wireframe de swipe.', atualizado_em: dataRelativa(-5) },
  { id: 'n2', usuario_id: 'demo', titulo: 'Compras do mês', conteudo: 'Mercado, farmácia e pet shop.', atualizado_em: dataRelativa(-9) },
  { id: 'n3', usuario_id: 'demo', titulo: 'Senhas backup', conteudo: 'Anotar depois de trocar o roteador.', atualizado_em: dataRelativa(-15) },
]

export const mockWishlist = [
  { id: 'w1', perfil_id: 'p-pessoal', nome: 'Fone bluetooth', preco: 350, link_produto: '', link_imagem: '', meta_data: dataRelativa(44) },
  { id: 'w2', perfil_id: 'p-pessoal', nome: 'Cadeira gamer', preco: 900, link_produto: '', link_imagem: '', meta_data: dataRelativa(-12) },
]
