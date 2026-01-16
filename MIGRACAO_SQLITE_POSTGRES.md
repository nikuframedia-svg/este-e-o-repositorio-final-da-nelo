# Migração SQLite → PostgreSQL

## 📋 Resumo

Este documento descreve a migração de dados do SQLite (backend antigo) para PostgreSQL (backend novo) e a criação de endpoints paginados compatíveis.

## ✅ O Que Foi Criado

### 1. Modelos de Base de Dados

- **`src/plan/models/order.py`**: Modelo `ProductionOrder` para ordens de produção
- **`src/hr/models/legacy_allocation.py`**: Modelo `LegacyAllocation` para alocações de funcionários

### 2. Script de Migração

- **`scripts/migrate_sqlite_to_postgres.py`**: Script que:
  - Lê dados do SQLite (`backend/prodplan.db`)
  - Migra para PostgreSQL
  - Suporta batch inserts (1000 registos por vez)
  - Evita duplicados (verifica se já existem)
  - Mostra progresso durante a migração

### 3. Endpoints de Compatibilidade

- **`src/legacy/api.py`**: Endpoints compatíveis com o frontend:
  - `GET /api/orders` - Lista paginada de ordens
  - `GET /api/orders/stats` - Estatísticas de ordens
  - `GET /api/orders/{order_id}` - Detalhes de uma ordem
  - `GET /api/allocations` - Lista paginada de alocações
  - `GET /api/allocations/stats` - Estatísticas de alocações

## 🚀 Como Executar a Migração

### Pré-requisitos

1. **PostgreSQL a correr** com base de dados criada
2. **SQLite database** em `backend/prodplan.db` (deve existir)
3. **Variáveis de ambiente** configuradas (`.env`)

### Passos

1. **Verificar configuração do PostgreSQL**:
   ```bash
   # Verificar .env
   cat .env | grep DATABASE_URL
   # Deve ser algo como:
   # DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/prodplan_one
   ```

2. **Executar migração**:
   ```bash
   cd /Users/joaomilhazes/este-e-o-repositorio-final-da-nelo
   python3 scripts/migrate_sqlite_to_postgres.py
   ```

3. **Verificar resultados**:
   O script mostrará:
   - Quantas ordens foram migradas
   - Quantas alocações foram migradas
   - Quantas duplicados foram ignorados

### Exemplo de Output

```
🚀 Starting migration from SQLite to PostgreSQL...
   SQLite DB: /path/to/backend/prodplan.db
   PostgreSQL: postgresql+asyncpg://...
   Tenant ID: 00000000-0000-0000-0000-000000000001

📊 Initializing PostgreSQL database...
✅ Database initialized

📥 Loading data from SQLite...
   Found 27,380 orders
   Found 346,832 allocations

📦 Migrating 27,380 orders...
  ✓ Inserted 1,000 orders (skipped 0)
  ✓ Inserted 1,000 orders (skipped 0)
  ...
✅ Migrated 27,380 orders (skipped 0 duplicates)

👥 Migrating 346,832 allocations...
  ✓ Inserted 1,000 allocations (skipped 0)
  ...
✅ Migrated 346,832 allocations (skipped 0 duplicates)

✅ Migration completed successfully!
   Orders: 27,380
   Allocations: 346,832
```

## 🔧 Estrutura dos Dados

### ProductionOrder

- `legacy_id`: ID original do SQLite (único)
- `product_id`: ID do produto (legacy)
- `product_name`: Nome do produto
- `product_type`: Tipo (K1, K2, K4, C1, C2, C4, Other)
- `current_phase_id`: ID da fase atual
- `current_phase_name`: Nome da fase atual
- `created_date`: Data de criação
- `completed_date`: Data de conclusão
- `transport_date`: Data de transporte
- `status`: IN_PROGRESS, COMPLETED, CANCELLED

### LegacyAllocation

- `order_id`: ID da ordem
- `phase_id`: ID da fase
- `phase_name`: Nome da fase
- `employee_id`: ID do funcionário (legacy)
- `employee_name`: Nome do funcionário
- `is_leader`: Se é líder (boolean)
- `start_date`: Data de início
- `end_date`: Data de fim

## 📡 Endpoints Disponíveis

### Orders

```bash
# Lista paginada
GET /api/orders?page=1&pageSize=20&status=IN_PROGRESS&search=kayak

# Estatísticas
GET /api/orders/stats

# Detalhes
GET /api/orders/12345
```

### Allocations

```bash
# Lista paginada
GET /api/allocations?page=1&pageSize=20&isLeader=true&search=john

# Estatísticas
GET /api/allocations/stats
```

## 🔍 Verificação

Após a migração, pode verificar os dados:

```sql
-- Verificar ordens
SELECT COUNT(*) FROM plan.production_orders;

-- Verificar alocações
SELECT COUNT(*) FROM hr.legacy_allocations;

-- Verificar distribuição
SELECT status, COUNT(*) 
FROM plan.production_orders 
GROUP BY status;
```

## ⚠️ Notas Importantes

1. **Tenant ID**: A migração usa o tenant ID padrão `00000000-0000-0000-0000-000000000001`
2. **Duplicados**: O script verifica duplicados e não insere novamente
3. **Batch Size**: Migra 1000 registos por vez para melhor performance
4. **Idempotência**: Pode executar o script múltiplas vezes sem problemas

## 🐛 Troubleshooting

### Erro: "SQLite database not found"
- Verificar se `backend/prodplan.db` existe
- Se não existir, executar o backend antigo para criar a base de dados

### Erro: "Database connection failed"
- Verificar se PostgreSQL está a correr
- Verificar `DATABASE_URL` no `.env`
- Verificar permissões do utilizador

### Erro: "Table already exists"
- Normal se já executou a migração antes
- O script verifica duplicados automaticamente

## 📝 Próximos Passos

1. Executar a migração
2. Testar os endpoints no frontend
3. Verificar se os dados aparecem corretamente
4. (Opcional) Remover o backend antigo após validação

---

**Data**: Janeiro 2026
**Status**: ✅ Pronto para execução
