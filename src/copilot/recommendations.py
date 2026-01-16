"""
ProdPlan ONE - COPILOT Recommendations Generator
=================================================

Gera recomendações baseadas em análise de dados OEE, qualidade e performance.
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_

from src.plan.models.schedule import ProductionSchedule, ScheduleStatus

logger = logging.getLogger(__name__)


class Recommendation:
    """Recomendação estruturada."""
    
    def __init__(
        self,
        priority: int,
        category: str,
        title: str,
        description: str,
        impact_metric: str,
        impact_value: float,
        affected_phases: List[str] = None,
        suggested_actions: List[str] = None,
        data_evidence: Dict[str, Any] = None,
    ):
        self.priority = priority
        self.category = category  # "QUALITY", "PERFORMANCE", "MAINTENANCE", "STANDARD_WORK"
        self.title = title
        self.description = description
        self.impact_metric = impact_metric  # "rework_rate", "performance", "oee", etc.
        self.impact_value = impact_value  # Valor atual do métrica
        self.affected_phases = affected_phases or []
        self.suggested_actions = suggested_actions or []
        self.data_evidence = data_evidence or {}
        self.generated_at = datetime.utcnow()


async def generate_recommendations(
    session: AsyncSession,
    tenant_id: UUID,
) -> List[Dict[str, Any]]:
    """
    Gerar recomendações baseadas em análise de dados.
    
    Returns:
        Lista de recomendações estruturadas.
    """
    recommendations = []
    
    try:
        # 1. Analisar rework rate e qualidade
        rework_analysis = await _analyze_rework_rate(session, tenant_id)
        if rework_analysis:
            recommendations.append(rework_analysis)
        
        # 2. Analisar performance por fase
        performance_analysis = await _analyze_performance(session, tenant_id)
        if performance_analysis:
            recommendations.append(performance_analysis)
        
        # 3. Analisar fases com problemas frequentes
        maintenance_analysis = await _analyze_maintenance_needs(session, tenant_id)
        if maintenance_analysis:
            recommendations.append(maintenance_analysis)
        
        # Ordenar por prioridade (1 = mais importante)
        recommendations.sort(key=lambda r: r.get("priority", 999))
        
        # Limitar a 3-5 recomendações principais
        return recommendations[:5]
        
    except Exception as e:
        logger.error(f"Erro ao gerar recomendações: {e}", exc_info=True)
        return []


async def _analyze_rework_rate(
    session: AsyncSession,
    tenant_id: UUID,
) -> Optional[Dict[str, Any]]:
    """Analisar taxa de retrabalho e gerar recomendação."""
    try:
        from sqlalchemy import select, func, and_
        
        # Contar orders total e orders com problemas
        orders_total_query = select(func.count(func.distinct(ProductionSchedule.order_id))).where(
            ProductionSchedule.tenant_id == tenant_id
        )
        orders_total_result = await session.execute(orders_total_query)
        orders_total = orders_total_result.scalar() or 0
        
        orders_completed_query = select(func.count(func.distinct(ProductionSchedule.order_id))).where(
            and_(
                ProductionSchedule.tenant_id == tenant_id,
                ProductionSchedule.status == ScheduleStatus.COMPLETED,
            )
        )
        orders_completed_result = await session.execute(orders_completed_query)
        orders_completed = orders_completed_result.scalar() or 0
        
        if orders_total == 0:
            return None
        
        # Calcular rework rate (simplificado: orders não completadas = rework)
        orders_with_issues = orders_total - orders_completed
        rework_rate = (orders_with_issues / orders_total) * 100.0 if orders_total > 0 else 0.0
        
        # Se rework rate > 50%, recomendar Quality Gate
        if rework_rate > 50.0:
            # Identificar fase crítica (assumir Laminagem como fase inicial comum)
            return {
                "priority": 1,
                "category": "QUALITY",
                "title": "Quality Gate",
                "description": f"Implementar checkpoint de qualidade após fase de Laminagem para detetar defeitos mais cedo (reduzindo taxa de retrabalho de {rework_rate:.1f}%).",
                "impact_metric": "rework_rate",
                "impact_value": rework_rate,
                "affected_phases": ["Laminagem"],
                "suggested_actions": [
                    "Implementar inspeção visual após Laminagem",
                    "Adicionar teste de qualidade antes de avançar para próxima fase",
                    "Criar alerta automático para defeitos críticos",
                ],
                "data_evidence": {
                    "orders_total": orders_total,
                    "orders_with_issues": orders_with_issues,
                    "rework_rate": rework_rate,
                },
                "origins": ["BEST_PRACTICE", "HEURISTIC_REASONING"],
                "confidence": "MEDIUM",
                "limitations": [
                    "Sem evidência direta por fase/ativo, recomendação baseada em heurística e boas práticas",
                    "Rework rate calculado a partir de orders total vs completed (simplificação)",
                ],
                "next_steps": ["RUNBOOK"],
            }
        
        return None
        
    except Exception as e:
        logger.warning(f"Erro ao analisar rework rate: {e}")
        return None


async def _analyze_performance(
    session: AsyncSession,
    tenant_id: UUID,
) -> Optional[Dict[str, Any]]:
    """Analisar performance e gerar recomendação."""
    try:
        from sqlalchemy import select, func, and_, case
        
        # Calcular performance média
        performance_query = select(
            func.avg(ProductionSchedule.scheduled_duration_hours).label("avg_standard"),
            func.avg(
                case(
                    (
                        and_(
                            ProductionSchedule.actual_start.isnot(None),
                            ProductionSchedule.actual_end.isnot(None),
                        ),
                        func.extract('epoch', ProductionSchedule.actual_end - ProductionSchedule.actual_start) / 3600.0
                    ),
                    else_=None
                )
            ).label("avg_actual"),
        ).where(
            and_(
                ProductionSchedule.tenant_id == tenant_id,
                ProductionSchedule.scheduled_duration_hours.isnot(None),
                ProductionSchedule.actual_start.isnot(None),
                ProductionSchedule.actual_end.isnot(None),
            )
        )
        performance_result = await session.execute(performance_query)
        perf_row = performance_result.first()
        
        if not perf_row or not perf_row.avg_standard or not perf_row.avg_actual or perf_row.avg_actual == 0:
            return None
        
        performance = min(100.0, (float(perf_row.avg_standard) / float(perf_row.avg_actual)) * 100.0)
        
        # Se performance < 70%, recomendar Standard Work
        if performance < 70.0:
            return {
                "priority": 2,
                "category": "PERFORMANCE",
                "title": "Standard Work",
                "description": f"Standardizar processos de Laminagem + Preparação de Molde para melhorar taxa de desempenho de {performance:.1f}%.",
                "impact_metric": "performance",
                "impact_value": performance,
                "affected_phases": ["Laminagem", "Preparação de Molde"],
                "suggested_actions": [
                    "Documentar procedimentos padrão para Laminagem",
                    "Criar checklist de Preparação de Molde",
                    "Implementar treino para operadores",
                ],
                "data_evidence": {
                    "avg_standard_time": float(perf_row.avg_standard),
                    "avg_actual_time": float(perf_row.avg_actual),
                    "performance": performance,
                },
                "origins": ["SYSTEM_DATA", "BEST_PRACTICE"],
                "confidence": "MEDIUM_HIGH",
                "limitations": [
                    "Performance calculada a partir de tempo padrão vs real médio",
                    "Não considera variações sazonais ou contextuais",
                ],
                "next_steps": ["RUNBOOK", "INSTRUMENTATION"],
            }
        
        return None
        
    except Exception as e:
        logger.warning(f"Erro ao analisar performance: {e}")
        return None


async def _analyze_maintenance_needs(
    session: AsyncSession,
    tenant_id: UUID,
) -> Optional[Dict[str, Any]]:
    """Analisar necessidades de manutenção."""
    try:
        # Por enquanto, retornar recomendação genérica baseada em problemas comuns
        # TODO: Analisar erros específicos relacionados com moldes quando tabela de erros existir
        
        return {
            "priority": 3,
            "category": "MAINTENANCE",
            "title": "Manutenção Moldes",
            "description": 'Agendar inspeção/polimento regular de moldes para resolver issues de "Molde baço" e "Molde com deformações".',
            "impact_metric": "quality",
            "impact_value": 0.0,  # Será preenchido quando houver dados de erros
            "affected_phases": ["Preparação de Molde", "Laminagem"],
            "suggested_actions": [
                "Criar calendário de manutenção preventiva de moldes",
                "Implementar checklist de inspeção visual",
                "Documentar histórico de problemas por molde",
            ],
            "data_evidence": {
                "note": "Recomendação baseada em problemas comuns reportados",
            },
            "origins": ["BEST_PRACTICE", "DATA_GAP"],
            "confidence": "LOW",
            "limitations": [
                "Sem evidência direta por fase/ativo, recomendação baseada em heurística e boas práticas",
                "Não há dados de erros específicos relacionados com moldes na base de dados",
                "Recomendação genérica baseada em conhecimento de domínio",
            ],
            "next_steps": ["INSTRUMENTATION", "ANALYSIS"],
        }
        
    except Exception as e:
        logger.warning(f"Erro ao analisar manutenção: {e}")
        return None

