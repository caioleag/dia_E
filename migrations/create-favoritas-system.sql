-- ============================================
-- MIGRATION: Sistema de Cartas Favoritas
-- Data: 2026-02-16
-- Descrição: Permite usuários favoritarem cartas
--            e aumenta probabilidade no sorteio
-- ============================================

-- 1. Criar tabela de favoritas
-- ============================================
CREATE TABLE IF NOT EXISTS public.favoritas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_id text NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  
  -- Garantir que usuário não favorita a mesma carta 2x
  CONSTRAINT favoritas_user_item_unique UNIQUE(user_id, item_id)
);

-- 2. Criar índices para performance
-- ============================================
-- Buscar favoritas de um usuário
CREATE INDEX idx_favoritas_user_id ON public.favoritas(user_id);

-- Buscar se uma carta específica é favorita
CREATE INDEX idx_favoritas_item_id ON public.favoritas(item_id);

-- Buscar favoritas de múltiplos usuários (sessão)
CREATE INDEX idx_favoritas_user_item ON public.favoritas(user_id, item_id);

-- 3. Configurar RLS (Row Level Security)
-- ============================================
ALTER TABLE public.favoritas ENABLE ROW LEVEL SECURITY;

-- Usuários podem ler suas próprias favoritas
CREATE POLICY "Users can read own favorites"
  ON public.favoritas
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem adicionar favoritas para si mesmos
CREATE POLICY "Users can insert own favorites"
  ON public.favoritas
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem remover suas próprias favoritas
CREATE POLICY "Users can delete own favorites"
  ON public.favoritas
  FOR DELETE
  USING (auth.uid() = user_id);

-- Permitir que participantes de uma sessão vejam favoritas uns dos outros
-- (necessário para calcular favoritas da sessão no sorteio)
CREATE POLICY "Session participants can read each other's favorites"
  ON public.favoritas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sala_jogadores sj1
      WHERE sj1.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.sala_jogadores sj2
        WHERE sj2.sala_id = sj1.sala_id
        AND sj2.user_id = favoritas.user_id
      )
    )
  );

-- 4. Função auxiliar: contar favoritas de um usuário
-- ============================================
CREATE OR REPLACE FUNCTION contar_favoritas(user_uuid uuid)
RETURNS integer AS $$
  SELECT COUNT(*)::integer
  FROM public.favoritas
  WHERE user_id = user_uuid;
$$ LANGUAGE sql STABLE;

-- 5. Função auxiliar: obter IDs de cartas favoritas de uma lista de usuários
-- ============================================
-- Útil para pegar favoritas de uma sessão inteira
CREATE OR REPLACE FUNCTION get_favoritas_sessao(user_ids uuid[])
RETURNS TABLE(item_id text) AS $$
  SELECT DISTINCT f.item_id
  FROM public.favoritas f
  WHERE f.user_id = ANY(user_ids);
$$ LANGUAGE sql STABLE;

-- 6. Comentários para documentação
-- ============================================
COMMENT ON TABLE public.favoritas IS 
  'Cartas favoritas dos usuários. Favoritas têm 10x mais chance no sorteio.';

COMMENT ON COLUMN public.favoritas.user_id IS 
  'Usuário que favoritou a carta';

COMMENT ON COLUMN public.favoritas.item_id IS 
  'ID da carta favorita (referência para public.items)';

COMMENT ON FUNCTION get_favoritas_sessao IS 
  'Retorna lista única de item_ids favoritos por qualquer usuário na lista fornecida';

-- ============================================
-- FIM DA MIGRATION
-- ============================================

-- Para reverter (ROLLBACK):
-- DROP FUNCTION IF EXISTS get_favoritas_sessao(uuid[]);
-- DROP FUNCTION IF EXISTS contar_favoritas(uuid);
-- DROP TABLE IF EXISTS public.favoritas CASCADE;
