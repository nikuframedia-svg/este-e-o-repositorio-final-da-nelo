import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { 
  Dashboard,
  // CORE
  ProductsPage,
  MachinesPage,
  EmployeesPage,
  OperationsPage,
  RatesPage,
  // PLAN
  SchedulingPage,
  MRPPage,
  CapacityPage,
  // PROFIT
  COGSPage, 
  PricingPage,
  ScenariosPage,
  OEEPage,
  QualityPage,
  // HR
  AllocationsPage,
  PayrollPage,
  ProductivityPage,
} from './pages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Dashboard */}
            <Route index element={<Dashboard />} />
            
            {/* CORE Module - Master Data */}
            <Route path="core">
              <Route path="products" element={<ProductsPage />} />
              <Route path="machines" element={<MachinesPage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="operations" element={<OperationsPage />} />
              <Route path="rates" element={<RatesPage />} />
            </Route>
            
            {/* PLAN Module - Production Planning */}
            <Route path="plan">
              <Route path="scheduling" element={<SchedulingPage />} />
              <Route path="mrp" element={<MRPPage />} />
              <Route path="capacity" element={<CapacityPage />} />
            </Route>
            
            {/* PROFIT Module - Cost & Pricing */}
            <Route path="profit">
              <Route path="oee" element={<OEEPage />} />
              <Route path="quality" element={<QualityPage />} />
              <Route path="cogs" element={<COGSPage />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="scenarios" element={<ScenariosPage />} />
            </Route>
            
            {/* HR Module - Human Resources */}
            <Route path="hr">
              <Route path="allocations" element={<AllocationsPage />} />
              <Route path="payroll" element={<PayrollPage />} />
              <Route path="productivity" element={<ProductivityPage />} />
            </Route>
            
            {/* Legacy routes - redirect to new structure */}
            <Route path="products" element={<Navigate to="/core/products" replace />} />
            <Route path="machines" element={<Navigate to="/core/machines" replace />} />
            
            {/* Settings */}
            <Route path="settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Settings</h1><p className="text-slate-500">Coming soon...</p></div>} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
