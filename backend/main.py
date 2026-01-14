"""
FastAPI Backend for ProdPlan API.
Provides paginated access to Orders, Errors, and Allocations.
"""

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import math

from database import (
    init_database,
    get_orders, get_orders_stats,
    get_errors, get_errors_stats,
    get_allocations, get_allocations_stats
)

# Initialize FastAPI app
app = FastAPI(
    title="ProdPlan API",
    description="API for Production Orders, Errors, and Allocations with pagination",
    version="2.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    init_database()


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "ProdPlan API v2.0 - Orders, Errors, Allocations"}


# =========================================================================
# ORDERS ENDPOINTS
# =========================================================================

@app.get("/api/orders")
async def list_orders(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    pageSize: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status: ALL, IN_PROGRESS, COMPLETED"),
    search: Optional[str] = Query(None, description="Search in product name, order ID, or phase"),
    productType: Optional[str] = Query(None, description="Filter by product type: K1, K2, K4, C1, C2, C4, Other"),
    sortBy: str = Query("createdDate", description="Sort field: createdDate, productName, status, id"),
    sortOrder: str = Query("desc", description="Sort order: asc, desc")
):
    """Get paginated list of production orders."""
    orders, total = get_orders(
        page=page,
        page_size=pageSize,
        status=status,
        search=search,
        product_type=productType,
        sort_by=sortBy,
        sort_order=sortOrder
    )
    
    total_pages = math.ceil(total / pageSize) if pageSize > 0 else 0
    
    return {
        "data": orders,
        "total": total,
        "page": page,
        "pageSize": pageSize,
        "totalPages": total_pages,
        "hasNextPage": page < total_pages,
        "hasPreviousPage": page > 1
    }


@app.get("/api/orders/stats")
async def orders_stats():
    """Get aggregate statistics for all orders."""
    return get_orders_stats()


@app.get("/api/orders/{order_id}")
async def get_order(order_id: int):
    """Get a single order by ID."""
    orders, _ = get_orders(page=1, page_size=1, search=str(order_id))
    if orders and orders[0]["id"] == str(order_id):
        return orders[0]
    return {"error": "Order not found"}, 404


# =========================================================================
# ERRORS ENDPOINTS
# =========================================================================

@app.get("/api/errors")
async def list_errors(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    pageSize: int = Query(20, ge=1, le=100, description="Items per page"),
    severity: Optional[int] = Query(None, description="Filter by severity: 1 (Minor), 2 (Major), 3 (Critical)"),
    phase: Optional[str] = Query(None, description="Filter by phase name"),
    search: Optional[str] = Query(None, description="Search in description or order ID"),
    sortBy: str = Query("errorDate", description="Sort field: errorDate, severity, description, id"),
    sortOrder: str = Query("desc", description="Sort order: asc, desc")
):
    """Get paginated list of production errors."""
    errors, total = get_errors(
        page=page,
        page_size=pageSize,
        severity=severity,
        phase=phase,
        search=search,
        sort_by=sortBy,
        sort_order=sortOrder
    )
    
    total_pages = math.ceil(total / pageSize) if pageSize > 0 else 0
    
    return {
        "data": errors,
        "total": total,
        "page": page,
        "pageSize": pageSize,
        "totalPages": total_pages,
        "hasNextPage": page < total_pages,
        "hasPreviousPage": page > 1
    }


@app.get("/api/errors/stats")
async def errors_stats():
    """Get aggregate statistics for all errors."""
    return get_errors_stats()


# =========================================================================
# ALLOCATIONS ENDPOINTS
# =========================================================================

@app.get("/api/allocations")
async def list_allocations(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    pageSize: int = Query(20, ge=1, le=100, description="Items per page"),
    employeeId: Optional[int] = Query(None, description="Filter by employee ID"),
    phase: Optional[str] = Query(None, description="Filter by phase name"),
    isLeader: Optional[bool] = Query(None, description="Filter by leader status"),
    search: Optional[str] = Query(None, description="Search in employee name, phase, or order ID"),
    sortBy: str = Query("startDate", description="Sort field: startDate, employeeName, phaseName, id"),
    sortOrder: str = Query("desc", description="Sort order: asc, desc")
):
    """Get paginated list of employee allocations."""
    allocations, total = get_allocations(
        page=page,
        page_size=pageSize,
        employee_id=employeeId,
        phase=phase,
        is_leader=isLeader,
        search=search,
        sort_by=sortBy,
        sort_order=sortOrder
    )
    
    total_pages = math.ceil(total / pageSize) if pageSize > 0 else 0
    
    return {
        "data": allocations,
        "total": total,
        "page": page,
        "pageSize": pageSize,
        "totalPages": total_pages,
        "hasNextPage": page < total_pages,
        "hasPreviousPage": page > 1
    }


@app.get("/api/allocations/stats")
async def allocations_stats():
    """Get aggregate statistics for all allocations."""
    return get_allocations_stats()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
