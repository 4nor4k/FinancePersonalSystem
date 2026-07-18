// Dados de exemplo usados no modo demo -- dá pra navegar o app inteiro
// sem precisar de conta ou Supabase configurado.
//
// As datas são calculadas relativas a hoje (não fixas), pra funcionar bem
// independente de quando o app é testado. O histórico é montado pra ficar
// realista: saldo positivo, receita cobrindo despesa em todos os meses.

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
  { id: 'p-pessoal', nome: 'Pessoal', cor: '#f5f5f3', cor_bg: '#2a2a28' },
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
  { id: 'cat-transporte', perfil_id: 'p-pessoal', nome: 'Transporte', tipo: 'despesa', icone: 'ti-car', cor: '#6ab8d9' },
  { id: 'cat-lazer', perfil_id: 'p-pessoal', nome: 'Lazer', tipo: 'despesa', icone: 'ti-movie', cor: '#c084e0' },
  { id: 'cat-renda', perfil_id: 'p-pessoal', nome: 'Renda', tipo: 'receita', icone: 'ti-cash', cor: '#4fce7a' },
  { id: 'cat-extra', perfil_id: 'p-pessoal', nome: 'Renda extra', tipo: 'receita', icone: 'ti-briefcase', cor: '#7fd88f' },
  { id: 'cat-rendimento', perfil_id: 'p-pessoal', nome: 'Rendimento', tipo: 'receita', icone: 'ti-trending-up', cor: '#4fce7a' },
  { id: 'cat-fornecedor', perfil_id: 'p-empresa', nome: 'Fornecedores', tipo: 'despesa', icone: 'ti-truck', cor: '#4fce7a' },
  { id: 'cat-marketing', perfil_id: 'p-empresa', nome: 'Marketing', tipo: 'despesa', icone: 'ti-speakerphone', cor: '#6ab8d9' },
  { id: 'cat-vendas', perfil_id: 'p-empresa', nome: 'Vendas', tipo: 'receita', icone: 'ti-trending-up', cor: '#4fce7a' },
  { id: 'cat-servicos', perfil_id: 'p-empresa', nome: 'Serviços', tipo: 'receita', icone: 'ti-briefcase', cor: '#7fd88f' },
]

export const mockRecorrencias = [
  { id: 'rec-aluguel', perfil_id: 'p-pessoal', tipo: 'fixa', valor_original: 1200, data_inicio: dataNoMes(5, 5), numero_parcelas: null, ativa: true },
  { id: 'rec-cartao-3', perfil_id: 'p-pessoal', tipo: 'parcelada', valor_original: 100, data_inicio: dataNoMes(2, 12), numero_parcelas: 10, ativa: true },
]

// Histórico mensal (pessoal) -- meses passados (1 a 5), todos consolidados,
// com receita sempre cobrindo despesa pra o saldo ficar positivo e realista.
const historicoPessoal = [
  { mes: 5, salario: 4200, aluguel: 1200, alimentacao: 380, transporte: 180, assinaturas: 120, lazer: 0, extra: 0, poupanca: 200 },
  { mes: 4, salario: 4200, aluguel: 1200, alimentacao: 420, transporte: 210, assinaturas: 120, lazer: 150, extra: 600, poupanca: 250 },
  { mes: 3, salario: 4200, aluguel: 1200, alimentacao: 510, transporte: 190, assinaturas: 120, lazer: 0, extra: 0, poupanca: 200 },
  { mes: 2, salario: 4300, aluguel: 1200, alimentacao: 340, transporte: 220, assinaturas: 120, lazer: 220, extra: 900, poupanca: 300 },
  { mes: 1, salario: 4300, aluguel: 1200, alimentacao: 460, transporte: 175, assinaturas: 120, lazer: 90, extra: 0, poupanca: 250 },
]

const transacoesHistoricoPessoal = historicoPessoal.flatMap((m, i) => {
  const base = [
    { id: `hp-sal-${i}`, categoria_id: 'cat-renda', conta_id: 'c-corrente', tipo: 'receita', valor: m.salario, dia: 1, anotacao: 'Salário' },
    { id: `hp-alu-${i}`, categoria_id: 'cat-moradia', conta_id: 'c-corrente', tipo: 'despesa', valor: m.aluguel, dia: 5, anotacao: 'Aluguel', recorrencia_id: 'rec-aluguel' },
    { id: `hp-ali-${i}`, categoria_id: 'cat-alimentacao', conta_id: 'c-corrente', tipo: 'despesa', valor: m.alimentacao, dia: 17, anotacao: 'Mercado' },
    { id: `hp-tra-${i}`, categoria_id: 'cat-transporte', conta_id: 'c-corrente', tipo: 'despesa', valor: m.transporte, dia: 10, anotacao: 'Combustível' },
    { id: `hp-ass-${i}`, categoria_id: 'cat-assinaturas', conta_id: 'c-corrente', tipo: 'despesa', valor: m.assinaturas, dia: 8, anotacao: 'Internet + streaming' },
    { id: `hp-poup-${i}`, categoria_id: 'cat-rendimento', conta_id: 'c-poupanca', tipo: 'receita', valor: m.poupanca, dia: 28, anotacao: 'Rendimento' },
  ]
  if (m.lazer > 0) base.push({ id: `hp-laz-${i}`, categoria_id: 'cat-lazer', conta_id: 'c-corrente', tipo: 'despesa', valor: m.lazer, dia: 22, anotacao: 'Cinema/saída' })
  if (m.extra > 0) base.push({ id: `hp-ext-${i}`, categoria_id: 'cat-extra', conta_id: 'c-corrente', tipo: 'receita', valor: m.extra, dia: 20, anotacao: 'Freelance' })
  return base.map((t) => ({
    perfil_id: 'p-pessoal',
    recorrencia_id: null,
    status: t.tipo === 'receita' ? 'recebido' : 'pago',
    parcela_atual: null,
    ...t,
    data: dataNoMes(m.mes, t.dia),
  }))
})

// Histórico mensal (empresa)
const historicoEmpresa = [
  { mes: 5, vendas: 7200, servicos: 1400, fornecedor: 2100, marketing: 600 },
  { mes: 4, vendas: 8100, servicos: 900, fornecedor: 2400, marketing: 750 },
  { mes: 3, vendas: 6800, servicos: 1600, fornecedor: 1900, marketing: 500 },
  { mes: 2, vendas: 8500, servicos: 1100, fornecedor: 2200, marketing: 800 },
  { mes: 1, vendas: 7900, servicos: 1300, fornecedor: 2050, marketing: 650 },
]

const transacoesHistoricoEmpresa = historicoEmpresa.flatMap((m, i) => [
  { id: `he-ven-${i}`, categoria_id: 'cat-vendas', conta_id: 'c-empresa', tipo: 'receita', valor: m.vendas, dia: 5, anotacao: '' },
  { id: `he-ser-${i}`, categoria_id: 'cat-servicos', conta_id: 'c-empresa', tipo: 'receita', valor: m.servicos, dia: 18, anotacao: 'Consultoria' },
  { id: `he-for-${i}`, categoria_id: 'cat-fornecedor', conta_id: 'c-empresa', tipo: 'despesa', valor: m.fornecedor, dia: 12, anotacao: '' },
  { id: `he-mkt-${i}`, categoria_id: 'cat-marketing', conta_id: 'c-empresa', tipo: 'despesa', valor: m.marketing, dia: 15, anotacao: 'Anúncios' },
].map((t) => ({
  perfil_id: 'p-empresa',
  recorrencia_id: null,
  status: t.tipo === 'receita' ? 'recebido' : 'pago',
  parcela_atual: null,
  ...t,
  data: dataNoMes(m.mes, t.dia),
})))

// Mês atual: mistura de já pago/recebido + pendências (pra mostrar "próximas transações")
const mesAtualPessoal = [
  { id: 't-sal', categoria_id: 'cat-renda', conta_id: 'c-corrente', tipo: 'receita', valor: 4300, data: dataNoMes(0, 1), anotacao: 'Salário', status: 'recebido' },
  { id: 't-ali', categoria_id: 'cat-alimentacao', conta_id: 'c-corrente', tipo: 'despesa', valor: 260, data: dataRelativa(-6), anotacao: 'Mercado', status: 'pago' },
  { id: 't-poup', categoria_id: 'cat-rendimento', conta_id: 'c-poupanca', tipo: 'receita', valor: 260, data: dataRelativa(-3), anotacao: 'Rendimento', status: 'recebido' },
  { id: 't1', categoria_id: 'cat-moradia', conta_id: 'c-corrente', tipo: 'despesa', valor: 1200, data: dataNoMes(0, 5), anotacao: 'Aluguel', status: 'pendente', recorrencia_id: 'rec-aluguel' },
  { id: 't2', categoria_id: 'cat-assinaturas', conta_id: 'c-corrente', tipo: 'despesa', valor: 120, data: dataRelativa(3), anotacao: 'Internet + streaming', status: 'pendente' },
  { id: 't3', categoria_id: 'cat-eletronicos', conta_id: 'c-cartao', tipo: 'despesa', valor: 100, data: dataRelativa(5), anotacao: 'Fone bluetooth', status: 'pendente', recorrencia_id: 'rec-cartao-3', parcela_atual: 3 },
  { id: 't-tra', categoria_id: 'cat-transporte', conta_id: 'c-corrente', tipo: 'despesa', valor: 195, data: dataRelativa(8), anotacao: 'Combustível', status: 'pendente' },
].map((t) => ({ perfil_id: 'p-pessoal', recorrencia_id: null, parcela_atual: null, ...t }))

const mesAtualEmpresa = [
  { id: 't6', categoria_id: 'cat-vendas', conta_id: 'c-empresa', tipo: 'receita', valor: 8100, data: dataNoMes(0, 3), anotacao: '', status: 'recebido' },
  { id: 't-serv', categoria_id: 'cat-servicos', conta_id: 'c-empresa', tipo: 'receita', valor: 1200, data: dataRelativa(-4), anotacao: 'Consultoria', status: 'recebido' },
  { id: 't7', categoria_id: 'cat-fornecedor', conta_id: 'c-empresa', tipo: 'despesa', valor: 2100, data: dataRelativa(7), anotacao: '', status: 'pendente' },
  { id: 't-mkt', categoria_id: 'cat-marketing', conta_id: 'c-empresa', tipo: 'despesa', valor: 700, data: dataRelativa(10), anotacao: 'Anúncios', status: 'pendente' },
].map((t) => ({ perfil_id: 'p-empresa', recorrencia_id: null, parcela_atual: null, ...t }))

export const mockTransacoes = [
  ...transacoesHistoricoPessoal,
  ...transacoesHistoricoEmpresa,
  ...mesAtualPessoal,
  ...mesAtualEmpresa,
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

export const mockObjetivos = [
  { id: 'o1', perfil_id: 'p-pessoal', nome: 'Reserva de emergência', valor_meta: 15000, valor_atual: 6200, icone: 'ti-shield', cor: '#7fd88f', meta_data: dataNoMes(-8, 1) },
  { id: 'o2', perfil_id: 'p-pessoal', nome: 'Carro novo', valor_meta: 40000, valor_atual: 9500, icone: 'ti-car', cor: '#6ab8d9', meta_data: dataNoMes(-14, 1) },
  { id: 'o3', perfil_id: 'p-empresa', nome: 'Capital de giro', valor_meta: 20000, valor_atual: 20000, icone: 'ti-briefcase', cor: '#4fce7a', meta_data: null },
]

export const mockWatchlist = [
  { id: 'wl1', perfil_id: 'p-pessoal', ticker: 'PETR4' },
  { id: 'wl2', perfil_id: 'p-pessoal', ticker: 'HGLG11' },
  { id: 'wl3', perfil_id: 'p-pessoal', ticker: 'VALE3' },
]
