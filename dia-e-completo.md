# Dia E — Documentação Completa do Produto

**Versão:** 1.0  
**Data:** Fevereiro 2026  
**Status:** Pré-desenvolvimento

---

## 1. Visão Geral

**Dia E** é um web app de jogo social de Verdade ou Desafio com conteúdo adulto, focado em dois contextos distintos: grupos de amigos (Modo Grupo) e casais (Modo Casal). O app é projetado com UI mobile-first, rodando inteiramente no dispositivo do host durante a partida.

### Proposta de valor
- Jogo de interações progressivas com conteúdo calibrado pelo próprio usuário
- Perfil persistente com escalas de conforto por categoria e por modo
- Sessão centralizada no host — sem necessidade de interação nos celulares dos convidados durante o jogo
- Conteúdo exclusivo, organizado em categorias e níveis de intensidade

### Stack Técnica
| Camada | Tecnologia |
|--------|-----------|
| Frontend | React (Next.js) |
| Hospedagem frontend | Vercel |
| Backend / Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth — Google OAuth |
| Repositório | GitHub |
| Idioma | Português BR |

---

## 2. Modos de Jogo

### 2.1 Modo Grupo
Voltado para grupos de amigos. Mínimo de 3 jogadores, sem limite máximo definido.

**Categorias disponíveis:**
| Categoria | Código | Itens |
|-----------|--------|-------|
| Verbal / Confissão | VC | 240 |
| Toque | TO | 120 |
| Beijo | BJ | 90 |
| Performance | PE | 150 |
| Exposição Corporal | EC | 120 |
| Contato Íntimo | CI | 150 |

### 2.2 Modo Casal
Voltado para dois jogadores em relacionamento. Exige exatamente 2 jogadores.

**Categorias disponíveis:**
| Categoria | Código | Itens |
|-----------|--------|-------|
| Revelação | RE | 90 |
| Ato | AT | 90 |
| Encenação | EN | 90 |
| Exposição | EX | 90 |
| Sensorial | SE | 90 |
| Resistência | RS | 90 |
| Abertura | AB | 90 |
| Terceiros | TE | 90 |

### 2.3 Níveis de Intensidade
Cada categoria possui 3 níveis de intensidade. O jogador configura, para cada categoria, o nível máximo que aceita (0 = nunca, 1 = leve, 2 = médio, 3 = intenso).

- **Nível 0:** Categoria completamente bloqueada para o jogador
- **Nível 1:** Conteúdo leve
- **Nível 2:** Conteúdo intermediário
- **Nível 3:** Conteúdo mais explícito/intenso

---

## 3. Autenticação e Perfil de Usuário

### 3.1 Login
- Autenticação exclusiva via **Google OAuth** (Supabase Auth)
- Obrigatória para todos os jogadores — host e convidados
- Sem opção de jogo anônimo

### 3.2 Onboarding (Primeiro Acesso)
Ao fazer login pela primeira vez, o usuário é direcionado obrigatoriamente para o onboarding completo antes de acessar qualquer funcionalidade.

**Fluxo do onboarding:**
1. Boas-vindas + explicação do conceito do app
2. Configuração das escalas do **Modo Grupo** — uma categoria por tela, slider de 0 a 3
3. Configuração das escalas do **Modo Casal** — uma categoria por tela, slider de 0 a 3
4. Confirmação e acesso à tela principal

Total de telas de configuração: 14 (6 categorias Grupo + 8 categorias Casal)

### 3.3 Perfil do Usuário
Dados salvos permanentemente no Supabase por `user_id`:

| Campo | Fonte |
|-------|-------|
| Nome/apelido | Editável pelo usuário (default: nome Google) |
| Foto de perfil | Importada automaticamente do Google |
| Escalas Modo Grupo | Configuradas no onboarding, editáveis no perfil |
| Escalas Modo Casal | Configuradas no onboarding, editáveis no perfil |

**Ações disponíveis no perfil:**
- Editar nome/apelido
- Visualizar/editar escalas por modo e categoria
- Resetar preferências (volta tudo para N1)

---

## 4. Estrutura de Banco de Dados (Supabase)

### Tabela: `users`
```
id              uuid (PK, via Supabase Auth)
email           text
nome            text
foto_url        text
created_at      timestamp
onboarding_completo boolean
```

### Tabela: `preferencias`
```
id              uuid (PK)
user_id         uuid (FK → users.id)
modo            text ('grupo' | 'casal')
categoria       text (ex: 'Toque', 'Revelação')
nivel_max       integer (0–3)
updated_at      timestamp
```

### Tabela: `salas`
```
id              uuid (PK)
codigo          text (único, 6 caracteres alfanuméricos)
host_id         uuid (FK → users.id)
modo            text ('grupo' | 'casal')
status          text ('aguardando' | 'em_jogo' | 'encerrada')
created_at      timestamp
encerrada_at    timestamp (nullable)
```

### Tabela: `sala_jogadores`
```
id              uuid (PK)
sala_id         uuid (FK → salas.id)
user_id         uuid (FK → users.id)
entrou_em       timestamp
```

### Tabela: `items`
```
id              text (PK, ex: AT-1-001)
modo            text ('Grupo' | 'Casal')
categoria       text
nivel           integer (1–3)
tipo            text ('Verdade' | 'Desafio')
quem            text (ex: 'VOCÊ', 'AMBOS', 'Solo', 'Dupla')
conteudo        text
```

> A tabela `items` é populada diretamente com o CSV `banco-sombra.csv` já gerado.

---

## 5. Fluxo Completo do Usuário

### 5.1 Primeiro Acesso
```
Abre o app
  → Tela de login (botão "Entrar com Google")
  → Autenticação Google
  → Onboarding: configuração Modo Grupo (6 telas)
  → Onboarding: configuração Modo Casal (8 telas)
  → Tela Principal (Home)
```

### 5.2 Acessos Seguintes
```
Abre o app
  → Já autenticado → Tela Principal (Home)
```

### 5.3 Criar Sala (Host)
```
Tela Principal
  → Botão "Criar Sala"
  → Escolhe o Modo: Grupo ou Casal
  → App gera código único de 6 caracteres + QR Code
  → Tela de Lobby (aguardando jogadores)
```

### 5.4 Entrar na Sala (Jogador Convidado)
```
Recebe link/QR Code
  → Abre o app (faz login se necessário, completa onboarding se for primeiro acesso)
  → Entra automaticamente na sala via código/link
  → Vê tela de confirmação: "Você entrou na sala de [Nome do Host]"
  → Aguarda o host iniciar — tela de espera simples
```

### 5.5 Lobby (Host)
```
Tela de Lobby
  → Lista de jogadores que já entraram (nome + foto)
  → Código da sala + QR Code visível para compartilhar
  → Botão "Iniciar Jogo" (habilitado com mínimo de jogadores: 2 para Casal, 3 para Grupo)
```

### 5.6 Partida — Fluxo de Rodada
```
[TELA DO HOST]

1. Tela de Rodada
   → Exibe: "Vez de [NOME DO JOGADOR SORTEADO]"
   → Dois botões: [VERDADE] [DESAFIO]
   → Host aperta o botão escolhido pelo jogador sorteado

2. App executa o algoritmo de sorteio (ver Seção 6)

3. Tela do Item
   → Exibe o texto da carta sorteada
   → Se envolver outro jogador: exibe "[NOME DO JOGADOR]" no lugar do placeholder
   → Botão [PRÓXIMA RODADA]
   → Botão [PULAR] (sem penalidade, sem limite)

4. Ao apertar PRÓXIMA RODADA → volta ao passo 1 com novo sorteio de jogador
```

### 5.7 Encerrar Partida (Host)
```
Durante o jogo
  → Menu/botão "Encerrar Sala"
  → Confirmação: "Tem certeza que quer encerrar?"
  → Sala marcada como 'encerrada' no banco
  → Todos os jogadores veem tela de "Jogo encerrado pelo host"
  → Redirecionados para a Tela Principal
```

### 5.8 Sala Órfã (Host fecha o app sem encerrar)
```
A sala permanece com status 'aguardando' ou 'em_jogo'
O host pode retomar a sala ao abrir o app novamente
Tela Principal exibe: "Você tem uma sala ativa — [Retomar] ou [Encerrar]"
```

---

## 6. Algoritmo de Sorteio

### Passo 1 — Sortear Jogador
- Sorteio aleatório simples entre todos os jogadores ativos na sala
- Sem peso ou histórico — totalmente aleatório

### Passo 2 — Host escolhe Verdade ou Desafio
- Host aperta o botão correspondente à escolha do jogador sorteado

### Passo 3 — Sortear Categoria
- App sorteia aleatoriamente uma categoria disponível para aquele modo
- Filtra apenas categorias onde o **jogador sorteado tem nível ≥ 1**

### Passo 4 — Sortear Item
Filtros aplicados na query:
```sql
SELECT * FROM items
WHERE modo = [modo_da_sala]
  AND categoria = [categoria_sorteada]
  AND tipo = [verdade_ou_desafio]
  AND nivel <= [nivel_max do jogador sorteado nessa categoria]
ORDER BY RANDOM()
LIMIT 1
```

### Passo 5 — Verificar Compatibilidade com Outros Jogadores
- Se o item tiver `quem` = "Dupla" ou envolver outro jogador:
  - App sorteia um segundo jogador entre os disponíveis na sala
  - Verifica se o nível do item está dentro do `nivel_max` desse segundo jogador na mesma categoria
  - Se não for compatível: sorteia outro jogador ou retorna ao Passo 3 para nova categoria

### Passo 6 — Fallback
- Se não encontrar item compatível após 3 tentativas de categoria: exibe mensagem "Nenhuma carta compatível — pulando rodada" e vai para próxima

### Substituição de Placeholders
- `[JOGADOR]` → substituído pelo nome do jogador envolvido sorteado no Passo 5
- `VOCÊ` → refere-se ao jogador da vez (exibido no cabeçalho da carta)

---

## 7. Telas do App

### 7.1 Tela de Login
- Logo do Dia E
- Tagline curta
- Botão "Entrar com Google"

### 7.2 Onboarding (14 telas)
- Barra de progresso no topo
- Nome da categoria + descrição curta do que ela envolve
- Slider visual 0–3 com labels descritivos por nível
- Botão "Continuar"
- Botão "Voltar" (exceto na primeira tela)

### 7.3 Tela Principal (Home)
- Saudação com nome + foto do usuário
- Botão principal: "Criar Sala"
- Botão secundário: "Entrar em uma Sala" (para digitar código manualmente)
- Atalho para "Meu Perfil"
- Banner se houver sala ativa: "Retomar sala" / "Encerrar"

### 7.4 Criar Sala
- Título: "Nova Sala"
- Seleção de modo: [Grupo] [Casal]
- Botão "Criar"

### 7.5 Lobby (Host)
- Código da sala em destaque (grande, copiável)
- QR Code gerado dinamicamente
- Lista de jogadores (foto + nome) que já entraram
- Contador: "X jogadores na sala"
- Botão "Iniciar Jogo" (desabilitado até mínimo)
- Botão "Cancelar Sala"

### 7.6 Tela de Espera (Jogador Convidado)
- "Você está na sala de [Nome do Host]"
- Lista dos outros jogadores que já entraram
- Mensagem: "Aguardando o host iniciar..."
- Animação/indicador de espera

### 7.7 Tela de Rodada (Host — Sorteio do Jogador)
- Nome + foto do jogador sorteado em destaque
- Instrução: "[NOME], é sua vez! Escolha:"
- Dois botões grandes: [VERDADE] [DESAFIO]

### 7.8 Tela da Carta (Host — Exibição do Item)
- Tag da categoria + nível (ex: "🔥 Ato · N2")
- Texto da carta em destaque (fonte grande, legível)
- Se envolver outro jogador: foto + nome do jogador envolvido
- Botão primário: "Próxima Rodada"
- Botão secundário: "Pular"
- Menu superior: "Encerrar Sala"

### 7.9 Tela de Perfil
- Foto + nome (editável)
- Seção "Preferências Modo Grupo" — lista de categorias com nível atual, botão editar
- Seção "Preferências Modo Casal" — lista de categorias com nível atual, botão editar
- Botão "Resetar Preferências" (com confirmação)
- Botão "Sair da conta"

### 7.10 Tela de Encerramento
- "O jogo foi encerrado"
- Botão "Voltar ao Início"

---

## 8. Regras de Negócio

| Regra | Detalhe |
|-------|---------|
| Login obrigatório | Todos os jogadores precisam de conta Google |
| Onboarding obrigatório | Não é possível criar ou entrar em sala sem completar o onboarding |
| Modo Casal | Exige exatamente 2 jogadores para iniciar |
| Modo Grupo | Exige mínimo de 3 jogadores para iniciar |
| Controle centralizado | Após início da partida, apenas o dispositivo do host interage com o jogo |
| Sala persistente | Sala permanece ativa até o host encerrar manualmente |
| Sala órfã | Host pode retomar sala ativa ao reabrir o app |
| Skip livre | Host pode pular qualquer carta sem limite ou penalidade |
| Nível 0 = bloqueio total | Se jogador tem nível 0 em uma categoria, essa categoria nunca aparece para ele |
| Compatibilidade dupla | Item que envolve dois jogadores deve respeitar o nível máximo dos dois |
| Fallback de sorteio | Após 3 tentativas sem item compatível, rodada é pulada automaticamente |
| Preferências editáveis | Jogador pode editar escalas a qualquer momento no perfil, fora da partida |
| Reset de preferências | Reseta todos os níveis para 1 (não para 0) |

---

## 9. Casos de Uso Detalhados

### CU-01: Primeiro login de um novo usuário
**Ator:** Usuário novo  
**Fluxo:** Login Google → Onboarding Grupo (6 telas) → Onboarding Casal (8 telas) → Home  
**Exceção:** Se abandonar o onboarding no meio, ao reabrir o app retoma de onde parou

### CU-02: Host cria sala Modo Grupo
**Ator:** Host  
**Fluxo:** Home → Criar Sala → Seleciona Grupo → Lobby gerado com código  
**Exceção:** Se tentar criar com sala já ativa, app pergunta se quer encerrar a anterior

### CU-03: Jogador entra via link
**Ator:** Jogador convidado  
**Pré-condição:** Já tem conta e onboarding completo  
**Fluxo:** Clica no link → App abre na sala → Entra automaticamente → Tela de espera  
**Exceção:** Se não tiver conta, faz login e onboarding antes de entrar na sala

### CU-04: Jogador entra via link (primeiro acesso)
**Ator:** Jogador novo  
**Fluxo:** Clica no link → Login Google → Onboarding → Entra na sala automaticamente  
**Obs:** O link da sala fica salvo e é usado após o onboarding

### CU-05: Rodada normal (Modo Grupo)
**Ator:** Host  
**Fluxo:** App sorteia jogador → Host aperta Verdade ou Desafio → App sorteia categoria → App sorteia item compatível → Exibe carta → Host aperta Próxima Rodada  

### CU-06: Item envolve segundo jogador
**Fluxo:** App sorteia item com placeholder [JOGADOR] → Sorteia segundo jogador entre os da sala → Verifica compatibilidade de nível → Substitui placeholder pelo nome → Exibe carta  
**Exceção:** Se nenhum jogador for compatível, tenta nova categoria

### CU-07: Host pula carta
**Fluxo:** Tela da carta → Host aperta Pular → Volta para tela de sorteio do jogador (mesmo jogador, nova escolha)  

### CU-08: Encerrar partida
**Fluxo:** Menu → Encerrar Sala → Confirmação → Sala encerrada → Todos veem tela de encerramento → Redirecionados para Home

### CU-09: Host fecha o app sem encerrar
**Fluxo:** App fecha → Sala permanece ativa no banco → Host reabre → Home mostra banner "Sala ativa" → [Retomar] ou [Encerrar]

### CU-10: Editar preferências
**Fluxo:** Home → Perfil → Seção de preferências → Edita slider de categoria → Salva → Confirmação

### CU-11: Resetar preferências
**Fluxo:** Perfil → Resetar preferências → Confirmação → Todos os níveis voltam para 1

---

## 10. Considerações Técnicas

### Realtime (Supabase Realtime)
- O lobby precisa de atualização em tempo real para exibir novos jogadores entrando
- A tela de espera do convidado precisa receber o sinal de "jogo iniciado" para mudar de estado
- Usar Supabase Realtime (subscriptions em `sala_jogadores` e `salas`)

### Geração de Código de Sala
- Código de 6 caracteres alfanuméricos maiúsculos (ex: `X7K2QP`)
- Gerado no backend (Supabase Edge Function) com verificação de unicidade
- Link de convite: `https://diae.app/sala/X7K2QP`

### QR Code
- Gerado no frontend a partir do link de convite
- Biblioteca recomendada: `qrcode.react`

### Algoritmo de Sorteio
- Executado no frontend (client-side) com dados carregados da sessão
- Preferências dos jogadores carregadas quando entram na sala e mantidas em memória durante a partida
- Items sorteados via query ao Supabase com `ORDER BY RANDOM()`

### Sessão de Jogo
- Estado da partida mantido no frontend (React state / Context)
- Não é necessário salvar estado da partida no banco em tempo real
- Apenas o status da sala (`em_jogo`) é persistido

### Mobile-First
- Layout otimizado para telas de 375px–430px de largura
- Fontes grandes, botões com área de toque mínima de 48px
- Sem scroll durante a tela da carta — tudo cabe na viewport

---

## 11. Estrutura de Pastas do Projeto (Next.js)

```
dia-e/
├── app/
│   ├── page.tsx                  # Home
│   ├── login/page.tsx            # Tela de login
│   ├── onboarding/page.tsx       # Fluxo de onboarding
│   ├── sala/
│   │   ├── criar/page.tsx        # Criar sala
│   │   ├── [codigo]/
│   │   │   ├── lobby/page.tsx    # Lobby (host)
│   │   │   ├── espera/page.tsx   # Espera (convidado)
│   │   │   ├── jogo/page.tsx     # Tela de rodada
│   │   │   └── encerrada/page.tsx
│   └── perfil/page.tsx           # Perfil do usuário
├── components/
│   ├── carta/                    # Componente de exibição da carta
│   ├── lobby/                    # Componentes do lobby
│   ├── onboarding/               # Steps do onboarding
│   └── ui/                      # Componentes base (botões, sliders...)
├── lib/
│   ├── supabase.ts               # Cliente Supabase
│   ├── sorteio.ts                # Algoritmo de sorteio
│   └── sala.ts                   # Funções de sala
├── types/
│   └── index.ts                  # Tipos TypeScript
└── public/
    └── assets/                   # Logo, ícones
```

---

## 12. Roadmap de Desenvolvimento

### Fase 1 — Fundação
- [ ] Setup do repositório GitHub
- [ ] Configuração do projeto Next.js + Tailwind
- [ ] Configuração do Supabase (tabelas, Auth Google)
- [ ] Deploy inicial na Vercel
- [ ] Importação do `banco-sombra.csv` para tabela `items`

### Fase 2 — Autenticação e Perfil
- [ ] Tela de login com Google OAuth
- [ ] Fluxo de onboarding completo (14 telas)
- [ ] Tela de perfil com edição e reset

### Fase 3 — Sala e Lobby
- [ ] Criação de sala com geração de código
- [ ] Entrada via link/código
- [ ] Lobby com Realtime (lista de jogadores)
- [ ] QR Code de convite

### Fase 4 — Jogo
- [ ] Algoritmo de sorteio completo
- [ ] Tela de rodada (sorteio de jogador)
- [ ] Exibição de carta com substituição de placeholders
- [ ] Skip e próxima rodada
- [ ] Encerramento de sala

### Fase 5 — Polimento
- [ ] Animações e transições
- [ ] Tratamento de erros e edge cases
- [ ] Testes em dispositivos móveis reais
- [ ] Revisão de UX e acessibilidade

---

*Documentação gerada para uso no Claude Code. Todas as decisões de produto estão refletidas neste documento.*

---

# Design UI/UX

## 13. Identidade Visual

### Conceito
O Dia E tem uma identidade visual que comunica **intimidade, mistério e cumplicidade**. O design deve fazer o usuário sentir que está entrando em algo exclusivo — como um ambiente com luz baixa, onde a tensão é parte da experiência. Nada gritante, nada infantil. Sofisticado, mas acessível.

### Palavras-chave do design
`íntimo` · `misterioso` · `provocativo` · `fluido` · `atmosférico`

---

## 14. Paleta de Cores

### Cores Base
| Nome | Hex | Uso |
|------|-----|-----|
| **Background Deep** | `#0A0A0F` | Fundo principal — quase preto com leve tom azulado |
| **Background Surface** | `#13131C` | Cards, modais, superfícies elevadas |
| **Background Elevated** | `#1C1C2A` | Elementos sobre cards, inputs, itens de lista |

### Cores de Destaque (Gradiente Principal)
O app usa um gradiente como identidade central — aplicado em botões primários, bordas de destaque e elementos de glow.

| Nome | Hex | Uso |
|------|-----|-----|
| **Roxo Profundo** | `#6B21A8` | Início do gradiente principal |
| **Rosa Quente** | `#EC4899` | Fim do gradiente principal |
| **Gradiente Principal** | `linear-gradient(135deg, #6B21A8, #EC4899)` | Botões primários, destaques, bordas ativas |

### Cores de Apoio
| Nome | Hex | Uso |
|------|-----|-----|
| **Vinho Suave** | `#9D174D` | Hover states, elementos secundários |
| **Lilás Suave** | `#A855F7` | Ícones ativos, badges, labels de categoria |
| **Vermelho Carta** | `#F43F5E` | Desafio (badge) |
| **Âmbar Carta** | `#F59E0B` | Verdade (badge) |

### Cores Neutras
| Nome | Hex | Uso |
|------|-----|-----|
| **Texto Principal** | `#F1F0F5` | Títulos, conteúdo principal |
| **Texto Secundário** | `#9B9AAF` | Subtítulos, labels, placeholders |
| **Texto Desabilitado** | `#4A4A62` | Elementos inativos |
| **Divisor** | `#2A2A3D` | Linhas divisórias, bordas sutis |

### Uso do Glow
Elementos principais recebem um efeito de `box-shadow` com as cores do gradiente para criar profundidade atmosférica:
```css
/* Glow padrão — botão primário */
box-shadow: 0 0 20px rgba(168, 85, 247, 0.35), 0 0 40px rgba(236, 72, 153, 0.15);

/* Glow suave — card ativo */
box-shadow: 0 0 12px rgba(168, 85, 247, 0.2);
```

---

## 15. Tipografia

### Fontes
| Papel | Fonte | Peso | Uso |
|-------|-------|------|-----|
| **Display** | `Playfair Display` | 700 (Bold) | Títulos de tela, nome do jogador sorteado, texto da carta |
| **Interface** | `Inter` | 400 / 500 / 600 | Todo o resto — labels, botões, corpo de texto, inputs |

Ambas disponíveis via Google Fonts.

```css
/* Importação */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap');
```

### Escala Tipográfica
| Token | Fonte | Tamanho | Peso | Uso |
|-------|-------|---------|------|-----|
| `display-xl` | Playfair Display | 32px | 700 | Nome do jogador sorteado, texto da carta |
| `display-lg` | Playfair Display | 24px | 700 | Títulos de tela |
| `display-md` | Playfair Display | 20px | 700 | Subtítulos com personalidade |
| `body-lg` | Inter | 18px | 500 | Conteúdo importante, botões grandes |
| `body-md` | Inter | 16px | 400 | Corpo de texto padrão |
| `body-sm` | Inter | 14px | 400 | Labels, descrições secundárias |
| `caption` | Inter | 12px | 500 | Badges, tags, metadados |

### Regras de Uso
- Títulos de tela e texto das cartas → sempre `Playfair Display`
- Botões, inputs, labels, navegação → sempre `Inter`
- Nunca usar peso abaixo de 400 em dark mode (prejudica legibilidade)
- Tracking levemente espaçado em caps: `letter-spacing: 0.08em`

---

## 16. Iconografia e Elementos Visuais

### Ícones
- Biblioteca: **Lucide React** (consistente com Next.js)
- Estilo: outline, stroke de 1.5px
- Tamanhos: 20px (interface), 24px (destaque), 32px (hero)

### Emojis de Categoria
Cada categoria tem um emoji identificador usado nas cartas e no onboarding:

| Modo | Categoria | Emoji |
|------|-----------|-------|
| Grupo | Verbal / Confissão | 💬 |
| Grupo | Toque | 👋 |
| Grupo | Beijo | 💋 |
| Grupo | Performance | 🎭 |
| Grupo | Exposição Corporal | 🙈 |
| Grupo | Contato Íntimo | 🌶️ |
| Casal | Revelação | 💬 |
| Casal | Ato | 🔥 |
| Casal | Encenação | 🎭 |
| Casal | Exposição | 🙈 |
| Casal | Sensorial | 🎯 |
| Casal | Resistência | ⏱️ |
| Casal | Abertura | 🔓 |
| Casal | Terceiros | 👥 |

### Badge de Tipo
As cartas exibem um badge identificando Verdade ou Desafio:

```
Verdade → fundo âmbar (#F59E0B) · texto escuro · pill
Desafio → fundo vermelho (#F43F5E) · texto branco · pill
```

---

## 17. Componentes de Interface

### 5.1 Botão Primário
```
Fundo: gradiente linear (#6B21A8 → #EC4899)
Texto: branco #F1F0F5 · Inter 500 · 16px
Border radius: 9999px (pill)
Padding: 16px 32px
Glow: box-shadow com roxo/rosa suave
Estado hover: brightness(1.1) + glow intensificado
Estado disabled: opacidade 40%, sem glow
Altura mínima: 56px (área de toque adequada mobile)
```

### 5.2 Botão Secundário
```
Fundo: transparente
Borda: 1px solid #2A2A3D
Texto: #9B9AAF · Inter 500 · 16px
Border radius: 9999px (pill)
Estado hover: borda #6B21A8, texto #F1F0F5
Altura mínima: 56px
```

### 5.3 Card Base
```
Fundo: #13131C
Border radius: 20px
Padding: 24px
Borda: 1px solid #2A2A3D
Sombra: 0 4px 24px rgba(0,0,0,0.4)
```

### 5.4 Carta do Jogo (componente principal)
```
Fundo: #13131C
Border radius: 24px
Padding: 32px 28px
Borda: 1px solid com gradiente (via border-image ou pseudo-elemento)
Glow suave no contorno
Largura: 100% com max-width 380px
Sombra: 0 8px 32px rgba(0,0,0,0.6)

Estrutura interna (de cima para baixo):
  1. Badge de tipo (Verdade/Desafio) — canto superior esquerdo
  2. Tag de categoria (emoji + nome) — canto superior direito
  3. Espaço
  4. Texto da carta — Playfair Display 700 32px, centralizado
  5. Espaço
  6. Se envolver outro jogador: avatar + nome do jogador envolvido
```

### 5.5 Avatar de Jogador
```
Foto: circular, 48px × 48px (lobby/lista) ou 64px × 64px (carta)
Borda: 2px solid gradiente
Fallback (sem foto): círculo com inicial do nome, fundo #1C1C2A
```

### 5.6 Slider de Nível (Onboarding e Perfil)
```
Track: #2A2A3D, altura 6px, border radius 9999px
Fill: gradiente (#6B21A8 → #EC4899)
Thumb: círculo 24px, fundo gradiente, glow suave
Labels abaixo: 0 = "Nunca" · 1 = "Leve" · 2 = "Médio" · 3 = "Intenso"
Valor atual: exibido em destaque acima do slider
```

### 5.7 Input de Texto
```
Fundo: #1C1C2A
Borda: 1px solid #2A2A3D
Border radius: 12px
Texto: #F1F0F5 · Inter 16px
Padding: 14px 16px
Foco: borda #A855F7, glow suave
```

### 5.8 Código da Sala
```
Display: letras grandes, espaçadas · Playfair Display 700 · 40px
Fundo: #1C1C2A · border radius 16px · padding 20px 32px
Borda: 1px solid #2A2A3D
Ícone de cópia ao lado
Ao copiar: feedback visual (check verde por 2 segundos)
```

---

## 18. Layout e Grid

### Viewport Alvo
- Design base: **390px × 844px** (iPhone 14)
- Funcional de 375px a 430px de largura
- Padding horizontal padrão: `24px` em ambos os lados

### Estrutura de Tela Padrão
```
┌─────────────────────────┐
│  Status bar (sistema)   │  — não controlado
│─────────────────────────│
│  Header (opcional)      │  56px — logo ou título + ação
│─────────────────────────│
│                         │
│  Conteúdo principal     │  flex-1, scroll se necessário
│                         │
│─────────────────────────│
│  Ação principal (CTA)   │  80px + safe area bottom
└─────────────────────────┘
```

### Telas sem scroll (jogo)
As telas de rodada e carta são projetadas para caber inteiramente na viewport sem scroll. Todo o conteúdo deve ser dimensionado para isso.

### Safe Areas
Usar `env(safe-area-inset-bottom)` no padding inferior das telas com botões — evita sobreposição com a barra home do iPhone.

---

## 19. Animações e Microinterações

### 7.1 Transições entre Telas
```
Tipo: fade + slide suave
Duração: 300ms
Easing: ease-in-out
Implementação: Framer Motion (pageVariants)

Entrada: opacity 0→1 + translateY 20px→0
Saída: opacity 1→0 + translateY 0→-20px
```

### 7.2 Revelação da Carta
```
Efeito: card flip 3D (rotateY)
Duração: 500ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)

Fase 1 (0–250ms): card gira de 0° a 90° — frente some
Fase 2 (250–500ms): card gira de 90° a 180° — verso aparece com conteúdo

Durante a animação: glow pulsa levemente
```

### 7.3 Sorteio do Jogador
```
Efeito: nome do jogador "rola" rapidamente antes de parar no sorteado
Duração total: 1200ms
Fase 1 (0–900ms): nomes trocam rapidamente (interval de 80ms)
Fase 2 (900–1200ms): desacelera até parar no nome sorteado
Ao parar: pequena vibração háptica (navigator.vibrate([30, 50, 30]))
```

### 7.4 Glow Pulsante (elementos em destaque)
```
Animação CSS keyframe em botões primários e bordas de carta ativa
Duração: 3s, loop infinito, easing: ease-in-out
Variação: opacity do glow entre 0.3 e 0.7
```

### 7.5 Vibração Háptica
```
Evento: sorteio do jogador confirmado
Padrão: navigator.vibrate([30, 50, 30])
Fallback: silencioso (API não disponível em todos os browsers)
```

### 7.6 Feedback de Botão
```
Toque: scale(0.97) por 100ms, volta com spring
Sem delay perceptível — resposta imediata
```

### 7.7 Entrada de Jogadores no Lobby
```
Cada novo jogador aparece com: fade-in + slide da direita
Duração: 250ms
```

### Biblioteca Recomendada
**Framer Motion** — integração nativa com Next.js, suporte a page transitions, spring animations e gesture handling.

---

## 20. UX — Princípios e Decisões

### 8.1 Foco no Host
Durante o jogo, toda a UI é desenhada para uma pessoa operando com uma mão só, com o celular deitado em uma mesa ou segurado. Botões grandes, ações claras, sem precisar pensar.

### 8.2 Zero Distração na Carta
A tela da carta é minimalista. O texto da carta ocupa o centro visual com tipografia grande. Nada compete com ele. Os botões de ação ficam na parte inferior, fora da área de leitura.

### 8.3 Feedback Constante
Toda ação tem resposta visual imediata — não deixar o usuário em dúvida se algo funcionou. Toques respondem em <100ms, transições confirmam navegação.

### 8.4 Onboarding Sem Atrito
Cada tela do onboarding tem apenas uma decisão. Slider simples, label claro por nível, botão de continuar grande. Barra de progresso visível o tempo todo para dar senso de avanço.

### 8.5 Tela de Espera do Convidado
É intencional que a tela de espera seja simples. O convidado não precisa de nada após entrar — sua função está cumprida. A tela confirma que ele está na sala certa e aguarda.

### 8.6 Modo Casal — Tom Visual Diferenciado
Quando o modo Casal está ativo, o gradiente pode ter uma variação mais quente (mais rosa, menos roxo) para diferenciar sutilmente dos jogos em grupo. Não é obrigatório, mas adiciona contexto visual.

```css
/* Gradiente Modo Grupo */
linear-gradient(135deg, #6B21A8, #EC4899)

/* Gradiente Modo Casal */
linear-gradient(135deg, #9D174D, #F43F5E)
```

---

## 21. Especificações por Tela

### 9.1 Tela de Login
```
Fundo: #0A0A0F com gradiente radial sutil no centro (roxo muito escuro)
Logo: centralizado, tipografia Playfair Display
Tagline: Inter 400 16px, cor secundária
Botão Google: branco sobre fundo escuro, ícone Google, pill
Posição do botão: 70% da altura da tela (não colado no topo nem no fundo)
```

### 9.2 Onboarding
```
Header: barra de progresso (segmentada, estilo pill) · cor preenchida = gradiente
Título da categoria: emoji grande (40px) + nome · Playfair Display 24px
Descrição: Inter 400 14px · cor secundária · max 2 linhas
Slider: largura total com padding 24px
Labels do slider: Inter 12px · espaçados uniformemente
Botão continuar: fixo no rodapé · pill · gradiente
Botão voltar: texto link · cor secundária · acima do botão continuar
```

### 9.3 Home
```
Header: foto do usuário (32px circular) + "Olá, [Nome]" à esquerda · ícone perfil à direita
Seção central: logo grande + botão "Criar Sala" (destaque máximo)
Botão secundário "Entrar em sala": abaixo, estilo outline
Banner sala ativa: card com fundo vinho suave, ícone de alerta, dois botões inline
```

### 9.4 Lobby (Host)
```
Código: centralizado, grande, copiável · QR Code abaixo (200px × 200px)
Lista de jogadores: scroll vertical · avatar + nome + "✓ pronto"
Contador: "X jogadores" · Inter 500 · cor secundária
Botão Iniciar: fixo no rodapé · desabilitado (opacidade 40%) até mínimo atingido
Botão Cancelar: texto link · cor secundária · acima do botão iniciar
```

### 9.5 Tela de Rodada
```
Fundo: tela cheia com leve vinheta nas bordas
Avatar do jogador sorteado: 96px · centralizado · borda gradiente · glow
Nome do jogador: Playfair Display 32px · centralizado · animação de rolagem
Instrução: Inter 400 16px · cor secundária
Botões Verdade/Desafio: lado a lado · largura igual · pill
  Verdade: fundo âmbar (#F59E0B) · texto escuro
  Desafio: fundo vermelho (#F43F5E) · texto branco
```

### 9.6 Tela da Carta
```
Card central: ocupa 70% da altura da tela · border radius 24px · glow na borda
  Topo do card: badge tipo (esquerda) + tag categoria (direita)
  Centro: texto da carta · Playfair Display 700 · 28-32px · centralizado
  Rodapé do card (se houver outro jogador): avatar 48px + nome · separado por linha
Botões: fixos no rodapé · "Próxima Rodada" (primário) + "Pular" (link)
Menu superior: ícone "⋯" → dropdown com "Encerrar Sala"
```

### 9.7 Perfil
```
Header: foto 80px · nome editável (ícone lápis ao lado) · email Google (readonly)
Seções: "Modo Grupo" e "Modo Casal" · cada uma com lista de categorias
Cada categoria: emoji + nome à esquerda · nível atual à direita (pill colorido)
Tap na categoria: expande inline com slider para editar
Botão Resetar: cor vermelha · confirmação modal antes de executar
Botão Sair: cor secundária · rodapé
```

---

## 22. Design Tokens (para implementação)

```js
// tailwind.config.js — extend
colors: {
  brand: {
    purple: '#6B21A8',
    pink: '#EC4899',
    wine: '#9D174D',
    lilac: '#A855F7',
    red: '#F43F5E',
    amber: '#F59E0B',
  },
  bg: {
    deep: '#0A0A0F',
    surface: '#13131C',
    elevated: '#1C1C2A',
  },
  text: {
    primary: '#F1F0F5',
    secondary: '#9B9AAF',
    disabled: '#4A4A62',
  },
  border: {
    subtle: '#2A2A3D',
  }
},
borderRadius: {
  pill: '9999px',
  card: '20px',
  'card-lg': '24px',
},
fontFamily: {
  display: ['Playfair Display', 'serif'],
  sans: ['Inter', 'sans-serif'],
},
```

---

## 23. Acessibilidade

- Contraste mínimo de **4.5:1** entre texto e fundo em todos os elementos de interface
- Área de toque mínima de **48px × 48px** em todos os elementos interativos
- Estados de foco visíveis (outline com cor da marca) para navegação por teclado
- Textos alternativos em todos os avatares e ícones significativos
- Animações respeitam `prefers-reduced-motion` — desabilitar flip e transições complexas quando ativo

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

*Documentação de design para uso conjunto com `dia-e-documentacao.md` no Claude Code.*
