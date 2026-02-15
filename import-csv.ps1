# Script PowerShell para importar os batches SQL
# Uso: .\import-csv.ps1

$ProjectId = "qoqgolgarmwcrbssaksf"
$DbHost = "db.$ProjectId.supabase.co"
$DbPort = "5432"
$DbName = "postgres"
$DbUser = "postgres"

Write-Host "🚀 Iniciando importação do CSV para o Supabase..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Você precisará da senha do banco de dados." -ForegroundColor Yellow
Write-Host "   Obtenha em: Supabase Dashboard → Project Settings → Database → Database password"
Write-Host ""

$SecurePassword = Read-Host "Digite a senha do banco" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
$DbPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""

# Verificar se psql está instalado
if (!(Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Host "❌ psql não encontrado. Instale o PostgreSQL:" -ForegroundColor Red
    Write-Host "   Download: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Executar cada batch
for ($i = 1; $i -le 8; $i++) {
    $BatchFile = "import-items-batch-$i.sql"

    if (!(Test-Path $BatchFile)) {
        Write-Host "❌ Arquivo não encontrado: $BatchFile" -ForegroundColor Red
        continue
    }

    Write-Host "📦 Executando batch $i/8..." -ForegroundColor Yellow

    $env:PGPASSWORD = $DbPassword
    & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $BatchFile -q

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Batch $i importado com sucesso" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao importar batch $i" -ForegroundColor Red
        exit 1
    }

    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "🎉 Importação concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "Verificando total de itens..."

$env:PGPASSWORD = $DbPassword
& psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c "SELECT COUNT(*) as total FROM public.items;" -t

Write-Host ""
Write-Host "✨ Pronto! Execute no SQL Editor para ver a distribuição:" -ForegroundColor Cyan
Write-Host '   SELECT modo, COUNT(*) as count FROM public.items GROUP BY modo;'
