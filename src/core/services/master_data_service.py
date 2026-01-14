"""
ProdPlan ONE - Master Data Service
====================================

Business logic for master data management (products, machines, employees, operations).
"""

from datetime import date
from decimal import Decimal
from typing import List, Optional, TypeVar, Generic, Type
from uuid import UUID

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.models.product import Product, ProductType, ProductStatus
from src.core.models.machine import Machine, MachineStatus
from src.core.models.employee import Employee, EmploymentStatus
from src.core.models.operation import Operation
from src.core.models.bom import BOMItem
from src.core.models.partner import Customer, Supplier
from src.shared.database import TenantBase
from src.shared.kafka_client import publish_event, Topics
from src.shared.events import MasterDataLoadedEvent

T = TypeVar("T", bound=TenantBase)


class BaseCRUDService(Generic[T]):
    """Base CRUD service for tenant-scoped entities."""
    
    def __init__(self, session: AsyncSession, tenant_id: UUID, model_class: Type[T]):
        self.session = session
        self.tenant_id = tenant_id
        self.model_class = model_class
    
    async def get(self, entity_id: UUID) -> Optional[T]:
        """Get entity by ID."""
        result = await self.session.execute(
            select(self.model_class).where(
                and_(
                    self.model_class.id == entity_id,
                    self.model_class.tenant_id == self.tenant_id,
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def list(
        self,
        limit: int = 100,
        offset: int = 0,
        **filters,
    ) -> List[T]:
        """List entities with filtering."""
        query = select(self.model_class).where(
            self.model_class.tenant_id == self.tenant_id
        )
        
        for field, value in filters.items():
            if hasattr(self.model_class, field) and value is not None:
                query = query.where(getattr(self.model_class, field) == value)
        
        query = query.limit(limit).offset(offset)
        result = await self.session.execute(query)
        return list(result.scalars().all())
    
    async def create(self, entity: T) -> T:
        """Create entity."""
        entity.tenant_id = self.tenant_id
        self.session.add(entity)
        await self.session.flush()
        return entity
    
    async def delete(self, entity_id: UUID) -> bool:
        """Delete entity."""
        entity = await self.get(entity_id)
        if entity:
            await self.session.delete(entity)
            await self.session.flush()
            return True
        return False


class MasterDataService:
    """
    Service for all master data operations.
    
    Provides typed accessors for each entity type.
    """
    
    def __init__(self, session: AsyncSession, tenant_id: UUID):
        self.session = session
        self.tenant_id = tenant_id
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # PRODUCTS
    # ═══════════════════════════════════════════════════════════════════════════════
    
    async def create_product(
        self,
        product_code: str,
        product_name: str,
        product_type: ProductType = ProductType.FINISHED_GOOD,
        category: Optional[str] = None,
        lead_time_days: int = 7,
        standard_cost: Optional[Decimal] = None,
    ) -> Product:
        """Create a new product."""
        product = Product(
            tenant_id=self.tenant_id,
            product_code=product_code.upper(),
            product_name=product_name,
            product_type=product_type,
            category=category,
            lead_time_days=lead_time_days,
            standard_cost=standard_cost,
            status=ProductStatus.ACTIVE,
        )
        
        self.session.add(product)
        await self.session.flush()
        return product
    
    async def get_product(self, product_id: UUID) -> Optional[Product]:
        """Get product by ID."""
        result = await self.session.execute(
            select(Product).where(
                and_(
                    Product.id == product_id,
                    Product.tenant_id == self.tenant_id,
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def get_product_by_code(self, product_code: str) -> Optional[Product]:
        """Get product by code."""
        result = await self.session.execute(
            select(Product).where(
                and_(
                    Product.product_code == product_code.upper(),
                    Product.tenant_id == self.tenant_id,
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def list_products(
        self,
        product_type: Optional[ProductType] = None,
        status: Optional[ProductStatus] = None,
        category: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Product]:
        """List products with filtering."""
        query = select(Product).where(Product.tenant_id == self.tenant_id)
        
        if product_type:
            query = query.where(Product.product_type == product_type)
        if status:
            query = query.where(Product.status == status)
        if category:
            query = query.where(Product.category == category)
        
        query = query.order_by(Product.product_code).limit(limit).offset(offset)
        result = await self.session.execute(query)
        return list(result.scalars().all())
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # MACHINES
    # ═══════════════════════════════════════════════════════════════════════════════
    
    async def create_machine(
        self,
        machine_code: str,
        machine_name: str,
        location: Optional[str] = None,
        capacity_units_per_hour: Optional[int] = None,
        available_hours_per_day: Decimal = Decimal("8.0"),
    ) -> Machine:
        """Create a new machine."""
        machine = Machine(
            tenant_id=self.tenant_id,
            machine_code=machine_code.upper(),
            machine_name=machine_name,
            location=location,
            capacity_units_per_hour=capacity_units_per_hour,
            available_hours_per_day=available_hours_per_day,
            status=MachineStatus.ACTIVE,
        )
        
        self.session.add(machine)
        await self.session.flush()
        return machine
    
    async def get_machine(self, machine_id: UUID) -> Optional[Machine]:
        """Get machine by ID."""
        result = await self.session.execute(
            select(Machine).where(
                and_(
                    Machine.id == machine_id,
                    Machine.tenant_id == self.tenant_id,
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def list_machines(
        self,
        status: Optional[MachineStatus] = None,
        location: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Machine]:
        """List machines with filtering."""
        query = select(Machine).where(Machine.tenant_id == self.tenant_id)
        
        if status:
            query = query.where(Machine.status == status)
        if location:
            query = query.where(Machine.location == location)
        
        query = query.order_by(Machine.machine_code).limit(limit).offset(offset)
        result = await self.session.execute(query)
        return list(result.scalars().all())
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # EMPLOYEES
    # ═══════════════════════════════════════════════════════════════════════════════
    
    async def create_employee(
        self,
        employee_code: str,
        employee_name: str,
        hire_date: date,
        department: Optional[str] = None,
        base_monthly_salary: Decimal = Decimal("0"),
        burden_rate: Decimal = Decimal("0.32"),
    ) -> Employee:
        """Create a new employee."""
        employee = Employee(
            tenant_id=self.tenant_id,
            employee_code=employee_code.upper(),
            employee_name=employee_name,
            hire_date=hire_date,
            department=department,
            base_monthly_salary=base_monthly_salary,
            burden_rate=burden_rate,
            status=EmploymentStatus.ACTIVE,
        )
        
        self.session.add(employee)
        await self.session.flush()
        return employee
    
    async def get_employee(self, employee_id: UUID) -> Optional[Employee]:
        """Get employee by ID."""
        result = await self.session.execute(
            select(Employee).where(
                and_(
                    Employee.id == employee_id,
                    Employee.tenant_id == self.tenant_id,
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def list_employees(
        self,
        status: Optional[EmploymentStatus] = None,
        department: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Employee]:
        """List employees with filtering."""
        query = select(Employee).where(Employee.tenant_id == self.tenant_id)
        
        if status:
            query = query.where(Employee.status == status)
        if department:
            query = query.where(Employee.department == department)
        
        query = query.order_by(Employee.employee_name).limit(limit).offset(offset)
        result = await self.session.execute(query)
        return list(result.scalars().all())
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # OPERATIONS
    # ═══════════════════════════════════════════════════════════════════════════════
    
    async def create_operation(
        self,
        operation_code: str,
        operation_name: str,
        machine_id: Optional[UUID] = None,
        std_time_minutes: Decimal = Decimal("0"),
        setup_time_minutes: Decimal = Decimal("0"),
        skills_required: Optional[list] = None,
    ) -> Operation:
        """Create a new operation."""
        operation = Operation(
            tenant_id=self.tenant_id,
            operation_code=operation_code.upper(),
            operation_name=operation_name,
            machine_id=machine_id,
            std_time_minutes=std_time_minutes,
            std_time_hours=std_time_minutes / 60,
            setup_time_minutes=setup_time_minutes,
            skills_required={"skills": skills_required or []},
        )
        
        self.session.add(operation)
        await self.session.flush()
        return operation
    
    async def get_operation(self, operation_id: UUID) -> Optional[Operation]:
        """Get operation by ID."""
        result = await self.session.execute(
            select(Operation).where(
                and_(
                    Operation.id == operation_id,
                    Operation.tenant_id == self.tenant_id,
                )
            )
        )
        return result.scalar_one_or_none()
    
    async def list_operations(
        self,
        machine_id: Optional[UUID] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Operation]:
        """List operations with filtering."""
        query = select(Operation).where(Operation.tenant_id == self.tenant_id)
        
        if machine_id:
            query = query.where(Operation.machine_id == machine_id)
        
        query = query.order_by(Operation.operation_code).limit(limit).offset(offset)
        result = await self.session.execute(query)
        return list(result.scalars().all())
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # BOM
    # ═══════════════════════════════════════════════════════════════════════════════
    
    async def add_bom_item(
        self,
        parent_product_id: UUID,
        component_product_id: UUID,
        quantity_per: Decimal,
        sequence: int = 0,
        scrap_factor: Decimal = Decimal("1.0"),
    ) -> BOMItem:
        """Add BOM item."""
        bom_item = BOMItem(
            tenant_id=self.tenant_id,
            parent_product_id=parent_product_id,
            component_product_id=component_product_id,
            quantity_per=quantity_per,
            sequence=sequence,
            scrap_factor=scrap_factor,
        )
        
        self.session.add(bom_item)
        await self.session.flush()
        return bom_item
    
    async def get_bom(self, parent_product_id: UUID) -> List[BOMItem]:
        """Get BOM for a product."""
        result = await self.session.execute(
            select(BOMItem).where(
                and_(
                    BOMItem.parent_product_id == parent_product_id,
                    BOMItem.tenant_id == self.tenant_id,
                )
            ).order_by(BOMItem.sequence)
        )
        return list(result.scalars().all())
    
    # ═══════════════════════════════════════════════════════════════════════════════
    # BULK OPERATIONS
    # ═══════════════════════════════════════════════════════════════════════════════
    
    async def sync_master_data(self, entity_type: str, count: int) -> None:
        """Publish event after master data sync."""
        await publish_event(
            Topics.MASTER_DATA_LOADED,
            MasterDataLoadedEvent(
                tenant_id=self.tenant_id,
                payload={
                    "entity_type": entity_type,
                    "count": count,
                    "sync_type": "incremental",
                },
            ),
        )

