# Sistema Financeiro Pessoal

App de controle financeiro pessoal e empresarial (dois ou mais perfis
independentes, mesmo app), com objetivos de economia, cotações da bolsa,
lista de desejos, notas com editor rico, calculadora e até um minigame.
PWA instalável no celular, tema escuro com cor de destaque personalizável
por perfil.

React + Vite no front, Supabase (Postgres + Auth) como banco, deploy na
Vercel.

> ⚠️ **Disclaimer**: este aplicativo foi desenhado e projetado
> por **4nor4k**, e desenvolvido com o **Claude Code**.
> Todas as decisões de produto e o design visual partiram de mim; o Claude Code
> foi usado como ferramenta de implementação e programação ao longo do processo.

---

## Índice

- [O que o app faz](#o-que-o-app-faz)
- [O que dá pra personalizar](#o-que-dá-pra-personalizar)
- [Rodando localmente](#rodando-localmente)
- [Setup completo (Supabase + GitHub + Vercel)](#setup-completo)
- [Modo demo](#modo-demo)
- [Instalar como app (PWA)](#instalar-como-app-pwa)
- [Desbloqueio por biometria](#desbloqueio-por-biometria)
- [O minigame](#o-minigame)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Estado atual / próximos passos](#estado-atual--próximos-passos)

---

## O que o app faz

**Multiperfil**: crie quantos perfis quiser (ex: "Pessoal" e o nome da sua
empresa) -- cada um com suas próprias contas, categorias, transações,
objetivos e cor de destaque. Trocar de perfil (menu ☰ no Dashboard) muda o
tema do app inteiro na hora.

**Dashboard**: saldo total, pilha de contas (toque pra ver a próxima),
receitas e despesas do mês selecionado (navega mês a mês com as setas no
topo), gráfico de balanço anual (receitas x despesas), gráfico de despesas
por categoria, próximas transações pendentes, e cards de objetivos,
cotações e lista de desejos.

**Transações**: despesas e receitas, com descrição livre, categoria, conta
e data. Toda transação nasce **pendente** e só afeta o saldo quando
consolidada (marcada como paga/recebida) -- exceto no cartão de crédito,
que debita o limite assim que a compra é lançada. Dá pra **filtrar** por
conta e por categoria específicas (ícone de ajustes no topo da lista).

**Recorrência**: uma transação pode ser **fixa** (repete todo mês, sem fim)
ou **parcelada** (número definido de parcelas -- comum em compra no
cartão). Editar ou excluir uma ocorrência recorrente pergunta se a mudança
vale só pra aquele mês ou também pros próximos.

**Contas**: contas comuns e cartão de crédito (com limite editável, que é
liberado conforme as parcelas são pagas). Dá pra **reordenar** arrastando
pela alcinha.

**Categorias**: separadas por tipo (despesa/receita) e por perfil.

**Objetivos**: metas de economia com valor-alvo, data opcional e barra de
progresso. Ao "aportar" um valor, dá pra já registrar isso como uma despesa
de verdade saindo de uma conta.

**Cotações**: ações e FIIs da B3 em tempo real (atualiza sozinho a cada 1
minuto), mais a cotação do dólar no topo do Dashboard.

**Lista de desejos**: itens que você quer comprar, com preço, link, imagem
e meta de data. Ao marcar como comprado, vira uma transação de verdade.

**Notas**: editor de texto rico (negrito, itálico, sublinhado, riscado,
títulos, citação, código, listas com marcador/numeradas/checklist, links,
desfazer/refazer).

**Calculadora**: com suporte a expressões e parênteses, resultado
preservado mesmo trocando de tela.

**Calculadora de juros compostos**: simulação de investimento com aporte
mensal, taxa e prazo (em meses ou anos).

**Desbloqueio por biometria**: trava opcional do app usando Face
ID/Touch ID/digital do aparelho.

**Minigame**: um shoot 'em up espacial escondido no menu -- veja a seção
[O minigame](#o-minigame).

---

## O que dá pra personalizar

- **Cor de destaque por perfil**: cada perfil (Pessoal, Empresa, etc.) tem
  sua própria cor de tema, escolhida numa roda de cores de verdade (matiz +
  saturação no disco, brilho no slider) -- não é uma paleta fixa.
- **Paleta de cores pessoal**: ao escolher uma cor em qualquer lugar do
  app, dá pra salvá-la numa paleta reutilizável (botão "Salvar cor na
  paleta"), e também remover cores salvas quando quiser. Fica guardada no
  navegador.
- **Ícone e cor de cada conta**, com 12 ícones à disposição (banco,
  poupança, cartão, dinheiro, carteira, moeda, dólar, recibo, prédio,
  relatório, cofre, cifrão).
- **Ícone e cor de cada categoria**, com 18 ícones (casa, carro, mercado,
  eletrônicos, ferramentas, coração, viagem, escola, pet, presente,
  dinheiro, conta de luz, água, wifi, comida, saúde, lazer, e mais).
- **Ícone e cor de cada objetivo**, com 18 ícones (escudo, carro, casa,
  investimento, maleta, viagem, coração, presente, escola, poupança, alvo,
  prédio, bebê, notebook, praia, diamante, foguete, e mais).
- **Ordem das contas**: arraste pela alcinha na tela de Contas.
- **Ordem de exibição** Receitas/Despesas nos gráficos e cards.
- **Limite do cartão**: editável a qualquer momento.
- **Ocultar valores**: ícone de olho no Dashboard, esconde todos os
  números da tela (útil em público).
- **Filtros de transação**: por conta específica e/ou categoria
  específica.
- **Tickers acompanhados** na tela de Cotações: adicione/remova qualquer
  ação ou FII da B3.
- **Desbloqueio por biometria**: ativa/desativa quando quiser, no menu.

---

## Rodando localmente

```bash
npm install
cp .env.example .env   # depois preencha com suas chaves (veja abaixo)
npm run dev
```

## Setup completo

Essas contas/serviços são gratuitos. Cada passo é feito na sua própria
conta.

### 1. Supabase (banco de dados)

1. Crie uma conta em [supabase.com](https://supabase.com) e um novo projeto.
2. Vá em **SQL Editor > New query**, cole o conteúdo de `supabase/schema.sql`
   e rode. Isso cria todas as tabelas e as regras de segurança (RLS).
3. **Importante**: também rode, na ordem, cada arquivo dentro de
   `supabase/migrations/` (002, 003, 004, 005...) -- são ajustes feitos
   depois do schema inicial. Rodar de novo não quebra nada (usam
   `if not exists`).
4. Vá em **Project Settings > API Keys** e copie a **Project URL** e a
   **Publishable key** (aba "Legacy" chama de `anon` key).
5. Cole no seu `.env`:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
6. Em **Authentication > URL Configuration**, defina a **Site URL** e
   **Redirect URLs** com o domínio onde o app vai ficar publicado.

### 2. brapi.dev (cotações -- opcional)

Só necessário pra tela de Cotações mostrar dados reais. Crie uma conta
gratuita em [brapi.dev/dashboard](https://brapi.dev/dashboard) e copie o
token. Veja [Variáveis de ambiente](#variáveis-de-ambiente).

### 3. GitHub

1. Crie um repositório novo.
2. `git init`, `git add .`, `git commit -m "primeira versão"`, e siga as
   instruções do próprio GitHub pra conectar e dar `git push`.

### 4. Vercel

1. Crie uma conta em [vercel.com](https://vercel.com).
2. **Add New > Project**, importe o repositório.
3. Antes de publicar, abra **Environment Variables** e adicione
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e (opcional)
   `VITE_BRAPI_TOKEN`.
4. Deploy. A cada `git push`, a Vercel builda e publica sozinha.
5. Se adicionar/mudar uma variável de ambiente **depois** do primeiro
   deploy, precisa ir em **Deployments > (⋯) no mais recente > Redeploy**
   pra ela entrar em vigor.

---

## Modo demo

A tela de login tem um botão **"Visualizar modo demo"**, que carrega o app
inteiro com dados de exemplo (perfis, contas, transações, objetivos,
cotações, etc.) sem precisar de conta nem Supabase configurado. Os dados
ficam só em memória (somem ao recarregar a página).

## Instalar como app (PWA)

- **Android/Chrome**: banner de "Instalar app", ou menu > "Adicionar à tela
  inicial".
- **iPhone/Safari**: Compartilhar > "Adicionar à Tela de Início".

## Desbloqueio por biometria

Trava local (via WebAuthn do navegador), verificada pelo sistema
operacional do aparelho -- não substitui o login, é uma camada extra que
pede Face ID/Touch ID/digital toda vez que o app é aberto, depois de
ativada em Configurações. Não depende de nada no Supabase.

## O minigame

Escondido no app, um shoot 'em up espacial em pixel art com glow neon:

- Arraste o dedo pra mover a nave; o tiro é automático
- Desvie de asteroides e naves inimigas (que miram e atiram de volta)
- Power-ups: escudo (barreira que absorve tiro inimigo por 10s), tiro
  triplo (10s) e bomba (guardada no arsenal -- ative na hora estratégica
  pra disparar uma onda de energia que destrói tudo no caminho)
- A cada leva de abates, uma transição de hiperespaço leva pro próximo
  nível, cada vez mais difícil
- Recorde salvo localmente no aparelho

---

## Estrutura do projeto

```
src/
  components/     -- componentes reutilizáveis (BottomNav, SideMenu, ColorPicker, PickerField, modais, etc.)
  context/        -- estado global (AuthContext, DataContext)
  lib/            -- Supabase client, cotações, cores, formatação, sprites do minigame, dados de demo
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
- ✅ Dashboard, Transações (com recorrência e filtros), Contas (reordenáveis), Categorias
- ✅ Objetivos, Cotações, Wishlist, Notas (editor rico), Calculadora, Juros compostos
- ✅ Minigame completo (SpaceExplorer)
- 🔲 Sparkline (mini-gráfico de histórico) nos cards de cotação
- 🔲 Efeito sonoro no minigame

---

<p align="center">
  <sub>Desenhado e projetado por <strong>4nor4k</strong> · desenvolvido com</sub>
  <br/>
  <img src="https://img.shields.io/badge/Claude%20Code-D97757?style=for-the-badge&logo=claude&logoColor=white" alt="Built with Claude Code" />
</p>
