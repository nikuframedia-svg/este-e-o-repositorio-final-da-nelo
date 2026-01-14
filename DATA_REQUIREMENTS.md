# Requisitos de Dados - ProdPlan ONE

Este documento detalha todos os dados necessários para o funcionamento completo de cada módulo do sistema ProdPlan ONE. Inclui os dados já existentes (Folha_IA.xlsx) e os dados em falta para ativar funcionalidades atualmente desativadas.

---

## 1. DADOS EXISTENTES (Folha_IA.xlsx)

### 1.1 Resumo das Tabelas Disponíveis

| Sheet | Registos | Descrição | Uso no Sistema |
|-------|----------|-----------|----------------|
| OrdensFabrico | 27,380 | Ordens de produção | Scheduling, Dashboard, OEE |
| FasesOrdemFabrico | 519,079 | Fases executadas por ordem | OEE Performance, Allocations |
| FuncionariosFaseOrdemFabrico | 423,769 | Alocações de funcionários | Allocations Page |
| OrdemFabricoErros | 89,836 | Erros de qualidade | Quality Analysis, FPY |
| Funcionarios | 902 | Funcionários (137 ativos) | Employees Page |
| FuncionariosFasesAptos | 902 | Skills dos funcionários | Employees (skills) |
| Fases | 71 | Fases de produção | Operations Page |
| Modelos | 894 | Produtos/Kayaks | Products Page |
| FasesStandardModelos | 15,347 | Tempos padrão por produto/fase | Standard Times, COGS |

### 1.2 Mapeamento Detalhado por Sheet

#### OrdensFabrico
```
Of_Id              - ID único da ordem
Of_DataCriacao     - Data de criação
Of_DataAcabamento  - Data de conclusão (null = em progresso)
Of_ProdutoId       - FK para Modelos
Of_FaseId          - Fase atual
Of_DataTransporte  - Data de expedição
```

#### FasesOrdemFabrico
```
FaseOf_Id           - ID único
FaseOf_OfId         - FK para OrdensFabrico
FaseOf_Inicio       - Início da fase
FaseOf_Fim          - Fim da fase
FaseOf_DataPrevista - Data planeada
FaseOf_Coeficiente  - Tempo mão-de-obra (horas)
FaseOf_CoeficienteX - Tempo máquina (horas)
FaseOf_FaseId       - FK para Fases
FaseOf_Peso         - Peso processado
FaseOf_Retorno      - Flag retorno
FaseOf_Turno        - Turno (1, 2, 3)
FaseOf_Sequencia    - Ordem de execução
```

#### OrdemFabricoErros
```
Erro_Descricao      - Descrição do erro
Erro_OfId           - FK para OrdensFabrico
Erro_FaseAvaliacao  - Fase onde foi detetado
OFCH_GRAVIDADE      - Severidade (1=Minor, 2=Major, 3=Critical)
Erro_FaseOfAvaliacao - FK para FasesOrdemFabrico (avaliação)
Erro_FaseOfCulpada   - FK para FasesOrdemFabrico (origem)
```

#### Funcionarios
```
Funcionario_Id     - ID único
Funcionario_Nome   - Nome completo
Funcionario_Activo - 1=Ativo, 0=Inativo
```

#### Fases
```
Fase_Id         - ID único
Fase_Nome       - Nome da fase
Fase_Sequencia  - Ordem no fluxo
Fase_DeProducao - 1=Produção, 0=Administrativa
Fase_Automatica - 1=Automática, 0=Manual
```

#### Modelos (Produtos)
```
Produto_Id           - ID único
Produto_Nome         - Nome (ex: "K1 Quatro Vanquish")
Produto_PesoDesmolde - Peso ao desmoldar (kg)
Produto_PesoAcabamento - Peso final (kg)
Produto_QtdGelDeck   - Quantidade gel deck
Produto_QtdGelCasco  - Quantidade gel casco
```

#### FasesStandardModelos (Tempos Padrão)
```
ProdutoFase_ProdutoId   - FK para Modelos
ProdutoFase_FaseId      - FK para Fases
ProdutoFase_Sequencia   - Ordem da fase no produto
ProdutoFase_Coeficiente - Horas mão-de-obra padrão
ProdutoFase_CoeficienteX - Horas máquina padrão
```

---

## 2. DADOS EM FALTA POR MÓDULO

### 2.1 CORE Module

#### Machines (MachinesPage.tsx)
**Estado atual**: NoDataState - Sem dados

**Dados necessários**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| machine_id | INTEGER | Sim | ID único |
| machine_name | TEXT | Sim | Nome/código da máquina |
| machine_type | TEXT | Sim | Tipo (CNC, Prensa, Forno, etc.) |
| location | TEXT | Não | Localização na fábrica |
| capacity_per_hour | DECIMAL | Sim | Capacidade horária |
| status | TEXT | Sim | ACTIVE, MAINTENANCE, INACTIVE |
| last_maintenance | DATE | Não | Data última manutenção |
| next_maintenance | DATE | Não | Data próxima manutenção |
| cost_per_hour | DECIMAL | Não | Custo operacional/hora |
| utilization_target | DECIMAL | Não | % utilização objetivo |

#### Rates (RatesPage.tsx)
**Estado atual**: NoDataState - Sem dados

**Dados necessários**:

**Labor Rates**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| rate_id | INTEGER | Sim | ID único |
| department | TEXT | Sim | Departamento/secção |
| skill_level | TEXT | Sim | Junior, Mid, Senior |
| hourly_rate | DECIMAL | Sim | Custo/hora base |
| burden_rate | DECIMAL | Sim | Encargos (%) |
| effective_date | DATE | Sim | Data de vigência |

**Machine Rates**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| machine_type | TEXT | Sim | Tipo de máquina |
| hourly_rate | DECIMAL | Sim | Custo/hora |
| energy_cost | DECIMAL | Não | Custo energia/hora |
| depreciation_rate | DECIMAL | Não | Depreciação/hora |

**Overhead Rates**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| category | TEXT | Sim | Categoria overhead |
| allocation_base | TEXT | Sim | Base de alocação |
| rate | DECIMAL | Sim | Taxa |
| effective_date | DATE | Sim | Data vigência |

---

### 2.2 PLAN Module

#### MRP (MRPPage.tsx)
**Estado atual**: NoDataState - Sem dados

**Dados necessários**:

**Inventory (Stock)**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| item_id | INTEGER | Sim | ID do item |
| item_code | TEXT | Sim | Código SKU |
| item_name | TEXT | Sim | Nome do item |
| item_type | TEXT | Sim | RAW, WIP, FINISHED |
| unit | TEXT | Sim | Unidade (kg, un, m) |
| qty_on_hand | DECIMAL | Sim | Quantidade em stock |
| qty_reserved | DECIMAL | Não | Quantidade reservada |
| qty_ordered | DECIMAL | Não | Quantidade encomendada |
| reorder_point | DECIMAL | Não | Ponto de reposição |
| safety_stock | DECIMAL | Não | Stock segurança |
| unit_cost | DECIMAL | Não | Custo unitário |

**BOM (Bill of Materials)**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| bom_id | INTEGER | Sim | ID do BOM |
| product_id | INTEGER | Sim | FK para produto |
| component_id | INTEGER | Sim | FK para item |
| quantity | DECIMAL | Sim | Quantidade necessária |
| unit | TEXT | Sim | Unidade |
| scrap_rate | DECIMAL | Não | Taxa de desperdício (%) |
| lead_time_days | INTEGER | Não | Lead time interno |

**Suppliers**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| supplier_id | INTEGER | Sim | ID do fornecedor |
| supplier_name | TEXT | Sim | Nome |
| lead_time_days | INTEGER | Sim | Lead time entrega |
| min_order_qty | DECIMAL | Não | MOQ |
| payment_terms | TEXT | Não | Condições pagamento |

#### Capacity (CapacityPage.tsx)
**Estado atual**: NoDataState - Sem dados

**Dados necessários**:

**Resource Capacity**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| resource_id | INTEGER | Sim | ID do recurso |
| resource_type | TEXT | Sim | MACHINE, WORKSTATION, TEAM |
| resource_name | TEXT | Sim | Nome |
| capacity_hours_day | DECIMAL | Sim | Horas/dia disponíveis |
| efficiency_factor | DECIMAL | Não | Fator eficiência (0-1) |

**Calendar/Shifts**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| date | DATE | Sim | Data |
| shift_id | INTEGER | Sim | ID do turno |
| start_time | TIME | Sim | Hora início |
| end_time | TIME | Sim | Hora fim |
| is_working_day | BOOLEAN | Sim | Dia útil |
| resource_id | INTEGER | Não | Recurso específico |

---

### 2.3 PROFIT Module

#### Pricing (PricingPage.tsx)
**Estado atual**: NoDataState - Sem dados

**Dados necessários**:

**Product Pricing**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| product_id | INTEGER | Sim | FK para produto |
| base_price | DECIMAL | Sim | Preço base |
| currency | TEXT | Sim | Moeda (EUR) |
| price_list | TEXT | Não | Lista de preços |
| valid_from | DATE | Sim | Data início |
| valid_to | DATE | Não | Data fim |
| min_margin | DECIMAL | Não | Margem mínima (%) |
| target_margin | DECIMAL | Não | Margem objetivo (%) |

**Material Costs**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| product_id | INTEGER | Sim | FK para produto |
| material_cost | DECIMAL | Sim | Custo materiais |
| last_updated | DATE | Sim | Data atualização |

#### Scenarios (ScenariosPage.tsx)
**Estado atual**: NoDataState - Sem dados

**Dados necessários**:

**Scenario Config**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| scenario_id | INTEGER | Sim | ID do cenário |
| scenario_name | TEXT | Sim | Nome do cenário |
| description | TEXT | Não | Descrição |
| created_date | DATE | Sim | Data criação |
| status | TEXT | Sim | DRAFT, ACTIVE, ARCHIVED |

**Scenario Variables**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| variable_id | INTEGER | Sim | ID da variável |
| scenario_id | INTEGER | Sim | FK para cenário |
| variable_type | TEXT | Sim | COST, PRICE, VOLUME, RATE |
| variable_name | TEXT | Sim | Nome da variável |
| base_value | DECIMAL | Sim | Valor base |
| adjusted_value | DECIMAL | Sim | Valor ajustado |
| change_percent | DECIMAL | Não | Variação (%) |

---

### 2.4 HR Module

#### Payroll (PayrollPage.tsx)
**Estado atual**: NoDataState - Sem dados

**Dados necessários**:

**Employee Contracts**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| employee_id | INTEGER | Sim | FK para funcionário |
| contract_type | TEXT | Sim | PERMANENT, TEMPORARY, CONTRACT |
| base_salary | DECIMAL | Sim | Salário base mensal |
| start_date | DATE | Sim | Data início |
| end_date | DATE | Não | Data fim (se temporário) |
| hours_per_week | INTEGER | Sim | Horas semanais |

**Salary Components**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| employee_id | INTEGER | Sim | FK para funcionário |
| component_type | TEXT | Sim | BASE, BONUS, ALLOWANCE, OVERTIME |
| amount | DECIMAL | Sim | Valor |
| period | TEXT | Sim | MONTHLY, ANNUAL |

**Burden Costs**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| category | TEXT | Sim | SS, INSURANCE, OTHER |
| rate | DECIMAL | Sim | Taxa (%) |
| effective_date | DATE | Sim | Data vigência |

#### Productivity (ProductivityPage.tsx)
**Estado atual**: NoDataState - Sem dados

**Dados necessários**:

**Productivity Metrics** (podem ser calculados a partir de dados existentes):
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| employee_id | INTEGER | Sim | FK para funcionário |
| period | TEXT | Sim | Período (YYYY-MM) |
| total_hours | DECIMAL | Sim | Horas trabalhadas |
| productive_hours | DECIMAL | Sim | Horas produtivas |
| orders_completed | INTEGER | Não | Ordens concluídas |
| phases_completed | INTEGER | Não | Fases concluídas |
| errors_caused | INTEGER | Não | Erros gerados |
| efficiency_score | DECIMAL | Não | Score eficiência (0-100) |

**KPI Targets**:
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| role | TEXT | Sim | Função/cargo |
| kpi_name | TEXT | Sim | Nome do KPI |
| target_value | DECIMAL | Sim | Valor objetivo |
| unit | TEXT | Sim | Unidade |

---

## 3. PRIORIZAÇÃO DE IMPLEMENTAÇÃO

### Prioridade Alta (Dados Deriváveis)
Estas funcionalidades podem ser ativadas com cálculos sobre dados existentes:

1. **Productivity** - Pode ser calculado a partir de:
   - FuncionariosFaseOrdemFabrico (alocações)
   - FasesOrdemFabrico (tempos reais)
   - FasesStandardModelos (tempos padrão)
   - OrdemFabricoErros (erros por funcionário via alocação)

### Prioridade Média (Requerem Novos Dados)
2. **Rates** - Essencial para cálculos de custo
3. **Pricing** - Depende de Rates + Materiais
4. **Payroll** - Requer dados salariais confidenciais

### Prioridade Baixa (Requerem Sistema Adicional)
5. **Machines** - Requer integração IoT ou sistema de manutenção
6. **MRP** - Requer sistema de inventário
7. **Capacity** - Requer definição de calendário e recursos
8. **Scenarios** - Depende de Pricing e Rates

---

## 4. FORMATO DE IMPORTAÇÃO

### Opção A: Excel Adicional
Criar novo ficheiro `Dados_Complementares.xlsx` com sheets:
- Maquinas
- TaxasMaoObra
- TaxasMaquinas
- Precos
- Salarios

### Opção B: CSV Import
Criar ficheiros CSV individuais:
```
/data/import/
  machines.csv
  labor_rates.csv
  machine_rates.csv
  product_prices.csv
  employee_salaries.csv
```

### Opção C: UI de Configuração
Implementar forms de entrada manual para:
- Rates (uma vez configurado, raramente muda)
- Machines (lista relativamente estática)
- Pricing (pode ser calculado automaticamente)

---

## 5. NOTAS FINAIS

### Dados Sensíveis
Os seguintes dados devem ter proteção especial:
- Salários (Payroll)
- Custos de materiais (competitivo)
- Margens e preços (estratégico)

### Integrações Potenciais
- **ERP**: Stocks, BOM, Custos
- **IoT**: Status máquinas, tempos reais
- **RH**: Salários, contratos
- **Contabilidade**: Taxas, custos overhead

---

*Documento gerado automaticamente - ProdPlan ONE v2.0*
*Data: Janeiro 2026*

