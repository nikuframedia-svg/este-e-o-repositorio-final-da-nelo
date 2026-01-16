# 🚀 Guia de Inicialização do COPILOT

Este guia explica como iniciar o módulo COPILOT do ProdPlan ONE.

## Pré-requisitos

1. **Ollama instalado** (já está instalado em `/opt/homebrew/bin/ollama`)
2. **Modelo LLM instalado** (ex: `llama3:8b`)
3. **Backend configurado** (PostgreSQL, Redis, Kafka)
4. **Variáveis de ambiente** configuradas

## Passo 1: Iniciar o Ollama

O Ollama precisa de estar a correr como serviço. No macOS:

```bash
# Iniciar o Ollama (se não estiver a correr)
ollama serve
```

Ou, se preferires iniciar em background:

```bash
# Verificar se está a correr
ps aux | grep ollama

# Se não estiver, iniciar:
ollama serve &
```

**Verificar se está a funcionar:**
```bash
curl http://localhost:11434/api/tags
```

## Passo 2: Verificar/Instalar o Modelo

O backend está configurado para usar `llama3:8b` por padrão. Verifica se está instalado:

```bash
ollama list
```

Se não estiver instalado:

```bash
ollama pull llama3:8b
```

**Nota:** O modelo `llama3:8b` tem ~4.7GB. Certifica-te de que tens espaço suficiente.

## Passo 3: Configurar Variáveis de Ambiente

Cria um ficheiro `.env` na raiz do projeto (se não existir):

```bash
cd /Users/joaomilhazes/este-e-o-repositorio-final-da-nelo
```

Exemplo de `.env`:

```env
# Database
DATABASE_URL=postgresql+asyncpg://prodplan:prodplan_secret_2026@localhost:5432/prodplan_one

# Redis
REDIS_URL=redis://:redis_secret_2026@localhost:6379/0

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:29092

# COPILOT
COPILOT_ENABLED=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3:8b
COPILOT_EMBEDDINGS_MODEL=all-minilm

# Security
SECRET_KEY=prodplan_jwt_secret_key_2026_change_in_production
```

## Passo 4: Iniciar o Backend

O backend completo (com COPILOT) está em `src/main.py`:

```bash
cd /Users/joaomilhazes/este-e-o-repositorio-final-da-nelo

# Instalar dependências (se necessário)
pip install -r requirements.txt

# Iniciar o backend
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

Ou, se preferires usar o script direto:

```bash
python src/main.py
```

**Verificar se está a funcionar:**
```bash
curl http://localhost:8000/api/copilot/health
```

Deve retornar:
```json
{
  "status": "healthy",
  "ollama": "online",
  "embeddings_model": "all-minilm",
  "rate_limit": {
    "per_hour": 60,
    "per_day": 300
  }
}
```

## Passo 5: Verificar o Frontend

O frontend já está configurado para usar `http://localhost:8000` por padrão.

Se estiveres a usar uma porta diferente, configura no `.env` do frontend:

```bash
cd frontend
echo "VITE_API_URL=http://localhost:8000" > .env.local
```

## Troubleshooting

### Erro: "Ollama server not responding"

**Solução:** Inicia o Ollama:
```bash
ollama serve
```

### Erro: "Model not found"

**Solução:** Instala o modelo:
```bash
ollama pull llama3:8b
```

### Erro: "Circuit breaker aberto"

**Solução:** O Ollama falhou 3 vezes consecutivas. Aguarda 60 segundos ou reinicia o Ollama.

### Erro: "Database connection failed"

**Solução:** Verifica se o PostgreSQL está a correr e se as credenciais no `.env` estão corretas.

### Erro: "Redis connection failed"

**Solução:** O COPILOT funciona sem Redis (usa fallback em memória), mas o rate limiting será menos eficiente.

## Verificação Rápida

Executa este script para verificar tudo:

```bash
#!/bin/bash
echo "🔍 Verificando COPILOT..."

# Ollama
echo -n "Ollama: "
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
  echo "✅ Online"
else
  echo "❌ Offline (executa: ollama serve)"
fi

# Modelo
echo -n "Modelo llama3:8b: "
if ollama list 2>/dev/null | grep -q "llama3:8b"; then
  echo "✅ Instalado"
else
  echo "❌ Não instalado (executa: ollama pull llama3:8b)"
fi

# Backend
echo -n "Backend: "
if curl -s http://localhost:8000/api/copilot/health > /dev/null 2>&1; then
  echo "✅ Online"
else
  echo "❌ Offline (executa: python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload)"
fi

echo "✅ Verificação completa!"
```

## Próximos Passos

1. **Testar o COPILOT:** Abre o frontend e clica no botão vermelho do COPILOT (canto inferior direito)
2. **Fazer uma pergunta:** Ex: "Porque é que o OEE baixou?"
3. **Verificar logs:** Os logs do backend mostram o processo completo (context building, RAG, LLM call, etc.)

## Notas Importantes

- O COPILOT requer **PostgreSQL** (não funciona com SQLite simples)
- O **Redis** é opcional mas recomendado para rate limiting eficiente
- O **Kafka** é opcional para audit logs (pode usar DB direto)
- O modelo `llama3:8b` é o mínimo recomendado. Modelos maiores (ex: `llama3:70b`) dão melhores resultados mas são mais lentos.

