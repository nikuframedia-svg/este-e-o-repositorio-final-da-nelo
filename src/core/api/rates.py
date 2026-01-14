"""
ProdPlan ONE - Rates API
=========================

REST endpoints for rate configuration.
"""

from datetime import date
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.shared.database import get_session
from src.core.services.configuration_service import ConfigurationService
from .schemas import (
    LaborRateCreate, LaborRateResponse,
    MachineRateCreate, MachineRateResponse,
    OverheadRateCreate, OverheadRateResponse,
)

router = APIRouter(prefix="/config", tags=["Configuration"])


def get_tenant_id(x_tenant_id: UUID = Header(...)) -> UUID:
    """Extract tenant ID from header."""
    return x_tenant_id


# ═══════════════════════════════════════════════════════════════════════════════
# LABOR RATES
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/labor-rates", response_model=LaborRateResponse, status_code=status.HTTP_201_CREATED)
async def create_labor_rate(
    data: LaborRateCreate,
    tenant_id: UUID = Depends(get_tenant_id),
    session: AsyncSession = Depends(get_session),
):
    """Set labor rate for an employee."""
    service = ConfigurationService(session, tenant_id)
    
    rate = await service.set_labor_rate(
        employee_id=data.employee_id,
        base_hourly_rate=data.base_hourly_rate,
        burden_rate=data.burden_rate,
        effective_date=data.effective_date,
        valid_until=data.valid_until,
    )
    
    return rate


@router.get("/labor-rates/{employee_id}", response_model=LaborRateResponse)
async def get_labor_rate(
    employee_id: UUID,
    as_of_date: Optional[date] = None,
    tenant_id: UUID = Depends(get_tenant_id),
    session: AsyncSession = Depends(get_session),
):
    """Get effective labor rate for an employee."""
    service = ConfigurationService(session, tenant_id)
    
    rate = await service.get_labor_rate(employee_id, as_of_date)
    
    if not rate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No labor rate found for employee {employee_id}",
        )
    
    return rate


# ═══════════════════════════════════════════════════════════════════════════════
# MACHINE RATES
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/machine-rates", response_model=MachineRateResponse, status_code=status.HTTP_201_CREATED)
async def create_machine_rate(
    data: MachineRateCreate,
    tenant_id: UUID = Depends(get_tenant_id),
    session: AsyncSession = Depends(get_session),
):
    """Set machine rate."""
    service = ConfigurationService(session, tenant_id)
    
    rate = await service.set_machine_rate(
        machine_id=data.machine_id,
        depreciation_rate=data.depreciation_rate,
        energy_cost_per_hour=data.energy_cost_per_hour,
        maintenance_cost_per_hour=data.maintenance_cost_per_hour,
        effective_date=data.effective_date,
        valid_until=data.valid_until,
    )
    
    return rate


@router.get("/machine-rates/{machine_id}", response_model=MachineRateResponse)
async def get_machine_rate(
    machine_id: UUID,
    as_of_date: Optional[date] = None,
    tenant_id: UUID = Depends(get_tenant_id),
    session: AsyncSession = Depends(get_session),
):
    """Get effective machine rate."""
    service = ConfigurationService(session, tenant_id)
    
    rate = await service.get_machine_rate(machine_id, as_of_date)
    
    if not rate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No machine rate found for machine {machine_id}",
        )
    
    return rate


# ═══════════════════════════════════════════════════════════════════════════════
# OVERHEAD RATES
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/overhead-rates", response_model=OverheadRateResponse, status_code=status.HTTP_201_CREATED)
async def create_overhead_rate(
    data: OverheadRateCreate,
    tenant_id: UUID = Depends(get_tenant_id),
    session: AsyncSession = Depends(get_session),
):
    """Set overhead rate for a month."""
    service = ConfigurationService(session, tenant_id)
    
    rate = await service.set_overhead_rate(
        year_month=data.year_month,
        rent_amount=data.rent_amount,
        utilities_amount=data.utilities_amount,
        management_amount=data.management_amount,
        other_overhead_amount=data.other_overhead_amount,
        total_available_hours=data.total_available_hours,
    )
    
    return rate


@router.get("/overhead-rates/{year_month}", response_model=OverheadRateResponse)
async def get_overhead_rate(
    year_month: date,
    tenant_id: UUID = Depends(get_tenant_id),
    session: AsyncSession = Depends(get_session),
):
    """Get overhead rate for a month."""
    service = ConfigurationService(session, tenant_id)
    
    rate = await service.get_overhead_rate(year_month)
    
    if not rate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No overhead rate found for {year_month}",
        )
    
    return rate

