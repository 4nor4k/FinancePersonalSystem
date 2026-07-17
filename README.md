# Financeiro (nome provisório)

App pessoal de controle financeiro (pessoal + empresa), notas, calculadora e
lista de desejos. React + Vite, Supabase como banco, deploy na Vercel.

## Rodando localmente

```bash
npm install
cp .env.example .env   # depois preencha com suas chaves do Supabase
npm run dev
```

## Passo a passo do setup (contas/serviços)

Essas etapas você faz na sua própria conta -- eu (Claude) te acompanho em
cada uma quando chegar a hora, mas não consigo clicar por você.

### 1. Supabase
1. Crie uma conta em supabase.com e um novo projeto.
2. Vá em **SQL Editor > New query**, cole o conteúdo de `supabase/schema.sql`
   e rode. Isso cria todas as tabelas e as regras de segurança (RLS).
3. Vá em **Project Settings > API** e copie a **Project URL** e a
   **anon public key**.
4. Cole os dois valores no seu `.env` local:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

### 2. GitHub
1. Crie um repositório novo (privado ou público, tanto faz -- o `.env`
   nunca vai junto, já está no `.gitignore`).
2. `git init`, `git add .`, `git commit -m "primeira versão"`,
   e siga as instruções do próprio GitHub pra conectar e dar push.

### 3. Vercel
1. Crie uma conta em vercel.com e conecte com o GitHub.
2. Importe o repositório.
3. Em **Environment Variables**, adicione `VITE_SUPABASE_URL` e
   `VITE_SUPABASE_ANON_KEY` com os mesmos valores do seu `.env`.
4. Deploy. A cada push no GitHub, a Vercel builda e publica sozinha.

## Estrutura do projeto

```
src/
  components/     -- componentes reutilizáveis (ex: BottomNav)
  context/        -- estado global (ex: perfil ativo e tema)
  lib/            -- cliente do Supabase
  pages/          -- uma tela por arquivo
```

## Login e modo demo

A tela inicial pede login (email/senha, via Supabase Auth) ou tem um botão
**"Visualizar modo demo"**, que carrega o app inteiro com dados de exemplo
(perfis, contas, transações, notas, wishlist) sem precisar de conta nem
Supabase configurado -- ótimo pra navegar e mostrar o app antes de plugar
o banco de verdade.

No modo demo, os dados ficam só em memória (somem se recarregar a página).
Com login de verdade, tudo é lido e salvo no Supabase.

## Instalar como app (PWA)

O projeto já está configurado como PWA (manifest + service worker via
`vite-plugin-pwa`). Depois de publicado (Vercel), abrindo o link pelo celular:
- **Android/Chrome**: aparece um banner de "Instalar app", ou menu > "Adicionar
  à tela inicial".
- **iPhone/Safari**: toque em Compartilhar > "Adicionar à Tela de Início".

Em ambos os casos o app abre em tela cheia, sem a barra do navegador, com
ícone próprio.

## Estado atual

- ✅ Estrutura do projeto, roteamento, tema dark com accent por perfil
- ✅ PWA (instalável no celular)
- ✅ Login + modo demo com dados de exemplo
- ✅ Todas as telas do MVP construídas e ligadas aos dados (demo ou Supabase):
  Dashboard, Nova Transação, Transações, Contas, Categorias, Configurações,
  Calculadora, Notas, Wishlist
- 🔲 Minigame (fase 2, ainda não definido)
- 🔲 Watchlist de cotações (fase 2)
- 🔲 Swipe-to-action na lista de transações -- por ora são botões diretos
  (pagar/excluir), mais simples de manter; dá pra evoluir pro gesto depois
- 🔲 Editor de notas usa formatação básica via `contentEditable` -- funciona,
  mas uma biblioteca dedicada (ex: Tiptap) deixaria mais robusto no futuro
