import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  ChevronLeft,
  Users,
  UserCheck,
  UserX,
  Wrench,
} from 'lucide-react';
import { DisabledButton, EmptyListState } from '../../components/ui';

// Import real data
import employeesData from '../../data/employees.json';

interface Employee {
  id: string;
  name: string;
  status: string;
  skills: string[];
  skillIds: string[];
  department: string;
}

const employees: Employee[] = employeesData;

// Get unique departments from data
const departments = ['ALL', ...new Set(employees.map(e => e.department))].sort();

export function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const matchesFilter = filter === 'ALL' || e.department === filter;
      const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
      const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || 
                            e.id.includes(search) ||
                            e.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
      return matchesFilter && matchesSearch && matchesStatus;
    });
  }, [filter, statusFilter, search]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter(e => e.status === 'ACTIVE').length,
    inactive: employees.filter(e => e.status === 'INACTIVE').length,
    departments: new Set(employees.map(e => e.department)).size,
    avgSkills: (employees.reduce((sum, e) => sum + e.skills.length, 0) / employees.length).toFixed(1),
  }), []);

  // Department distribution for visualization
  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(e => {
      counts[e.department] = (counts[e.department] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, []);

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1a2744]">Employees</h1>
                <p className="text-sm text-slate-500">{employees.length} workforce members</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 w-72">
                <Search size={18} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by name or skill..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="flex-1 bg-transparent text-sm outline-none"
                />
              </div>
              
              <select 
                value={filter}
                onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 bg-slate-100 rounded-lg text-sm outline-none text-slate-700"
              >
                {departments.slice(0, 10).map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      statusFilter === status 
                        ? 'bg-white text-[#1a2744] shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            
            <DisabledButton icon={<Plus size={18} />}>
              Add Employee
            </DisabledButton>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-slate-400" />
              <span className="text-sm text-slate-500">Total</span>
            </div>
            <p className="text-2xl font-bold text-[#1a2744]">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck size={16} className="text-emerald-500" />
              <span className="text-sm text-slate-500">Active</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <UserX size={16} className="text-slate-400" />
              <span className="text-sm text-slate-500">Inactive</span>
            </div>
            <p className="text-2xl font-bold text-slate-500">{stats.inactive}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Wrench size={16} className="text-blue-500" />
              <span className="text-sm text-slate-500">Departments</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.departments}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Wrench size={16} className="text-amber-500" />
              <span className="text-sm text-slate-500">Avg Skills</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.avgSkills}</p>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <h3 className="text-sm font-semibold text-[#1a2744] mb-3">Department Distribution</h3>
          <div className="grid grid-cols-6 gap-3">
            {departmentCounts.map(([dept, count]) => (
              <button
                key={dept}
                onClick={() => { setFilter(dept); setCurrentPage(1); }}
                className={`p-3 rounded-lg border transition-all text-center ${
                  filter === dept 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-lg font-bold text-[#1a2744]">{count}</p>
                <p className="text-xs text-slate-500 truncate">{dept}</p>
              </button>
            ))}
          </div>
        </div>
        
        {/* Employee Cards */}
        <div className="grid grid-cols-3 gap-4">
          {paginatedEmployees.map((employee) => (
            <div key={employee.id} className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-md transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                  employee.status === 'ACTIVE' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-br from-slate-300 to-slate-400'
                }`}>
                  {employee.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1a2744] truncate">{employee.name}</h3>
                  <p className="text-sm text-slate-500">{employee.department}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    employee.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {employee.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Employee ID</p>
                  <p className="text-sm font-medium text-[#1a2744]">#{employee.id}</p>
                </div>
                
                <div>
                  <p className="text-xs text-slate-400 mb-1">Skills ({employee.skills.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {employee.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                    {employee.skills.length > 3 && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">
                        +{employee.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {paginatedEmployees.length === 0 && (
            <div className="col-span-3 bg-white rounded-2xl border border-slate-200">
              <EmptyListState
                title="Sem funcionários encontrados"
                message="Nenhum funcionário corresponde aos filtros aplicados. Tente alterar os critérios de pesquisa."
              />
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-sm text-slate-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} employees
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = currentPage <= 3 ? i + 1 : currentPage + i - 2;
                if (page > totalPages || page < 1) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium ${
                      currentPage === page 
                        ? 'bg-[#1a2744] text-white' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
