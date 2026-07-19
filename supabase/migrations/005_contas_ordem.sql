-- Rode isso no SQL Editor do Supabase pra permitir reordenar as contas
-- manualmente (arrastando) na tela de Contas.

alter table contas add column if not exists ordem integer;
