import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  ChevronLeft,
  Wrench,
  Cog,
  PlayCircle,
  PauseCircle,
  ArrowUpDown,
  Factory,
  Bot,
  Hand,
} from 'lucide-react';
import { DisabledButton, EmptyTableState } from '../../components/ui';

// Import real data
import phasesData from '../../data/phases.json';

interface Phase {
  id: string;
  name: string;
  sequence: number;
  isProduction: boolean;
  isAutomatic: boolean;
  status: string;
}

const phases: Phase[] = phasesData;

export function OperationsPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PRODUCTION' | 'NON_PRODUCTION'>('ALL');
  const [sortBy, setSortBy] = useState<'sequence' | 'name'>('sequence');

  const filteredPhases = useMemo(() => {
    return phases
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                              p.id.includes(search);
        const matchesType = filterType === 'ALL' || 
                           (filterType === 'PRODUCTION' && p.isProduction) ||
                           (filterType === 'NON_PRODUCTION' && !p.isProduction);
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'sequence') return a.sequence - b.sequence;
        return a.name.localeCompare(b.name);
      });
  }, [search, filterType, sortBy]);

  const stats = useMemo(() => ({
    total: phases.length,
    production: phases.filter(p => p.isProduction).length,
    automatic: phases.filter(p => p.isAutomatic).length,
    manual: phases.filter(p => !p.isAutomatic).length,
  }), []);

  // Group phases by production sequence for visual flow
  const productionPhases = phases.filter(p => p.isProduction).sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/" className="text-slate-400 hover:text-slate-600">
              <ChevronLeft size={20} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Wrench size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1a2744]">Production Phases</h1>
                <p className="text-sm text-slate-500">{phases.length} phases in workflow</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 w-72">
                <Search size={18} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search phases..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none"
                />
              </div>
              
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                {(['ALL', 'PRODUCTION', 'NON_PRODUCTION'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      filterType === type 
                        ? 'bg-white text-[#1a2744] shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {type === 'ALL' ? 'All' : type === 'PRODUCTION' ? 'Production' : 'Non-Production'}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setSortBy(sortBy === 'sequence' ? 'name' : 'sequence')}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200"
              >
                <ArrowUpDown size={14} />
                Sort by {sortBy === 'sequence' ? 'Sequence' : 'Name'}
              </button>
            </div>
            
            <DisabledButton icon={<Plus size={18} />}>
              Add Phase
            </DisabledButton>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Cog size={16} className="text-slate-400" />
              <span className="text-sm text-slate-500">Total Phases</span>
            </div>
            <p className="text-2xl font-bold text-[#1a2744]">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Factory size={16} className="text-blue-500" />
              <span className="text-sm text-slate-500">Production</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.production}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Bot size={16} className="text-emerald-500" />
              <span className="text-sm text-slate-500">Automatic</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{stats.automatic}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Hand size={16} className="text-amber-500" />
              <span className="text-sm text-slate-500">Manual</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.manual}</p>
          </div>
        </div>

        {/* Production Flow Visualization */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <h3 className="text-sm font-semibold text-[#1a2744] mb-3">Production Flow</h3>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {productionPhases.slice(0, 12).map((phase, index) => (
              <div key={phase.id} className="flex items-center">
                <div className="flex flex-col items-center min-w-[80px]">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                    phase.isAutomatic ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}>
                    {phase.sequence}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 text-center truncate w-full">{phase.name}</p>
                </div>
                {index < Math.min(productionPhases.length, 12) - 1 && (
                  <div className="w-4 h-0.5 bg-slate-200 mx-1" />
                )}
              </div>
            ))}
            {productionPhases.length > 12 && (
              <span className="text-xs text-slate-400 ml-2">+{productionPhases.length - 12} more</span>
            )}
          </div>
        </div>
        
        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Seq</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Phase</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Mode</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPhases.map((phase) => (
                <tr key={phase.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${
                      phase.isProduction ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {phase.sequence}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-semibold text-[#1a2744] text-sm">{phase.name}</p>
                      <p className="text-xs text-slate-400">ID: {phase.id}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                      phase.isProduction 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {phase.isProduction ? (
                        <>
                          <PlayCircle size={12} />
                          Production
                        </>
                      ) : (
                        <>
                          <PauseCircle size={12} />
                          Non-Production
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                      phase.isAutomatic 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {phase.isAutomatic ? (
                        <>
                          <Bot size={12} />
                          Automatic
                        </>
                      ) : (
                        <>
                          <Hand size={12} />
                          Manual
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      phase.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {phase.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredPhases.length === 0 && (
                <EmptyTableState 
                  title="Sem fases encontradas"
                  message="Nenhuma fase corresponde aos filtros aplicados. Tente alterar os critérios de pesquisa."
                />
              )}
            </tbody>
          </table>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing {filteredPhases.length} of {phases.length} phases
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
