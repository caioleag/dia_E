# Plano de Desenvolvimento — Dia E

## Contexto
O Dia E é um web app de jogo social de Verdade ou Desafio com conteúdo adulto, com modos Grupo e Casal. O projeto Supabase (`qoqgolgarmwcrbssaksf`) está vazio e o repositório local só tem a documentação e o CSV com 1590 itens de conteúdo. O objetivo é construir a aplicação completa conforme `dia-e-completo.md`, testando localmente antes do deploy na Vercel.

---

## Fase 1 — Fundação (Setup do Projeto)

### 1.1 Inicializar Next.js + Tailwind
- `npx create-next-app@latest . --typescript --tailwind --eslint --app --src --no-import-alias`
- Instalar dependências: `@supabase/supabase-js`, `@supabase/ssr`, `framer-motion`, `qrcode.react`, `lucide-react`
- Configurar Google Fonts (Playfair Display + Inter) no `layout.tsx`
- Configurar `tailwind.config.ts` com os design tokens da doc (cores, fontes, border radius)

### 1.2 Configurar Supabase Client
- Criar `src/lib/supabase/client.ts` (browser client)
- Criar `src/lib/supabase/server.ts` (server client)
- Criar `src/lib/supabase/middleware.ts` (auth middleware)
- `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.3 Schema do Banco (Supabase migrations)
Aplicar 1 migration com todas as tabelas:

```sql
-- users
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nome text,
  foto_url text,
  created_at timestamp with time zone default now(),
  onboarding_completo boolean default false
);

-- preferencias
create table public.preferencias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  modo text check (modo in ('grupo', 'casal')),
  categoria text,
  nivel_max integer default 1 check (nivel_max between 0 and 3),
  updated_at timestamp with time zone default now(),
  unique(user_id, modo, categoria)
);

-- salas
create table public.salas (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  host_id uuid references public.users(id),
  modo text check (modo in ('grupo', 'casal')),
  status text default 'aguardando' check (status in ('aguardando', 'em_jogo', 'encerrada')),
  created_at timestamp with time zone default now(),
  encerrada_at timestamp with time zone
);

-- sala_jogadores
create table public.sala_jogadores (
  id uuid primary key default gen_random_uuid(),
  sala_id uuid references public.salas(id) on delete cascade,
  user_id uuid references public.users(id),
  entrou_em timestamp with time zone default now(),
  unique(sala_id, user_id)
);

-- items
create table public.items (
  id text primary key,
  modo text,
  categoria text,
  nivel integer check (nivel between 1 and 3),
  tipo text check (tipo in ('Verdade', 'Desafio')),
  quem text,
  conteudo text
);

-- RLS
alter table public.users enable row level security;
alter table public.preferencias enable row level security;
alter table public.salas enable row level security;
alter table public.sala_jogadores enable row level security;
alter table public.items enable row level security;

-- Policies: users
create policy "Users can read own data" on public.users for select using (auth.uid() = id);
create policy "Users can update own data" on public.users for update using (auth.uid() = id);
create policy "Users can insert own data" on public.users for insert with check (auth.uid() = id);

-- Policies: preferencias
create policy "Users can manage own prefs" on public.preferencias for all using (auth.uid() = user_id);

-- Policies: salas
create policy "Anyone authenticated can read salas" on public.salas for select using (auth.uid() is not null);
create policy "Authenticated users can create salas" on public.salas for insert with check (auth.uid() = host_id);
create policy "Host can update own sala" on public.salas for update using (auth.uid() = host_id);

-- Policies: sala_jogadores
create policy "Participants can read" on public.sala_jogadores for select using (auth.uid() is not null);
create policy "Users can join sala" on public.sala_jogadores for insert with check (auth.uid() = user_id);

-- Policies: items (read-only for all authenticated)
create policy "Authenticated can read items" on public.items for select using (auth.uid() is not null);

-- Realtime
alter publication supabase_realtime add table public.salas;
alter publication supabase_realtime add table public.sala_jogadores;
```

### 1.4 Importar CSV de conteúdo
- Parse `banco-conteudo.csv` e inserir os 1590 itens na tabela `items` via SQL

### 1.5 Configurar Google OAuth no Supabase
- O usuário precisará configurar o Google OAuth provider no dashboard do Supabase manualmente (client ID/secret do Google Cloud Console)

---

## Fase 2 — Autenticação e Perfil

### 2.1 Middleware de Auth
- `src/middleware.ts` — refresh de sessão em todas as rotas
- Redirect: não autenticado → `/login`, autenticado sem onboarding → `/onboarding`

### 2.2 Tela de Login (`src/app/login/page.tsx`)
- Fundo escuro `#0A0A0F` com gradiente radial roxo sutil
- Logo "Dia E" em Playfair Display centralizado
- Tagline em Inter
- Botão "Entrar com Google" (pill, branco) → `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Callback handler: cria/atualiza registro em `users` (trigger ou on-login)

### 2.3 Auth Callback (`src/app/auth/callback/route.ts`)
- Exchange code for session
- Upsert user em `public.users` com dados do Google (nome, email, foto)
- Redirect para `/onboarding` ou `/` conforme `onboarding_completo`

### 2.4 Onboarding (`src/app/onboarding/page.tsx`)
- 1 tela boas-vindas + 6 telas Grupo + 8 telas Casal + 1 confirmação = ~16 steps
- Componente `OnboardingStep` com: barra de progresso, emoji + nome categoria, descrição, slider 0-3, botões voltar/continuar
- Slider customizado com visual do design system (track gradiente, thumb com glow)
- Ao finalizar: insere 14 registros em `preferencias` + atualiza `onboarding_completo = true`
- Se abandonar: salvar progresso em `localStorage`, retomar ao reabrir

### 2.5 Tela de Perfil (`src/app/perfil/page.tsx`)
- Foto + nome editável
- Seções Grupo e Casal com lista de categorias e nível atual (pill colorido)
- Tap em categoria: expande slider inline para editar
- Botão "Resetar Preferências" (modal de confirmação, seta tudo para 1)
- Botão "Sair da conta" → `supabase.auth.signOut()`

---

## Fase 3 — Sala e Lobby

### 3.1 Home (`src/app/page.tsx`)
- Header: foto + "Olá, [Nome]" | ícone perfil
- Botão "Criar Sala" (primário, gradiente, glow)
- Botão "Entrar em uma Sala" (secundário, outline)
- Banner sala ativa: detectar sala com status != 'encerrada' onde user é host → mostrar "Retomar" / "Encerrar"

### 3.2 Criar Sala (`src/app/sala/criar/page.tsx`)
- Seleção de modo: Grupo | Casal
- Ao criar: gerar código 6 chars alfanuméricos (verificar unicidade via query), inserir em `salas`, redirect para lobby

### 3.3 Lobby Host (`src/app/sala/[codigo]/lobby/page.tsx`)
- Código grande copiável + QR Code (`qrcode.react`)
- Lista de jogadores com Supabase Realtime (subscribe em `sala_jogadores` filtrado por `sala_id`)
- Contador de jogadores
- Botão "Iniciar Jogo" — habilitado quando >= 3 (grupo) ou == 2 (casal)
  - Ao iniciar: atualiza `salas.status = 'em_jogo'`
- Botão "Cancelar Sala" — encerra e volta para home

### 3.4 Entrada na Sala (`src/app/sala/[codigo]/page.tsx`)
- Rota que recebe o código, valida sala existente/aberta
- Se não logado: salva código em `localStorage`, redireciona para login → onboarding → volta
- Insere em `sala_jogadores` e redirect para `/sala/[codigo]/espera`

### 3.5 Tela de Espera (`src/app/sala/[codigo]/espera/page.tsx`)
- "Você está na sala de [Nome do Host]"
- Lista jogadores (realtime)
- "Aguardando o host iniciar..."
- Subscribe em `salas` para detectar `status = 'em_jogo'` → redirect para `/sala/[codigo]/jogo`

---

## Fase 4 — Jogo

### 4.1 Contexto do Jogo (`src/lib/jogo-context.tsx`)
- React Context com estado: jogadores, rodada atual, jogador sorteado, carta atual
- Carregar preferências de todos os jogadores da sala ao iniciar

### 4.2 Tela de Rodada (`src/app/sala/[codigo]/jogo/page.tsx`)
- **Estado 1 — Sorteio do jogador**: animação de rolagem de nomes → para no sorteado, vibração háptica
- **Estado 2 — Escolha V/D**: foto+nome do jogador, botões Verdade (âmbar) / Desafio (vermelho)
- **Estado 3 — Carta**: card flip 3D, exibe texto da carta, badge tipo, tag categoria
  - Se `quem = 'Dupla'` ou `[JOGADOR]`: sortear segundo jogador compatível, substituir placeholder
  - Botões: "Próxima Rodada" (primário), "Pular" (link)
  - Menu "Encerrar Sala" no header

### 4.3 Algoritmo de Sorteio (`src/lib/sorteio.ts`)
1. Sortear jogador aleatório
2. Host escolhe Verdade/Desafio
3. Sortear categoria (filtrar onde jogador tem nível >= 1)
4. Query items: `modo + categoria + tipo + nivel <= nivel_max`, ORDER BY RANDOM(), LIMIT 1
5. Se item envolve segundo jogador: sortear outro jogador, verificar compatibilidade
6. Fallback: 3 tentativas de categoria, depois pular rodada

### 4.4 Encerramento (`src/app/sala/[codigo]/encerrada/page.tsx`)
- "O jogo foi encerrado"
- Botão "Voltar ao Início"
- Host: atualiza `salas.status = 'encerrada'`, `encerrada_at = now()`
- Convidados: detectam via Realtime

---

## Fase 5 — Polimento e UX

### 5.1 Animações (Framer Motion)
- Page transitions: fade + slide (300ms)
- Card flip 3D na revelação da carta (500ms)
- Rolagem de nomes no sorteio (1200ms)
- Glow pulsante em botões e bordas de carta (CSS keyframe 3s loop)
- Feedback de botão: scale(0.97) 100ms
- Entrada de jogadores no lobby: fade-in + slide

### 5.2 Responsividade e Mobile-First
- Layout base 390px, padding 24px
- Botões min 56px altura (touch target 48px)
- `env(safe-area-inset-bottom)` no padding inferior
- Telas de jogo sem scroll (cabe na viewport)

### 5.3 Acessibilidade
- Contraste 4.5:1
- `prefers-reduced-motion` desabilita animações complexas
- Focus states visíveis
- Alt text em avatares

### 5.4 Edge Cases
- Sala órfã: banner na home para retomar/encerrar
- Onboarding interrompido: retoma de onde parou
- Link de sala para usuário novo: salvar código, completar auth+onboarding, depois entrar
- Nenhum item compatível: mensagem "pulando rodada"

---

## Estrutura de Arquivos Final

```
src/
├── app/
│   ├── layout.tsx              # Fonts, providers, global styles
│   ├── page.tsx                # Home
│   ├── login/page.tsx
│   ├── onboarding/page.tsx
│   ├── perfil/page.tsx
│   ├── auth/callback/route.ts
│   ├── sala/
│   │   ├── criar/page.tsx
│   │   └── [codigo]/
│   │       ├── page.tsx        # Entry point (join room)
│   │       ├── lobby/page.tsx
│   │       ├── espera/page.tsx
│   │       ├── jogo/page.tsx
│   │       └── encerrada/page.tsx
│   └── globals.css
├── components/
│   ├── ui/                     # Button, Slider, Card, Avatar, Input, Badge
│   ├── carta/                  # GameCard, CardFlip
│   ├── lobby/                  # PlayerList, RoomCode, QRCode
│   └── onboarding/             # OnboardingStep, ProgressBar
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── sorteio.ts
│   ├── sala.ts
│   └── jogo-context.tsx
├── types/
│   └── index.ts
└── middleware.ts
```

---

## Verificação / Testes

- **Fase 1**: Confirmar tabelas no Supabase (`list_tables`), verificar items importados (`SELECT count(*) FROM items`)
- **Fase 2**: Login Google funcional, onboarding salva preferências, perfil edita e reseta
- **Fase 3**: Criar sala gera código, QR funciona, convidado entra via código, Realtime atualiza lobby
- **Fase 4**: Sorteio respeita preferências, placeholder substituído, skip funciona, encerramento propaga
- **Fase 5**: Animações fluidas em mobile, `prefers-reduced-motion` funcional, sem scroll nas telas de jogo

---

## Ordem de Execução

1. Setup Next.js + Tailwind + design tokens
2. Supabase: migration do schema + import CSV
3. Auth: client Supabase, middleware, login, callback
4. Onboarding completo
5. Home + Perfil
6. Criar sala + Lobby + Entrada + Espera (com Realtime)
7. Jogo: contexto, sorteio, tela de rodada, carta, encerramento
8. Animações e polimento
