"""
ProdPlan ONE - Productivity API
================================
"""

from datetime import date
from decimal import Decimal
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.shared.database import get_session
from src.hr.services.productivity_service import ProductivityService

router = APIRouter(prefix="/productivity", tags=["Productivity"])


def get_tenant_id(x_tenant_id: UUID = Header(...)) -> UUID:
    return x_tenant_id


class ProductivityRecordRequest(BaseModel):
    """Productivity record request."""
    employee_id: UUID
    operation_id: UUID
    order_id: str
    record_date: date
    standard_hours: Decimal
    actual_hours: Decimal
    standard_quantity: Decimal
    actual_quantity: Decimal
    good_quantity: Decimal


@router.post("/record")
async def record_productivity(
    request: ProductivityRecordRequest,
    tenant_id: UUID = Depends(get_tenant_id),
    session: AsyncSession = Depends(get_session),
):
    """Record productivity."""
    service = ProductivityService(session, tenant_id)
    
    record = await service.record_productivity(
        employee_id=request.employee_id,
        operation_id=request.operation_id,
        order_id=request.order_id,
        record_date=request.record_date,
        standard_hours=request.standard_hours,
        actual_hours=request.actual_hours,
        standard_quantity=request.standard_quantity,
        actual_quantity=request.actual_quantity,
        good_quantity=request.good_quantity,
    )
    
    return {
        "id": str(record.id),
        "employee_id": str(record.employee_id),
        "efficiency_percent": float(record.efficiency_percent),
        "quality_percent": float(record.quality_percent),
        "bonus_eligible": record.bonus_eligible,
    }


@router.get("/employee/{employee_id}")
async def get_employee_productivity(
    employee_id: UUID,
    from_date: date = None,
    to_date: date = None,
    tenant_id: UUID = Depends(get_tenant_id),
    session: AsyncSession = Depends(get_session),
):
    """Get productivity for an employee."""
    service = ProductivityService(session, tenant_id)
    
    result = await service.get_employee_productivity(
        employee_id=employee_id,
        from_date=from_date,
        to_date=to_date,
    )
    
    return result


@router.get("/orders/{order_id}")
async def get_order_productivity(
    order_id: str,
    tenant_id: UUID = Depends(get_tenant_id),
    session: AsyncSession = Depends(get_session),
):
    """Get productivity for an order."""
    service = ProductivityService(session, tenant_id)
    
    result = await service.get_order_productivity(order_id=order_id)
    
    return result

