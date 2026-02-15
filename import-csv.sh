#!/bin/bash
# Script para importar os batches SQL via psql

# Configurações do Supabase
PROJECT_ID="qoqgolgarmwcrbssaksf"
DB_HOST="db.${PROJECT_ID}.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

echo "🚀 Iniciando importação do CSV para o Supabase..."
echo ""
echo "⚠️  IMPORTANTE: Você precisará da senha do banco de dados."
echo "   Obtenha em: Supabase Dashboard → Project Settings → Database → Database password"
echo ""
read -sp "Digite a senha do banco: " DB_PASSWORD
echo ""
echo ""

# Verificar se psql está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ psql não encontrado. Instale o PostgreSQL client:"
    echo "   Windows: https://www.postgresql.org/download/windows/"
    echo "   Mac: brew install postgresql"
    echo "   Linux: sudo apt-get install postgresql-client"
    exit 1
fi

# Executar cada batch
for i in {1..8}; do
    BATCH_FILE="import-items-batch-${i}.sql"

    if [ ! -f "$BATCH_FILE" ]; then
        echo "❌ Arquivo não encontrado: $BATCH_FILE"
        continue
    fi

    echo "📦 Executando batch ${i}/8..."

    PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -f "$BATCH_FILE" \
        -q

    if [ $? -eq 0 ]; then
        echo "✅ Batch ${i} importado com sucesso"
    else
        echo "❌ Erro ao importar batch ${i}"
        exit 1
    fi

    # Pequeno delay entre batches
    sleep 0.5
done

echo ""
echo "🎉 Importação concluída!"
echo ""
echo "Verificando total de itens..."
PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -c "SELECT COUNT(*) as total FROM public.items;" \
    -t

echo ""
echo "✨ Pronto! Execute no SQL Editor para ver a distribuição:"
echo "   SELECT modo, COUNT(*) as count FROM public.items GROUP BY modo;"
