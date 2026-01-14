"""
ProdPlan ONE - Machines API
============================

REST endpoints for machine management.
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.shared.database import get_session
from src.core.models.machine import MachineStatus
from src.core.services.master_data_service import MasterDataService
from .schemas import MachineCreate, MachineUpdate, MachineResponse

router = APIRouter(prefix="/machines", tags=["Machines"])


def get_tenant_id(x_tenant_id: UUID = Header(...)) -> UUID:
    """Extract tenant ID from header."""
    return x_tenant_id


@router.post("", response_model=MachineResponse, status_code=status.HTTP_201_CREATED)
async def create_machine(
    data: MachineCreate,
    tenant_id: UUID = Depends(get_tenant_id),
    session: AsyncSession = Depends(get_session),
):
    """Create a new machine."""
    service = MasterDataService(session, tenant_id)
    
    machine = await service.create_machine(
        machine_code=data.machine_code,
        machine_name=data.machine_name,
        location=data.location,
        capacity_units_per_hour=data.capacity_units_per_hour,
        available_hours_per_day=data.available_hours_per_day,
    )
    
    return machine


@router.get("", response_model=List[MachineResponse])
async def list_machines(
    status: MachineStatus = None,
    location: str = None,
    limit: int = 100,
    offset: int = 0,
    tenant_id: UUID = Depends(get_tenant_id),
    session: AsyncSession = Depends(get_session),
):
    """List machines with optional filtering."""
    service = MasterDataService(session, tenant_id)
    machines = await service.list_machines(
        status=status,
        location=location,
        limit=limit,
        offset=offset,
    )
    return machines


@router.get("/{machine_id}", response_model=MachineResponse)
async def get_machine(
    machine_id: UUID,
    tenant_id: UUID = Depends(get_tenant_id),
    session: AsyncSession = Depends(get_session),
):
    """Get machine by ID."""
    service = MasterDataService(session, tenant_id)
    machine = await service.get_machine(machine_id)
    
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine {machine_id} not found",
        )
    
    return machine

