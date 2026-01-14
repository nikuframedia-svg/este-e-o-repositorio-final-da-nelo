import { Link } from 'react-router-dom';
import { ChevronLeft, DollarSign } from 'lucide-react';
import { NoDataState } from '../../components/ui';

export function RatesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-400 hover:text-slate-600">
              <ChevronLeft size={20} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
                <DollarSign size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1a2744]">Rates</h1>
                <p className="text-sm text-slate-500">Labor, Machine & Overhead rates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl border border-slate-200">
          <NoDataState
            title="Sem taxas definidas"
            message="Não existem taxas de mão-de-obra, máquinas ou overhead definidas no sistema. Os custos por hora não estão disponíveis no ficheiro Excel de origem."
            icon={<DollarSign size={32} className="text-slate-300" />}
          />
        </div>
      </div>
    </div>
  );
}
