// Core Types
export interface Tenant {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  unit_of_measure: string;
  cost: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Machine {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  capacity: number;
  cost_per_hour: number;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  tenant_id: string;
  name: string;
  role: string;
  hourly_rate: number;
  created_at: string;
  updated_at: string;
}

export interface Operation {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  standard_time: number;
  machine_id?: string;
  created_at: string;
  updated_at: string;
}

// Plan Types
export interface Schedule {
  id: string;
  tenant_id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'generated' | 'executed';
  tasks: ScheduleTask[];
  created_at: string;
  updated_at: string;
}

export interface ScheduleTask {
  id: string;
  schedule_id: string;
  product_id: string;
  machine_id?: string;
  employee_id?: string;
  start_time?: string;
  end_time?: string;
  quantity: number;
  status: string;
}

export interface MRPRun {
  id: string;
  tenant_id: string;
  run_date: string;
  status: string;
  items: MRPItem[];
}

export interface MRPItem {
  id: string;
  mrp_run_id: string;
  item_id: string;
  item_type: 'purchase_order' | 'production_order';
  quantity: number;
  start_date?: string;
  due_date?: string;
}

// Profit Types
export interface COGSResult {
  product_id: string;
  quantity: number;
  total_cogs: number;
  components: {
    direct_material_cost: number;
    direct_labor_cost: number;
    manufacturing_overhead_machine: number;
    manufacturing_overhead_other: number;
    packaging_cost: number;
    quality_control_cost: number;
  };
}

export interface PricingResult {
  product_id: string;
  quantity: number;
  base_cogs: number;
  markup_percentage: number;
  calculated_price: number;
  pricing_strategy: string;
}

export interface ScenarioResult {
  product_id: string;
  quantity: number;
  original_cogs: number;
  simulated_cogs: number;
  original_components: Record<string, number>;
  simulated_components: Record<string, number>;
  scenario_changes: Record<string, number>;
}

// HR Types
export interface EmployeeAllocation {
  id: string;
  tenant_id: string;
  employee_id: string;
  operation_id: string;
  allocated_hours: number;
  start_time: string;
  end_time: string;
}

export interface ProductivityMetric {
  id: string;
  tenant_id: string;
  employee_id: string;
  metric_name: string;
  metric_value: number;
  recorded_date: string;
}

export interface PayrollResult {
  employee_id: string;
  start_date: string;
  end_date: string;
  total_hours_worked: number;
  hourly_rate: number;
  gross_pay: number;
  tax_deductions: number;
  other_deductions: number;
  net_pay: number;
}

// Dashboard Types
export interface DashboardMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  avgCOGS: number;
  cogsChange: number;
  employeeCount: number;
  productivityIndex: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  value2?: number;
  label?: string;
  [key: string]: string | number | undefined;
}

