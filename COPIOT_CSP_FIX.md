# Fix CSP (Content Security Policy) Error

## Problema
O browser está a bloquear o uso de `eval()` devido à Content Security Policy.

## Solução Aplicada

1. **Meta tag CSP no `index.html`**: Adicionada política que permite `unsafe-eval` em desenvolvimento
2. **Configuração Vite**: Ajustada para não usar transformações que requerem eval

## Como Aplicar

1. **Limpar cache do browser**:
   - Chrome: DevTools (F12) → Network → marcar "Disable cache"
   - Ou: `Ctrl+Shift+Delete` → Limpar cache

2. **Reiniciar servidor de desenvolvimento**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Recarregar página**: `Ctrl+F5` (hard refresh)

## Em Produção

⚠️ **IMPORTANTE**: A política atual permite `unsafe-eval` e `unsafe-inline`, o que reduz a segurança.

Para produção, configure CSP mais restritivo no servidor web (nginx/Apache):

### Nginx
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" always;
```

### Apache
```apache
Header set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
```

## Identificar Origem do Problema

Se o erro persistir, pode ser causado por:
- Alguma biblioteca externa (React DevTools, TanStack Query, etc.)
- Código que usa `eval()`, `new Function()`, ou `setTimeout/setInterval` com strings

Para identificar:
1. Abrir DevTools → Console
2. Ver qual ficheiro/linha está a causar o erro
3. Verificar se é uma biblioteca externa ou código próprio


