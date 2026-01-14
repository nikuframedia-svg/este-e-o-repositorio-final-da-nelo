import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Package,
  ChevronLeft,
  Edit,
  Trash2,
  Eye,
  Weight,
  Droplets,
} from 'lucide-react';
import { DisabledButton, DisabledIconButton, EmptyTableState } from '../../components/ui';

// Import real data
import productsData from '../../data/products.json';

interface Product {
  id: string;
  name: string;
  type: string;
  weightDismold: number;
  weightFinish: number;
  gelDeck: number;
  gelHull: number;
  status: string;
}

const products: Product[] = productsData;

// Get unique product types from data
const productTypes = ['ALL', ...new Set(products.map(p => p.type))].sort();

export function ProductsPage() {
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesType = filterType === 'ALL' || p.type === filterType;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.id.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [filterType, search]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const stats = useMemo(() => ({
    total: products.length,
    active: products.filter(p => p.status === 'ACTIVE').length,
    k1: products.filter(p => p.type === 'K1').length,
    k2: products.filter(p => p.type === 'K2').length,
    k4: products.filter(p => p.type === 'K4').length,
    avgWeight: products.reduce((sum, p) => sum + p.weightFinish, 0) / products.length,
  }), []);

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Package size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1a2744]">Kayak Models</h1>
                <p className="text-sm text-slate-500">{products.length} products in catalog</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 w-72">
                <Search size={18} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search kayaks..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="flex-1 bg-transparent text-sm outline-none"
                />
              </div>
              
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto">
                {productTypes.slice(0, 8).map((type) => (
                  <button
                    key={type}
                    onClick={() => { setFilterType(type); setCurrentPage(1); }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                      filterType === type 
                        ? 'bg-white text-[#1a2744] shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            <DisabledButton icon={<Plus size={18} />}>
              Add Kayak
            </DisabledButton>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="grid grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-2xl font-bold text-[#1a2744]">{stats.total}</p>
            <p className="text-sm text-slate-500">Total Models</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
            <p className="text-sm text-slate-500">Active</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-2xl font-bold text-blue-600">{stats.k1}</p>
            <p className="text-sm text-slate-500">K1 Singles</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-2xl font-bold text-purple-600">{stats.k2}</p>
            <p className="text-sm text-slate-500">K2 Doubles</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-2xl font-bold text-amber-600">{stats.k4}</p>
            <p className="text-sm text-slate-500">K4 Fours</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-2xl font-bold text-[#1a2744]">{stats.avgWeight.toFixed(1)} kg</p>
            <p className="text-sm text-slate-500">Avg Weight</p>
          </div>
        </div>
        
        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Model</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Weight size={14} />
                    Dismold
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Weight size={14} />
                    Finish
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Droplets size={14} />
                    Gel Deck
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Droplets size={14} />
                    Gel Hull
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-semibold text-[#1a2744] text-sm">{product.name}</p>
                      <p className="text-xs text-slate-400">ID: {product.id}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      product.type === 'K1' ? 'bg-blue-50 text-blue-600' :
                      product.type === 'K2' ? 'bg-purple-50 text-purple-600' :
                      product.type === 'K4' ? 'bg-amber-50 text-amber-600' :
                      product.type === 'C1' ? 'bg-emerald-50 text-emerald-600' :
                      product.type === 'C2' ? 'bg-teal-50 text-teal-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {product.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-slate-700">{product.weightDismold} kg</td>
                  <td className="py-4 px-6 text-sm font-medium text-[#1a2744]">{product.weightFinish} kg</td>
                  <td className="py-4 px-6 text-sm text-slate-600">{product.gelDeck} L</td>
                  <td className="py-4 px-6 text-sm text-slate-600">{product.gelHull} L</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      product.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-1">
                      <DisabledIconButton icon={<Eye size={16} />} tooltip="Ver detalhes (em desenvolvimento)" />
                      <DisabledIconButton icon={<Edit size={16} />} tooltip="Editar (em desenvolvimento)" />
                      <DisabledIconButton icon={<Trash2 size={16} />} tooltip="Eliminar (em desenvolvimento)" />
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedProducts.length === 0 && (
                <EmptyTableState 
                  title="Sem produtos encontrados"
                  message="Nenhum produto corresponde aos filtros aplicados. Tente alterar os critérios de pesquisa."
                />
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} results
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
                if (page > totalPages) return null;
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
        </div>
      </div>
    </div>
  );
}
