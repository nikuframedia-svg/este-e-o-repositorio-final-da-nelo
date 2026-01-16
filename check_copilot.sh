#!/bin/bash
# Verificação rápida do COPILOT

echo "🔍 Verificando COPILOT..."
echo ""

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
  # Mostrar status detalhado
  echo ""
  echo "Status detalhado:"
  curl -s http://localhost:8000/api/copilot/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8000/api/copilot/health
else
  echo "❌ Offline (executa: python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload)"
fi

echo ""
echo "✅ Verificação completa!"

