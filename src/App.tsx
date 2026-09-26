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
          className={`pt-20 px-4 sm:px-6 lg:px-8 pb-16 transition-all duration-300 no-print print:hidden ${
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
