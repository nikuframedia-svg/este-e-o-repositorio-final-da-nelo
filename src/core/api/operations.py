"""
ProdPlan ONE - Operations API
==============================

REST endpoints for operation management.
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.shared.database import get_session
from src.core.services.master_data_service import MasterDataService
from .schemas import OperationCreate, OperationResponse

router = APIRouter(prefix="/operations", tags=["Operations"])


def get_tenant_id(x_tenant_id: UUID = Header(...)) -> UUID:
    """Extract tenant ID from header."""
    return x_tenant_id


@router.post("", response_model=OperationResponse, status_code=status.HTTP_201_CREATED)
async def create_operation(
    data: OperationCreate,
    tenant_id: UUID = Depends(get_tenant_id),
    session: AsyncSession = Depends(get_session),
):
    """Create a new operation."""
    service = MasterDataService(session, tenant_id)
    
    operation = await service.create_operation(
        operation_code=data.operation_code,
        operation_name=data.operation_name,
        machine_id=data.machine_id,
        std_time_minutes=data.std_time_minutes,
        setup_time_minutes=data.setup_time_minutes,
        skills_required=data.skills_required,
    )
    
    return operation


@router.get("", response_model=List[OperationResponse])
async def list_operations(
    machine_id: UUID = None,
    limit: int = 100,
    offset: int = 0,
    tenant_id: UUID = Depends(get_tenant_id),
    session: AsyncSession = Depends(get_session),
):
    """List operations with optional filtering."""
    service = MasterDataService(session, tenant_id)
    operations = await service.list_operations(
        machine_id=machine_id,
        limit=limit,
        offset=offset,
    )
    return operations


@router.get("/{operation_id}", response_model=OperationResponse)
async def get_operation(
    operation_id: UUID,
    tenant_id: UUID = Depends(get_tenant_id),
    session: AsyncSession = Depends(get_session),
):
    """Get operation by ID."""
    service = MasterDataService(session, tenant_id)
    operation = await service.get_operation(operation_id)
    
    if not operation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Operation {operation_id} not found",
        )
    
    return operation

