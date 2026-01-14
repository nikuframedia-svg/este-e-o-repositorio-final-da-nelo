import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  AlertOctagon,
  PieChart,
  TrendingDown,
  Wrench,
  Paintbrush,
  Layers,
  Search,
  Loader2,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import { EmptyTableState } from '../../components/ui';
import { errorsApi, type ProductionError, type ErrorsStats } from '../../lib/api';

// Import static data for FPY charts (these don't need pagination)
import oeeMetrics from '../../data/oeeMetrics.json';

interface FPYFamily {
  totalOrders: number;
  ordersWithErrors: number;
  fpy: number;
}

// Severity Badge
function SeverityBadge({ severity }: { severity: number }) {
  const config = {
    1: { label: 'Minor', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
    2: { label: 'Major', color: 'bg-orange-100 text-orange-700', icon: AlertOctagon },
    3: { label: 'Critical', color: 'bg-red-100 text-red-700', icon: XCircle },
  }[severity] || { label: 'Unknown', color: 'bg-slate-100 text-slate-700', icon: AlertTriangle };
  
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

// Stat Card
function StatCard({ 
  label, 
  value, 
  icon, 
  color,
  subtext,
  loading = false,
}: { 
  label: string; 
  value: string | number; 
  icon: React.ReactNode;
  color: string;
  subtext?: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          {loading ? (
            <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-[#1a2744]">{value}</p>
          )}
          <p className="text-sm text-slate-500">{label}</p>
          {subtext && <p className="text-xs text-slate-400">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

// Pareto Bar
function ParetoBar({ description, count, maxCount, index, percentage }: { 
  description: string; 
  count: number; 
  maxCount: number; 
  index: number;
  percentage: number;
}) {
  const barWidth = (count / maxCount) * 100;
  
  return (
    <div className="flex items-center gap-3 group">
      <span className="w-6 text-xs font-medium text-slate-400">{index + 1}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-[#1a2744] group-hover:text-blue-600 transition-colors">
            {description}
          </span>
          <span className="text-xs font-bold text-slate-600">{count.toLocaleString()}</span>
        </div>
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
      <span className="w-12 text-xs text-slate-500 text-right">{percentage.toFixed(1)}%</span>
    </div>
  );
}

// Category Icon
function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, React.ReactNode> = {
    'Molde': <Wrench size={20} className="text-slate-600" />,
    'Laminagem': <Layers size={20} className="text-blue-600" />,
    'Pintura': <Paintbrush size={20} className="text-purple-600" />,
    'Other': <BarChart3 size={20} className="text-slate-400" />,
  };
  return icons[category] || icons['Other'];
}

// FPY Ring Chart
function FPYRing({ fpy }: { fpy: number }) {
  const radius = 40;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = (fpy / 100) * circumference;
  const remaining = circumference - progress;
  
  const color = fpy >= 50 ? '#22c55e' : fpy >= 30 ? '#f59e0b' : '#ef4444';
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={100} height={100} className="transform -rotate-90">
        <circle
          cx={50}
          cy={50}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={50}
          cy={50}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${progress} ${remaining}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold text-[#1a2744]">{fpy}%</span>
        <span className="text-[10px] text-slate-500">FPY</span>
      </div>
    </div>
  );
}

export function QualityPage() {
  // State for paginated errors
  const [errors, setErrors] = useState<ProductionError[]>([]);
  const [totalErrors, setTotalErrors] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [severityFilter, setSeverityFilter] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const itemsPerPage = 15;

  // State for stats
  const [stats, setStats] = useState<ErrorsStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingErrors, setIsLoadingErrors] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FPY data from static file
  const fpyByFamily = oeeMetrics.fpyByFamily as Record<string, FPYFamily>;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch stats
  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoadingStats(true);
        const data = await errorsApi.stats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setIsLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  // Fetch errors
  useEffect(() => {
    async function loadErrors() {
      try {
        setIsLoadingErrors(true);
        setError(null);
        
        const response = await errorsApi.list({
          page: currentPage,
          pageSize: itemsPerPage,
          severity: severityFilter || undefined,
          search: debouncedSearch || undefined,
          sortBy: 'id',
          sortOrder: 'desc',
        });
        
        setErrors(response.data);
        setTotalErrors(response.total);
        setTotalPages(response.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load errors');
      } finally {
        setIsLoadingErrors(false);
      }
    }
    loadErrors();
  }, [currentPage, severityFilter, debouncedSearch]);

  // Compute top descriptions from stats
  const topDescriptions = useMemo(() => {
    if (!stats?.topDescriptions) return [];
    const total = stats.total;
    return stats.topDescriptions.map(d => ({
      ...d,
      percentage: (d.count / total) * 100
    }));
  }, [stats]);

  const maxErrorCount = useMemo(() => {
    return Math.max(...topDescriptions.map(e => e.count), 1);
  }, [topDescriptions]);

  const handleRetry = () => {
    setError(null);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-400 hover:text-slate-600">
              <ChevronLeft size={20} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <CheckCircle2 size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1a2744]">Quality Analysis</h1>
                <p className="text-sm text-slate-500">
                  {isLoadingStats ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : stats ? (
                    <>Total: <span className="font-semibold">{stats.total.toLocaleString()}</span> errors across {stats.ordersWithErrors.toLocaleString()} orders</>
                  ) : (
                    'Error tracking and First Pass Yield'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <StatCard
            label="Total Errors"
            value={stats?.total.toLocaleString() || '-'}
            icon={<AlertTriangle size={24} className="text-white" />}
            color="bg-gradient-to-br from-slate-600 to-slate-700"
            loading={isLoadingStats}
          />
          <StatCard
            label="FPY Rate"
            value={`${oeeMetrics.quality}%`}
            icon={<CheckCircle2 size={24} className="text-white" />}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            subtext="First Pass Yield"
          />
          <StatCard
            label="Critical Errors"
            value={stats?.bySeverity.critical.toLocaleString() || '-'}
            icon={<XCircle size={24} className="text-white" />}
            color="bg-gradient-to-br from-red-500 to-red-600"
            loading={isLoadingStats}
          />
          <StatCard
            label="Major Errors"
            value={stats?.bySeverity.major.toLocaleString() || '-'}
            icon={<AlertOctagon size={24} className="text-white" />}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            loading={isLoadingStats}
          />
          <StatCard
            label="Rework Rate"
            value={`${oeeMetrics.reworkRate}%`}
            icon={<TrendingDown size={24} className="text-white" />}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            subtext="Orders requiring rework"
          />
        </div>
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Pareto Chart */}
          <div className="col-span-7 bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#1a2744]">Error Pareto Analysis</h3>
                <p className="text-xs text-slate-500">Top 10 most common defects</p>
              </div>
              <PieChart size={20} className="text-slate-400" />
            </div>
            {isLoadingStats ? (
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {topDescriptions.slice(0, 10).map((error, index) => (
                  <ParetoBar 
                    key={error.description} 
                    description={error.description}
                    count={error.count}
                    percentage={error.percentage}
                    maxCount={maxErrorCount} 
                    index={index} 
                  />
                ))}
              </div>
            )}
            
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Key Finding</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Focus on mold condition and lamination process for highest impact on quality.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="col-span-5 space-y-6">
            {/* FPY by Product Family */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-[#1a2744] mb-4">FPY by Product Family</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(fpyByFamily)
                  .filter(([key]) => key !== 'Other')
                  .sort((a, b) => b[1].totalOrders - a[1].totalOrders)
                  .map(([family, data]) => (
                    <div key={family} className="text-center">
                      <FPYRing fpy={data.fpy} />
                      <p className="mt-2 font-bold text-[#1a2744]">{family}</p>
                      <p className="text-xs text-slate-500">{data.totalOrders.toLocaleString()} orders</p>
                    </div>
                  ))}
              </div>
            </div>
            
            {/* Errors by Severity */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-[#1a2744] mb-4">Errors by Severity</h3>
              {isLoadingStats ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-6 bg-slate-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : stats ? (
                <div className="space-y-3">
                  {[
                    { severity: 1, label: 'Minor', count: stats.bySeverity.minor, color: 'bg-amber-500' },
                    { severity: 2, label: 'Major', count: stats.bySeverity.major, color: 'bg-orange-500' },
                    { severity: 3, label: 'Critical', count: stats.bySeverity.critical, color: 'bg-red-500' },
                  ].map((sev) => (
                    <div key={sev.severity} className="flex items-center gap-3">
                      <SeverityBadge severity={sev.severity} />
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${sev.color}`}
                          style={{ width: `${(sev.count / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-[#1a2744] w-20 text-right">
                        {sev.count.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 w-12 text-right">
                        {((sev.count / stats.total) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            
            {/* Detection Phase */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold text-[#1a2744] mb-4">Top Detection Phases</h3>
              <p className="text-xs text-slate-500 mb-3">Where defects are identified</p>
              {isLoadingStats ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : stats?.topPhases ? (
                <div className="space-y-2">
                  {stats.topPhases.slice(0, 5).map((phase) => (
                    <div key={phase.phase} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="font-medium text-[#1a2744]">{phase.phase}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#1a2744]">{phase.count.toLocaleString()}</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {((phase.count / stats.total) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        
        {/* Errors Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#1a2744]">All Errors</h3>
                <p className="text-xs text-slate-500">
                  Browse all {totalErrors.toLocaleString()} production errors
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 w-64">
                  <Search size={16} className="text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search errors..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                  {search && isLoadingErrors && (
                    <Loader2 size={14} className="text-slate-400 animate-spin" />
                  )}
                </div>
                
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                  {[
                    { value: null, label: 'All' },
                    { value: 1, label: 'Minor' },
                    { value: 2, label: 'Major' },
                    { value: 3, label: 'Critical' },
                  ].map((filter) => (
                    <button
                      key={filter.value ?? 'all'}
                      onClick={() => { setSeverityFilter(filter.value); setCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        severityFilter === filter.value 
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
          
          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded-lg text-xs font-medium text-red-800"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          )}
          
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Order</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Phase</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Severity</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingErrors ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-16 animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-20 animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-40 animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-24 animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-16 animate-pulse" /></td>
                  </tr>
                ))
              ) : errors.length > 0 ? (
                errors.map((err) => (
                  <tr key={err.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-mono text-slate-500">#{err.id}</td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-[#1a2744]">OF-{err.orderId}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-[#1a2744]">{err.description}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-600">{err.phaseName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={err.severity} />
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyTableState 
                  title="No errors found"
                  message="No errors match your current filters. Try adjusting your search criteria."
                />
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              {isLoadingErrors ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                <>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalErrors)} of {totalErrors.toLocaleString()} errors
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoadingErrors}
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
                        disabled={isLoadingErrors}
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
                disabled={currentPage === totalPages || isLoadingErrors}
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
