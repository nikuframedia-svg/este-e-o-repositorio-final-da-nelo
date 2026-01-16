# 📘 Explicação Completa da Aplicação ProdPlan ONE

## 🎯 Visão Geral

**ProdPlan ONE** é um sistema ERP (Enterprise Resource Planning) industrial completo desenvolvido para a **NELO**, uma empresa de produção de kayaks. O sistema integra gestão de produção, planeamento, análise de custos, recursos humanos e um assistente de IA (COPILOT) para análise inteligente de dados operacionais.

---

## 🏗️ Arquitetura do Sistema

### Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React 19 + TypeScript + Tailwind CSS + TanStack Query      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │Dashboard│  │   CORE   │  │   PLAN   │  │  PROFIT  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐   │
│  │    HR   │  │ COPILOT  │  │   Componentes UI/Charts   │   │
│  └──────────┘  └──────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│  FastAPI + SQLAlchemy + PostgreSQL + Redis + Kafka         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   CORE   │  │   PLAN   │  │  PROFIT  │  │    HR    │     │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              COPILOT Module (IA)                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │ Ollama   │  │   RAG    │  │ Context │              │   │
│  │  │ Client   │  │  System  │  │ Builder │              │   │
│  │  └──────────┘  └──────────┘  └──────────┘              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    INFRAESTRUTURA                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │PostgreSQL│  │  Redis   │  │  Kafka   │  │  Ollama  │     │
│  │  (DB)    │  │  (Cache) │  │ (Events) │  │   (LLM)  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Padrão Arquitetural

- **Backend**: Arquitetura modular (CORE, PLAN, PROFIT, HR, COPILOT)
- **Frontend**: Single Page Application (SPA) com React Router
- **Comunicação**: REST API (JSON)
- **Base de Dados**: PostgreSQL (produção) / SQLite (desenvolvimento)
- **Cache**: Redis (opcional)
- **Eventos**: Kafka (opcional, produção)
- **IA**: Ollama (LLM local) + RAG (Retrieval Augmented Generation)

---

## 📦 Módulos Principais

### 1. **CORE Module** - Master Data (Dados Mestres)

**Propósito**: Gerir dados fundamentais do sistema (produtos, máquinas, funcionários, operações, taxas).

**Componentes**:
- **Models**: `Product`, `Machine`, `Employee`, `Operation`, `Rate`, `BOM` (Bill of Materials)
- **API Endpoints**: `/api/core/products`, `/api/core/machines`, `/api/core/employees`, etc.
- **Services**: `MasterDataService`, `ConfigurationService`, `TenantService`

**Funcionalidades**:
- CRUD completo de produtos (kayaks)
- Gestão de máquinas e equipamentos
- Gestão de funcionários e skills
- Definição de operações/fases de produção
- Taxas e custos padrão
- Multi-tenant (suporte a múltiplas empresas)

**Frontend**: Páginas em `/core/products`, `/core/machines`, `/core/employees`, etc.

---

### 2. **PLAN Module** - Production Planning (Planeamento de Produção)

**Propósito**: Planeamento e agendamento de produção, MRP (Material Requirements Planning), gestão de capacidade.

**Componentes**:
- **Models**: `Schedule`, `MRP`, `BOM`
- **API Endpoints**: `/api/plan/schedule`, `/api/plan/mrp`, `/api/plan/capacity`
- **Services**: `SchedulingService`, `MRPService`, `CapacityService`
- **Engines**: `SchedulingAdapter`, `MRPAdapter`, `BOMAdapter`

**Funcionalidades**:
- Agendamento de ordens de produção
- Cálculo de MRP (necessidades de materiais)
- Análise de capacidade (máquinas, funcionários)
- Otimização de sequências de produção

**Frontend**: Páginas em `/plan/scheduling`, `/plan/mrp`, `/plan/capacity`

---

### 3. **PROFIT Module** - Cost & Pricing (Custos e Preços)

**Propósito**: Análise de custos, cálculo de preços, análise de OEE (Overall Equipment Effectiveness), análise de qualidade.

**Componentes**:
- **Models**: `Cost`, `KPIs`
- **API Endpoints**: `/api/profit/cogs`, `/api/profit/pricing`, `/api/profit/kpis`, `/api/profit/scenarios`
- **Services**: `CostService`, `PricingService`
- **Calculators**: `COGSCalculator`, `PricingEngine`, `ScenarioSimulator`

**Funcionalidades**:
- Cálculo de COGS (Cost of Goods Sold)
- Engine de pricing (cálculo de preços)
- Análise de OEE (Disponibilidade, Performance, Qualidade)
- Análise de qualidade (FPY, rework rate, erros)
- Simulação de cenários (what-if analysis)

**Frontend**: Páginas em `/profit/oee`, `/profit/quality`, `/profit/cogs`, `/profit/pricing`, `/profit/scenarios`

---

### 4. **HR Module** - Human Resources (Recursos Humanos)

**Propósito**: Gestão de alocações de funcionários, produtividade, folha de pagamento.

**Componentes**:
- **Models**: `Allocation`, `Productivity`
- **API Endpoints**: `/api/hr/allocations`, `/api/hr/productivity`, `/api/hr/payroll`
- **Services**: `AllocationService`, `ProductivityService`, `PayrollService`
- **Engines**: `AllocationAdapter`, `ProductivityAdapter`

**Funcionalidades**:
- Alocações de funcionários por fase/ordem
- Análise de produtividade
- Cálculo de folha de pagamento
- Tracking de horas trabalhadas

**Frontend**: Páginas em `/hr/allocations`, `/hr/productivity`, `/hr/payroll`

---

### 5. **COPILOT Module** - AI Assistant (Assistente de IA) 🤖

**Propósito**: Assistente de IA que analisa dados operacionais e responde a perguntas em linguagem natural.

**Componentes**:
- **Service**: `CopilotService` - Orquestra todo o fluxo
- **LLM Client**: `OllamaClient` - Cliente para Ollama (LLM local)
- **RAG System**: `rag.py` - Sistema de recuperação de conhecimento
- **Context Builder**: `context_builder.py` - Constrói contexto operacional
- **Guardrails**: `guardrails.py` - Validação e segurança
- **Models**: `CopilotSuggestion`, `CopilotConversation`, `CopilotMessage`, `CopilotRAGChunk`

**Funcionalidades**:
- **Análise Inteligente**: Responde perguntas sobre KPIs, qualidade, produção
- **Fast Path**: Respostas rápidas (<500ms) para perguntas simples de KPIs
- **RAG (Retrieval Augmented Generation)**: Usa documentos internos (SOPs, políticas) para contexto
- **Conversation History**: Histórico de conversas persistente
- **Daily Feedback**: Feedback diário automático sobre a operação
- **Recommendations**: Recomendações automáticas de melhoria
- **Insights Card**: Card no dashboard com insights principais

**Fluxo de Processamento**:
```
1. User pergunta → Intent Detection (detecta tipo de pergunta)
2. Fast Path? → Se pergunta simples de KPI, responde diretamente (<500ms)
3. Build Context → Constrói contexto operacional (KPIs, ordens, erros, etc.)
4. RAG Retrieval → Busca documentos relevantes (se necessário)
5. Prompt Rendering → Cria prompt completo para LLM
6. LLM Call → Chama Ollama (LLM local)
7. Response Validation → Valida resposta com guardrails
8. Normalization → Normaliza citations, facts, actions
9. Return → Retorna resposta estruturada
```

**Endpoints**:
- `POST /api/copilot/ask` - Fazer pergunta ao COPILOT
- `POST /api/copilot/ask-dev` - Versão dev (sem autenticação)
- `GET /api/copilot/health` - Health check (Ollama, DB, etc.)
- `GET /api/copilot/insights` - Insights diários
- `GET /api/copilot/daily-feedback` - Feedback diário
- `GET /api/copilot/recommendations` - Recomendações
- `POST /api/copilot/conversations` - Criar conversa
- `GET /api/copilot/conversations` - Listar conversas
- `POST /api/copilot/conversations/{id}/messages` - Enviar mensagem

**Frontend**:
- `CopilotFab.tsx` - Botão flutuante (FAB) no canto inferior direito
- `CopilotDrawer.tsx` - Chat drawer (painel lateral)
- `CopilotMessage.tsx` - Renderização de mensagens do COPILOT
- `CopilotInsightsCard.tsx` - Card de insights no dashboard
- `CopilotActions.tsx` - Ações propostas pelo COPILOT
- `CopilotCitations.tsx` - Evidências e citações

---

## 🛠️ Stack Tecnológico

### Backend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Python** | 3.11+ | Linguagem principal |
| **FastAPI** | 0.109.0 | Framework web assíncrono |
| **SQLAlchemy** | 2.0+ | ORM (Object-Relational Mapping) |
| **PostgreSQL** | 14+ | Base de dados principal |
| **Alembic** | - | Migrations de base de dados |
| **Pydantic** | 2.0+ | Validação de dados e settings |
| **httpx** | - | Cliente HTTP assíncrono (para Ollama) |
| **Ollama** | - | LLM local (llama3:8b) |
| **Redis** | - | Cache e rate limiting (opcional) |
| **Kafka** | - | Event streaming (opcional, produção) |

### Frontend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **React** | 19.2.0 | Biblioteca UI |
| **TypeScript** | 5.9.3 | Type safety |
| **Vite** | 7.2.4 | Build tool e dev server |
| **Tailwind CSS** | 4.1.18 | Styling utility-first |
| **TanStack Query** | 5.90.16 | Data fetching e cache |
| **React Router** | 7.12.0 | Roteamento |
| **Recharts** | 3.6.0 | Gráficos e visualizações |
| **Lucide React** | 0.562.0 | Ícones |

---

## 📊 Fluxo de Dados

### Fluxo Geral

```
┌─────────────┐
│   User      │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. User Action (click, submit)
       ▼
┌─────────────────┐
│  React Component│
│  (Frontend)     │
└──────┬──────────┘
       │
       │ 2. API Call (via api.ts)
       ▼
┌─────────────────┐
│  FastAPI Router │
│  (Backend)      │
└──────┬──────────┘
       │
       │ 3. Service Layer
       ▼
┌─────────────────┐
│  Service Class  │
│  (Business Logic)│
└──────┬──────────┘
       │
       │ 4. Database Query
       ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Database)    │
└──────┬──────────┘
       │
       │ 5. Response
       ▼
┌─────────────────┐
│  JSON Response  │
│  (via API)      │
└──────┬──────────┘
       │
       │ 6. Update UI
       ▼
┌─────────────────┐
│  React State    │
│  (TanStack Query)│
└─────────────────┘
```

### Fluxo COPILOT (Específico)

```
┌─────────────┐
│   User      │
│  "Qual é o  │
│   OEE?"     │
└──────┬──────┘
       │
       │ 1. handleSend()
       ▼
┌─────────────────┐
│ CopilotDrawer   │
│ (Frontend)      │
└──────┬──────────┘
       │
       │ 2. copilotApi.ask()
       ▼
┌─────────────────┐
│  /api/copilot/  │
│  ask-dev        │
└──────┬──────────┘
       │
       │ 3. CopilotService.process_ask()
       ▼
┌─────────────────┐
│ Intent Detection│
│ (Fast Path?)    │
└──────┬──────────┘
       │
       ├─ SIM → KPI Snapshot → Response (<500ms)
       │
       └─ NÃO → Build Context → RAG → LLM Call
                    │
                    ▼
            ┌───────────────┐
            │  Ollama LLM   │
            │  (llama3:8b)  │
            └───────┬───────┘
                    │
                    ▼
            ┌───────────────┐
            │  Validation   │
            │  & Normalize  │
            └───────┬───────┘
                    │
                    ▼
            ┌───────────────┐
            │  CopilotResponse│
            │  (JSON)       │
            └───────┬───────┘
                    │
                    ▼
            ┌───────────────┐
            │  Frontend UI  │
            │  (Render)     │
            └───────────────┘
```

---

## 📁 Estrutura de Pastas Detalhada

```
este-e-o-repositorio-final-da-nelo/
│
├── frontend/                    # Frontend React
│   ├── src/
│   │   ├── pages/              # Páginas da aplicação
│   │   │   ├── Dashboard.tsx  # Dashboard principal
│   │   │   ├── core/           # Páginas CORE
│   │   │   ├── plan/           # Páginas PLAN
│   │   │   ├── profit/         # Páginas PROFIT
│   │   │   └── hr/             # Páginas HR
│   │   ├── components/         # Componentes React
│   │   │   ├── copilot/        # Componentes COPILOT
│   │   │   ├── charts/         # Componentes de gráficos
│   │   │   ├── layout/         # Layout (Header, Sidebar)
│   │   │   └── ui/             # Componentes UI genéricos
│   │   ├── lib/                # Utilitários
│   │   │   ├── api.ts          # Cliente API
│   │   │   └── utils.ts        # Funções utilitárias
│   │   └── data/               # Dados JSON (mock/seed)
│   └── package.json
│
├── src/                         # Backend Python
│   ├── main.py                  # Entry point FastAPI
│   │
│   ├── core/                    # Módulo CORE
│   │   ├── api/                 # Endpoints REST
│   │   ├── models/              # SQLAlchemy models
│   │   └── services/            # Business logic
│   │
│   ├── plan/                    # Módulo PLAN
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   └── engines/             # Engines de cálculo
│   │
│   ├── profit/                   # Módulo PROFIT
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   └── calculators/         # Calculadoras (COGS, Pricing)
│   │
│   ├── hr/                      # Módulo HR
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   └── engines/
│   │
│   ├── copilot/                 # Módulo COPILOT (IA)
│   │   ├── api.py               # Endpoints COPILOT
│   │   ├── service.py            # Lógica principal
│   │   ├── ollama_client.py      # Cliente Ollama
│   │   ├── rag.py                # Sistema RAG
│   │   ├── context_builder.py    # Construtor de contexto
│   │   ├── guardrails.py         # Validação e segurança
│   │   ├── models.py             # Models (Conversations, Messages)
│   │   ├── schemas.py            # Pydantic schemas
│   │   ├── prompts/              # Prompts do LLM
│   │   ├── jobs/                 # Jobs assíncronos
│   │   │   └── daily_feedback.py # Feedback diário
│   │   └── utils/                # Utilitários
│   │
│   └── shared/                   # Código partilhado
│       ├── config.py             # Configurações
│       ├── database.py           # Setup DB
│       ├── auth/                 # Autenticação
│       ├── redis_client.py       # Cliente Redis
│       └── kafka_client.py        # Cliente Kafka
│
├── alembic/                      # Migrations DB
│   └── versions/
│
├── scripts/                      # Scripts utilitários
│   └── convert_excel_to_json.py  # Conversão Excel → JSON
│
└── docker-compose.yml            # Setup Docker
```

---

## 🎨 Frontend - Componentes Principais

### Layout

- **`Layout.tsx`**: Layout principal com Header e Sidebar
- **`Header.tsx`**: Cabeçalho com navegação
- **`Sidebar.tsx`**: Menu lateral com módulos

### Dashboard

- **`Dashboard.tsx`**: Dashboard principal com:
  - OEE Metrics (cards de métricas)
  - Charts (gráficos de tendências)
  - COPILOT Insights Card
  - Recommendations Card
  - Daily Feedback Card

### COPILOT Components

- **`CopilotFab.tsx`**: Botão flutuante (FAB) no canto inferior direito
  - Abre o chat do COPILOT
  - Tooltip no hover
  - Animação suave
  
- **`CopilotDrawer.tsx`**: Chat drawer (painel lateral)
  - Header com status (ONLINE/OFFLINE)
  - Lista de mensagens (scrollable)
  - Input de texto
  - Botões "Nova conversa" e "Ver conversas antigas"
  
- **`CopilotMessage.tsx`**: Renderização de mensagens do COPILOT
  - Summary (resumo)
  - Facts (factos com citations)
  - Actions (ações propostas)
  - Warnings (avisos)
  - Evidências (expandable)
  
- **`CopilotInsightsCard.tsx`**: Card de insights no dashboard
  - Alertas atuais
  - Próximos passos
  - UI premium com gradientes e sombras

### Charts

- **`AreaChart.tsx`**: Gráficos de área
- **`BarChart.tsx`**: Gráficos de barras
- **`DonutChart.tsx`**: Gráficos donut
- **`GanttChart.tsx`**: Gráficos Gantt
- **`SparkLine.tsx`**: Mini gráficos sparkline

---

## 🔧 Backend - Serviços Principais

### CopilotService

**Localização**: `src/copilot/service.py`

**Responsabilidades**:
- Orquestra todo o fluxo de processamento de perguntas
- Detecta intent (tipo de pergunta)
- Implementa fast path para KPIs simples
- Constrói contexto operacional
- Chama LLM (Ollama)
- Valida e normaliza respostas
- Gera citations e facts

**Métodos Principais**:
- `process_ask()`: Método principal que processa perguntas
- `_detect_intent()`: Detecta tipo de pergunta
- `_handle_fast_path_kpi()`: Responde KPIs sem LLM
- `_fetch_kpi_snapshot()`: Busca snapshot de KPIs
- `_render_prompt()`: Cria prompt para LLM
- `_validate_explanation_quality()`: Valida qualidade da explicação

### OllamaClient

**Localização**: `src/copilot/ollama_client.py`

**Responsabilidades**:
- Cliente HTTP para Ollama
- Circuit breaker (proteção contra falhas)
- Retry com backoff exponencial
- Health check
- Configuração de latência (keep-alive, num_threads)

**Configurações de Performance**:
- `keep_alive: "10m"` - Mantém modelo em memória
- `num_predict: 500` - Limita tokens de resposta
- `temperature: 0.3` - Respostas mais diretas
- `top_k: 40` - Limita vocabulário
- HTTP keep-alive para reutilizar conexões

### ContextBuilder

**Localização**: `src/copilot/context_builder.py`

**Responsabilidades**:
- Constrói contexto operacional para o LLM
- Agrega dados de múltiplas fontes:
  - KPIs (OEE, FPY, rework rate)
  - Ordens em progresso
  - Erros recentes
  - Alocações de funcionários
  - Top fases por WIP

### RAG System

**Localização**: `src/copilot/rag.py`

**Responsabilidades**:
- Retrieval Augmented Generation
- Armazena documentos (SOPs, políticas) como embeddings
- Busca documentos relevantes para contexto
- Usa pgvector (PostgreSQL) para similarity search

---

## 📊 Dados e Modelos

### Dados Principais

O sistema processa dados do ficheiro `Folha_IA.xlsx`:

- **27,380 ordens de produção** (OrdensFabrico)
- **519,079 execuções de fases** (FasesOrdemFabrico)
- **89,836 erros registados** (OrdemFabricoErros)
- **346,832 alocações** (FuncionariosFaseOrdemFabrico)
- **894 produtos/kayaks** (Modelos)
- **71 fases de produção** (Fases)
- **137 funcionários ativos** (Funcionarios)

### Modelos de Base de Dados

#### CORE
- `Product` - Produtos/Kayaks
- `Machine` - Máquinas e equipamentos
- `Employee` - Funcionários
- `Operation` - Operações/Fases
- `Rate` - Taxas e custos
- `BOM` - Bill of Materials

#### PLAN
- `Schedule` - Agendamentos
- `MRP` - Material Requirements Planning

#### PROFIT
- `Cost` - Custos

#### HR
- `Allocation` - Alocações de funcionários
- `Productivity` - Produtividade

#### COPILOT
- `CopilotSuggestion` - Sugestões do COPILOT (audit)
- `CopilotConversation` - Conversas
- `CopilotMessage` - Mensagens (user + copilot)
- `CopilotRAGChunk` - Chunks de documentos para RAG
- `CopilotDailyFeedback` - Feedback diário
- `CopilotDecisionPR` - Decision Pull Requests

---

## 🔐 Autenticação e Segurança

### Autenticação

- **JWT (JSON Web Tokens)**: Tokens Bearer
- **Multi-tenant**: Cada tenant tem dados isolados
- **RBAC (Role-Based Access Control)**: Permissões por papel
- **Headers obrigatórios**: `Authorization: Bearer <token>`, `X-Tenant-Id: <uuid>`

### Segurança COPILOT

- **Rate Limiting**: Limite de perguntas por hora/dia
- **Security Flags**: Detecção de perguntas sensíveis
- **Guardrails**: Validação de respostas do LLM
- **Redaction**: Remoção de dados sensíveis (nomes de funcionários)
- **Audit Log**: Todas as interações são registadas

---

## 🚀 Como Funciona (Fluxo Completo)

### 1. Inicialização

```
1. Backend inicia (FastAPI)
   ├─ Conecta a PostgreSQL
   ├─ Conecta a Redis (opcional)
   ├─ Inicia Kafka producer (opcional)
   └─ Verifica Ollama (health check)

2. Frontend inicia (Vite dev server)
   ├─ Carrega React app
   ├─ Conecta a API (http://localhost:8000)
   └─ Renderiza Dashboard
```

### 2. User Abre Dashboard

```
1. Frontend faz chamadas API:
   ├─ GET /api/profit/kpis → KPIs principais
   ├─ GET /api/copilot/insights → Insights do COPILOT
   ├─ GET /api/copilot/daily-feedback → Feedback diário
   └─ GET /api/copilot/recommendations → Recomendações

2. Backend processa:
   ├─ Busca dados da base de dados
   ├─ Calcula KPIs
   └─ Retorna JSON

3. Frontend renderiza:
   ├─ Cards de métricas
   ├─ Gráficos
   └─ COPILOT Insights Card
```

### 3. User Faz Pergunta ao COPILOT

```
1. User clica no FAB (botão flutuante)
   └─ Abre CopilotDrawer

2. User digita pergunta e envia
   └─ handleSend() → askMutation.mutate()

3. Frontend chama API:
   └─ POST /api/copilot/ask-dev
      (sem token, usa endpoint dev)

4. Backend processa (CopilotService.process_ask):
   ├─ Detecta intent (kpi_current, generic, etc.)
   ├─ Se kpi_current → Fast Path (<500ms)
   │  └─ Busca KPI snapshot → Responde diretamente
   │
   └─ Se não → LLM Path:
      ├─ Build context (KPIs, ordens, erros)
      ├─ RAG retrieval (se necessário)
      ├─ Render prompt
      ├─ Chama Ollama (LLM)
      ├─ Valida resposta
      ├─ Normaliza citations
      └─ Retorna CopilotResponse

5. Frontend recebe resposta:
   ├─ onSuccess() adiciona mensagem ao estado
   └─ Renderiza CopilotMessage
```

---

## 🎯 Funcionalidades Principais

### Dashboard

- **OEE Metrics**: Disponibilidade, Performance, Qualidade
- **Charts**: Tendências temporais, distribuições
- **COPILOT Insights**: Alertas e recomendações
- **Quick Actions**: Ações rápidas

### Gestão de Ordens

- Lista paginada de ordens
- Filtros avançados (status, produto, fase)
- Detalhes de cada ordem
- Timeline de fases

### Análise de Qualidade

- Tracking de erros
- FPY (First Pass Yield)
- Rework rate
- Análise de defeitos por fase

### COPILOT (IA)

- **Perguntas em linguagem natural**: "Qual é o OEE atual?"
- **Análise inteligente**: "Porque é que o OEE baixou?"
- **Recomendações**: Sugestões automáticas de melhoria
- **Insights diários**: Resumo automático da operação
- **Conversation history**: Histórico de conversas
- **Fast path**: Respostas instantâneas para KPIs

---

## 🔄 Integrações

### Ollama (LLM Local)

- **Modelo**: `llama3:8b` (quantizado Q4_0)
- **URL**: `http://localhost:11434`
- **Formato**: JSON structured output
- **Configuração**: Baixa latência (keep-alive, num_threads)

### PostgreSQL

- **Base de dados principal**
- **Extensões**: `pgvector` (para RAG embeddings)
- **Migrations**: Alembic
- **Pool**: Connection pooling (10 conexões, max 20 overflow)

### Redis (Opcional)

- **Cache**: Cache de respostas
- **Rate Limiting**: Limite de perguntas
- **Fallback**: Em memória se Redis não disponível

### Kafka (Opcional, Produção)

- **Event Streaming**: Eventos de sistema
- **Audit Logs**: Logs de auditoria
- **Event Handlers**: Processamento assíncrono

---

## 📈 Performance e Otimizações

### COPILOT Performance

1. **Fast Path**: Perguntas simples de KPIs respondem em <500ms (sem LLM)
2. **Intent Routing**: Detecta tipo de pergunta antes de chamar LLM
3. **Prompt Size Reduction**: Limita contexto para perguntas simples
4. **Ollama Optimization**:
   - Keep-alive (modelo em memória)
   - Num threads (paralelização)
   - Num predict limitado (500 tokens)
   - Temperature reduzida (0.3)
5. **RAG Control**: Só usa RAG quando necessário (SOPs, políticas)

### Frontend Performance

- **TanStack Query**: Cache de dados
- **Lazy Loading**: Componentes carregados sob demanda
- **Code Splitting**: Vite faz split automático
- **Optimistic Updates**: UI atualiza antes da resposta

---

## 🧪 Desenvolvimento e Testes

### Backend

```bash
# Iniciar servidor
python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload

# Executar migrations
alembic upgrade head

# Health check
curl http://localhost:8000/health
```

### Frontend

```bash
# Instalar dependências
cd frontend && npm install

# Dev server
npm run dev

# Build produção
npm run build
```

### COPILOT

```bash
# Verificar Ollama
curl http://localhost:11434/api/tags

# Health check COPILOT
curl http://localhost:8000/api/copilot/health

# Testar pergunta (dev endpoint)
curl -X POST http://localhost:8000/api/copilot/ask-dev \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: 00000000-0000-0000-0000-000000000001" \
  -d '{"user_query": "Qual é o OEE atual?"}'
```

---

## 📝 Configuração

### Variáveis de Ambiente

**Backend** (`.env`):
```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/prodplan_one
REDIS_URL=redis://localhost:6379/0
KAFKA_BOOTSTRAP_SERVERS=localhost:29092
SECRET_KEY=your-secret-key
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3:8b
COPILOT_RATE_LIMIT_PER_HOUR=60
COPILOT_RATE_LIMIT_PER_DAY=300
```

**Frontend** (`frontend/.env.local`):
```env
VITE_API_URL=http://localhost:8000
```

---

## 🎨 Design System

### Cores Principais

- **Azul Profundo**: `#1a2744` (primary)
- **Azul Médio**: `#2d4a7c` (secondary)
- **Verde**: `#10b981` (success)
- **Vermelho**: `#ef4444` (error)
- **Amarelo**: `#f59e0b` (warning)

### Tipografia

- **Font**: System fonts (San Francisco, Segoe UI, etc.)
- **Sizes**: `text-xs` (12px) até `text-2xl` (24px)
- **Weights**: `font-normal` (400), `font-medium` (500), `font-semibold` (600), `font-bold` (700)

### Componentes UI

- **Cards**: Bordas arredondadas, sombras suaves, gradientes subtis
- **Buttons**: Gradientes, hover effects, estados disabled
- **Charts**: Cores consistentes, tooltips, legendas
- **Tables**: Striped rows, hover effects, paginação

---

## 🔍 Troubleshooting Comum

### COPILOT não responde

1. Verificar Ollama: `curl http://localhost:11434/api/tags`
2. Verificar health: `curl http://localhost:8000/api/copilot/health`
3. Verificar logs do backend
4. Verificar circuit breaker (pode estar aberto)

### Erros 401 (Unauthorized)

- Normal se não houver autenticação
- Frontend usa automaticamente endpoints `-dev` quando não há token
- Não bloqueia funcionalidade básica

### Performance lenta

1. Verificar se fast path está a ser usado (logs)
2. Verificar tamanho do prompt (logs mostram chars/tokens)
3. Verificar configuração do Ollama (keep-alive, num_threads)
4. Verificar se RAG está a ser usado desnecessariamente

---

## 📚 Documentação Adicional

- **README.md**: Visão geral e instalação
- **DATA_REQUIREMENTS.md**: Requisitos de dados
- **STATUS_COPILOT.md**: Status do COPILOT
- **START_COPILOT.md**: Como iniciar o COPILOT

---

## 🎯 Conclusão

O **ProdPlan ONE** é um sistema ERP industrial completo que combina:
- **Gestão tradicional**: CORE, PLAN, PROFIT, HR
- **IA Assistente**: COPILOT para análise inteligente
- **UI Moderna**: Design premium e responsivo
- **Arquitetura Escalável**: Modular, assíncrona, multi-tenant

O sistema está preparado para produção, com suporte a:
- Multi-tenant
- Autenticação e autorização
- Cache e rate limiting
- Event streaming (Kafka)
- LLM local (Ollama)
- RAG para conhecimento interno

---

**Versão**: 2.0.0  
**Última atualização**: Janeiro 2026  
**Desenvolvido para**: NELO

