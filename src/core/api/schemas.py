"""
ProdPlan ONE - CORE API Schemas
================================

Pydantic schemas for request/response validation.
"""

from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict

from src.core.models.tenant import TenantStatus, SubscriptionLevel
from src.core.models.product import ProductType, ProductStatus
from src.core.models.machine import MachineStatus, MachineType
from src.core.models.employee import EmploymentStatus, EmploymentType


# ═══════════════════════════════════════════════════════════════════════════════
# TENANT SCHEMAS
# ═══════════════════════════════════════════════════════════════════════════════

class TenantCreate(BaseModel):
    """Create tenant request."""
    tenant_name: str = Field(..., min_length=1, max_length=255)
    tenant_code: str = Field(..., min_length=2, max_length=50)
    subscription_level: SubscriptionLevel = SubscriptionLevel.STARTER
    contact_email: Optional[str] = None
    currency_code: str = Field(default="EUR", max_length=3)
    timezone: str = Field(default="UTC", max_length=50)


class TenantUpdate(BaseModel):
    """Update tenant request."""
    tenant_name: Optional[str] = Field(None, max_length=255)
    contact_email: Optional[str] = None
    currency_code: Optional[str] = Field(None, max_length=3)
    timezone: Optional[str] = Field(None, max_length=50)


class TenantResponse(BaseModel):
    """Tenant response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    tenant_name: str
    tenant_code: str
    status: TenantStatus
    subscription_level: SubscriptionLevel
    contact_email: Optional[str]
    currency_code: str
    timezone: str
    created_at: datetime
    updated_at: datetime


# ═══════════════════════════════════════════════════════════════════════════════
# PRODUCT SCHEMAS
# ═══════════════════════════════════════════════════════════════════════════════

class ProductCreate(BaseModel):
    """Create product request."""
    product_code: str = Field(..., min_length=1, max_length=50)
    product_name: str = Field(..., min_length=1, max_length=255)
    product_type: ProductType = ProductType.FINISHED_GOOD
    category: Optional[str] = Field(None, max_length=100)
    lead_time_days: int = Field(default=7, ge=0)
    standard_cost: Optional[Decimal] = Field(None, ge=0)


class ProductUpdate(BaseModel):
    """Update product request."""
    product_name: Optional[str] = Field(None, max_length=255)
    category: Optional[str] = Field(None, max_length=100)
    lead_time_days: Optional[int] = Field(None, ge=0)
    standard_cost: Optional[Decimal] = Field(None, ge=0)
    status: Optional[ProductStatus] = None


class ProductResponse(BaseModel):
    """Product response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    product_code: str
    product_name: str
    product_type: ProductType
    category: Optional[str]
    status: ProductStatus
    lead_time_days: int
    standard_cost: Optional[Decimal]
    created_at: datetime
    updated_at: datetime


# ═══════════════════════════════════════════════════════════════════════════════
# MACHINE SCHEMAS
# ═══════════════════════════════════════════════════════════════════════════════

class MachineCreate(BaseModel):
    """Create machine request."""
    machine_code: str = Field(..., min_length=1, max_length=50)
    machine_name: str = Field(..., min_length=1, max_length=255)
    machine_type: MachineType = MachineType.OTHER
    location: Optional[str] = Field(None, max_length=100)
    capacity_units_per_hour: Optional[int] = Field(None, ge=0)
    available_hours_per_day: Decimal = Field(default=Decimal("8.0"), ge=0)


class MachineUpdate(BaseModel):
    """Update machine request."""
    machine_name: Optional[str] = Field(None, max_length=255)
    location: Optional[str] = Field(None, max_length=100)
    capacity_units_per_hour: Optional[int] = Field(None, ge=0)
    status: Optional[MachineStatus] = None


class MachineResponse(BaseModel):
    """Machine response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    machine_code: str
    machine_name: str
    machine_type: MachineType
    status: MachineStatus
    location: Optional[str]
    capacity_units_per_hour: Optional[int]
    available_hours_per_day: Decimal
    created_at: datetime
    updated_at: datetime


# ═══════════════════════════════════════════════════════════════════════════════
# EMPLOYEE SCHEMAS
# ═══════════════════════════════════════════════════════════════════════════════

class EmployeeCreate(BaseModel):
    """Create employee request."""
    employee_code: str = Field(..., min_length=1, max_length=50)
    employee_name: str = Field(..., min_length=1, max_length=255)
    hire_date: date
    department: Optional[str] = Field(None, max_length=100)
    job_title: Optional[str] = Field(None, max_length=100)
    base_monthly_salary: Decimal = Field(default=Decimal("0"), ge=0)
    burden_rate: Decimal = Field(default=Decimal("0.32"), ge=0, le=1)


class EmployeeUpdate(BaseModel):
    """Update employee request."""
    employee_name: Optional[str] = Field(None, max_length=255)
    department: Optional[str] = Field(None, max_length=100)
    job_title: Optional[str] = Field(None, max_length=100)
    base_monthly_salary: Optional[Decimal] = Field(None, ge=0)
    status: Optional[EmploymentStatus] = None


class EmployeeResponse(BaseModel):
    """Employee response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    employee_code: str
    employee_name: str
    status: EmploymentStatus
    department: Optional[str]
    job_title: Optional[str]
    hire_date: date
    base_monthly_salary: Decimal
    burden_rate: Decimal
    hourly_loaded_rate: Decimal
    created_at: datetime
    updated_at: datetime


# ═══════════════════════════════════════════════════════════════════════════════
# OPERATION SCHEMAS
# ═══════════════════════════════════════════════════════════════════════════════

class OperationCreate(BaseModel):
    """Create operation request."""
    operation_code: str = Field(..., min_length=1, max_length=50)
    operation_name: str = Field(..., min_length=1, max_length=255)
    machine_id: Optional[UUID] = None
    std_time_minutes: Decimal = Field(default=Decimal("0"), ge=0)
    setup_time_minutes: Decimal = Field(default=Decimal("0"), ge=0)
    skills_required: Optional[List[str]] = None


class OperationResponse(BaseModel):
    """Operation response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    operation_code: str
    operation_name: str
    machine_id: Optional[UUID]
    std_time_minutes: Decimal
    std_time_hours: Decimal
    setup_time_minutes: Decimal
    created_at: datetime
    updated_at: datetime


# ═══════════════════════════════════════════════════════════════════════════════
# RATE SCHEMAS
# ═══════════════════════════════════════════════════════════════════════════════

class LaborRateCreate(BaseModel):
    """Create labor rate request."""
    employee_id: UUID
    base_hourly_rate: Decimal = Field(..., ge=0)
    burden_rate: Decimal = Field(default=Decimal("0.32"), ge=0, le=1)
    effective_date: date
    valid_until: Optional[date] = None


class LaborRateResponse(BaseModel):
    """Labor rate response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    employee_id: UUID
    base_hourly_rate: Decimal
    burden_rate: Decimal
    loaded_rate: Decimal
    effective_date: date
    valid_until: Optional[date]
    currency_code: str


class MachineRateCreate(BaseModel):
    """Create machine rate request."""
    machine_id: UUID
    depreciation_rate: Decimal = Field(default=Decimal("0"), ge=0)
    energy_cost_per_hour: Decimal = Field(default=Decimal("0"), ge=0)
    maintenance_cost_per_hour: Decimal = Field(default=Decimal("0"), ge=0)
    effective_date: date
    valid_until: Optional[date] = None


class MachineRateResponse(BaseModel):
    """Machine rate response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    machine_id: UUID
    depreciation_rate: Decimal
    energy_cost_per_hour: Decimal
    maintenance_cost_per_hour: Decimal
    total_rate: Decimal
    effective_date: date
    valid_until: Optional[date]
    currency_code: str


class OverheadRateCreate(BaseModel):
    """Create overhead rate request."""
    year_month: date
    rent_amount: Decimal = Field(default=Decimal("0"), ge=0)
    utilities_amount: Decimal = Field(default=Decimal("0"), ge=0)
    management_amount: Decimal = Field(default=Decimal("0"), ge=0)
    other_overhead_amount: Decimal = Field(default=Decimal("0"), ge=0)
    total_available_hours: int = Field(..., gt=0)


class OverheadRateResponse(BaseModel):
    """Overhead rate response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    year_month: date
    total_monthly_overhead: Decimal
    total_available_hours: int
    calculated_rate: Decimal
    currency_code: str


# ═══════════════════════════════════════════════════════════════════════════════
# COMMON SCHEMAS
# ═══════════════════════════════════════════════════════════════════════════════

class PaginatedResponse(BaseModel):
    """Paginated list response."""
    items: List
    total: int
    limit: int
    offset: int


class ErrorResponse(BaseModel):
    """Error response."""
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None

