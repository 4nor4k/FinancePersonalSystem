-- Rode isso no SQL Editor do Supabase (você já rodou o schema.sql original,
-- então precisa só desse ALTER pra atualizar a tabela `contas` existente).

alter table contas add column if not exists icone text not null default 'ti-building-bank';
alter table contas add column if not exists cor text not null default '#8a8a87';
