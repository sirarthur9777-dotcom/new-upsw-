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
      className={`fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 flex flex-col bg-gradient-to-b from-[#ffffff] via-[#fdfbf7] to-[#f8f3e8] dark:from-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-200 border-r-2 border-amber-300/70 dark:border-slate-800 shadow-[4px_0_24px_rgba(217,119,6,0.08)] no-print print:hidden ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header / Branding */}
      <div className="h-16 flex items-center justify-between px-3 border-b-2 border-amber-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {companySettings.logoUrl ? (
            <img
              src={companySettings.logoUrl}
              alt="Company Logo"
              className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 shrink-0 shadow-md border-2 border-amber-300/70"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-orange-600 flex items-center justify-center text-white font-bold shadow-md shadow-amber-500/30 border-b-2 border-amber-700 shrink-0">
              <Sun className="w-5 h-5 fill-white animate-[spin_12s_linear_infinite]" />
            </div>
          )}
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-black text-slate-900 dark:text-white tracking-tight text-xs leading-snug truncate">
                {companySettings.companyName}
              </span>
              <span className="text-[9.5px] text-amber-700 dark:text-amber-400 font-extrabold tracking-wider uppercase flex items-center gap-1">
                <span>सूर्य ऊर्जा</span>
                <span>•</span>
                <span>JAUNPUR EPC</span>
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-800 dark:text-slate-400 dark:hover:text-white bg-amber-50/80 hover:bg-amber-100 dark:bg-slate-800 border border-amber-200/60 dark:border-slate-700 transition active:translate-y-0.5 shadow-2xs"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4 text-amber-700 dark:text-amber-400" /> : <ChevronLeft className="w-4 h-4 text-amber-700 dark:text-amber-400" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {/* SECTION: CORE ERP */}
        {!collapsed && (
          <div className="px-3 pt-1 pb-1.5 text-[10px] font-black text-amber-800/80 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>मुख्य संचालन (Core)</span>
          </div>
        )}

        {/* Main Items Before Purchases */}
        {mainNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative group cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 text-white font-bold shadow-[0_4px_12px_rgba(217,119,6,0.32),inset_0_1px_0_rgba(255,255,255,0.35)] border-b-3 border-amber-700 translate-y-[-1px]'
                  : 'text-slate-700 dark:text-slate-300 hover:text-amber-900 dark:hover:text-amber-300 hover:bg-amber-100/70 dark:hover:bg-slate-800/70 border border-transparent hover:border-amber-200/70 hover:shadow-2xs active:translate-y-0.5'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className={isActive ? 'text-white drop-shadow-xs' : 'text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform'}>
                {item.icon}
              </span>

              {!collapsed && <span className="truncate">{item.label}</span>}

              {/* Badge */}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`ml-auto px-2 py-0.5 text-[10px] font-black rounded-full shadow-2xs ${
                    isActive
                      ? 'bg-slate-950 text-amber-300 border border-amber-400/50'
                      : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
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
            <div className="px-3 pt-1 pb-1.5 text-[10px] font-black text-amber-800/80 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>खरीद एवं सप्लायर</span>
            </div>
          )}
          {collapsed ? (
            <button
              onClick={() => setActiveTab('purchases')}
              className={`w-full flex items-center justify-center p-2.5 rounded-xl text-sm font-semibold transition-all relative group cursor-pointer ${
                isPurchaseActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-md border-b-3 border-amber-700'
                  : 'text-slate-700 dark:text-slate-300 hover:text-amber-900 hover:bg-amber-100/70 dark:hover:bg-slate-800/70 border border-transparent hover:border-amber-200'
              }`}
              title="Purchase Management"
            >
              <ShoppingCart className={`w-5 h-5 ${isPurchaseActive ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
              {pendingPurchasesCount > 0 && (
                <span className="absolute top-1 right-1 px-1.5 py-0 text-[9px] bg-amber-600 text-white font-black rounded-full shadow-xs">
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group cursor-pointer ${
                  isPurchaseActive
                    ? 'bg-amber-100/90 dark:bg-slate-800 text-amber-900 dark:text-amber-300 font-bold border border-amber-300/80 shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-amber-900 hover:bg-amber-100/60 dark:hover:bg-slate-800/70 border border-transparent hover:border-amber-200/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className={`w-5 h-5 ${isPurchaseActive ? 'text-amber-700 dark:text-amber-400' : 'text-amber-600 dark:text-amber-400'}`} />
                  <span className="truncate">Purchases & Suppliers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {pendingPurchasesCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-white shadow-xs">
                      {pendingPurchasesCount}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 text-amber-700 dark:text-amber-400 ${
                      purchaseMenuOpen ? 'rotate-180 text-amber-800 font-bold' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Sub-menu items */}
              {purchaseMenuOpen && (
                <div className="mt-1 ml-3 pl-3 border-l-2 border-amber-300/60 dark:border-slate-700 space-y-1 py-1">
                  {purchaseSubItems.map((sub) => {
                    const isSubActive = activeTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setActiveTab(sub.id)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSubActive
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-xs border-b-2 border-amber-700'
                            : 'text-slate-600 dark:text-slate-400 hover:text-amber-900 hover:bg-amber-100/60 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <span className={isSubActive ? 'text-white' : 'text-amber-600'}>
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
            <div className="px-3 pt-1 pb-1.5 text-[10px] font-black text-amber-800/80 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>प्रबंधन एवं सेटिंग्स</span>
            </div>
          )}
          {secondaryNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 text-white font-bold shadow-[0_4px_12px_rgba(217,119,6,0.32),inset_0_1px_0_rgba(255,255,255,0.35)] border-b-3 border-amber-700 translate-y-[-1px]'
                    : 'text-slate-700 dark:text-slate-300 hover:text-amber-900 dark:hover:text-amber-300 hover:bg-amber-100/70 dark:hover:bg-slate-800/70 border border-transparent hover:border-amber-200/70 hover:shadow-2xs active:translate-y-0.5'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span className={isActive ? 'text-white drop-shadow-xs' : 'text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform'}>
                  {item.icon}
                </span>

                {!collapsed && <span className="truncate">{item.label}</span>}

                {/* Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-auto px-2 py-0.5 text-[10px] font-black rounded-full shadow-2xs ${
                      isActive
                        ? 'bg-slate-950 text-amber-300 border border-amber-400/50'
                        : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
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
      <div className="p-3 border-t-2 border-amber-200/80 dark:border-slate-800/80 space-y-2 bg-white/70 dark:bg-slate-900/70">
        {/* Dark/Light toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50/80 dark:bg-slate-800/60 hover:bg-amber-100 text-xs text-slate-700 dark:text-slate-300 border border-amber-200/70 dark:border-slate-700 shadow-2xs transition active:translate-y-0.5 cursor-pointer"
        >
          <div className="flex items-center gap-2 font-semibold">
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500 fill-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            {!collapsed && <span>{isDarkMode ? 'डार्क मोड' : 'लाइट मोड (सक्रिय)'}</span>}
          </div>
          {!collapsed && (
            <span className="text-[10px] font-extrabold bg-amber-200/80 dark:bg-slate-700 px-2 py-0.5 rounded text-amber-900 dark:text-slate-300 shadow-2xs">
              {isDarkMode ? 'DARK' : 'LIGHT ☀️'}
            </span>
          )}
        </button>

        {/* User Account / Cloud Auth Card */}
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-amber-50/90 to-orange-50/90 dark:from-slate-800/50 dark:to-slate-800/50 rounded-xl border border-amber-200/80 dark:border-slate-700/60 shadow-2xs transition group">
          <div
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2 overflow-hidden cursor-pointer flex-1"
            title="View Cloud Sync & Account Details"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden shadow-xs border border-amber-400">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
              ) : (
                (user?.displayName || user?.email || userRole)[0].toUpperCase()
              )}
            </div>
            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user?.displayName || user?.email?.split('@')[0] || 'Solar Admin'}
                </p>
                <p className="text-[9.5px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>क्लाउड सिंक सक्रिय</span>
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
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition cursor-pointer"
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

