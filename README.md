# Dia E

Jogo social de Verdade ou Desafio com conteúdo adulto, focado em dois modos: Grupo e Casal.

## Stack

- **Frontend:** Next.js 16 + React 19 + TypeScript
- **Styling:** Tailwind CSS com design tokens customizados
- **Backend/DB:** Supabase (PostgreSQL + Realtime + Auth)
- **Animações:** Framer Motion
- **Deploy:** Vercel (frontend) + Supabase (backend)

## Setup Local

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

O arquivo `.env.local` já está configurado com as credenciais do projeto Supabase.

### 3. Configurar Google OAuth no Supabase

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Habilite a Google+ API
4. Crie credenciais OAuth 2.0:
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `https://qoqgolgarmwcrbssaksf.supabase.co/auth/v1/callback`
5. No dashboard do Supabase (Authentication > Providers > Google):
   - Cole o Client ID e Client Secret
   - Habilite o provider

### 4. Verificar dados importados

Verifique se os 1590 itens do CSV foram importados:

```bash
# Via Supabase Dashboard ou MCP tool
SELECT COUNT(*) FROM public.items;
```

Se não foram importados, execute o import manualmente via SQL ou usando os arquivos `import-items-batch-*.sql`.

### 5. Rodar o projeto

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Estrutura do Projeto

```
src/
├── app/                    # Rotas do Next.js (App Router)
│   ├── auth/callback/      # OAuth callback
│   ├── login/              # Tela de login
│   ├── onboarding/         # Configuração inicial (14 categorias)
│   ├── perfil/             # Edição de preferências
│   ├── sala/               # Fluxos de sala
│   │   ├── criar/          # Criar nova sala
│   │   └── [codigo]/       # Sala específica
│   │       ├── lobby/      # Lobby do host
│   │       ├── espera/     # Tela de espera dos convidados
│   │       ├── jogo/       # Tela de jogo (host)
│   │       └── encerrada/  # Sala encerrada
│   └── page.tsx            # Home (criar/entrar em sala)
├── components/
│   ├── ui/                 # Componentes base (Button, Avatar, Slider, Badge)
│   ├── carta/              # Componente de carta do jogo
│   ├── lobby/              # Componentes de lobby (PlayerList, QRCode, RoomCode)
│   └── onboarding/         # Componentes de onboarding
├── lib/
│   ├── supabase/           # Clientes Supabase (browser, server, middleware)
│   ├── sala.ts             # Funções de gestão de sala
│   ├── sorteio.ts          # Algoritmo de sorteio de cartas
│   ├── jogo-context.tsx    # Context do estado do jogo
│   └── utils.ts            # Utilitários (cn para classes)
└── types/
    └── index.ts            # Tipos TypeScript + constantes

```

## Fluxo do Usuário

1. **Login** → Google OAuth obrigatório
2. **Onboarding** → Configurar preferências (0-3) para 14 categorias
3. **Home** → Criar sala ou entrar com código
4. **Lobby (Host)** → Mostrar código/QR, aguardar jogadores, iniciar
5. **Espera (Convidado)** → Aguardar host iniciar
6. **Jogo** → Sorteio → Escolha V/D → Carta → Próxima rodada
7. **Encerramento** → Sala marcada como encerrada

## Recursos Implementados

### Fase 1 — Fundação ✅
- [x] Setup Next.js + Tailwind + design tokens
- [x] Configuração Supabase (client, server, middleware)
- [x] Schema do banco (users, preferencias, salas, sala_jogadores, items)
- [x] Import de 1590 itens do CSV
- [x] RLS policies + Realtime habilitado

### Fase 2 — Autenticação e Perfil ✅
- [x] Middleware de auth (refresh + redirects)
- [x] Tela de login (Google OAuth)
- [x] Callback handler (upsert user)
- [x] Onboarding completo (14 categorias + persistência localStorage)
- [x] Tela de perfil (editar nome, escalas inline, reset, sign out)

### Fase 3 — Sala e Lobby ✅
- [x] Home com detecção de sala ativa
- [x] Criar sala (modo Grupo/Casal)
- [x] Lobby host (código copiável, QR code, lista jogadores Realtime)
- [x] Entrada na sala (validação, join)
- [x] Tela de espera (Realtime para início de jogo)

### Fase 4 — Jogo ✅
- [x] Context do jogo (estado, jogadores, preferências)
- [x] Algoritmo de sorteio (categorias compatíveis, níveis, segundo jogador)
- [x] Tela de rodada (sorteio animado, escolha V/D, carta com flip 3D)
- [x] Substituição de placeholders [JOGADOR]
- [x] Skip e próxima rodada
- [x] Encerramento de sala
- [x] Tela de encerrada

### Fase 5 — Polimento ✅
- [x] Animações Framer Motion (page transitions, card flip, fade-in)
- [x] Glow pulsante (CSS keyframes)
- [x] Feedback de botão (scale active)
- [x] Responsividade mobile-first (390px base)
- [x] Safe areas (iOS notch/home bar)
- [x] `prefers-reduced-motion` support
- [x] Focus states acessíveis
- [x] Contraste adequado (4.5:1)
- [x] Manifest.json para PWA

## Deploy

### Frontend (Vercel)

```bash
# Conectar ao GitHub e deploy automático
vercel
```

Variáveis de ambiente necessárias:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Backend (Supabase)

Já configurado e rodando em `qoqgolgarmwcrbssaksf.supabase.co`.

**Próximos passos:**
1. Configurar domínio customizado (opcional)
2. Habilitar Google OAuth no ambiente de produção
3. Ajustar redirect URLs no Google Cloud Console

## Notas Técnicas

- **RLS habilitado** em todas as tabelas públicas
- **Realtime** ativo em `salas` e `sala_jogadores`
- **Items table** é read-only para usuários autenticados
- **Preferências** são upsert com unique constraint (user_id, modo, categoria)
- **Salas órfãs** detectadas na home com banner de retomar/encerrar
- **Onboarding interrompido** retoma via localStorage
- **Link de sala para usuário novo** salva código e redireciona após auth+onboarding

## Troubleshooting

### OAuth redirect_uri_mismatch
Verifique se a URL de redirect no Google Cloud Console está correta:
- Dev: `https://qoqgolgarmwcrbssaksf.supabase.co/auth/v1/callback`
- Prod: mesma URL (Supabase gerencia)

### Items não importados
Execute os batches SQL manualmente via Supabase SQL Editor ou use o MCP tool para executar cada batch.

### Realtime não atualiza
Verifique se as tabelas `salas` e `sala_jogadores` estão na publicação `supabase_realtime`:
```sql
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

## Licença

Projeto privado — uso restrito.
