import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ChevronLeft,
  Users,
  Clock,
  Wrench,
  Calendar,
  Star,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { EmptyTableState } from '../../components/ui';
import { allocationsApiPaginated, type Allocation, type AllocationsStats } from '../../lib/api';

export function AllocationsPage() {
  // Filters & pagination state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLeaderFilter, setIsLeaderFilter] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Data state
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [totalAllocations, setTotalAllocations] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState<AllocationsStats | null>(null);
  
  // Loading & error states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch stats (once on mount)
  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoadingStats(true);
        const data = await allocationsApiPaginated.stats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setIsLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  // Fetch allocations
  useEffect(() => {
    async function loadAllocations() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await allocationsApiPaginated.list({
          page: currentPage,
          pageSize: itemsPerPage,
          isLeader: isLeaderFilter ?? undefined,
          search: debouncedSearch || undefined,
          sortBy: 'startDate',
          sortOrder: 'desc',
        });
        
        setAllocations(response.data);
        setTotalAllocations(response.total);
        setTotalPages(response.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load allocations');
      } finally {
        setIsLoading(false);
      }
    }
    loadAllocations();
  }, [currentPage, isLeaderFilter, debouncedSearch]);

  // Top phases from stats
  const topPhases = useMemo(() => {
    return stats?.topPhases || [];
  }, [stats]);

  // Format date
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate duration
  const calculateDuration = (start: string | null, end: string | null): string => {
    if (!start || !end) return '-';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    if (diffMs < 0) return '-';
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1a2744]">Employee Allocations</h1>
                <p className="text-sm text-slate-500">
                  {isLoadingStats ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : stats ? (
                    <>
                      Total: <span className="font-semibold">{stats.total.toLocaleString()}</span> allocations 
                      ({stats.uniqueEmployees} employees, {stats.uniqueOrders.toLocaleString()} orders)
                    </>
                  ) : (
                    'All employee allocations'
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
                  placeholder="Search employees, phases, orders..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none"
                />
                {search && isLoading && (
                  <Loader2 size={14} className="text-slate-400 animate-spin" />
                )}
              </div>
              
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                {[
                  { value: null, label: 'All' },
                  { value: true, label: 'Leaders' },
                  { value: false, label: 'Team' },
                ].map((filter) => (
                  <button
                    key={String(filter.value)}
                    onClick={() => { setIsLeaderFilter(filter.value); setCurrentPage(1); }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      isLeaderFilter === filter.value 
                        ? 'bg-white text-[#1a2744] shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Stats - Real values from database */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-slate-400" />
              <span className="text-sm text-slate-500">Total Allocations</span>
            </div>
            {isLoadingStats ? (
              <div className="h-8 bg-slate-100 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-[#1a2744]">{stats?.total.toLocaleString() || '-'}</p>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-blue-500" />
              <span className="text-sm text-slate-500">Unique Employees</span>
            </div>
            {isLoadingStats ? (
              <div className="h-8 bg-slate-100 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-blue-600">{stats?.uniqueEmployees.toLocaleString() || '-'}</p>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Wrench size={16} className="text-purple-500" />
              <span className="text-sm text-slate-500">Unique Orders</span>
            </div>
            {isLoadingStats ? (
              <div className="h-8 bg-slate-100 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-purple-600">{stats?.uniqueOrders.toLocaleString() || '-'}</p>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} className="text-amber-500" />
              <span className="text-sm text-slate-500">As Leader</span>
            </div>
            {isLoadingStats ? (
              <div className="h-8 bg-slate-100 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-amber-600">{stats?.asLeader.toLocaleString() || '-'}</p>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-emerald-500" />
              <span className="text-sm text-slate-500">Avg per Employee</span>
            </div>
            {isLoadingStats ? (
              <div className="h-8 bg-slate-100 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-emerald-600">{stats?.avgPerEmployee.toLocaleString() || '-'}</p>
            )}
          </div>
        </div>

        {/* Phase distribution from stats */}
        {topPhases.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <h3 className="text-sm font-semibold text-[#1a2744] mb-3">
              Top Phases <span className="font-normal text-slate-400">(all allocations)</span>
            </h3>
            <div className="grid grid-cols-10 gap-2">
              {topPhases.map(({ phase, count }) => (
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
                <p className="font-medium text-red-900">Error loading allocations</p>
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
        
        {/* Allocations Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Phase</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Order</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Start</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">End</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Duration</th>
                <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-32 animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-24 animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-20 animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-28 animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-28 animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-16 animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-16 animate-pulse" /></td>
                  </tr>
                ))
              ) : allocations.length > 0 ? (
                allocations.map((allocation) => (
                  <tr key={allocation.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-[#1a2744] text-sm">{allocation.employeeName}</p>
                        <p className="text-xs text-slate-400">ID: {allocation.employeeId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-700">{allocation.phaseName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-500 font-mono">
                        {allocation.orderId ? `OF-${allocation.orderId}` : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {formatDate(allocation.startDate)}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {formatDate(allocation.endDate)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-[#1a2744]">
                        {calculateDuration(allocation.startDate, allocation.endDate)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {allocation.isLeader ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">
                          <Star size={12} />
                          Leader
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                          Team
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyTableState 
                  title="No allocations found"
                  message="No allocations match your current filters. Try adjusting your search criteria."
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
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalAllocations)} of {totalAllocations.toLocaleString()} allocations
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
