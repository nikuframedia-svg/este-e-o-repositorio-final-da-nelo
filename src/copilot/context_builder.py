"""
ProdPlan ONE - COPILOT Context Builder
=======================================

Constrói context_facts estruturado a partir da base de dados.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from uuid import UUID

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.shared.auth.rbac import Role

logger = logging.getLogger(__name__)


async def build_context_facts(
    session: AsyncSession,
    tenant_id: UUID,
    context_window_hours: int,
    user_role: str,
    kpi_snapshot: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Construir context_facts estruturado.
    
    Args:
        session: Database session
        tenant_id: Tenant ID
        context_window_hours: Janela temporal (horas)
        user_role: Role do utilizador (para redação)
        kpi_snapshot: Snapshot de KPIs (opcional, se fornecido usa valores reais)
    
    Returns:
        Dict com context_facts estruturado
    """
    has_hr_role = user_role in (Role.HR_MANAGER.value, Role.ADMIN_PLATFORM.value)
    
    # Calcular data de início
    window_start = datetime.utcnow() - timedelta(hours=context_window_hours)
    
    context = {
        "operational_snapshot": await _build_operational_snapshot(
            session, tenant_id, window_start, has_hr_role, kpi_snapshot=kpi_snapshot
        ),
        "quality": await _build_quality_snapshot(session, tenant_id, window_start),
        "plan_history": await _build_plan_history(session, tenant_id),
        "trust_index": await _calculate_trust_index(session, tenant_id),
    }
    
    return context


async def _build_operational_snapshot(
    session: AsyncSession,
    tenant_id: UUID,
    window_start: datetime,
    has_hr_role: bool,
    kpi_snapshot: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Construir snapshot operacional."""
    # Se kpi_snapshot fornecido, usar valores reais
    if kpi_snapshot:
        oee_value = kpi_snapshot.get("oee", {}).get("value") if isinstance(kpi_snapshot.get("oee"), dict) else None
        availability_value = kpi_snapshot.get("availability", {}).get("value") if isinstance(kpi_snapshot.get("availability"), dict) else None
        performance_value = kpi_snapshot.get("performance", {}).get("value") if isinstance(kpi_snapshot.get("performance"), dict) else None
        quality_fpy_value = kpi_snapshot.get("quality_fpy", {}).get("value") if isinstance(kpi_snapshot.get("quality_fpy"), dict) else None
        rework_rate_value = kpi_snapshot.get("rework_rate", {}).get("value") if isinstance(kpi_snapshot.get("rework_rate"), dict) else None
        orders_total_value = kpi_snapshot.get("orders_total", {}).get("value") if isinstance(kpi_snapshot.get("orders_total"), dict) else None
        orders_in_progress_value = kpi_snapshot.get("orders_in_progress", {}).get("value") if isinstance(kpi_snapshot.get("orders_in_progress"), dict) else None
        orders_completed_value = kpi_snapshot.get("orders_completed", {}).get("value") if isinstance(kpi_snapshot.get("orders_completed"), dict) else None
        
        has_data = any(v is not None for v in [oee_value, availability_value, performance_value, quality_fpy_value, rework_rate_value, orders_total_value])
        
        snapshot = {
            "orders_total": int(orders_total_value) if orders_total_value is not None else 0,
            "orders_in_progress": int(orders_in_progress_value) if orders_in_progress_value is not None else 0,
            "orders_completed": int(orders_completed_value) if orders_completed_value is not None else 0,
            "rework_rate": float(rework_rate_value) if rework_rate_value is not None else 0.0,
            "fpy": float(quality_fpy_value) if quality_fpy_value is not None else 0.0,
            "oee": float(oee_value) if oee_value is not None else None,
            "availability": float(availability_value) if availability_value is not None else None,
            "performance": float(performance_value) if performance_value is not None else None,
            "quality": float(quality_fpy_value) if quality_fpy_value is not None else None,
            "top_phases_by_wip": [],
            "allocations": {
                "top_phases": [],
                "top_employees": [],  # Mascarado se não HR role
            },
            "standard_times": {
                "avg_labor_hours": 0.0,
                "avg_machine_hours": 0.0,
            },
            "has_data": has_data,
            "data_status": "DATA_AVAILABLE" if has_data else "NO_DATA_AVAILABLE",
        }
    else:
        # Sem kpi_snapshot, retornar estrutura vazia
        snapshot = {
            "orders_total": 0,
            "orders_in_progress": 0,
            "orders_completed": 0,
            "rework_rate": 0.0,
            "fpy": 0.0,
            "oee": None,
            "availability": None,
            "performance": None,
            "quality": None,
            "top_phases_by_wip": [],
            "allocations": {
                "top_phases": [],
                "top_employees": [],
            },
            "standard_times": {
                "avg_labor_hours": 0.0,
                "avg_machine_hours": 0.0,
            },
            "has_data": False,
            "data_status": "NO_DATA_AVAILABLE",
        }
    
    return snapshot


async def _build_quality_snapshot(
    session: AsyncSession,
    tenant_id: UUID,
    window_start: datetime,
) -> Dict[str, Any]:
    """Construir snapshot de qualidade."""
    # TODO: Query tabela errors quando existir
    
    return {
        "minor_errors": 0,
        "major_errors": 0,
        "critical_errors": 0,
    }


async def _build_plan_history(
    session: AsyncSession,
    tenant_id: UUID,
) -> Dict[str, Any]:
    """Construir histórico de planeamento."""
    # TODO: Query tabela schedules quando existir
    
    return {
        "has_history": False,
        "recent_diffs": "NO_PLAN_HISTORY",
    }


async def _calculate_trust_index(
    session: AsyncSession,
    tenant_id: UUID,
) -> Dict[str, Any]:
    """
    Calcular trust index baseado em:
    - data_freshness: frescura dos dados
    - integrity: invariantes (total = progress + completed)
    - completeness: % de campos não-null
    """
    # Placeholder - implementar cálculo real
    return {
        "value": 0.85,  # Placeholder
        "factors": {
            "data_freshness": 0.90,
            "integrity": 0.85,
            "completeness": 0.80,
        },
    }


