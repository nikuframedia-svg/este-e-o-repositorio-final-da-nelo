"""
ProdPlan ONE - Employees API
=============================

REST endpoints for employee management.
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.shared.database import get_session
from src.core.models.employee import EmploymentStatus
from src.core.services.master_data_service import MasterDataService
from .schemas import EmployeeCreate, EmployeeUpdate, EmployeeResponse

router = APIRouter(prefix="/employees", tags=["Employees"])


def get_tenant_id(x_tenant_id: UUID = Header(...)) -> UUID:
    """Extract tenant ID from header."""
    return x_tenant_id


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    data: EmployeeCreate,
    tenant_id: UUID = Depends(get_tenant_id),
    session: AsyncSession = Depends(get_session),
):
    """Create a new employee."""
    service = MasterDataService(session, tenant_id)
    
    employee = await service.create_employee(
        employee_code=data.employee_code,
        employee_name=data.employee_name,
        hire_date=data.hire_date,
        department=data.department,
        base_monthly_salary=data.base_monthly_salary,
        burden_rate=data.burden_rate,
    )
    
    return employee


@router.get("", response_model=List[EmployeeResponse])
async def list_employees(
    status: EmploymentStatus = None,
    department: str = None,
    limit: int = 100,
    offset: int = 0,
    tenant_id: UUID = Depends(get_tenant_id),
    session: AsyncSession = Depends(get_session),
):
    """List employees with optional filtering."""
    service = MasterDataService(session, tenant_id)
    employees = await service.list_employees(
        status=status,
        department=department,
        limit=limit,
        offset=offset,
    )
    return employees


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: UUID,
    tenant_id: UUID = Depends(get_tenant_id),
    session: AsyncSession = Depends(get_session),
):
    """Get employee by ID."""
    service = MasterDataService(session, tenant_id)
    employee = await service.get_employee(employee_id)
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee {employee_id} not found",
        )
    
    return employee

