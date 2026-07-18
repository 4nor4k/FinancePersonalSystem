# Financeiro

App de controle financeiro pessoal e empresarial (dois perfis independentes,
mesmo app), com notas, calculadora, lista de desejos, objetivos de economia
e cotações da bolsa. PWA instalável no celular, tema escuro com cor de
destaque personalizável por perfil.

React + Vite no front, Supabase (Postgres + Auth) como banco, deploy na
Vercel.

---

## Índice

- [O que o app faz](#o-que-o-app-faz)
- [Rodando localmente](#rodando-localmente)
- [Setup completo (Supabase + GitHub + Vercel)](#setup-completo)
- [Modo demo](#modo-demo)
- [Instalar como app (PWA)](#instalar-como-app-pwa)
- [Desbloqueio por biometria](#desbloqueio-por-biometria)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Estado atual / próximos passos](#estado-atual--próximos-passos)

---

## O que o app faz

**Multiperfil**: crie quantos perfis quiser (ex: "Pessoal" e o nome da sua
empresa) -- cada um com suas próprias contas, categorias, transações,
objetivos e cor de destaque. Trocar de perfil muda o tema do app inteiro.
A troca fica no menu (ícone de hambúrguer no Dashboard).

**Dashboard**: saldo total, pilha de contas (toque pra ver a próxima),
despesas e receitas do mês selecionado (dá pra navegar mês a mês), gráfico
de balanço anual (despesas x receitas), gráfico de categorias, próximas
transações pendentes, e cards resumidos de objetivos, cotações e lista de
desejos.

**Transações**: despesas e receitas, com descrição livre, categoria, conta
e data. Toda transação nasce **pendente** e só afeta o saldo quando você
consolida (marca como paga/recebida) -- exceto no cartão de crédito, que
debita o limite na hora do lançamento.

**Recorrência**: uma transação pode ser marcada como **fixa** (repete todo
mês, sem fim) ou **parcelada** (número definido de parcelas, comum em
compras no cartão). Editar ou excluir uma ocorrência recorrente pergunta se
a mudança vale só pra aquele mês ou também para os próximos.

**Contas**: contas comuns (nome, ícone e cor personalizáveis) e cartão de
crédito (com limite, que é liberado conforme as parcelas são pagas).

**Categorias**: separadas por tipo (despesa/receita) e por perfil, com
ícone e cor próprios.

**Objetivos**: metas de economia (reserva de emergência, viagem, etc.) com
valor-alvo, data opcional e barra de progresso. Ao "aportar" um valor, dá
pra já registrar isso como uma despesa de verdade saindo de uma conta.

**Cotações**: acompanhe ações e FIIs da B3 (preço e variação em tempo real,
atualiza sozinho a cada 1 minuto) -- veja [Variáveis de ambiente](#variáveis-de-ambiente)
pra configurar o token gratuito da brapi.dev. Cotação de dólar também
aparece no topo do Dashboard.

**Lista de desejos**: itens que você quer comprar, com preço, link, imagem
e meta de data. Ao marcar como comprado, vira uma transação de verdade.

**Notas**: bloco de notas simples com formatação básica (negrito, itálico,
sublinhado, lista).

**Calculadora**: calculadora com suporte a expressões e parênteses, com o
resultado salvo mesmo trocando de tela dentro do app.

**Calculadora de juros compostos**: simulação de investimento com aporte
mensal, taxa e prazo (em meses ou anos).

**Desbloqueio por biometria**: trava opcional do app usando Face
ID/Touch ID/digital do aparelho (ativa em Configurações, dentro do menu).

---

## Rodando localmente

```bash
npm install
cp .env.example .env   # depois preencha com suas chaves (veja abaixo)
npm run dev
```

## Setup completo

Essas contas/serviços são gratuitos. Cada passo é feito na sua própria
conta -- se estiver com dúvida em algum, é só perguntar.

### 1. Supabase (banco de dados)

1. Crie uma conta em [supabase.com](https://supabase.com) e um novo projeto.
2. Vá em **SQL Editor > New query**, cole o conteúdo de `supabase/schema.sql`
   e rode. Isso cria todas as tabelas e as regras de segurança (RLS).
3. **Importante**: também rode, na ordem, cada arquivo dentro de
   `supabase/migrations/` (002, 003, 004...) -- são ajustes feitos depois do
   schema inicial. Se você já rodou o `schema.sql` mais recente do zero,
   pode ser que algumas dessas migrações já estejam contempladas; rodar de
   novo não quebra nada (usam `if not exists`).
4. Vá em **Project Settings > API Keys** e copie a **Project URL** e a
   **Publishable key** (também chamada de `anon` key na aba "Legacy").
5. Cole no seu `.env`:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
6. Em **Authentication > URL Configuration**, defina a **Site URL** e
   **Redirect URLs** com o domínio onde o app vai ficar publicado (senão o
   link de confirmação de email aponta pra `localhost`).

### 2. brapi.dev (cotações -- opcional)

Só necessário se quiser usar a tela de Cotações com dados reais. Veja
[Variáveis de ambiente](#variáveis-de-ambiente).

### 3. GitHub

1. Crie um repositório novo.
2. `git init`, `git add .`, `git commit -m "primeira versão"`, e siga as
   instruções do próprio GitHub pra conectar e dar `git push`.

### 4. Vercel

1. Crie uma conta em [vercel.com](https://vercel.com) (dá pra conectar com
   GitHub direto, ou entrar com Google e depois vincular o GitHub manualmente
   em Settings).
2. **Add New > Project**, importe o repositório.
3. Antes de publicar, abra **Environment Variables** e adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_BRAPI_TOKEN` (opcional, cotações)
4. Deploy. A cada `git push`, a Vercel builda e publica sozinha.
5. Se você adicionar/mudar uma variável de ambiente **depois** do primeiro
   deploy, precisa ir em **Deployments > (⋯) no mais recente > Redeploy**
   pra ela entrar em vigor.

---

## Modo demo

A tela de login tem um botão **"Visualizar modo demo"**, que carrega o app
inteiro com dados de exemplo (perfis, contas, transações, objetivos,
cotações, etc.) sem precisar de conta nem Supabase configurado -- ótimo pra
navegar e mostrar o app antes de configurar o banco de verdade. Os dados do
modo demo ficam só em memória (somem ao recarregar a página).

## Instalar como app (PWA)

Depois de publicado, abrindo o link pelo celular:
- **Android/Chrome**: banner de "Instalar app", ou menu > "Adicionar à tela
  inicial".
- **iPhone/Safari**: toque em Compartilhar > "Adicionar à Tela de Início".

O app abre em tela cheia, sem a barra do navegador, com ícone próprio.

## Desbloqueio por biometria

É uma trava local (usando a API WebAuthn do navegador), verificada pelo
sistema operacional do aparelho -- não substitui o login, é uma camada
extra que pede Face ID/Touch ID/digital toda vez que o app é aberto,
depois de ativada em Configurações. Não depende de nada no Supabase.

---

## Estrutura do projeto

```
src/
  components/     -- componentes reutilizáveis (BottomNav, SideMenu, modais, etc.)
  context/        -- estado global (AuthContext, DataContext)
  lib/            -- Supabase client, cotações, cores, formatação, dados de demo
  pages/          -- uma tela por arquivo
supabase/
  schema.sql      -- schema completo (do zero)
  migrations/     -- alterações incrementais, rodar em ordem
```

## Variáveis de ambiente

| Variável | Obrigatória? | Onde conseguir |
|---|---|---|
| `VITE_SUPABASE_URL` | Sim (pra login real funcionar) | Supabase > Project Settings > API Keys |
| `VITE_SUPABASE_ANON_KEY` | Sim | Mesma tela, campo "Publishable key" |
| `VITE_BRAPI_TOKEN` | Não (só afeta a tela de Cotações) | Crie conta gratuita em [brapi.dev/dashboard](https://brapi.dev/dashboard) |

Sem essas variáveis, o app ainda abre e o **modo demo** funciona
normalmente -- só login real e cotações reais ficam indisponíveis.

---

## Estado atual / próximos passos

- ✅ Multiperfil com tema por perfil, PWA, login + modo demo, biometria
- ✅ Dashboard, Transações (com recorrência), Contas, Categorias
- ✅ Objetivos, Cotações, Wishlist, Notas, Calculadora, Juros compostos
- 🔲 Minigame (planejado, ainda não implementado)
- 🔲 Sparkline (mini-gráfico de histórico) nos cards de cotação
- 🔲 Editor de notas usa formatação básica via `contentEditable` -- funciona,
  mas uma biblioteca dedicada (ex: Tiptap) deixaria mais robusto no futuro
