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
  LogIn,
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
    dashboard: 'Dashboard & Analytics',
    customers: 'Customer Management',
    projects: 'Solar Project Management',
    billing: 'Billing & Invoices',
    quotation: 'Quotation Generator',
    payments: 'Payment Management',
    purchases: 'Product Purchases & GRN',
    'purchase-returns': 'Purchase Returns',
    distributors: 'Distributors & Suppliers',
    expenses: 'Expense Manager',
    inventory: 'Inventory & Stock Module',
    employees: 'Employee Management',
    reports: 'Enterprise Reports',
    settings: 'Company Settings & Theme',
  };

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 transition-all duration-300 flex items-center justify-between px-6 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Title & Global Search Trigger */}
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2">
            <span>{tabTitles[activeTab] || activeTab}</span>
            {isCloudSynced && (
              <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <CloudCheck className="w-3 h-3 text-emerald-500" />
                <span>Cloud Synced</span>
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            {companySettings.companyName} EPC Management System
          </p>
        </div>

        {/* Global Search Input */}
        <button
          onClick={() => setGlobalSearchOpen(true)}
          className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 text-xs border border-slate-200/80 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600 transition w-64 shadow-2xs"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">Search customer, invoice, project...</span>
          <kbd className="ml-auto px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 rounded text-slate-500 dark:text-slate-300">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Quick Action</span>
          </button>

          {quickActionOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Create New Record
              </div>
              <button
                onClick={() => {
                  setActiveTab('billing');
                  setQuickActionOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2.5 transition"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span>New Tax Invoice</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('projects');
                  setQuickActionOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2.5 transition"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Sun className="w-3.5 h-3.5" />
                </div>
                <span>New Solar Project</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('purchases');
                  setQuickActionOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2.5 transition"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShoppingCart className="w-3.5 h-3.5" />
                </div>
                <span>New Product Purchase</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('customers');
                  setQuickActionOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2.5 transition"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
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
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/90 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80 transition"
          title="Start Live Voice Conversation with Gemini 3.1 Flash Live API"
        >
          <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span className="hidden md:inline">Live Voice</span>
        </button>

        {/* GEMINI AI COPILOT CHAT TRIGGER */}
        <button
          onClick={() => setIsAiAssistantOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-500/40 transition"
          title="Open SolarFlow AI Copilot (Multi-turn Chat & ERP Function Calling)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="hidden md:inline">AI Copilot</span>
        </button>

        {/* DARK / LIGHT MODE TOGGLE BUTTON */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Audit Log Trigger */}
        <button
          onClick={() => setAuditLogOpen(true)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Audit Trail Logs"
        >
          <Shield className="w-4 h-4" />
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute 1.5 top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-slate-400 hover:text-red-400 transition"
                  >
                    Clear All
                  </button>
                  <button onClick={() => setNotifOpen(false)} className="text-slate-400 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto my-2 space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No notifications</p>
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
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                          : 'bg-blue-500/10 dark:bg-blue-500/10 border-blue-500/30 text-slate-900 dark:text-slate-100 font-medium'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold">{n.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.date}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-300 leading-tight">
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Role: {userRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{r}</span>
                  {userRole === r && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* USER PROFILE & LOGOUT DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition border border-slate-200/80 dark:border-slate-700"
            title="User Account Menu"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
              ) : (
                (user?.displayName || user?.email || 'U')[0].toUpperCase()
              )}
            </div>
            <span className="max-w-[110px] truncate hidden md:inline">
              {user?.displayName || user?.email?.split('@')[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 z-50 animate-in fade-in slide-in-from-top-2 space-y-3">
              {/* User Details Header */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    (user?.displayName || user?.email || 'U')[0].toUpperCase()
                  )}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.displayName || 'Solar Enterprise User'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Session & Role
                </div>
                <div className="px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>Role:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{userRole}</span>
                </div>
                <div className="px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>Cloud Database:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CloudCheck className="w-3.5 h-3.5" />
                    <span>Connected</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 transition"
                >
                  <UserIcon className="w-4 h-4 text-blue-600" />
                  <span>Account & Cloud Status</span>
                </button>

                <button
                  onClick={async () => {
                    setUserMenuOpen(false);
                    await logout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 transition"
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
