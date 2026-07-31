-- Rode isso no SQL Editor do Supabase.
-- Antes, o perfil "Nebulus" escondia Cotações/Lista de desejos no Dashboard
-- comparando o nome do perfil direto no código (quebrava se o perfil fosse
-- renomeado). Agora isso vira uma flag de verdade, editável na tela de perfil.

alter table perfis add column if not exists ocultar_extras boolean not null default false;
