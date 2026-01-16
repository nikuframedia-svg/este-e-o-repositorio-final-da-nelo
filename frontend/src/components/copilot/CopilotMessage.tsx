import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, AlertTriangle } from 'lucide-react';
import type { CopilotResponse } from '../../lib/api';
import { CopilotCitations } from './CopilotCitations';
import { CopilotActions } from './CopilotActions';

interface CopilotMessageProps {
  response: CopilotResponse;
}

export function CopilotMessage({ response }: CopilotMessageProps) {
  const [showCitations, setShowCitations] = useState(false);

  // Verificar warnings com fallback seguro
  const warnings = response.warnings || [];
  const hasWarnings = warnings.length > 0;
  const hasInsufficientEvidence = warnings.some(
    (w) => w.code === 'INSUFFICIENT_EVIDENCE'
  );

  // Verificar facts com fallback seguro
  const facts = response.facts || [];
  const actions = response.actions || [];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div>
        <p className="font-semibold text-slate-900 mb-2 leading-relaxed text-base">{response.summary || '(Sem resumo)'}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium">
            {response.intent}
          </span>
          <span className="text-xs text-slate-400">
            {response.meta?.latency_ms || 0}ms
          </span>
        </div>
      </div>

      {/* Warnings */}
      {hasWarnings && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200/60 rounded-xl p-4 shadow-sm">
          {warnings.map((warning, idx) => (
            <div key={idx} className="flex items-start gap-3 text-yellow-800">
              <div className="w-6 h-6 rounded-lg bg-yellow-200/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle size={14} className="text-yellow-700" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">{warning.code}</p>
                <p className="text-xs leading-relaxed text-yellow-700/80">{warning.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Facts */}
      {facts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Factos</h4>
          {facts.map((fact, idx) => {
            const factCitations = fact.citations || [];
            return (
            <div key={idx} className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
              <p className="text-sm text-slate-800 leading-relaxed mb-2">{fact.text || '(Sem texto)'}</p>
              {factCitations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                  {factCitations.map((citation, cIdx) => (
                    <span
                      key={cIdx}
                      className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700 font-medium shadow-sm"
                      title={`${citation.label} (${citation.source_type})`}
                    >
                      {citation.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <CopilotActions actions={actions} suggestionId={response.suggestion_id} />
      )}

      {/* Citations Accordion - apenas mostrar se houver evidências */}
      {(() => {
        const totalCitations = facts.reduce((acc, f) => acc + (f.citations?.length || 0), 0);
        if (totalCitations === 0) {
          return null; // Não mostrar se não houver evidências
        }
        return (
          <div className="border-t border-slate-200/60 pt-3">
            <button
              onClick={() => setShowCitations(!showCitations)}
              className="flex items-center justify-between w-full text-sm text-slate-600 hover:text-slate-900 transition-colors duration-150 group"
            >
              <span className="font-medium">Evidências ({totalCitations})</span>
              <div className={`transition-transform duration-200 ${showCitations ? 'rotate-180' : ''}`}>
                <ChevronDown size={18} className="text-slate-400 group-hover:text-slate-600" />
              </div>
            </button>
            
            {showCitations && (
              <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
                <CopilotCitations response={response} />
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

