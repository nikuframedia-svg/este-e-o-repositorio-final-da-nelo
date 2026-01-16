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
  
  // Obter token de autenticação do localStorage
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  const tenantId = localStorage.getItem('tenant_id') || '00000000-0000-0000-0000-000000000000';
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Adicionar token se existir
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Adicionar tenant ID (requerido pelo backend)
  headers['X-Tenant-Id'] = tenantId;
  
  const response = await fetch(url, {
    headers,
    ...options,
  });

  if (!response.ok) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b36927af-6ca5-4f4b-8938-4f4afe8aa116',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:50',message:'response not ok',data:{status:response.status,statusText:response.statusText,url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    const error = await response.json().catch(() => ({}));
    const errorMessage = error.detail || error.message || `HTTP ${response.status}`;
    const errorObj = new Error(errorMessage);
    (errorObj as any).status = response.status;
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b36927af-6ca5-4f4b-8938-4f4afe8aa116',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:57',message:'throwing error',data:{errorMessage,status:response.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    throw errorObj;
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

// ═══════════════════════════════════════════════════════════════════════════════
// COPILOT API
// ═══════════════════════════════════════════════════════════════════════════════

// Import and re-export types from separate file
export type { CopilotAskRequest, CopilotResponse, DailyFeedbackResponse } from './copilot-types';

export const copilotApi = {
  ask: async (data: CopilotAskRequest) => {
    // Verificar se há token - se não houver, usar diretamente o endpoint dev
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    
    if (!token) {
      // Sem token, usar diretamente endpoint dev (sem autenticação)
      // Criar request manual para endpoint dev com tenant_id correto
      const url = `${API_BASE}/api/copilot/ask-dev`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': '00000000-0000-0000-0000-000000000001', // Tenant dev
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}`;
        const errorObj = new Error(errorMessage);
        (errorObj as any).status = response.status;
        throw errorObj;
      }
      
      return await response.json();
    }
    
    // Com token, tentar endpoint normal primeiro
    try {
      return await request<CopilotResponse>('/api/copilot/ask', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      // Se erro de autenticação, tentar endpoint dev
      if (error.status === 401 || error.status === 403 || error.message?.includes('Not authenticated') || error.message?.includes('Unauthorized')) {
        // Criar request manual para endpoint dev com tenant_id correto
        const url = `${API_BASE}/api/copilot/ask-dev`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Id': '00000000-0000-0000-0000-000000000001', // Tenant dev
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}`;
          const errorObj = new Error(errorMessage);
          (errorObj as any).status = response.status;
          throw errorObj;
        }
        
        return await response.json();
      }
      throw error;
    }
  },
  
  action: (data: { action_type: string; suggestion_id: string; payload: any }) =>
    request<any>('/api/copilot/action', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getDailyFeedback: (date?: string) => {
    const endpoint = `/api/copilot/daily-feedback${date ? `?date=${date}` : ''}`;
    const devEndpoint = `/api/copilot/daily-feedback-dev${date ? `?date=${date}` : ''}`;
    
    return request<DailyFeedbackResponse>(endpoint).catch((error: any) => {
      // Se erro de autenticação, tentar endpoint dev (silenciar erro 401)
      if (error.status === 401 || error.message?.includes('Not authenticated')) {
        // Não logar erro 401 - é esperado e vamos usar dev endpoint
        return request<DailyFeedbackResponse>(devEndpoint);
      }
      throw error;
    });
  },
  
  getSuggestion: (id: string) =>
    request<CopilotResponse>(`/api/copilot/suggestions/${id}`),
  
  health: () =>
    request<any>('/api/copilot/health').catch((error: any) => {
      // Se erro 401, retornar resposta padrão (health pode funcionar sem auth)
      if (error.status === 401) {
        return {
          status: 'degraded',
          ollama: 'unknown',
          embeddings_model: 'unknown',
        };
      }
      throw error;
    }),
  
  getRecommendations: () => {
    const endpoint = '/api/copilot/recommendations';
    const devEndpoint = '/api/copilot/recommendations-dev';
    
    return request<any[]>(endpoint).catch((error: any) => {
      if (error.status === 401 || error.message?.includes('Not authenticated')) {
        return request<any[]>(devEndpoint);
      }
      throw error;
    });
  },
  
  explainRecommendations: (data: { recommendations: any[]; user_query?: string }) => {
    const endpoint = '/api/copilot/recommendations/explain';
    const devEndpoint = '/api/copilot/recommendations/explain-dev';
    
    return request<CopilotResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }).catch((error: any) => {
      // Se erro de autenticação, tentar endpoint dev (silenciar erro 401)
      if (error.status === 401 || error.message?.includes('Not authenticated')) {
        // Não logar erro 401 - é esperado e vamos usar dev endpoint
        return request<CopilotResponse>(devEndpoint, {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
      throw error;
    });
  },
  
  getInsights: (date?: string) => {
    const endpoint = `/api/copilot/insights${date ? `?date=${date}` : ''}`;
    const devEndpoint = `/api/copilot/insights-dev${date ? `?date=${date}` : ''}`;
    
    return request<any>(endpoint).catch((error: any) => {
      if (error.status === 401 || error.message?.includes('Not authenticated')) {
        return request<any>(devEndpoint);
      }
      throw error;
    });
  },
  
  // Conversations API
  createConversation: (title?: string) => {
    // Se não houver token, rejeitar imediatamente (sem fazer chamada)
    const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : null;
    if (!token) {
      const error = new Error('Authentication required');
      (error as any).status = 401;
      return Promise.reject(error);
    }
    
    return request<{ id: string; title: string; created_at: string }>('/api/copilot/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }).catch((error: any) => {
      // Se erro 401, re-throw para que o componente possa tratar (criar conversa sem BD)
      throw error;
    });
  },
  
  listConversations: (params?: { limit?: number; offset?: number; archived?: boolean }) => {
    // Se não houver token, retornar imediatamente array vazio (sem fazer chamada)
    const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : null;
    if (!token) {
      return Promise.resolve([]);
    }
    
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.offset) queryParams.set('offset', String(params.offset));
    if (params?.archived !== undefined) queryParams.set('archived', String(params.archived));
    return request<Array<{
      id: string;
      title: string;
      created_at: string;
      last_message_at: string | null;
      is_archived: boolean;
    }>>(`/api/copilot/conversations?${queryParams.toString()}`).catch((error: any) => {
      // Se erro 401, retornar array vazio (conversas requerem auth, mas não são críticas)
      if (error.status === 401 || error.status === 403) {
        return [];
      }
      throw error;
    });
  },
  
  getConversationMessages: (conversationId: string, params?: { limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.offset) queryParams.set('offset', String(params.offset));
    return request<Array<{
      id: string;
      role: 'user' | 'copilot';
      content_text: string;
      content_structured: any | null;
      created_at: string;
    }>>(`/api/copilot/conversations/${conversationId}/messages?${queryParams.toString()}`).catch((error: any) => {
      // Se erro 401, retornar array vazio
      if (error.status === 401) {
        return [];
      }
      throw error;
    });
  },
  
  sendMessage: (conversationId: string, data: CopilotAskRequest) =>
    request<CopilotResponse>(`/api/copilot/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).catch((error: any) => {
      // Se erro 401, re-throw para que o componente possa usar endpoint normal
      throw error;
    }),
  
  renameConversation: (conversationId: string, title: string) =>
    request<{ id: string; title: string }>(`/api/copilot/conversations/${conversationId}/rename`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    }),
  
  archiveConversation: (conversationId: string) =>
    request<{ id: string; is_archived: boolean }>(`/api/copilot/conversations/${conversationId}/archive`, {
      method: 'POST',
    }),
};

export const apiInfo = () => request<any>('/');
