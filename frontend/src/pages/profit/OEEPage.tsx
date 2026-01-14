import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft,
  Gauge,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Target,
  Activity,
  Info,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

// Import real OEE data
import oeeMetrics from '../../data/oeeMetrics.json';

interface FPYFamily {
  totalOrders: number;
  ordersWithErrors: number;
  fpy: number;
}

interface PhasePerformance {
  phaseId: string;
  phaseName: string;
  avgStandardTime: number;
  avgActualTime: number;
  performance: number;
  recordCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTIMATE BADGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function EstimateBadge({ tooltip }: { tooltip: string }) {
  return (
    <div className="group relative inline-flex items-center">
      <span className="badge-estimate">
        Estimativa
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 w-52 text-center shadow-xl">
        {tooltip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REAL DATA BADGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function RealDataBadge() {
  return (
    <span className="badge-real">
      Dados Reais
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OEE GAUGE COMPONENT - Premium Redesign
// ═══════════════════════════════════════════════════════════════════════════════

function OEEGauge({ 
  value, 
  label, 
  color,
  size = 'lg',
  isEstimate = false,
  methodology,
  glowClass
}: { 
  value: number; 
  label: string; 
  color: string;
  size?: 'sm' | 'md' | 'lg';
  isEstimate?: boolean;
  methodology?: string;
  glowClass?: string;
}) {
  const config = {
    lg: { radius: 80, stroke: 14, textSize: 'text-5xl', labelSize: 'text-sm' },
    md: { radius: 60, stroke: 12, textSize: 'text-4xl', labelSize: 'text-xs' },
    sm: { radius: 45, stroke: 10, textSize: 'text-2xl', labelSize: 'text-xs' },
  }[size];
  
  const circumference = 2 * Math.PI * config.radius;
  const progress = (value / 100) * circumference;
  const remaining = circumference - progress;
  
  const getStatus = (val: number) => {
    if (val >= 65) return { text: 'Bom', bgClass: 'bg-emerald-100', textClass: 'text-emerald-700' };
    if (val >= 40) return { text: 'Médio', bgClass: 'bg-amber-100', textClass: 'text-amber-700' };
    return { text: 'Baixo', bgClass: 'bg-red-100', textClass: 'text-red-700' };
  };
  
  const status = getStatus(value);
  
  return (
    <div className="gauge-container animate-fadeIn">
      <div className="relative">
        <svg 
          width={(config.radius + config.stroke) * 2} 
          height={(config.radius + config.stroke) * 2} 
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.radius + config.stroke}
            cy={config.radius + config.stroke}
            r={config.radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={config.stroke}
          />
          {/* Progress circle with glow */}
          <circle
            cx={config.radius + config.stroke}
            cy={config.radius + config.stroke}
            r={config.radius}
            fill="none"
            stroke={color}
            strokeWidth={config.stroke}
            strokeDasharray={`${progress} ${remaining}`}
            strokeLinecap="round"
            className={`gauge-arc ${glowClass || ''}`}
          />
        </svg>
        
        {/* Center content */}
        <div className="gauge-value">
          <span className={`font-extrabold ${config.textSize} tracking-tight`} style={{ color }}>
            {value}
            <span className="text-lg font-semibold opacity-70">%</span>
          </span>
          {size === 'lg' && (
            <span className={`mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.bgClass} ${status.textClass}`}>
              {status.text}
            </span>
          )}
        </div>
      </div>
      
      {/* Label section */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <p className={`font-semibold text-slate-700 ${config.labelSize}`}>{label}</p>
        {isEstimate ? (
          <EstimateBadge tooltip={methodology || 'Valor calculado com base em estimativas'} />
        ) : (
          <RealDataBadge />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// METRIC CARD COMPONENT - Premium Version
// ═══════════════════════════════════════════════════════════════════════════════

function MetricCardPremium({ 
  label, 
  value, 
  unit,
  icon,
  iconBgClass,
  trend,
  description 
}: { 
  label: string; 
  value: string | number; 
  unit?: string;
  icon: React.ReactNode;
  iconBgClass?: string;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}) {
  return (
    <div className="card-interactive p-5 group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgClass || 'bg-slate-100'}`}>
          {icon}
        </div>
        {trend && trend !== 'neutral' && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend === 'up' ? 'text-emerald-600' : 'text-red-500'
          }`}>
            {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          </div>
        )}
      </div>
      
      <p className="label-sm mb-1">{label}</p>
      
      <div className="flex items-baseline gap-1">
        <span className="metric-lg group-hover:text-blue-600 transition-colors">{value}</span>
        {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
      </div>
      
      {description && (
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FPY BAR COMPONENT - Premium Pill Design
// ═══════════════════════════════════════════════════════════════════════════════

function FPYBarPremium({ family, data }: { family: string; data: FPYFamily }) {
  const getColorClass = (fpy: number) => {
    if (fpy >= 50) return { bar: 'bg-emerald-500', dot: 'border-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (fpy >= 30) return { bar: 'bg-amber-500', dot: 'border-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' };
    return { bar: 'bg-red-500', dot: 'border-red-500', text: 'text-red-600', bg: 'bg-red-50' };
  };
  
  const colors = getColorClass(data.fpy);
  
  return (
    <div className="fpy-bar-container py-2 group hover:bg-slate-50/50 rounded-lg transition-colors -mx-2 px-2">
      <span className="w-14 text-sm font-bold text-slate-800">{family}</span>
      
      <div className="fpy-bar">
        <div 
          className={`fpy-bar-fill ${colors.bar}`}
          style={{ width: `${Math.max(data.fpy, 2)}%` }}
        >
          <div className={`fpy-bar-dot ${colors.dot}`} />
        </div>
      </div>
      
      <div className={`px-3 py-1 rounded-full ${colors.bg} ${colors.text} text-sm font-bold min-w-[4rem] text-center`}>
        {data.fpy}%
      </div>
      
      <span className="w-24 text-xs text-slate-500 text-right tabular-nums">
        {data.totalOrders.toLocaleString()} ordens
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE PERFORMANCE ROW - Premium Table Style
// ═══════════════════════════════════════════════════════════════════════════════

function PhasePerformanceRowPremium({ phase, maxRecords }: { phase: PhasePerformance; maxRecords: number }) {
  const getPerformanceBadge = (perf: number) => {
    if (perf >= 80) return 'badge-good';
    if (perf >= 60) return 'badge-attention';
    return 'badge-critical';
  };
  
  return (
    <tr className="border-b border-slate-100/80 hover:bg-blue-50/40 transition-colors">
      <td className="py-3.5 px-4">
        <p className="font-semibold text-slate-800 text-sm">{phase.phaseName}</p>
      </td>
      <td className="py-3.5 px-4 text-center">
        <span className="text-sm text-slate-600 tabular-nums font-medium">{phase.avgStandardTime}h</span>
      </td>
      <td className="py-3.5 px-4 text-center">
        <span className="text-sm text-slate-600 tabular-nums font-medium">{phase.avgActualTime}h</span>
      </td>
      <td className="py-3.5 px-4 text-center">
        <span className={`badge-pill ${getPerformanceBadge(phase.performance)}`}>
          {phase.performance}%
        </span>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 progress-bar">
            <div 
              className="progress-bar-fill progress-bar-blue"
              style={{ width: `${(phase.recordCount / maxRecords) * 100}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 w-14 text-right tabular-nums font-medium">
            {phase.recordCount.toLocaleString()}
          </span>
        </div>
      </td>
    </tr>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN OEE PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function OEEPage() {
  const fpyByFamily = oeeMetrics.fpyByFamily as Record<string, FPYFamily>;
  const performanceByPhase = oeeMetrics.performanceByPhase as PhasePerformance[];
  
  const maxRecords = useMemo(() => {
    return Math.max(...performanceByPhase.map(p => p.recordCount));
  }, [performanceByPhase]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50">
      {/* ═══════════════════════════════════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/80 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all"
            >
              <ChevronLeft size={20} />
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Gauge size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">OEE Dashboard</h1>
                <p className="text-sm text-slate-500">Overall Equipment Effectiveness</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* ═══════════════════════════════════════════════════════════════════════
          CONTENT
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        
        {/* ─────────────────────────────────────────────────────────────────────
            INFO BANNER
            ───────────────────────────────────────────────────────────────────── */}
        <div className="info-banner animate-fadeIn">
          <div className="info-banner-icon">
            <Info size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">Metodologia de Cálculo OEE</p>
            <p className="text-sm text-blue-700 mt-1 leading-relaxed">
              <strong>Disponibilidade</strong>: Fases iniciadas / Total de fases &nbsp;•&nbsp;
              <strong>Desempenho</strong>: Tempo padrão médio / Tempo real médio (máx 100%) &nbsp;•&nbsp;
              <strong>Qualidade (FPY)</strong>: Ordens sem erros / Total de ordens
            </p>
          </div>
        </div>
        
        {/* ─────────────────────────────────────────────────────────────────────
            MAIN GAUGES SECTION
            ───────────────────────────────────────────────────────────────────── */}
        <div className="card-elevated p-8 animate-fadeInUp">
          <div className="grid grid-cols-4 gap-8">
            {/* Main OEE Gauge */}
            <div className="flex flex-col items-center justify-center">
              <OEEGauge 
                value={oeeMetrics.oee} 
                label="OEE Global" 
                color="#3b82f6" 
                size="md"
                isEstimate={true}
                methodology="OEE = Disponibilidade × Desempenho × Qualidade"
                glowClass="gauge-glow-blue"
              />
              <p className="text-xs text-slate-400 mt-3 text-center max-w-[180px]">
                Disponibilidade × Desempenho × Qualidade
              </p>
            </div>
            
            {/* Availability */}
            <div className="flex flex-col items-center justify-center">
              <OEEGauge 
                value={oeeMetrics.availability} 
                label="Disponibilidade" 
                color="#10b981" 
                size="md"
                isEstimate={true}
                methodology="Fases iniciadas / Total de fases"
                glowClass="gauge-glow-green"
              />
              <p className="text-xs text-slate-400 mt-3 text-center tabular-nums">
                {oeeMetrics.phasesStarted.toLocaleString()} / {oeeMetrics.totalPhases.toLocaleString()} fases
              </p>
            </div>
            
            {/* Performance */}
            <div className="flex flex-col items-center justify-center">
              <OEEGauge 
                value={oeeMetrics.performance} 
                label="Desempenho" 
                color="#f59e0b" 
                size="md"
                isEstimate={true}
                methodology="Tempo padrão / Tempo real (capped 100%)"
                glowClass="gauge-glow-amber"
              />
              <p className="text-xs text-slate-400 mt-3 text-center tabular-nums">
                {oeeMetrics.avgStandardTime}h std vs {oeeMetrics.avgActualTime}h real
              </p>
            </div>
            
            {/* Quality (FPY) */}
            <div className="flex flex-col items-center justify-center">
              <OEEGauge 
                value={oeeMetrics.quality} 
                label="Qualidade (FPY)" 
                color="#ef4444" 
                size="md"
                isEstimate={false}
                glowClass="gauge-glow-red"
              />
              <p className="text-xs text-slate-400 mt-3 text-center tabular-nums">
                {oeeMetrics.ordersWithoutErrors.toLocaleString()} / {oeeMetrics.totalOrders.toLocaleString()} ordens OK
              </p>
            </div>
          </div>
        </div>
        
        {/* ─────────────────────────────────────────────────────────────────────
            METRICS GRID
            ───────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-5 gap-4">
          <div className="animate-fadeIn stagger-1">
            <MetricCardPremium
              label="Total de Ordens"
              value={oeeMetrics.totalOrders.toLocaleString()}
              icon={<Target size={18} className="text-slate-600" />}
              iconBgClass="bg-slate-100"
            />
          </div>
          <div className="animate-fadeIn stagger-2">
            <MetricCardPremium
              label="Ordens OK (FPY)"
              value={oeeMetrics.ordersWithoutErrors.toLocaleString()}
              icon={<CheckCircle2 size={18} className="text-emerald-600" />}
              iconBgClass="bg-emerald-50"
              trend="neutral"
            />
          </div>
          <div className="animate-fadeIn stagger-3">
            <MetricCardPremium
              label="Ordens com Erros"
              value={oeeMetrics.ordersWithErrors.toLocaleString()}
              icon={<AlertTriangle size={18} className="text-red-500" />}
              iconBgClass="bg-red-50"
              trend="down"
            />
          </div>
          <div className="animate-fadeIn stagger-4">
            <MetricCardPremium
              label="Taxa de Retrabalho"
              value={oeeMetrics.reworkRate}
              unit="%"
              icon={<Activity size={18} className="text-purple-500" />}
              iconBgClass="bg-purple-50"
              description="Ordens que precisaram de retrabalho"
            />
          </div>
          <div className="animate-fadeIn stagger-5">
            <MetricCardPremium
              label="Gap Cycle Time"
              value={`+${((oeeMetrics.avgActualTime / oeeMetrics.avgStandardTime - 1) * 100).toFixed(0)}`}
              unit="%"
              icon={<Clock size={18} className="text-amber-500" />}
              iconBgClass="bg-amber-50"
              description="Tempo real vs padrão"
            />
          </div>
        </div>
        
        {/* ─────────────────────────────────────────────────────────────────────
            TWO COLUMN LAYOUT
            ───────────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-6">
          {/* FPY by Product Family */}
          <div className="col-span-5 card-premium p-6 animate-fadeInUp">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-900">FPY por Família</h3>
                <p className="text-xs text-slate-500 mt-0.5">First Pass Yield</p>
              </div>
              <span className="badge-pill badge-neutral">
                {Object.keys(fpyByFamily).length} famílias
              </span>
            </div>
            
            <div className="space-y-1">
              {Object.entries(fpyByFamily)
                .sort((a, b) => b[1].totalOrders - a[1].totalOrders)
                .map(([family, data]) => (
                  <FPYBarPremium key={family} family={family} data={data} />
                ))}
            </div>
            
            {/* Insight Card */}
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-900">Insight</p>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    K2 tem o FPY mais baixo (12.0%), seguido por C1 (14.5%). 
                    Foque melhorias de qualidade nestas famílias primeiro.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Performance by Phase Table */}
          <div className="col-span-7 card-premium overflow-hidden animate-fadeInUp">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Desempenho por Fase</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Comparação tempo padrão vs real</p>
                </div>
                <span className="badge-pill badge-neutral">
                  Top 10 fases
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th className="text-left">Fase</th>
                    <th className="text-center">Std Time</th>
                    <th className="text-center">Actual</th>
                    <th className="text-center">Performance</th>
                    <th className="text-left">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceByPhase.slice(0, 10).map((phase) => (
                    <PhasePerformanceRowPremium 
                      key={phase.phaseId} 
                      phase={phase} 
                      maxRecords={maxRecords} 
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* ─────────────────────────────────────────────────────────────────────
            RECOMMENDATIONS SECTION
            ───────────────────────────────────────────────────────────────────── */}
        <div className="recommendations-container animate-fadeInUp">
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-6">Ações Recomendadas</h3>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Recommendation 1 */}
              <div className="recommendation-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="recommendation-number bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/30">
                    1
                  </div>
                  <span className="font-semibold text-white">Quality Gate</span>
                  <ArrowRight size={14} className="text-white/50 ml-auto" />
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  Implementar checkpoint de qualidade após fase de Laminagem para detetar defeitos mais cedo (reduzindo taxa de retrabalho de 69.7%).
                </p>
              </div>
              
              {/* Recommendation 2 */}
              <div className="recommendation-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="recommendation-number bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30">
                    2
                  </div>
                  <span className="font-semibold text-white">Standard Work</span>
                  <ArrowRight size={14} className="text-white/50 ml-auto" />
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  Standardizar processos de Laminagem + Preparação de Molde para melhorar taxa de desempenho de 67.6%.
                </p>
              </div>
              
              {/* Recommendation 3 */}
              <div className="recommendation-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="recommendation-number bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30">
                    3
                  </div>
                  <span className="font-semibold text-white">Manutenção Moldes</span>
                  <ArrowRight size={14} className="text-white/50 ml-auto" />
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  Agendar inspeção/polimento regular de moldes para resolver issues de "Molde baço" e "Molde com deformações".
                </p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
