# Erros Corrigidos em `src/`

## ✅ Erro 1: Importação de `generate_daily_feedback` (CORRIGIDO)

**Problema:**
```
ImportError: cannot import name 'generate_daily_feedback' from 'src.copilot.jobs.daily_feedback'
```

**Causa:**
O ficheiro `src/copilot/jobs/daily_feedback.py` estava vazio, mas `src/copilot/api.py` estava a tentar importar a função `generate_daily_feedback`.

**Correção:**
Criada a função `generate_daily_feedback` em `src/copilot/jobs/daily_feedback.py` com:
- Assinatura correta: `async def generate_daily_feedback(session, tenant_id, target_date) -> DailyFeedbackResponse`
- Implementação básica que retorna um `DailyFeedbackResponse` válido
- Tratamento de erros com fallback

**Ficheiro corrigido:**
- `src/copilot/jobs/daily_feedback.py` (criado)

---

## ⚠️ Problema 2: Endpoints `/api/allocations` e `/api/orders` não existem no backend novo

**Problema:**
O frontend está a chamar:
- `GET /api/allocations` (com paginação)
- `GET /api/orders` (com paginação)

Mas o backend novo (`src/main.py`) não tem esses endpoints. O backend novo tem:
- `GET /v1/hr/allocations` (sem paginação, apenas para criar/listar alocações)
- Não tem endpoint para `/api/orders`

**Backend Antigo (`backend/main.py`):**
- ✅ Tem `GET /api/allocations` (com paginação)
- ✅ Tem `GET /api/orders` (com paginação)
- ✅ Usa SQLite (`backend/prodplan.db`)

**Backend Novo (`src/main.py`):**
- ❌ Não tem `GET /api/allocations` (com paginação)
- ❌ Não tem `GET /api/orders` (com paginação)
- ✅ Usa PostgreSQL (modular)

**Solução Possível:**
1. **Opção A**: Adicionar endpoints de compatibilidade no backend novo que usem o SQLite antigo
2. **Opção B**: Migrar os dados do SQLite para PostgreSQL e criar endpoints paginados no backend novo
3. **Opção C**: Manter o backend antigo a correr em paralelo para esses endpoints específicos

---

## ✅ Verificações Realizadas

Todos os routers importam corretamente:
- ✅ `src.core.api` - OK
- ✅ `src.plan.api` - OK
- ✅ `src.profit.api` - OK
- ✅ `src.hr.api` - OK
- ✅ `src.copilot.api` - OK (após correção)
- ✅ `src.main` - OK (após correção)

---

## 📋 Próximos Passos Recomendados

1. **Decidir qual backend usar:**
   - Se usar backend novo (`src/main.py`): Adicionar endpoints `/api/allocations` e `/api/orders` com paginação
   - Se usar backend antigo (`backend/main.py`): Manter como está

2. **Se usar backend novo:**
   - Criar endpoints de compatibilidade em `src/main.py` ou criar um router separado
   - Migrar dados do SQLite para PostgreSQL (se necessário)
   - Atualizar frontend para usar novos endpoints (se mudar estrutura)

3. **Testar endpoints:**
   - Verificar se `/api/allocations` retorna dados
   - Verificar se `/api/orders` retorna dados
   - Verificar se paginação funciona corretamente

---

**Data:** Janeiro 2026
**Status:** Erro de importação corrigido. Problema de endpoints pendente de decisão arquitetural.
