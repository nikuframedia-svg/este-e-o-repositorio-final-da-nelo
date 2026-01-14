import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  CalendarDays,
  Package,
  Factory,
  Users,
  DollarSign,
  Settings,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: { label: string; path: string }[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
    path: '/',
  },
  {
    label: 'Planning',
    icon: <CalendarDays size={20} />,
    children: [
      { label: 'Scheduling', path: '/plan/scheduling' },
      { label: 'MRP', path: '/plan/mrp' },
      { label: 'Capacity', path: '/plan/capacity' },
    ],
  },
  {
    label: 'Profit',
    icon: <DollarSign size={20} />,
    children: [
      { label: 'COGS Analysis', path: '/profit/cogs' },
      { label: 'Pricing', path: '/profit/pricing' },
      { label: 'Scenarios', path: '/profit/scenarios' },
    ],
  },
  {
    label: 'HR',
    icon: <Users size={20} />,
    children: [
      { label: 'Allocations', path: '/hr/allocations' },
      { label: 'Payroll', path: '/hr/payroll' },
      { label: 'Productivity', path: '/hr/productivity' },
    ],
  },
  {
    label: 'Products',
    icon: <Package size={20} />,
    path: '/products',
  },
  {
    label: 'Machines',
    icon: <Factory size={20} />,
    path: '/machines',
  },
];

const bottomNavItems: NavItem[] = [
  {
    label: 'Settings',
    icon: <Settings size={20} />,
    path: '/settings',
  },
];

export function Sidebar() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Planning: true,
    Profit: true,
    HR: true,
  });

  const toggleExpand = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const renderNavItem = (item: NavItem) => {
    if (item.path) {
      return (
        <NavLink
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl text-[15px] font-medium transition-all',
              isActive
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                : 'text-slate-600 hover:bg-slate-100'
            )
          }
        >
          <span className="text-current opacity-80">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      );
    }

    return (
      <>
        <button
          onClick={() => toggleExpand(item.label)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[15px] font-medium text-slate-600 hover:bg-slate-100 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="opacity-80">{item.icon}</span>
            <span>{item.label}</span>
          </div>
          <ChevronDown
            size={16}
            className={cn(
              'opacity-50 transition-transform duration-200',
              expanded[item.label] && 'rotate-180'
            )}
          />
        </button>
        <div className={cn(
          "overflow-hidden transition-all duration-200",
          expanded[item.label] ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
        )}>
          {item.children && (
            <div className="ml-10 mt-1 space-y-1">
              {item.children.map((child) => (
                <NavLink
                  key={child.path}
                  to={child.path}
                  className={({ isActive }) =>
                    cn(
                      'block px-4 py-2.5 rounded-xl text-sm transition-all',
                      isActive
                        ? 'text-blue-600 font-semibold bg-blue-50'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    )
                  }
                >
                  {child.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="h-18 flex items-center px-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900">ProdPlan</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>{renderNavItem(item)}</li>
          ))}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-slate-100">
        <ul className="space-y-1">
          {bottomNavItems.map((item) => (
            <li key={item.label}>{renderNavItem(item)}</li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
              MN
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">Martim N.</p>
              <p className="text-xs text-slate-400 truncate">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
