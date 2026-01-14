/**
 * ProdPlan ONE - API Client
 * =========================
 * 
 * Client functions for all backend endpoints.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE MODULE - Master Data
// ═══════════════════════════════════════════════════════════════════════════════

// Products
export const productsApi = {
  list: (params?: { limit?: number; offset?: number; status?: string }) =>
    request<any>(`/v1/core/products?${new URLSearchParams(params as any)}`),
  
  get: (id: string) =>
    request<any>(`/v1/core/products/${id}`),
  
  create: (data: any) =>
    request<any>('/v1/core/products', { method: 'POST', body: JSON.stringify(data) }),
  
  update: (id: string, data: any) =>
    request<any>(`/v1/core/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  
  delete: (id: string) =>
    request<void>(`/v1/core/products/${id}`, { method: 'DELETE' }),
};

// Machines
export const machinesApi = {
  list: (params?: { limit?: number; offset?: number; status?: string }) =>
    request<any>(`/v1/core/machines?${new URLSearchParams(params as any)}`),
  
  get: (id: string) =>
    request<any>(`/v1/core/machines/${id}`),
  
  create: (data: any) =>
    request<any>('/v1/core/machines', { method: 'POST', body: JSON.stringify(data) }),
  
  update: (id: string, data: any) =>
    request<any>(`/v1/core/machines/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  
  delete: (id: string) =>
    request<void>(`/v1/core/machines/${id}`, { method: 'DELETE' }),
};

// Employees
export const employeesApi = {
  list: (params?: { limit?: number; offset?: number; status?: string; department?: string }) =>
    request<any>(`/v1/core/employees?${new URLSearchParams(params as any)}`),
  
  get: (id: string) =>
    request<any>(`/v1/core/employees/${id}`),
  
  create: (data: any) =>
    request<any>('/v1/core/employees', { method: 'POST', body: JSON.stringify(data) }),
  
  update: (id: string, data: any) =>
    request<any>(`/v1/core/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  
  delete: (id: string) =>
    request<void>(`/v1/core/employees/${id}`, { method: 'DELETE' }),
};

// Operations
export const operationsApi = {
  list: (params?: { limit?: number; offset?: number }) =>
    request<any>(`/v1/core/operations?${new URLSearchParams(params as any)}`),
  
  get: (id: string) =>
    request<any>(`/v1/core/operations/${id}`),
  
  create: (data: any) =>
    request<any>('/v1/core/operations', { method: 'POST', body: JSON.stringify(data) }),
  
  update: (id: string, data: any) =>
    request<any>(`/v1/core/operations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  
  delete: (id: string) =>
    request<void>(`/v1/core/operations/${id}`, { method: 'DELETE' }),
};

// Rates
export const ratesApi = {
  // Labor rates
  laborRates: {
    list: () => request<any>('/v1/core/rates/labor'),
    create: (data: any) => request<any>('/v1/core/rates/labor', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  // Machine rates
  machineRates: {
    list: () => request<any>('/v1/core/rates/machine'),
    create: (data: any) => request<any>('/v1/core/rates/machine', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  // Overhead rates
  overheadRates: {
    list: () => request<any>('/v1/core/rates/overhead'),
    create: (data: any) => request<any>('/v1/core/rates/overhead', { method: 'POST', body: JSON.stringify(data) }),
  },
};

// Tenants
export const tenantsApi = {
  list: () => request<any>('/v1/core/tenants'),
  get: (id: string) => request<any>(`/v1/core/tenants/${id}`),
  create: (data: any) => request<any>('/v1/core/tenants', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/v1/core/tenants/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// PLAN MODULE - Production Planning
// ═══════════════════════════════════════════════════════════════════════════════

// Scheduling
export const schedulingApi = {
  list: (params?: { status?: string }) =>
    request<any>(`/v1/plan/schedules?${new URLSearchParams(params as any)}`),
  
  get: (id: string) =>
    request<any>(`/v1/plan/schedules/${id}`),
  
  create: (data: any) =>
    request<any>('/v1/plan/schedules', { method: 'POST', body: JSON.stringify(data) }),
  
  run: (id: string) =>
    request<any>(`/v1/plan/schedules/${id}/run`, { method: 'POST' }),
  
  getTasks: (scheduleId: string) =>
    request<any>(`/v1/plan/schedules/${scheduleId}/tasks`),
};

// MRP
export const mrpApi = {
  list: () =>
    request<any>('/v1/plan/mrp/runs'),
  
  get: (id: string) =>
    request<any>(`/v1/plan/mrp/runs/${id}`),
  
  run: (data: any) =>
    request<any>('/v1/plan/mrp/run', { method: 'POST', body: JSON.stringify(data) }),
  
  getItems: (runId: string) =>
    request<any>(`/v1/plan/mrp/runs/${runId}/items`),
};

// Capacity
export const capacityApi = {
  getUtilization: (params?: { startDate?: string; endDate?: string }) =>
    request<any>(`/v1/plan/capacity/utilization?${new URLSearchParams(params as any)}`),
  
  getBottlenecks: () =>
    request<any>('/v1/plan/capacity/bottlenecks'),
  
  analyze: (data: any) =>
    request<any>('/v1/plan/capacity/analyze', { method: 'POST', body: JSON.stringify(data) }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROFIT MODULE - Cost & Pricing
// ═══════════════════════════════════════════════════════════════════════════════

// COGS
export const cogsApi = {
  calculate: (productId: string, quantity?: number) =>
    request<any>(`/v1/profit/cogs/calculate/${productId}?quantity=${quantity || 1}`),
  
  getBreakdown: (productId: string) =>
    request<any>(`/v1/profit/cogs/breakdown/${productId}`),
  
  list: () =>
    request<any>('/v1/profit/cogs/analyses'),
};

// Pricing
export const pricingApi = {
  calculate: (data: { product_id: string; strategy: string; target_margin?: number }) =>
    request<any>('/v1/profit/pricing/calculate', { method: 'POST', body: JSON.stringify(data) }),
  
  getStrategies: () =>
    request<any>('/v1/profit/pricing/strategies'),
  
  updatePrice: (productId: string, price: number) =>
    request<any>(`/v1/profit/pricing/products/${productId}`, { method: 'PATCH', body: JSON.stringify({ price }) }),
};

// Scenarios
export const scenariosApi = {
  list: () =>
    request<any>('/v1/profit/scenarios'),
  
  get: (id: string) =>
    request<any>(`/v1/profit/scenarios/${id}`),
  
  create: (data: any) =>
    request<any>('/v1/profit/scenarios', { method: 'POST', body: JSON.stringify(data) }),
  
  run: (id: string) =>
    request<any>(`/v1/profit/scenarios/${id}/run`, { method: 'POST' }),
  
  delete: (id: string) =>
    request<void>(`/v1/profit/scenarios/${id}`, { method: 'DELETE' }),
};

// ═══════════════════════════════════════════════════════════════════════════════
// HR MODULE - Human Resources
// ═══════════════════════════════════════════════════════════════════════════════

// Allocations
export const allocationsApi = {
  list: (params?: { scheduleId?: string; employeeId?: string }) =>
    request<any>(`/v1/hr/allocations?${new URLSearchParams(params as any)}`),
  
  create: (data: any) =>
    request<any>('/v1/hr/allocations', { method: 'POST', body: JSON.stringify(data) }),
  
  update: (id: string, data: any) =>
    request<any>(`/v1/hr/allocations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  
  delete: (id: string) =>
    request<void>(`/v1/hr/allocations/${id}`, { method: 'DELETE' }),
  
  optimize: (scheduleId: string) =>
    request<any>(`/v1/hr/allocations/optimize/${scheduleId}`, { method: 'POST' }),
};

// Payroll
export const payrollApi = {
  calculate: (params: { month: string; year: number }) =>
    request<any>(`/v1/hr/payroll/calculate?month=${params.month}&year=${params.year}`),
  
  getEmployeePayroll: (employeeId: string, month: string, year: number) =>
    request<any>(`/v1/hr/payroll/employee/${employeeId}?month=${month}&year=${year}`),
  
  process: (data: { month: string; year: number }) =>
    request<any>('/v1/hr/payroll/process', { method: 'POST', body: JSON.stringify(data) }),
};

// Productivity
export const productivityApi = {
  list: (params?: { employeeId?: string; startDate?: string; endDate?: string }) =>
    request<any>(`/v1/hr/productivity?${new URLSearchParams(params as any)}`),
  
  getMetrics: (employeeId: string) =>
    request<any>(`/v1/hr/productivity/employee/${employeeId}`),
  
  record: (data: any) =>
    request<any>('/v1/hr/productivity', { method: 'POST', body: JSON.stringify(data) }),
  
  getReport: (params: { startDate: string; endDate: string }) =>
    request<any>(`/v1/hr/productivity/report?${new URLSearchParams(params)}`),
};

// ═══════════════════════════════════════════════════════════════════════════════
// ORDERS API - Paginated Production Orders (NEW)
// ═══════════════════════════════════════════════════════════════════════════════

export interface OrdersParams {
  page?: number;
  pageSize?: number;
  status?: 'ALL' | 'IN_PROGRESS' | 'COMPLETED';
  search?: string;
  productType?: 'K1' | 'K2' | 'K4' | 'C1' | 'C2' | 'C4' | 'Other' | 'ALL';
  sortBy?: 'createdDate' | 'productName' | 'status' | 'id';
  sortOrder?: 'asc' | 'desc';
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Order {
  id: string;
  productId: string | null;
  productName: string;
  productType: string;
  currentPhaseId: string | null;
  currentPhaseName: string;
  createdDate: string | null;
  completedDate: string | null;
  transportDate: string | null;
  status: 'IN_PROGRESS' | 'COMPLETED';
}

export interface OrdersStats {
  total: number;
  inProgress: number;
  completed: number;
  withTransport: number;
  phaseDistribution: Array<{ phase: string; count: number }>;
}

export const ordersApi = {
  /**
   * Fetch paginated orders from the backend.
   * Supports filtering, searching, and sorting.
   */
  list: (params: OrdersParams = {}): Promise<OrdersResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set('page', String(params.page));
    if (params.pageSize) queryParams.set('pageSize', String(params.pageSize));
    if (params.status && params.status !== 'ALL') queryParams.set('status', params.status);
    if (params.search) queryParams.set('search', params.search);
    if (params.productType && params.productType !== 'ALL') queryParams.set('productType', params.productType);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
    
    return request<OrdersResponse>(`/api/orders?${queryParams.toString()}`);
  },
  
  /**
   * Get a single order by ID.
   */
  get: (id: string): Promise<Order> =>
    request<Order>(`/api/orders/${id}`),
  
  /**
   * Get aggregate statistics for all orders (uses full database).
   * This is NOT paginated - returns totals from all 27,380 orders.
   */
  stats: (): Promise<OrdersStats> =>
    request<OrdersStats>('/api/orders/stats'),
};

// ═══════════════════════════════════════════════════════════════════════════════
// ERRORS API - Paginated Production Errors
// ═══════════════════════════════════════════════════════════════════════════════

export interface ErrorsParams {
  page?: number;
  pageSize?: number;
  severity?: 1 | 2 | 3;
  phase?: string;
  search?: string;
  sortBy?: 'id' | 'severity' | 'description' | 'orderId';
  sortOrder?: 'asc' | 'desc';
}

export interface ErrorsResponse {
  data: ProductionError[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProductionError {
  id: string;
  orderId: string | null;
  phaseName: string;
  evalPhaseName: string;
  description: string;
  severity: number;
  severityLabel: 'Minor' | 'Major' | 'Critical';
}

export interface ErrorsStats {
  total: number;
  bySeverity: {
    minor: number;
    major: number;
    critical: number;
  };
  ordersWithErrors: number;
  topDescriptions: Array<{ description: string; count: number }>;
  topPhases: Array<{ phase: string; count: number }>;
}

export const errorsApi = {
  /**
   * Fetch paginated errors from the backend.
   * Supports filtering by severity, phase, and search.
   */
  list: (params: ErrorsParams = {}): Promise<ErrorsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set('page', String(params.page));
    if (params.pageSize) queryParams.set('pageSize', String(params.pageSize));
    if (params.severity) queryParams.set('severity', String(params.severity));
    if (params.phase) queryParams.set('phase', params.phase);
    if (params.search) queryParams.set('search', params.search);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
    
    return request<ErrorsResponse>(`/api/errors?${queryParams.toString()}`);
  },
  
  /**
   * Get aggregate statistics for all errors (uses full database).
   * This is NOT paginated - returns totals from all 89,836 errors.
   */
  stats: (): Promise<ErrorsStats> =>
    request<ErrorsStats>('/api/errors/stats'),
};

// ═══════════════════════════════════════════════════════════════════════════════
// ALLOCATIONS API - Paginated Employee Allocations
// ═══════════════════════════════════════════════════════════════════════════════

export interface AllocationsParams {
  page?: number;
  pageSize?: number;
  employeeId?: number;
  phase?: string;
  isLeader?: boolean;
  search?: string;
  sortBy?: 'startDate' | 'employeeName' | 'phaseName' | 'id';
  sortOrder?: 'asc' | 'desc';
}

export interface AllocationsResponse {
  data: Allocation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Allocation {
  id: string;
  orderId: string | null;
  phaseId: string | null;
  phaseName: string;
  employeeId: string | null;
  employeeName: string;
  isLeader: boolean;
  startDate: string | null;
  endDate: string | null;
}

export interface AllocationsStats {
  total: number;
  asLeader: number;
  uniqueEmployees: number;
  uniqueOrders: number;
  avgPerEmployee: number;
  topPhases: Array<{ phase: string; count: number }>;
  topEmployees: Array<{ employee: string; count: number }>;
}

export const allocationsApiPaginated = {
  /**
   * Fetch paginated allocations from the backend.
   * Supports filtering by employee, phase, leader status, and search.
   */
  list: (params: AllocationsParams = {}): Promise<AllocationsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set('page', String(params.page));
    if (params.pageSize) queryParams.set('pageSize', String(params.pageSize));
    if (params.employeeId) queryParams.set('employeeId', String(params.employeeId));
    if (params.phase) queryParams.set('phase', params.phase);
    if (params.isLeader !== undefined) queryParams.set('isLeader', String(params.isLeader));
    if (params.search) queryParams.set('search', params.search);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
    
    return request<AllocationsResponse>(`/api/allocations?${queryParams.toString()}`);
  },
  
  /**
   * Get aggregate statistics for all allocations (uses full database).
   * This is NOT paginated - returns totals from all 346,832 allocations.
   */
  stats: (): Promise<AllocationsStats> =>
    request<AllocationsStats>('/api/allocations/stats'),
};

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH & UTILITY
// ═══════════════════════════════════════════════════════════════════════════════

export const healthApi = {
  check: () => request<any>('/health'),
  ready: () => request<any>('/health/ready'),
  live: () => request<any>('/health/live'),
};

export const apiInfo = () => request<any>('/');
