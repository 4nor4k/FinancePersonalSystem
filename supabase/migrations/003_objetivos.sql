-- Rode isso no SQL Editor do Supabase pra adicionar a funcionalidade de Objetivos
-- (reserva de emergência, carro, casa, investimentos, etc).

create table if not exists objetivos (
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
