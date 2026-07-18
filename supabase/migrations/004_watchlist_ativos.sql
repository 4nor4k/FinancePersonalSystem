-- Rode isso no SQL Editor do Supabase pra adicionar a Watchlist de cotações
-- (ações e FIIs que você quer acompanhar).

create table if not exists watchlist_ativos (
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
