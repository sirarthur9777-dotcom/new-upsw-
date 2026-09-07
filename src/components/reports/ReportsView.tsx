import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  TrendingUp,
  PieChart as PieIcon,
  Sun,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReportsView: React.FC = () => {
  const { invoices, payments, expenses, projects, exportToCSV } = useApp();

  const [dateRange, setDateRange] = useState('This Month');

  // Business Analytics Calculations
  const totalBilled = invoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalCollected - totalExpenses;

  const totalKWInstalled = projects
    .filter((p) => p.status === 'Completed' || p.status === 'Running')
    .reduce((acc, p) => acc + p.capacityKW, 0);

  const handleExportInvoicesCSV = () => {
    exportToCSV('solarix_invoices_report', invoices);
  };

  const handleExportPaymentsCSV = () => {
    exportToCSV('solarix_payments_report', payments);
  };

  const handleExportExpensesCSV = () => {
    exportToCSV('solarix_expenses_report', expenses);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Business Financial Reports & Analytics</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export GST audit statements, revenue vs expense cash flows, KW capacity reports & Excel CSV downloads
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportInvoicesCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Gross Revenue Billed</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            ₹{totalBilled.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">Across {invoices.length} Tax Invoices</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Cash Collected</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{totalCollected.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">Realized bank & cash payments</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Operational Expenses</span>
            <DollarSign className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-red-500">
            ₹{totalExpenses.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">Fuel, transport, labour & materials</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Net Realized Margin</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-500">
            ₹{netProfit.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">{totalKWInstalled} KW Total Power Deployed</p>
        </div>
      </div>

      {/* Export Modules Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Invoices Ledger</h3>
              <p className="text-xs text-slate-400">Complete Tax & GST records</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Download full invoice breakdown including customer GSTIN, tax split, subtotal, and remaining balances.
          </p>
          <button
            onClick={handleExportInvoicesCSV}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-xs flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Invoices CSV</span>
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Payment Receipts</h3>
              <p className="text-xs text-slate-400">Realized Cash & Bank Logs</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Export all incoming payment transactions with receipt numbers, transaction references, and payment modes.
          </p>
          <button
            onClick={handleExportPaymentsCSV}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-xs flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Payments CSV</span>
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
              <PieIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Expense Log Audit</h3>
              <p className="text-xs text-slate-400">Operational Spending</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Detailed ledger of site expenses, fuel expenses, labour costs, and vendor material payments.
          </p>
          <button
            onClick={handleExportExpensesCSV}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Expenses CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
