import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  ChevronLeft,
  Calendar,
  ClipboardList,
  Clock,
  CheckCircle2,
  PlayCircle,
  Truck,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { DisabledButton, EmptyTableState } from '../../components/ui';
import { ordersApi, type Order, type OrdersStats } from '../../lib/api';

// Helper to format dates
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });
}

export function SchedulingPage() {
  // Filters & pagination state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [sortBy, setSortBy] = useState<'createdDate' | 'productName'>('createdDate');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Data state
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState<OrdersStats | null>(null);
  
  // Loading & error states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to page 1 on search
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch stats (once on mount)
  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoadingStats(true);
        const statsData = await ordersApi.stats();
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setIsLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  // Fetch orders with pagination
  useEffect(() => {
    async function loadOrders() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await ordersApi.list({
          page: currentPage,
          pageSize: itemsPerPage,
          status: statusFilter,
          search: debouncedSearch || undefined,
          sortBy: sortBy,
          sortOrder: sortOrder,
        });
        
        setOrders(response.data);
        setTotalOrders(response.total);
        setTotalPages(response.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, [currentPage, statusFilter, debouncedSearch, sortBy, sortOrder]);

  // Phase distribution from current page (local computation)
  const phaseDistribution = useMemo(() => {
    if (!stats?.phaseDistribution) return [];
    return stats.phaseDistribution;
  }, [stats]);

  // Get kayak type from product name
  const getKayakType = (name: string): string => {
    const match = name.match(/^(K\d|C\d)/);
    return match ? match[1] : 'Other';
  };

  // Toggle sort
  const toggleSort = () => {
    if (sortBy === 'createdDate') {
      setSortBy('productName');
      setSortOrder('asc');
    } else {
      setSortBy('createdDate');
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Retry on error
  const handleRetry = () => {
    setError(null);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/" className="text-slate-400 hover:text-slate-600">
              <ChevronLeft size={20} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Calendar size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1a2744]">Production Orders</h1>
                <p className="text-sm text-slate-500">
                  {isLoadingStats ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : stats ? (
                    <>
                      Total: <span className="font-semibold">{stats.total.toLocaleString()}</span> ordens 
                      ({stats.inProgress.toLocaleString()} em progresso, {stats.completed.toLocaleString()} concluídas)
                    </>
                  ) : (
                    'All production orders from database'
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 w-80">
                <Search size={18} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search orders, products, phases..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none"
                />
                {search && isLoading && (
                  <Loader2 size={14} className="text-slate-400 animate-spin" />
                )}
              </div>
              
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                {(['ALL', 'IN_PROGRESS', 'COMPLETED'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      statusFilter === status 
                        ? 'bg-white text-[#1a2744] shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {status === 'ALL' ? 'All' : status === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
                  </button>
                ))}
              </div>

              <button 
                onClick={toggleSort}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200"
              >
                <ArrowUpDown size={14} />
                {sortBy === 'createdDate' ? 'Date ↓' : 'Product ↑'}
              </button>
            </div>
            
            <DisabledButton icon={<Plus size={18} />}>
              New Order
            </DisabledButton>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Stats Cards - Real values from database */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList size={16} className="text-slate-400" />
              <span className="text-sm text-slate-500">Total Orders</span>
            </div>
            {isLoadingStats ? (
              <div className="h-8 bg-slate-100 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-[#1a2744]">{stats?.total.toLocaleString() || '-'}</p>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <PlayCircle size={16} className="text-blue-500" />
              <span className="text-sm text-slate-500">In Progress</span>
            </div>
            {isLoadingStats ? (
              <div className="h-8 bg-slate-100 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-blue-600">{stats?.inProgress.toLocaleString() || '-'}</p>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="text-sm text-slate-500">Completed</span>
            </div>
            {isLoadingStats ? (
              <div className="h-8 bg-slate-100 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-emerald-600">{stats?.completed.toLocaleString() || '-'}</p>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Truck size={16} className="text-amber-500" />
              <span className="text-sm text-slate-500">With Transport</span>
            </div>
            {isLoadingStats ? (
              <div className="h-8 bg-slate-100 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-amber-600">{stats?.withTransport.toLocaleString() || '-'}</p>
            )}
          </div>
        </div>

        {/* Phase Distribution - From full database */}
        {phaseDistribution.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <h3 className="text-sm font-semibold text-[#1a2744] mb-3">
              Top {phaseDistribution.length} Phases <span className="font-normal text-slate-400">(all orders)</span>
            </h3>
            <div className="grid grid-cols-8 gap-2">
              {phaseDistribution.map(({ phase, count }) => (
                <button
                  key={phase}
                  onClick={() => { setSearch(phase); setCurrentPage(1); }}
                  className="p-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-all text-center"
                >
                  <p className="text-lg font-bold text-[#1a2744]">{count.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500 truncate">{phase}</p>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} className="text-red-500" />
              <div>
                <p className="font-medium text-red-900">Error loading orders</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium text-red-800"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}
        
        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Order</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Product</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Phase</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Transport</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-20 animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-32 animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-12 animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-24 animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-20 animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-16 animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-20 animate-pulse" /></td>
                  </tr>
                ))
              ) : orders.length > 0 ? (
                orders.map((order) => {
                  const kayakType = getKayakType(order.productName);
                  return (
                    <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#1a2744] text-sm">OF-{order.id}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-[#1a2744] text-sm">{order.productName}</p>
                          <p className="text-xs text-slate-400">ID: {order.productId}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          kayakType === 'K1' ? 'bg-blue-50 text-blue-600' :
                          kayakType === 'K2' ? 'bg-purple-50 text-purple-600' :
                          kayakType === 'K4' ? 'bg-amber-50 text-amber-600' :
                          kayakType === 'C1' ? 'bg-emerald-50 text-emerald-600' :
                          kayakType === 'C2' ? 'bg-teal-50 text-teal-600' :
                          kayakType === 'C4' ? 'bg-pink-50 text-pink-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {kayakType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          <span className="text-sm text-slate-700">{order.currentPhaseName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {formatDate(order.createdDate)}
                      </td>
                      <td className="py-3 px-4">
                        {order.transportDate ? (
                          <div className="flex items-center gap-1.5">
                            <Truck size={14} className="text-amber-500" />
                            <span className="text-sm text-slate-700">{formatShortDate(order.transportDate)}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                          order.status === 'IN_PROGRESS' 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {order.status === 'IN_PROGRESS' ? (
                            <>
                              <PlayCircle size={12} />
                              In Progress
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={12} />
                              Completed
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <EmptyTableState 
                  title="No orders found"
                  message="No orders match your current filters. Try adjusting your search criteria."
                />
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              {isLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                <>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalOrders)} of {totalOrders.toLocaleString()} orders
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {totalPages > 0 && (
                <>
                  {currentPage > 3 && (
                    <>
                      <button
                        onClick={() => setCurrentPage(1)}
                        className="w-8 h-8 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                      >
                        1
                      </button>
                      {currentPage > 4 && <span className="text-slate-400">...</span>}
                    </>
                  )}
                  
                  {Array.from({ length: 5 }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (page > totalPages || page < 1) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        disabled={isLoading}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page 
                            ? 'bg-[#1a2744] text-white' 
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && <span className="text-slate-400">...</span>}
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-8 h-8 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </>
              )}
              
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || isLoading}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
