import { Link } from 'react-router-dom';
import { ChevronLeft, Activity } from 'lucide-react';
import { NoDataState } from '../../components/ui';

export function CapacityPage() {
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <Activity size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1a2744]">Capacity Planning</h1>
                <p className="text-sm text-slate-500">Monitor and optimize utilization</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl border border-slate-200">
          <NoDataState
            title="Sem dados de capacidade"
            message="Não existem dados de capacidade planeada no sistema. A análise de capacidade requer informações sobre capacidade das máquinas, turnos e calendário de produção que não estão disponíveis no ficheiro Excel de origem."
            icon={<Activity size={32} className="text-slate-300" />}
          />
        </div>
      </div>
    </div>
  );
}
