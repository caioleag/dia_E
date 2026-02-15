-- Adiciona coluna categorias_ativas na tabela salas
-- Armazena as categorias selecionadas pelo host para a sessão
ALTER TABLE salas
ADD COLUMN IF NOT EXISTS categorias_ativas text[] DEFAULT NULL;
