import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Sun,
  FileText,
  FileSpreadsheet,
  CreditCard,
  Package,
  Receipt,
  UserCheck,
  BarChart3,
  Settings,
  Moon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Zap,
  LogIn,
  ShoppingCart,
  RotateCcw,
  Building2,
  Truck,
  Landmark
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (col: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const {
    activeTab,
    setActiveTab,
    companySettings,
    isDarkMode,
    toggleDarkMode,
    userRole,
    inventory,
    projects,
    invoices,
    purchases,
    user,
    logout,
    setAuthModalOpen
  } = useApp();

  const isPurchaseActive = ['purchases', 'purchase-returns', 'distributors'].includes(activeTab);
  const [purchaseMenuOpen, setPurchaseMenuOpen] = useState(isPurchaseActive);

  useEffect(() => {
    if (isPurchaseActive) {
      setPurchaseMenuOpen(true);
    }
  }, [activeTab]);

  const lowStockCount = inventory.filter((i) => i.currentStock <= i.minStockAlert).length;
  const runningProjectsCount = projects.filter((p) => p.status === 'Running').length;
  const pendingInvoicesCount = invoices.filter((inv) => inv.paymentStatus !== 'Paid').length;
  const pendingPurchasesCount = (purchases || []).filter((p) => p.paymentStatus !== 'Paid').length;

  const mainNavItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-5 h-5" /> },
    { id: 'projects', label: 'Projects', icon: <Sun className="w-5 h-5" />, badge: runningProjectsCount },
    { id: 'billing', label: 'Billing & Invoices', icon: <FileText className="w-5 h-5" />, badge: pendingInvoicesCount },
    { id: 'quotation', label: 'Quotation Generator', icon: <FileSpreadsheet className="w-5 h-5" /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'accounting', label: 'Accounting & GST', icon: <Landmark className="w-5 h-5" /> },
  ];

  const secondaryNavItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'inventory', label: 'Inventory', icon: <Package className="w-5 h-5" />, badge: lowStockCount },
    { id: 'expenses', label: 'Expenses', icon: <Receipt className="w-5 h-5" /> },
    { id: 'employees', label: 'Employees', icon: <UserCheck className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const purchaseSubItems = [
    { id: 'purchases' as TabType, label: 'Product Purchases', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'purchase-returns' as TabType, label: 'Purchase Returns', icon: <RotateCcw className="w-4 h-4" /> },
    { id: 'distributors' as TabType, label: 'Distributors', icon: <Building2 className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header / Branding */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {companySettings.logoUrl ? (
            <img
              src={companySettings.logoUrl}
              alt="Company Logo"
              className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 shrink-0 shadow-md border border-slate-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20 shrink-0">
              <Zap className="w-5 h-5 fill-white" />
            </div>
          )}
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-white tracking-tight text-xs leading-snug truncate">
                {companySettings.companyName}
              </span>
              <span className="text-[9px] text-amber-400 font-bold tracking-wider uppercase">
                Jaunpur • EPC ERP
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {/* SECTION: CORE ERP */}
        {!collapsed && (
          <div className="px-3 pt-1 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Core Operations
          </div>
        )}

        {/* Main Items Before Purchases */}
        {mainNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className={isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400 transition-colors'}>
                {item.icon}
              </span>

              {!collapsed && <span className="truncate">{item.label}</span>}

              {/* Badge */}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive
                      ? 'bg-slate-950 text-amber-400'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  } ${collapsed ? 'absolute top-1 right-1 px-1.5 py-0 text-[9px]' : ''}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* SECTION: PROCUREMENT */}
        <div className="pt-2">
          {!collapsed && (
            <div className="px-3 pt-1 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Procurement
            </div>
          )}
          {collapsed ? (
            <button
              onClick={() => setActiveTab('purchases')}
              className={`w-full flex items-center justify-center p-2.5 rounded-xl text-sm font-medium transition-all relative group ${
                isPurchaseActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
              title="Purchase Management"
            >
              <ShoppingCart className={`w-5 h-5 ${isPurchaseActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
              {pendingPurchasesCount > 0 && (
                <span className="absolute top-1 right-1 px-1.5 py-0 text-[9px] bg-amber-500 text-slate-950 font-bold rounded-full">
                  {pendingPurchasesCount}
                </span>
              )}
            </button>
          ) : (
            <div>
              <button
                onClick={() => {
                  if (!isPurchaseActive) {
                    setActiveTab('purchases');
                  }
                  setPurchaseMenuOpen(!purchaseMenuOpen);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isPurchaseActive
                    ? 'bg-slate-800 text-amber-400 font-semibold border border-amber-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className={`w-5 h-5 ${isPurchaseActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'}`} />
                  <span className="truncate">Purchases & Suppliers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {pendingPurchasesCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {pendingPurchasesCount}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${
                      purchaseMenuOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Sub-menu items */}
              {purchaseMenuOpen && (
                <div className="mt-1 ml-3 pl-3 border-l border-slate-700/60 space-y-1 py-1">
                  {purchaseSubItems.map((sub) => {
                    const isSubActive = activeTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setActiveTab(sub.id)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                          isSubActive
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`}
                      >
                        <span className={isSubActive ? 'text-slate-950' : 'text-slate-400'}>
                          {sub.icon}
                        </span>
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION: ENTERPRISE & SETTINGS */}
        <div className="pt-2">
          {!collapsed && (
            <div className="px-3 pt-1 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Management
            </div>
          )}
          {secondaryNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span className={isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400 transition-colors'}>
                  {item.icon}
                </span>

                {!collapsed && <span className="truncate">{item.label}</span>}

                {/* Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive
                        ? 'bg-slate-950 text-amber-400'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    } ${collapsed ? 'absolute top-1 right-1 px-1.5 py-0 text-[9px]' : ''}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / Theme & User Info */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {/* Dark/Light toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-xs text-slate-300 transition"
        >
          <div className="flex items-center gap-2">
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
            {!collapsed && <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>}
          </div>
          {!collapsed && (
            <span className="text-[10px] bg-slate-700/80 px-2 py-0.5 rounded text-slate-300 font-mono">
              {isDarkMode ? 'ON' : 'OFF'}
            </span>
          )}
        </button>

        {/* User Account / Cloud Auth Card */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-800/40 rounded-xl border border-slate-700/60 transition group">
          <div
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2 overflow-hidden cursor-pointer flex-1"
            title="View Cloud Sync & Account Details"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
              ) : (
                (user?.displayName || user?.email || userRole)[0].toUpperCase()
              )}
            </div>
            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {user?.displayName || user?.email?.split('@')[0] || 'Solar Admin'}
                </p>
                <p className="text-[10px] text-blue-400 font-mono tracking-wider">
                  Cloud Active
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                await logout();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
              title="Log Out Session"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

