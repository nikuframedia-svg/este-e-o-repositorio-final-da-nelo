import type { CopilotResponse } from '../../lib/api';
import { ExternalLink } from 'lucide-react';

interface CopilotCitationsProps {
  response: CopilotResponse;
}

export function CopilotCitations({ response }: CopilotCitationsProps) {
  // Coletar todas as citations com fallbacks seguros
  const facts = response?.facts || [];
  const allCitations = facts
    .flatMap((fact) => fact?.citations || [])
    .filter((citation) => citation && typeof citation === 'object');

  if (allCitations.length === 0) {
    return (
      <div className="mt-2 text-sm text-slate-500 italic">
        Nenhuma evidência disponível
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2.5">
      {allCitations.map((citation, idx) => {
        // Garantir que citation tem todos os campos necessários
        const label = citation?.label || 'Sem rótulo';
        const sourceType = citation?.source_type || 'unknown';
        const ref = citation?.ref || '';
        const confidence = typeof citation?.confidence === 'number' ? citation.confidence : 0.8;
        const trustIndex = typeof citation?.trust_index === 'number' ? citation.trust_index : 0.75;

        return (
          <div
            key={idx}
            className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 mb-1.5">
                  {label}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-600 font-medium">
                    {sourceType}
                  </span>
                  {ref && (
                    <span className="text-xs text-slate-500 truncate">
                      {ref}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-600">Confiança:</span>
                    <span className="text-xs font-semibold text-slate-800">
                      {(confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-600">Trust:</span>
                    <span className="text-xs font-semibold text-slate-800">
                      {(trustIndex * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              <button
                className="p-2 hover:bg-white rounded-lg transition-all duration-150 hover:scale-105 flex-shrink-0"
                title="Abrir referência"
              >
                <ExternalLink size={16} className="text-slate-500 hover:text-slate-700" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

