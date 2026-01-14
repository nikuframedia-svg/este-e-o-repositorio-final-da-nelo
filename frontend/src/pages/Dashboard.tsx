import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search,
  Bell,
  ChevronRight,
  Settings,
  Package,
  Cpu,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Layers,
  PieChart,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  Gauge,
  Activity,
  FileX,
} from 'lucide-react';
import { SimpleTooltip } from '../components/ui';

// Import real data
import ordersData from '../data/orders.json';
import productsData from '../data/products.json';
import employeesData from '../data/employees.json';
import phasesData from '../data/phases.json';
import errorsData from '../data/errors.json';
import oeeMetrics from '../data/oeeMetrics.json';
import qualityAnalysis from '../data/qualityAnalysis.json';

// Computed stats
// NOTE: Orders stats use oeeMetrics (from FULL Excel data) NOT ordersData (which is sampled for listings)
const stats = {
  // Products and Employees - complete data from JSON
  totalProducts: productsData.length,
  activeEmployees: employeesData.filter(e => e.status === 'ACTIVE').length,
  totalEmployees: employeesData.length,
  totalPhases: phasesData.length,
  productionPhases: phasesData.filter(p => p.isProduction).length,
  
  // Orders - from oeeMetrics (FULL Excel data: 27,380 orders)
  ordersInProgress: oeeMetrics.ordersInProgress || 0,
  ordersCompleted: oeeMetrics.ordersCompleted || 0,
  totalOrders: oeeMetrics.totalOrders,
  
  // Recent items for preview (from sampled data - OK for preview)
  recentErrors: errorsData.slice(0, 5),
  
  // Product type counts
  k1Count: productsData.filter(p => p.type === 'K1').length,
  k2Count: productsData.filter(p => p.type === 'K2').length,
  k4Count: productsData.filter(p => p.type === 'K4').length,
};

// NELO Logo Component
function NeloLogo() {
  return (
    <div className="flex items-center gap-2">
      <div 
        className="flex items-center justify-center font-extrabold"
        style={{
          width: 32,
          height: 32,
          background: '#f7df1e',
          borderRadius: 10,
          fontSize: 14,
          color: '#1a2744',
        }}
      >
        N
      </div>
      <span className="font-bold text-[#1a2744] text-lg tracking-tight">NELO</span>
    </div>
  );
}

// OEE Mini Gauge
function OEEMiniGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const radius = 28;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;
  const remaining = circumference - progress;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={72} height={72} className="transform -rotate-90">
          <circle
            cx={36}
            cy={36}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={stroke}
          />
          <circle
            cx={36}
            cy={36}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${progress} ${remaining}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{value}%</span>
        </div>
      </div>
      <span className="text-xs text-white/70 mt-1">{label}</span>
    </div>
  );
}

// Navigation
function TopNav() {
  const [active, setActive] = useState('Home');
  const items = [
    { name: 'Home', href: '/' },
    { name: 'CORE', href: '/core/products' },
    { name: 'PLAN', href: '/plan/scheduling' },
    { name: 'PROFIT', href: '/profit/cogs' },
    { name: 'HR', href: '/hr/allocations' },
  ];
  
  return (
    <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <NeloLogo />
          <nav className="flex items-center gap-1">
            {items.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setActive(item.name)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  active === item.name 
                    ? 'text-[#1a2744] bg-slate-100' 
                    : 'text-slate-500 hover:text-[#1a2744] hover:bg-slate-50'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5 w-72">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..."
              className="flex-1 bg-transparent text-sm outline-none text-[#1a2744] placeholder:text-slate-400"
            />
          </div>
          
          <SimpleTooltip content="Configurações (em desenvolvimento)">
            <button 
              className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 cursor-not-allowed"
              aria-label="Configurações"
            >
              <Settings size={18} />
            </button>
          </SimpleTooltip>
          
          <SimpleTooltip content="Ver erros de qualidade">
            <Link 
              to="/profit/quality"
              className="relative w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
              aria-label="Notificações de erros"
            >
              <Bell size={18} />
              {stats.recentErrors.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#ff6b6b] rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                  {stats.recentErrors.length}
                </span>
              )}
            </Link>
          </SimpleTooltip>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 overflow-hidden cursor-pointer ring-2 ring-white shadow-md flex items-center justify-center text-white font-bold text-sm">
            NL
          </div>
        </div>
      </div>
    </header>
  );
}

// OEE Overview Card
function OEEOverviewCard() {
  const getColor = (val: number) => {
    if (val >= 65) return '#22c55e';
    if (val >= 40) return '#f59e0b';
    return '#ef4444';
  };
  
  return (
    <Link to="/profit/oee" className="block">
      <div className="bg-gradient-to-br from-[#1a2744] to-[#2d4a7c] rounded-2xl p-6 text-white hover:shadow-xl transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Gauge size={24} />
            <div>
              <h3 className="font-bold text-lg">OEE Dashboard</h3>
              <p className="text-white/60 text-sm">Overall Equipment Effectiveness</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/50" />
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          <OEEMiniGauge value={oeeMetrics.oee} label="OEE" color={getColor(oeeMetrics.oee)} />
          <OEEMiniGauge value={oeeMetrics.availability} label="Availability" color={getColor(oeeMetrics.availability)} />
          <OEEMiniGauge value={oeeMetrics.performance} label="Performance" color={getColor(oeeMetrics.performance)} />
          <OEEMiniGauge value={oeeMetrics.quality} label="Quality" color={getColor(oeeMetrics.quality)} />
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <TrendingDown size={14} className="text-red-400" />
            <span className="text-white/70">{oeeMetrics.reworkRate}% rework rate</span>
          </div>
          <span className="text-xs text-white/50">{oeeMetrics.totalOrders.toLocaleString()} orders analyzed</span>
        </div>
      </div>
    </Link>
  );
}

// Module Card
interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  links: { name: string; href: string }[];
  stats?: { label: string; value: string }[];
}

function ModuleCard({ title, description, icon, iconBg, links, stats: cardStats }: ModuleCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all">
      <div className="flex items-start gap-4 mb-4">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconBg)}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-[#1a2744] text-lg">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      
      {cardStats && (
        <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-slate-50 rounded-xl">
          {cardStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-xl font-bold text-[#1a2744]">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
      
      <div className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="flex items-center justify-between py-2 px-3 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-[#1a2744] transition-colors group"
          >
            <span>{link.name}</span>
            <ChevronRight size={16} className="text-slate-400 group-hover:text-[#1a2744] transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// KPI Card
function KPICard({ 
  label, 
  value, 
  change, 
  icon,
  iconBg,
  href,
}: { 
  label: string;
  value: string;
  change?: { value: number; label: string };
  icon: React.ReactNode;
  iconBg: string;
  href?: string;
}) {
  const content = (
    <div className={cn(
      "bg-white rounded-2xl p-5 border border-slate-100",
      href && "hover:shadow-md transition-all cursor-pointer"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg)}>
          {icon}
        </div>
        {change && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
            change.value >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          )}>
            {change.value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {change.value >= 0 ? '+' : ''}{change.value}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-[#1a2744] mb-1">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
  
  if (href) {
    return <Link to={href}>{content}</Link>;
  }
  return content;
}

// Recent Activity - Using real order data
function RecentActivity() {
  const recentOrders = ordersData.slice(0, 4);
  
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#1a2744]">Recent Orders</h3>
        <Link to="/plan/scheduling" className="text-sm text-slate-500 hover:text-[#1a2744]">View all</Link>
      </div>
      {recentOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-2">
            <FileX size={20} className="text-slate-300" />
          </div>
          <p className="text-sm text-slate-500">Sem ordens recentes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-start gap-3 py-2">
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
              )}>
                {order.status === 'IN_PROGRESS' ? <PlayCircle size={16} /> : <CheckCircle2 size={16} />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#1a2744] font-medium">{order.productName}</p>
                <p className="text-xs text-slate-400">OF-{order.id} · {order.currentPhaseName}</p>
              </div>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                order.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
              )}>
                {order.status === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Quality Summary Card
function QualitySummaryCard() {
  return (
    <Link to="/profit/quality" className="block">
      <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-emerald-500" />
            <h3 className="font-bold text-[#1a2744]">Quality Overview</h3>
          </div>
          <ChevronRight size={16} className="text-slate-400" />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">FPY Rate</span>
            <span className={cn(
              "font-bold",
              oeeMetrics.quality >= 50 ? "text-emerald-600" : 
              oeeMetrics.quality >= 30 ? "text-amber-600" : "text-red-600"
            )}>
              {oeeMetrics.quality}%
            </span>
          </div>
          
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full",
                oeeMetrics.quality >= 50 ? "bg-emerald-500" : 
                oeeMetrics.quality >= 30 ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${oeeMetrics.quality}%` }}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="text-center p-2 bg-amber-50 rounded-lg">
              <p className="text-lg font-bold text-amber-600">{qualityAnalysis.minorErrorsCount.toLocaleString()}</p>
              <p className="text-[10px] text-amber-700">Minor</p>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded-lg">
              <p className="text-lg font-bold text-orange-600">{qualityAnalysis.majorErrorsCount.toLocaleString()}</p>
              <p className="text-[10px] text-orange-700">Major</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-lg">
              <p className="text-lg font-bold text-red-600">{qualityAnalysis.criticalErrorsCount.toLocaleString()}</p>
              <p className="text-[10px] text-red-700">Critical</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Quick Actions
function QuickActions() {
  const actions = [
    { label: 'OEE Dashboard', icon: Gauge, href: '/profit/oee', color: 'bg-blue-500' },
    { label: 'Quality Analysis', icon: CheckCircle2, href: '/profit/quality', color: 'bg-emerald-500' },
    { label: 'Production Orders', icon: Calendar, href: '/plan/scheduling', color: 'bg-amber-500' },
    { label: 'COGS Analysis', icon: PieChart, href: '/profit/cogs', color: 'bg-purple-500' },
  ];
  
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <h3 className="font-bold text-[#1a2744] mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.href}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-white', action.color)}>
              <action.icon size={18} />
            </div>
            <span className="text-sm font-medium text-[#1a2744]">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Product Type Distribution - COMPLETE with C4 and Other
function ProductDistribution() {
  const c4Count = productsData.filter(p => p.type === 'C4').length;
  const otherCount = productsData.filter(p => p.type === 'Other').length;
  
  const types = [
    { type: 'K1', count: stats.k1Count, color: 'bg-blue-500' },
    { type: 'K2', count: stats.k2Count, color: 'bg-purple-500' },
    { type: 'K4', count: stats.k4Count, color: 'bg-amber-500' },
    { type: 'C1', count: productsData.filter(p => p.type === 'C1').length, color: 'bg-emerald-500' },
    { type: 'C2', count: productsData.filter(p => p.type === 'C2').length, color: 'bg-teal-500' },
    { type: 'C4', count: c4Count, color: 'bg-cyan-500' },
    { type: 'Other', count: otherCount, color: 'bg-slate-400' },
  ];
  
  const total = types.reduce((sum, t) => sum + t.count, 0);
  
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100">
      <h3 className="font-bold text-[#1a2744] mb-4">
        Distribuição de Modelos <span className="font-normal text-sm text-slate-400">({total} total)</span>
      </h3>
      <div className="space-y-3">
        {types.map((item) => (
          <div key={item.type} className="flex items-center gap-3">
            <div className={cn('w-3 h-3 rounded-full', item.color)} />
            <span className="text-sm text-slate-600 w-8">{item.type}</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={cn('h-full rounded-full', item.color)} 
                style={{ width: `${(item.count / total) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-[#1a2744] w-12 text-right">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Dashboard
export function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50">
      <TopNav />
      
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a2744] mb-2">Dashboard</h1>
          <p className="text-slate-500">Welcome back! Here's an overview of Nelo production.</p>
        </div>
        
        {/* OEE Overview - Full Width */}
        <div className="mb-8">
          <OEEOverviewCard />
        </div>
        
        {/* KPIs - All values from real data */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <KPICard
            label="FPY Rate"
            value={`${oeeMetrics.quality}%`}
            icon={<CheckCircle2 size={20} className="text-white" />}
            iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
            href="/profit/quality"
          />
          <KPICard
            label="Kayak Models"
            value={stats.totalProducts.toString()}
            icon={<Package size={20} className="text-white" />}
            iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
            href="/core/products"
          />
          <KPICard
            label="Production Phases"
            value={`${stats.productionPhases}/${stats.totalPhases}`}
            icon={<Cpu size={20} className="text-white" />}
            iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
            href="/core/operations"
          />
          <KPICard
            label="Orders In Progress"
            value={stats.ordersInProgress.toString()}
            icon={<Calendar size={20} className="text-white" />}
            iconBg="bg-gradient-to-br from-amber-500 to-amber-600"
            href="/plan/scheduling"
          />
          <KPICard
            label="Active Employees"
            value={`${stats.activeEmployees}/${stats.totalEmployees}`}
            icon={<Users size={20} className="text-white" />}
            iconBg="bg-gradient-to-br from-slate-500 to-slate-600"
            href="/core/employees"
          />
        </div>
        
        {/* Modules Grid */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          {/* CORE Module */}
          <div className="col-span-3">
            <ModuleCard
              title="CORE"
              description="Master Data Management"
              icon={<Briefcase size={24} className="text-white" />}
              iconBg="bg-gradient-to-br from-slate-600 to-slate-700"
              stats={[
                { label: 'Products', value: stats.totalProducts.toString() },
                { label: 'Phases', value: stats.totalPhases.toString() },
                { label: 'Employees', value: stats.totalEmployees.toString() },
              ]}
              links={[
                { name: 'Kayak Models', href: '/core/products' },
                { name: 'Production Phases', href: '/core/operations' },
                { name: 'Employees', href: '/core/employees' },
                { name: 'Machines', href: '/core/machines' },
                { name: 'Rates', href: '/core/rates' },
              ]}
            />
          </div>
          
          {/* PLAN Module */}
          <div className="col-span-3">
            <ModuleCard
              title="PLAN"
              description="Production Planning"
              icon={<Calendar size={24} className="text-white" />}
              iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
              stats={[
                { label: 'Orders', value: stats.totalOrders.toString() },
                { label: 'In Progress', value: stats.ordersInProgress.toString() },
                { label: 'Completed', value: stats.ordersCompleted.toString() },
              ]}
              links={[
                { name: 'Production Orders', href: '/plan/scheduling' },
                { name: 'MRP', href: '/plan/mrp' },
                { name: 'Capacity', href: '/plan/capacity' },
              ]}
            />
          </div>
          
          {/* PROFIT Module */}
          <div className="col-span-3">
            <ModuleCard
              title="PROFIT"
              description="Cost & Quality"
              icon={<PieChart size={24} className="text-white" />}
              iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
              stats={[
                { label: 'OEE', value: `${oeeMetrics.oee}%` },
                { label: 'FPY', value: `${oeeMetrics.quality}%` },
                { label: 'Rework', value: `${oeeMetrics.reworkRate}%` },
              ]}
              links={[
                { name: 'OEE Dashboard', href: '/profit/oee' },
                { name: 'Quality Analysis', href: '/profit/quality' },
                { name: 'COGS Analysis', href: '/profit/cogs' },
                { name: 'Pricing', href: '/profit/pricing' },
                { name: 'Scenarios', href: '/profit/scenarios' },
              ]}
            />
          </div>
          
          {/* HR Module */}
          <div className="col-span-3">
            <ModuleCard
              title="HR"
              description="Human Resources"
              icon={<Users size={24} className="text-white" />}
              iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
              stats={[
                { label: 'Activos', value: stats.activeEmployees.toString() },
                { label: 'Inativos', value: (stats.totalEmployees - stats.activeEmployees).toString() },
                { label: 'Total', value: stats.totalEmployees.toString() },
              ]}
              links={[
                { name: 'Allocations', href: '/hr/allocations' },
                { name: 'Payroll', href: '/hr/payroll' },
                { name: 'Productivity', href: '/hr/productivity' },
              ]}
            />
          </div>
        </div>
        
        {/* Bottom Row */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4">
            <RecentActivity />
          </div>
          <div className="col-span-4">
            <QualitySummaryCard />
          </div>
          <div className="col-span-4 space-y-6">
            <ProductDistribution />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
