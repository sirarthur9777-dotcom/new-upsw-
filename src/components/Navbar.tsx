import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  Shield,
  FileText,
  UserPlus,
  Sun,
  Moon,
  X,
  Check,
  ChevronDown,
  CloudCheck,
  User as UserIcon,
  LogOut,
  ShoppingCart,
  Sparkles,
  Radio,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface NavbarProps {
  sidebarCollapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ sidebarCollapsed }) => {
  const {
    activeTab,
    setActiveTab,
    companySettings,
    userRole,
    setUserRole,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    setGlobalSearchOpen,
    setAuditLogOpen,
    isDarkMode,
    toggleDarkMode,
    user,
    logout,
    setAuthModalOpen,
    isCloudSynced,
    setIsAiAssistantOpen,
    setIsVoiceLiveActive,
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const roles: UserRole[] = ['Admin', 'Manager', 'Technician', 'Accountant'];

  const tabTitles: Record<string, string> = {
    dashboard: 'Dashboard & Control Center',
    customers: 'Customer CRM',
    projects: 'Solar Project Management',
    billing: 'Billing & Tax Invoices',
    quotation: 'Quotation Generator',
    payments: 'Payment Management',
    accounting: 'Accounting & GST Ledger',
    purchases: 'Product Purchases & GRN',
    'purchase-returns': 'Purchase Returns',
    distributors: 'Distributors & Suppliers',
    inventory: 'Inventory & Stock Module',
    expenses: 'Expense Manager',
    employees: 'Employee Management',
    reports: 'Enterprise Reports',
    settings: 'Company Settings & Theme',
  };

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 transition-all duration-300 flex items-center justify-between px-6 bg-[#FFFFFF]/90 dark:bg-[#152019]/90 backdrop-blur-md border-b border-[#D9E2DA] dark:border-[#223328] no-print print:hidden shadow-[0_2px_8px_rgba(36,55,45,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Title & Global Search Trigger */}
      <div className="flex items-center gap-6">
        <div>
          <div className="flex items-center gap-2">
            
            <h1 className="text-base sm:text-lg font-bold text-[#24372D] dark:text-white capitalize flex items-center gap-2">
              <span>{tabTitles[activeTab] || activeTab}</span>
              {isCloudSynced && (
                <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCEBE0] text-[#25845A] dark:text-[#2DA16E] border border-[#25845A]/20">
                  <CloudCheck className="w-3 h-3 text-[#25845A] dark:text-[#2DA16E]" />
                  <span>Cloud Active</span>
                </span>
              )}
            </h1>
          </div>
        
        </div>

        {/* Global Search Input */}
        <button
          onClick={() => setGlobalSearchOpen(true)}
          className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-[#68786E] dark:text-[#8E9F94] text-xs shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] dark:shadow-[inset_1.5px_1.5px_3.5px_rgba(0,0,0,0.35)] border border-[#D9E2DA] dark:border-[#223328] hover:border-[#25845A]/40 transition w-64"
        >
          <Search className="w-3.5 h-3.5 text-[#25845A]" />
          <span className="truncate">Search customer, invoice, stock...</span>
          <kbd className="ml-auto px-1.5 py-0.5 text-[10px] font-mono bg-[#FFFFFF] dark:bg-[#1B2720] shadow-[1px_1px_2px_rgba(36,55,45,0.06),-1px_-1px_2px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] rounded text-[#68786E] dark:text-[#8E9F94]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Action Button */}
        <div className="relative">
          <button
            onClick={() => setQuickActionOpen(!quickActionOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#25845A] hover:bg-[#1D7049] text-white font-bold text-xs transition shadow-[0_4px_12px_rgba(37,132,90,0.25),0_1px_3px_rgba(37,132,90,0.15)] border border-[#1D7049] active:translate-y-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Quick Action</span>
          </button>

          {quickActionOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] dark:bg-[#1B2720] rounded-2xl shadow-[0_8px_24px_rgba(36,55,45,0.09),0_2px_6px_rgba(36,55,45,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.45)] border border-[#D9E2DA] dark:border-[#223328] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-1.5 text-[10px] font-bold text-[#87938B] dark:text-[#6B7C72] uppercase tracking-wider">
                Create New Record
              </div>
              <button
                onClick={() => {
                  setActiveTab('billing');
                  setQuickActionOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-[#24372D] dark:text-[#E6EEE8] hover:bg-[#F1F5F1] dark:hover:bg-[#223328] flex items-center gap-2.5 transition"
              >
                <div className="w-6 h-6 rounded-lg bg-[#DCEBE0] text-[#25845A] flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span>New Tax Invoice</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('projects');
                  setQuickActionOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-[#24372D] dark:text-[#E6EEE8] hover:bg-[#F1F5F1] dark:hover:bg-[#223328] flex items-center gap-2.5 transition"
              >
                <div className="w-6 h-6 rounded-lg bg-[#D99A18]/12 text-[#D99A18] flex items-center justify-center">
                  <Sun className="w-3.5 h-3.5" />
                </div>
                <span>New Solar Project</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('purchases');
                  setQuickActionOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-[#24372D] dark:text-[#E6EEE8] hover:bg-[#F1F5F1] dark:hover:bg-[#223328] flex items-center gap-2.5 transition"
              >
                <div className="w-6 h-6 rounded-lg bg-[#DCEBE0] text-[#25845A] flex items-center justify-center">
                  <ShoppingCart className="w-3.5 h-3.5" />
                </div>
                <span>New Product Purchase</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('customers');
                  setQuickActionOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-[#24372D] dark:text-[#E6EEE8] hover:bg-[#F1F5F1] dark:hover:bg-[#223328] flex items-center gap-2.5 transition"
              >
                <div className="w-6 h-6 rounded-lg bg-[#DCEBE0] text-[#25845A] flex items-center justify-center">
                  <UserPlus className="w-3.5 h-3.5" />
                </div>
                <span>Add Customer</span>
              </button>
            </div>
          )}
        </div>

        {/* GEMINI LIVE VOICE API BUTTON */}
        <button
          onClick={() => setIsVoiceLiveActive(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] dark:bg-[#1B2720] hover:bg-[#F8FAF8] text-[#24372D] dark:text-[#E6EEE8] text-xs font-semibold border border-[#D9E2DA] dark:border-[#223328] shadow-[2px_2px_6px_rgba(36,55,45,0.06),-2px_-2px_6px_rgba(255,255,255,0.85)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.3)] transition"
          title="Start Live Voice Conversation with Gemini"
        >
          <Radio className="w-3.5 h-3.5 text-[#D83B3B] animate-pulse" />
          <span className="hidden md:inline">Live Voice</span>
        </button>

        {/* GEMINI AI COPILOT CHAT TRIGGER */}
        <button
          onClick={() => setIsAiAssistantOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] dark:bg-[#1B2720] hover:bg-[#F8FAF8] text-[#25845A] dark:text-[#2DA16E] text-xs font-bold border border-[#D9E2DA] dark:border-[#223328] shadow-[2px_2px_6px_rgba(36,55,45,0.06),-2px_-2px_6px_rgba(255,255,255,0.85)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.3)] transition"
          title="Open SolarFlow AI Copilot"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#25845A]" />
          <span className="hidden md:inline">AI Copilot</span>
        </button>

        {/* DARK / LIGHT MODE TOGGLE BUTTON */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-[#68786E] hover:text-[#24372D] dark:text-[#8E9F94] dark:hover:text-white bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[2px_2px_6px_rgba(36,55,45,0.06),-2px_-2px_6px_rgba(255,255,255,0.85)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.3)] transition"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-[#D99A18]" /> : <Moon className="w-4 h-4 text-[#25845A]" />}
        </button>

        {/* Audit Log Trigger */}
        <button
          onClick={() => setAuditLogOpen(true)}
          className="p-2 rounded-xl text-[#68786E] hover:text-[#24372D] dark:text-[#8E9F94] dark:hover:text-white bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[2px_2px_6px_rgba(36,55,45,0.06),-2px_-2px_6px_rgba(255,255,255,0.85)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.3)] transition"
          title="Audit Trail Logs"
        >
          <Shield className="w-4 h-4" />
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-xl text-[#68786E] hover:text-[#24372D] dark:text-[#8E9F94] dark:hover:text-white bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[2px_2px_6px_rgba(36,55,45,0.06),-2px_-2px_6px_rgba(255,255,255,0.85)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.3)] transition relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#25845A] rounded-full ring-2 ring-[#FFFFFF] dark:ring-[#152019]" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#FFFFFF] dark:bg-[#1B2720] rounded-2xl shadow-[0_8px_24px_rgba(36,55,45,0.09),0_2px_6px_rgba(36,55,45,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.45)] border border-[#D9E2DA] dark:border-[#223328] p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-[#D9E2DA] dark:border-[#223328]">
                <h3 className="text-sm font-bold text-[#24372D] dark:text-white flex items-center gap-2">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] bg-[#DCEBE0] text-[#25845A] dark:text-[#2DA16E] font-bold rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-[#68786E] hover:text-[#D83B3B] transition font-medium"
                  >
                    Clear All
                  </button>
                  <button onClick={() => setNotifOpen(false)} className="text-[#68786E] hover:text-[#24372D] p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto my-2 space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[#87938B] text-center py-6">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.linkTab) setActiveTab(n.linkTab);
                        setNotifOpen(false);
                      }}
                      className={`p-3 rounded-xl border transition cursor-pointer text-xs ${
                        n.read
                          ? 'bg-[#F1F5F1] dark:bg-[#121A15] border-[#D9E2DA] dark:border-[#223328] text-[#87938B]'
                          : 'bg-[#FFFFFF] dark:bg-[#202E25] shadow-[0_2px_6px_rgba(36,55,45,0.05)] border-[#25845A]/30 text-[#24372D] dark:text-[#E6EEE8] font-medium'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold">{n.title}</span>
                        <span className="text-[10px] text-[#87938B] shrink-0">{n.date}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#68786E] dark:text-[#9FB1A7] leading-tight">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] dark:bg-[#1B2720] text-xs font-semibold text-[#24372D] dark:text-[#E6EEE8] border border-[#D9E2DA] dark:border-[#223328] shadow-[2px_2px_6px_rgba(36,55,45,0.06),-2px_-2px_6px_rgba(255,255,255,0.85)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.3)] transition"
          >
            <span className="w-2 h-2 rounded-full bg-[#25845A]"></span>
            <span>Role: {userRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#68786E]" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-[#FFFFFF] dark:bg-[#1B2720] rounded-2xl shadow-[0_8px_24px_rgba(36,55,45,0.09),0_2px_6px_rgba(36,55,45,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.45)] border border-[#D9E2DA] dark:border-[#223328] py-2 z-50">
              <div className="px-3 py-1 text-[10px] font-bold text-[#87938B] dark:text-[#6B7C72] uppercase tracking-wider">
                Switch Active Role
              </div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setUserRole(r);
                    setRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-1.5 text-xs flex items-center justify-between ${
                    userRole === r
                      ? 'bg-[#DCEBE0] text-[#25845A] dark:text-[#2DA16E] font-bold'
                      : 'text-[#24372D] dark:text-[#E6EEE8] hover:bg-[#F1F5F1] dark:hover:bg-[#223328]'
                  }`}
                >
                  <span>{r}</span>
                  {userRole === r && <Check className="w-3.5 h-3.5 text-[#25845A]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* USER PROFILE & LOGOUT DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-[#FFFFFF] dark:bg-[#1B2720] text-[#24372D] dark:text-[#E6EEE8] text-xs font-bold border border-[#D9E2DA] dark:border-[#223328] shadow-[2px_2px_6px_rgba(36,55,45,0.06),-2px_-2px_6px_rgba(255,255,255,0.85)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.3)] transition"
            title="User Account Menu"
          >
            <div className="w-6 h-6 rounded-lg bg-[#25845A] text-white flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
              ) : (
                (user?.displayName || user?.email || 'U')[0].toUpperCase()
              )}
            </div>
            <span className="max-w-[110px] truncate hidden md:inline">
              {user?.displayName || user?.email?.split('@')[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#68786E]" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#FFFFFF] dark:bg-[#1B2720] rounded-2xl shadow-[0_8px_24px_rgba(36,55,45,0.09),0_2px_6px_rgba(36,55,45,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.45)] border border-[#D9E2DA] dark:border-[#223328] p-3 z-50 animate-in fade-in slide-in-from-top-2 space-y-3">
              {/* User Details Header */}
              <div className="p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] border border-[#D9E2DA] dark:border-[#223328] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#25845A] text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 shadow-xs">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    (user?.displayName || user?.email || 'U')[0].toUpperCase()
                  )}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-[#24372D] dark:text-white truncate">
                    {user?.displayName || 'Solar Enterprise User'}
                  </p>
                  <p className="text-[11px] text-[#68786E] dark:text-[#8E9F94] truncate">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold text-[#87938B] dark:text-[#6B7C72] uppercase tracking-wider">
                  Session & Role
                </div>
                <div className="px-2.5 py-1.5 text-xs text-[#68786E] dark:text-[#8E9F94] flex items-center justify-between">
                  <span>Role:</span>
                  <span className="font-bold text-[#25845A] dark:text-[#2DA16E]">{userRole}</span>
                </div>
                <div className="px-2.5 py-1.5 text-xs text-[#68786E] dark:text-[#8E9F94] flex items-center justify-between">
                  <span>Cloud Database:</span>
                  <span className="font-bold text-[#25845A] dark:text-[#2DA16E] flex items-center gap-1">
                    <CloudCheck className="w-3.5 h-3.5" />
                    <span>Connected</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#D9E2DA] dark:border-[#223328] space-y-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#24372D] dark:text-[#E6EEE8] hover:bg-[#F1F5F1] dark:hover:bg-[#223328] flex items-center gap-2 transition"
                >
                  <UserIcon className="w-4 h-4 text-[#25845A]" />
                  <span>Account & Cloud Status</span>
                </button>

                <button
                  onClick={async () => {
                    setUserMenuOpen(false);
                    await logout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#D83B3B] hover:bg-[#FBEBEB] dark:hover:bg-[#2A1616] flex items-center gap-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
