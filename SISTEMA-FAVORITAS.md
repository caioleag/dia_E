# Sistema de Cartas Favoritas - Implementação Completa

## 📋 Resumo

Sistema que permite usuários favoritarem cartas durante o jogo. Cartas favoritas têm **10x mais probabilidade** de aparecer no sorteio, sem acumular multiplicadores.

---

## 🗄️ 1. Aplicar Migration no Banco de Dados

**Arquivo:** `migrations/create-favoritas-system.sql`

Execute este arquivo no **SQL Editor do Supabase Dashboard**:

1. Acesse: https://supabase.com/dashboard/project/qoqgolgarmwcrbssaksf/sql
2. Cole todo o conteúdo do arquivo `migrations/create-favoritas-system.sql`
3. Clique em "Run"

Isso criará:
- ✅ Tabela `favoritas`
- ✅ Índices para performance
- ✅ Políticas RLS
- ✅ Funções auxiliares

---

## 🎯 2. Como Funciona

### **Lógica de Probabilidade**

```
Pool de 100 cartas disponíveis:
├─ 5 são favoritas (do jogador OU da sessão)
├─ 95 são normais

Peso total = (5 × 10) + (95 × 1) = 145

Chance de sair favorita = 50/145 = ~34.5%
Chance de sair normal = 95/145 = ~65.5%
```

### **Regras**

1. **Favoritas do Jogador Atual** = peso 10
2. **Favoritas de Qualquer Participante da Sessão** = peso 10
3. **Carta favorita por 2+ pessoas** = peso ainda é 10 (NÃO acumula)
4. **Cartas normais** = peso 1

---

## 🎨 3. Interface

### **Durante o Jogo**
```
┌──────────────────────────┐
│ "Verdade ou Desafio?"    │
│ [conteúdo da carta...]   │
│                          │
│    ⭐ Favoritar           │ ← Botão toggle
└──────────────────────────┘
```

### **No Perfil**
```
Meu Perfil
├─ Avatar + Nome
├─ Preferências (Grupo)
├─ Preferências (Casal)
├─ ⭐ Cartas Favoritas (12) ← Nova seção
│  ├─ [preview da carta]
│  ├─ [preview da carta]
│  └─ ...
├─ Resetar Preferências
└─ Sair da conta
```

---

## 📁 4. Arquivos Criados/Modificados

### **Novos Arquivos:**
- ✅ `migrations/create-favoritas-system.sql` - Migration do banco
- ✅ `src/components/carta/FavoriteButton.tsx` - Botão de favoritar
- ✅ `src/components/perfil/FavoritasGrid.tsx` - Lista de favoritas no perfil

### **Modificados:**
- ✅ `src/types/index.ts` - Adicionado tipo `Favorita`
- ✅ `src/lib/sorteio.ts` - Adicionado sorteio ponderado com favoritas
- ✅ `src/components/carta/GameCard.tsx` - Integrado botão de favoritar
- ✅ `src/app/perfil/page.tsx` - Adicionada seção de favoritas
- ✅ `src/app/sala/[codigo]/jogo/page.tsx` - Carregamento de favoritas no sorteio

---

## 🧪 5. Como Testar

1. **Aplicar a migration** no Supabase
2. **Rodar o projeto:** `npm run dev`
3. **Entrar em uma sala** e jogar
4. Quando uma carta aparecer, clicar em **⭐ Favoritar**
5. Continuar jogando - cartas favoritadas devem aparecer mais
6. Ir em **Perfil** → ver lista de favoritas
7. Remover uma favorita clicando no 🗑️

---

## 🔍 6. Verificar Funcionamento

### **Consultas SQL Úteis:**

```sql
-- Ver todas as favoritas de um usuário
SELECT f.*, i.conteudo 
FROM favoritas f 
JOIN items i ON f.item_id = i.id
WHERE f.user_id = 'seu-user-id';

-- Ver cartas mais favoritadas
SELECT item_id, COUNT(*) as total_favs
FROM favoritas
GROUP BY item_id
ORDER BY total_favs DESC
LIMIT 10;

-- Ver favoritas de uma sessão
SELECT DISTINCT f.item_id, i.conteudo
FROM favoritas f
JOIN sala_jogadores sj ON f.user_id = sj.user_id
JOIN items i ON f.item_id = i.id
WHERE sj.sala_id = 'id-da-sala';
```

---

## ⚠️ 7. Considerações

### **Performance:**
- Índices criados em `favoritas(user_id)` e `favoritas(item_id)`
- Consultas otimizadas para buscar favoritas da sessão

### **Jogadores Fictícios:**
- Não têm favoritas (filtrados com `!id.startsWith('fictional-')`)
- Sistema funciona normalmente em modo solo

### **RLS (Segurança):**
- Usuários só podem favoritar/desfavoritar suas próprias cartas
- Participantes da sessão podem ver favoritas uns dos outros (necessário para o sorteio)
- Ninguém pode modificar favoritas de outros

---

## 🚀 8. Próximos Passos (Opcional)

- [ ] Mostrar indicador visual de "carta favorita" durante o jogo
- [ ] Estatísticas: "X% das cartas jogadas foram favoritas"
- [ ] Limite de favoritas por usuário (ex: máximo 50)
- [ ] Categorizar favoritas (grupo/casal)

---

## 📝 Notas Importantes

1. **Não acumula:** Se uma carta é favorita de 3 pessoas na sessão, ela não fica 30x mais provável. Continua 10x.
2. **Peso aplicado por sorteio:** A cada sorteio, o sistema une favoritas do jogador + sessão e aplica peso 10.
3. **Cartas nunca somem:** Mesmo cartas não favoritadas por ninguém continuam no pool com peso 1.

---

✅ **Sistema implementado e pronto para uso após aplicar a migration!**
