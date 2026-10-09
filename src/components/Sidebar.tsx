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
  ShoppingCart,
  RotateCcw,
  Building2,
  Landmark,
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
    setAuthModalOpen,
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

  const coreOperationsItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4.5 h-4.5" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-4.5 h-4.5" /> },
    { id: 'projects', label: 'Solar Projects', icon: <Sun className="w-4.5 h-4.5" />, badge: runningProjectsCount },
    { id: 'quotation', label: 'Quotation Generator', icon: <FileSpreadsheet className="w-4.5 h-4.5" /> },
  ];

  const financeItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'billing', label: 'Billing & Invoices', icon: <FileText className="w-4.5 h-4.5" />, badge: pendingInvoicesCount },
    { id: 'payments', label: 'Payments', icon: <CreditCard className="w-4.5 h-4.5" /> },
    { id: 'accounting', label: 'Accounting & GST', icon: <Landmark className="w-4.5 h-4.5" /> },
  ];

  const purchaseSubItems = [
    { id: 'purchases' as TabType, label: 'Product Purchases', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'purchase-returns' as TabType, label: 'Purchase Returns', icon: <RotateCcw className="w-4 h-4" /> },
    { id: 'distributors' as TabType, label: 'Distributors & Suppliers', icon: <Building2 className="w-4 h-4" /> },
  ];

  const reportsItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'inventory', label: 'Inventory & Stock', icon: <Package className="w-4.5 h-4.5" />, badge: lowStockCount },
    { id: 'expenses', label: 'Expenses', icon: <Receipt className="w-4.5 h-4.5" /> },
    { id: 'employees', label: 'Employees', icon: <UserCheck className="w-4.5 h-4.5" /> },
    { id: 'reports', label: 'Enterprise Reports', icon: <BarChart3 className="w-4.5 h-4.5" /> },
  ];

  const renderNavButton = (item: { id: TabType; label: string; icon: React.ReactNode; badge?: number }) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group ${
          isActive
            ? 'bg-[#DCEBE0] dark:bg-[#1D2B22] text-[#25845A] dark:text-[#2DA16E] border-l-4 border-[#25845A] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.06),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] dark:shadow-[inset_1.5px_1.5px_3.5px_rgba(0,0,0,0.35)]'
            : 'text-[#68786E] dark:text-[#8E9F94] hover:text-[#24372D] dark:hover:text-[#E6EEE8] hover:bg-[#E9EFEA] dark:hover:bg-[#1C2820]'
        }`}
        title={collapsed ? item.label : undefined}
      >
        <span className={isActive ? 'text-[#25845A] dark:text-[#2DA16E]' : 'text-[#68786E] group-hover:text-[#25845A] transition-colors'}>
          {item.icon}
        </span>

        {!collapsed && <span className="truncate">{item.label}</span>}

        {item.badge !== undefined && item.badge > 0 && (
          <span
            className={`ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full ${
              isActive
                ? 'bg-[#25845A] text-white'
                : 'bg-[#25845A]/12 text-[#25845A] dark:text-[#2DA16E] border border-[#25845A]/20'
            } ${collapsed ? 'absolute top-1 right-1 px-1.5 py-0 text-[9px]' : ''}`}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 flex flex-col bg-[#F1F5F1] dark:bg-[#152019] text-[#24372D] dark:text-[#E6EEE8] border-r border-[#D9E2DA] dark:border-[#223328] no-print print:hidden shadow-[0_4px_16px_rgba(36,55,45,0.05)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header / Branding */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-[#D9E2DA] dark:border-[#223328]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {companySettings.logoUrl ? (
            <img
              src={companySettings.logoUrl}
              alt="Company Logo"
              className="w-10 h-10 rounded-xl object-contain bg-[#FFFFFF] dark:bg-[#1B2720] p-1 shrink-0 shadow-[0_2px_6px_rgba(36,55,45,0.06)] border border-[#D9E2DA] dark:border-[#223328]"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[#25845A] flex items-center justify-center text-white font-bold shadow-[0_3px_8px_rgba(37,132,90,0.3)] shrink-0">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
          )}
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-[#24372D] dark:text-white tracking-tight text-xs leading-snug truncate">
                {companySettings.companyName}
              </span>
              <span className="text-[9px] text-[#25845A] dark:text-[#2DA16E] font-bold tracking-wider uppercase">
                Solar ERP & CRM
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-[#68786E] hover:text-[#24372D] dark:text-[#8E9F94] dark:hover:text-white bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[2px_2px_5px_rgba(36,55,45,0.05),-2px_-2px_5px_rgba(255,255,255,0.85)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.3)] transition"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-3">
        {/* SECTION: CORE OPERATIONS */}
        <div>
          {!collapsed && (
            <div className="px-3 pt-1 pb-1.5 text-[10px] font-bold text-[#87938B] dark:text-[#6B7C72] uppercase tracking-wider">
              Core Operations
            </div>
          )}
          <div className="space-y-1">
            {coreOperationsItems.map(renderNavButton)}
          </div>
        </div>

        {/* SECTION: FINANCE & BILLING */}
        <div>
          {!collapsed && (
            <div className="px-3 pt-1 pb-1.5 text-[10px] font-bold text-[#87938B] dark:text-[#6B7C72] uppercase tracking-wider">
              Finance & Billing
            </div>
          )}
          <div className="space-y-1">
            {financeItems.map(renderNavButton)}
          </div>
        </div>

        {/* SECTION: PROCUREMENT */}
        <div>
          {!collapsed && (
            <div className="px-3 pt-1 pb-1.5 text-[10px] font-bold text-[#87938B] dark:text-[#6B7C72] uppercase tracking-wider">
              Procurement
            </div>
          )}
          {collapsed ? (
            <button
              onClick={() => setActiveTab('purchases')}
              className={`w-full flex items-center justify-center p-2.5 rounded-xl text-xs font-semibold transition-all relative group ${
                isPurchaseActive
                  ? 'bg-[#DCEBE0] dark:bg-[#1D2B22] text-[#25845A] dark:text-[#2DA16E] border-l-4 border-[#25845A]'
                  : 'text-[#68786E] dark:text-[#8E9F94] hover:text-[#24372D] hover:bg-[#E9EFEA]'
              }`}
              title="Purchase Management"
            >
              <ShoppingCart className={`w-5 h-5 ${isPurchaseActive ? 'text-[#25845A]' : 'text-[#68786E]'}`} />
              {pendingPurchasesCount > 0 && (
                <span className="absolute top-1 right-1 px-1.5 py-0 text-[9px] bg-[#25845A] text-white font-bold rounded-full">
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isPurchaseActive
                    ? 'bg-[#DCEBE0] dark:bg-[#1D2B22] text-[#25845A] dark:text-[#2DA16E] border-l-4 border-[#25845A] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.06),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)]'
                    : 'text-[#68786E] dark:text-[#8E9F94] hover:text-[#24372D] dark:hover:text-[#E6EEE8] hover:bg-[#E9EFEA] dark:hover:bg-[#1C2820]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className={`w-4.5 h-4.5 ${isPurchaseActive ? 'text-[#25845A]' : 'text-[#68786E]'}`} />
                  <span className="truncate">Purchases & Suppliers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {pendingPurchasesCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#25845A]/12 text-[#25845A] dark:text-[#2DA16E]">
                      {pendingPurchasesCount}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 text-[#68786E] ${
                      purchaseMenuOpen ? 'rotate-180 text-[#25845A]' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Sub-menu items */}
              {purchaseMenuOpen && (
                <div className="mt-1 ml-3 pl-3 border-l-2 border-[#D9E2DA] dark:border-[#223328] space-y-1 py-1">
                  {purchaseSubItems.map((sub) => {
                    const isSubActive = activeTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setActiveTab(sub.id)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                          isSubActive
                            ? 'bg-[#25845A] text-white shadow-[0_2px_6px_rgba(37,132,90,0.3)]'
                            : 'text-[#68786E] dark:text-[#8E9F94] hover:text-[#24372D] dark:hover:text-white hover:bg-[#E9EFEA] dark:hover:bg-[#1C2820]'
                        }`}
                      >
                        <span className={isSubActive ? 'text-white' : 'text-[#68786E]'}>
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

        {/* SECTION: REPORTS & MANAGEMENT */}
        <div>
          {!collapsed && (
            <div className="px-3 pt-1 pb-1.5 text-[10px] font-bold text-[#87938B] dark:text-[#6B7C72] uppercase tracking-wider">
              Management & Reports
            </div>
          )}
          <div className="space-y-1">
            {reportsItems.map(renderNavButton)}
          </div>
        </div>

        {/* SECTION: SETTINGS */}
        <div>
          {!collapsed && (
            <div className="px-3 pt-1 pb-1.5 text-[10px] font-bold text-[#87938B] dark:text-[#6B7C72] uppercase tracking-wider">
              Configuration
            </div>
          )}
          <div className="space-y-1">
            {renderNavButton({
              id: 'settings',
              label: 'Settings & Company',
              icon: <Settings className="w-4.5 h-4.5" />,
            })}
          </div>
        </div>
      </div>

      {/* Footer / Theme & User Info */}
      <div className="p-3 border-t border-[#D9E2DA] dark:border-[#223328] space-y-2 bg-[#F1F5F1] dark:bg-[#152019]">
        {/* Dark/Light toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[2px_2px_6px_rgba(36,55,45,0.06),-2px_-2px_6px_rgba(255,255,255,0.85)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.3)] hover:bg-[#F8FAF8] text-xs text-[#24372D] dark:text-[#E6EEE8] transition"
        >
          <div className="flex items-center gap-2">
            {isDarkMode ? <Sun className="w-4 h-4 text-[#D99A18]" /> : <Moon className="w-4 h-4 text-[#25845A]" />}
            {!collapsed && <span className="font-medium">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>}
          </div>
          {!collapsed && (
            <span className="text-[10px] bg-[#E9EFEA] dark:bg-[#121B15] px-2 py-0.5 rounded-md text-[#68786E] dark:text-[#8E9F94] font-mono border border-[#D9E2DA] dark:border-[#223328]">
              {isDarkMode ? 'ON' : 'OFF'}
            </span>
          )}
        </button>

        {/* User Account / Cloud Auth Card */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#FFFFFF] dark:bg-[#1B2720] rounded-xl border border-[#D9E2DA] dark:border-[#223328] shadow-[2px_2px_6px_rgba(36,55,45,0.06),-2px_-2px_6px_rgba(255,255,255,0.85)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.3)] transition group">
          <div
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2 overflow-hidden cursor-pointer flex-1"
            title="View Cloud Sync & Account Details"
          >
            <div className="w-7 h-7 rounded-full bg-[#25845A] flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden shadow-xs">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
              ) : (
                (user?.displayName || user?.email || userRole)[0].toUpperCase()
              )}
            </div>
            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-bold text-[#24372D] dark:text-[#E6EEE8] truncate">
                  {user?.displayName || user?.email?.split('@')[0] || 'Solar Admin'}
                </p>
                <p className="text-[10px] text-[#25845A] dark:text-[#2DA16E] font-medium tracking-wide">
                  Upadhyay Brother Works
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
              className="p-1.5 rounded-lg text-[#68786E] hover:text-[#D83B3B] hover:bg-[#FBEBEB] dark:hover:bg-[#2A1616] transition"
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
