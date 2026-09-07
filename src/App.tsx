import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { PrintModal } from './components/PrintModal';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { AuditLogModal } from './components/audit/AuditLogModal';
import { AuthModal } from './components/auth/AuthModal';
import { AuthScreen } from './components/auth/AuthScreen';
import { AuthLoadingSplash } from './components/auth/AuthLoadingSplash';

import { DashboardView } from './components/dashboard/DashboardView';
import { CustomerView } from './components/customers/CustomerView';
import { ProjectView } from './components/projects/ProjectView';
import { BillingView } from './components/billing/BillingView';
import { QuotationView } from './components/quotations/QuotationView';
import { PaymentView } from './components/payments/PaymentView';
import { InventoryView } from './components/inventory/InventoryView';
import { PurchaseView } from './components/purchases/PurchaseView';
import { DistributorView } from './components/purchases/DistributorView';
import { PurchaseReturnView } from './components/purchases/PurchaseReturnView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { EmployeesView } from './components/employees/EmployeesView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { AccountingView } from './components/accounting/AccountingView';
import { GeminiChatModal } from './components/ai/GeminiChatModal';
import { GeminiLiveVoiceModal } from './components/ai/GeminiLiveVoiceModal';
import { Sparkles, Radio } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    isDarkMode,
    authModalOpen,
    setAuthModalOpen,
    user,
    authLoading,
    isAiAssistantOpen,
    setIsAiAssistantOpen,
    isVoiceLiveActive,
    setIsVoiceLiveActive,
  } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 1. Initial Auth Loading State
  if (authLoading) {
    return <AuthLoadingSplash />;
  }

  // 2. Unauthenticated Gatekeeper Guard: Redirect to Auth Screen
  if (!user) {
    return <AuthScreen />;
  }

  // 3. Authenticated App Experience
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'customers':
        return <CustomerView />;
      case 'projects':
        return <ProjectView />;
      case 'billing':
        return <BillingView />;
      case 'quotation':
        return <QuotationView />;
      case 'payments':
        return <PaymentView />;
      case 'accounting':
        return <AccountingView />;
      case 'inventory':
        return <InventoryView />;
      case 'purchases':
        return <PurchaseView />;
      case 'distributors':
        return <DistributorView />;
      case 'purchase-returns':
        return <PurchaseReturnView />;
      case 'expenses':
        return <ExpensesView />;
      case 'employees':
        return <EmployeesView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans selection:bg-amber-500/30 selection:text-amber-800 dark:selection:text-amber-300">
        {/* Persistent Navigation */}
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <Navbar sidebarCollapsed={sidebarCollapsed} />

        {/* Main View Area */}
        <main
          className={`pt-20 px-4 sm:px-6 lg:px-8 pb-16 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
        >
          <div className="max-w-7xl mx-auto">{renderActiveView()}</div>
        </main>

        {/* Global Modals */}
        <PrintModal />
        <GlobalSearchModal />
        <AuditLogModal />
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

        {/* Gemini AI Copilot Chat Modal */}
        <GeminiChatModal
          isOpen={isAiAssistantOpen}
          onClose={() => setIsAiAssistantOpen(false)}
          onOpenLiveVoice={() => setIsVoiceLiveActive(true)}
        />

        {/* Gemini Live Voice Modal (gemini-3.1-flash-live-preview) */}
        <GeminiLiveVoiceModal
          isOpen={isVoiceLiveActive}
          onClose={() => setIsVoiceLiveActive(false)}
          onOpenChat={() => setIsAiAssistantOpen(true)}
        />

        {/* Sleek Floating AI Capsule Dock */}
        <div className="fixed bottom-6 right-6 z-40 flex items-center p-1.5 rounded-full bg-slate-900/90 dark:bg-slate-800/95 backdrop-blur-md border border-slate-700/60 shadow-xl shadow-slate-950/25 gap-1.5">
          {/* Live Voice Floating Trigger */}
          <button
            onClick={() => setIsVoiceLiveActive(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition"
            title="Launch Real-time Voice with gemini-3.1-flash-live-preview"
          >
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="hidden sm:inline">Live Voice</span>
          </button>

          {/* AI Copilot Primary FAB */}
          <button
            onClick={() => setIsAiAssistantOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs group"
            title="Open SolarFlow AI Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950 group-hover:rotate-12 transition-transform" />
            <span>AI Copilot</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
