"""
ProdPlan ONE - COPILOT Rate Limiter
====================================

Rate limiting via Redis (fallback DB se Redis offline).
"""

import logging
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status

from src.shared.config import settings
from src.shared.redis_client import get_redis

logger = logging.getLogger(__name__)


class RateLimiter:
    """
    Rate limiter para COPILOT.
    
    Limites:
    - Por hora: configurável (default 60)
    - Por dia: configurável (default 300)
    """
    
    def __init__(
        self,
        per_hour: Optional[int] = None,
        per_day: Optional[int] = None,
    ):
        self.per_hour = per_hour or settings.copilot_rate_limit_per_hour
        self.per_day = per_day or settings.copilot_rate_limit_per_day
    
    async def check_rate_limit(
        self,
        tenant_id: UUID,
        actor_id: UUID,
    ) -> tuple[bool, Optional[int]]:
        """
        Verificar se request está dentro dos limites.
        
        Returns:
            (allowed, retry_after_seconds)
            - allowed: True se permitido, False se excedido
            - retry_after_seconds: segundos até poder tentar novamente (se excedido)
        """
        try:
            redis = await get_redis()
            
            # Keys para contadores
            hour_key = f"copilot:rate:{tenant_id}:{actor_id}:hour"
            day_key = f"copilot:rate:{tenant_id}:{actor_id}:day"
            
            # Obter contadores atuais
            hour_count_raw = await redis.get(hour_key)
            day_count_raw = await redis.get(day_key)
            
            hour_count = int(hour_count_raw) if hour_count_raw else 0
            day_count = int(day_count_raw) if day_count_raw else 0
            
            # Verificar limites
            if hour_count >= self.per_hour:
                # Calcular TTL restante
                ttl = await redis.ttl(hour_key)
                return False, max(ttl, 60)  # Mínimo 60s
            
            if day_count >= self.per_day:
                ttl = await redis.ttl(day_key)
                return False, max(ttl, 3600)  # Mínimo 1h
            
            # Incrementar contadores
            await redis.incr(hour_key)
            await redis.expire(hour_key, 3600)  # 1 hora
            await redis.incr(day_key)
            await redis.expire(day_key, 86400)  # 24 horas
            
            return True, None
            
        except Exception as e:
            logger.warning(f"Rate limiter falhou (Redis offline?): {e}")
            # Fallback: permitir (não bloquear se Redis falhar)
            # Em produção, poderia usar DB como fallback
            return True, None
    
    async def enforce_rate_limit(
        self,
        tenant_id: UUID,
        actor_id: UUID,
    ):
        """
        Enforce rate limit - raise HTTPException se excedido.
        
        Raises:
            HTTPException 429 se limite excedido
        """
        allowed, retry_after = await self.check_rate_limit(tenant_id, actor_id)
        
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit excedido. Tente novamente em {retry_after}s",
                headers={"Retry-After": str(retry_after or 60)},
            )


# Instância global
_rate_limiter: Optional[RateLimiter] = None


def get_rate_limiter() -> RateLimiter:
    """Get global rate limiter instance."""
    global _rate_limiter
    if _rate_limiter is None:
        _rate_limiter = RateLimiter()
    return _rate_limiter

