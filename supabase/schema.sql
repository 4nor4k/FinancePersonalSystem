-- Rode este arquivo inteiro no SQL Editor do Supabase (Project > SQL Editor > New query)
-- Ele cria as tabelas do app e as políticas de RLS que isolam os dados por usuário.

create extension if not exists "pgcrypto";

-- PERFIS -----------------------------------------------------------
create table perfis (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  cor text not null default '#ff8a3d',
  cor_bg text not null default '#2e1c10',
  criado_em timestamptz not null default now()
);

alter table perfis enable row level security;

create policy "usuario ve apenas seus proprios perfis"
  on perfis for all
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

-- CONTAS -------------------------------------------------------------
create table contas (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfis(id) on delete cascade,
  nome text not null,
  tipo text not null check (tipo in ('comum', 'cartao_credito')),
  limite numeric,
  icone text not null default 'ti-building-bank',
  cor text not null default '#8a8a87',
  criado_em timestamptz not null default now()
);

alter table contas enable row level security;

create policy "usuario ve apenas contas dos seus perfis"
  on contas for all
  using (
    exists (select 1 from perfis where perfis.id = contas.perfil_id and perfis.usuario_id = auth.uid())
  )
  with check (
    exists (select 1 from perfis where perfis.id = contas.perfil_id and perfis.usuario_id = auth.uid())
  );

-- CATEGORIAS ------------------------------------------------------
create table categorias (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfis(id) on delete cascade,
  nome text not null,
  tipo text not null check (tipo in ('despesa', 'receita')),
  icone text not null default 'ti-dots',
  cor text not null default '#8a8a87',
  criado_em timestamptz not null default now()
);

alter table categorias enable row level security;

create policy "usuario ve apenas categorias dos seus perfis"
  on categorias for all
  using (
    exists (select 1 from perfis where perfis.id = categorias.perfil_id and perfis.usuario_id = auth.uid())
  )
  with check (
    exists (select 1 from perfis where perfis.id = categorias.perfil_id and perfis.usuario_id = auth.uid())
  );

-- RECORRENCIAS -----------------------------------------------------
create table recorrencias (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfis(id) on delete cascade,
  tipo text not null check (tipo in ('fixa', 'parcelada')),
  valor_original numeric not null,
  data_inicio date not null,
  numero_parcelas integer,
  ativa boolean not null default true,
  criado_em timestamptz not null default now()
);

alter table recorrencias enable row level security;

create policy "usuario ve apenas recorrencias dos seus perfis"
  on recorrencias for all
  using (
    exists (select 1 from perfis where perfis.id = recorrencias.perfil_id and perfis.usuario_id = auth.uid())
  )
  with check (
    exists (select 1 from perfis where perfis.id = recorrencias.perfil_id and perfis.usuario_id = auth.uid())
  );

-- TRANSACOES -------------------------------------------------------
-- perfil_id fica redundante aqui de propósito: simplifica e agiliza
-- as políticas de RLS e os filtros do dashboard, como decidimos no planejamento.
create table transacoes (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfis(id) on delete cascade,
  conta_id uuid not null references contas(id) on delete cascade,
  categoria_id uuid references categorias(id) on delete set null,
  recorrencia_id uuid references recorrencias(id) on delete cascade,
  tipo text not null check (tipo in ('despesa', 'receita')),
  valor numeric not null,
  data date not null default current_date,
  anotacao text,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'recebido')),
  parcela_atual integer,
  criado_em timestamptz not null default now()
);

alter table transacoes enable row level security;

create policy "usuario ve apenas transacoes dos seus perfis"
  on transacoes for all
  using (
    exists (select 1 from perfis where perfis.id = transacoes.perfil_id and perfis.usuario_id = auth.uid())
  )
  with check (
    exists (select 1 from perfis where perfis.id = transacoes.perfil_id and perfis.usuario_id = auth.uid())
  );

-- NOTAS --------------------------------------------------------------
create table notas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null default '',
  conteudo text not null default '',
  atualizado_em timestamptz not null default now()
);

alter table notas enable row level security;

create policy "usuario ve apenas suas proprias notas"
  on notas for all
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

-- WISHLIST -----------------------------------------------------------
create table wishlist_itens (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfis(id) on delete cascade,
  nome text not null,
  preco numeric,
  link_produto text,
  link_imagem text,
  meta_data date,
  criado_em timestamptz not null default now()
);

alter table wishlist_itens enable row level security;

create policy "usuario ve apenas itens dos seus perfis"
  on wishlist_itens for all
  using (
    exists (select 1 from perfis where perfis.id = wishlist_itens.perfil_id and perfis.usuario_id = auth.uid())
  )
  with check (
    exists (select 1 from perfis where perfis.id = wishlist_itens.perfil_id and perfis.usuario_id = auth.uid())
  );

-- OBJETIVOS -----------------------------------------------------------
create table objetivos (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfis(id) on delete cascade,
  nome text not null,
  valor_meta numeric not null,
  valor_atual numeric not null default 0,
  icone text not null default 'ti-target',
  cor text not null default '#ff8a3d',
  meta_data date,
  criado_em timestamptz not null default now()
);

alter table objetivos enable row level security;

create policy "usuario ve apenas objetivos dos seus perfis"
  on objetivos for all
  using (
    exists (select 1 from perfis where perfis.id = objetivos.perfil_id and perfis.usuario_id = auth.uid())
  )
  with check (
    exists (select 1 from perfis where perfis.id = objetivos.perfil_id and perfis.usuario_id = auth.uid())
  );

-- WATCHLIST DE COTAÇÕES ------------------------------------------------
create table watchlist_ativos (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references perfis(id) on delete cascade,
  ticker text not null,
  criado_em timestamptz not null default now()
);

alter table watchlist_ativos enable row level security;

create policy "usuario ve apenas ativos dos seus perfis"
  on watchlist_ativos for all
  using (
    exists (select 1 from perfis where perfis.id = watchlist_ativos.perfil_id and perfis.usuario_id = auth.uid())
  )
  with check (
    exists (select 1 from perfis where perfis.id = watchlist_ativos.perfil_id and perfis.usuario_id = auth.uid())
  );
