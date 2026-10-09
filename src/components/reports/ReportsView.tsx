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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#26372D] dark:text-[#E5ECE7] tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[3px_3px_7px_rgba(175,188,177,0.5),-3px_-3px_7px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_7px_rgba(0,0,0,0.4),-2px_-2px_6px_rgba(255,255,255,0.03)] text-[#25845A] dark:text-[#4ADE80]">
              <BarChart3 className="w-5 h-5" />
            </span>
            <span>Business Financial Reports & Analytics</span>
          </h2>
          <p className="text-xs text-[#728078] dark:text-[#98A79D] mt-1 font-medium">
            Export GST audit statements, revenue vs expense cash flows, KW capacity reports & Excel CSV downloads
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportInvoicesCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[3px_3px_7px_rgba(175,188,177,0.5),-3px_-3px_7px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_7px_rgba(0,0,0,0.4),-2px_-2px_6px_rgba(255,255,255,0.03)] hover:shadow-[1px_1px_3px_rgba(175,188,177,0.5),-1px_-1px_3px_rgba(255,255,255,0.8)] active:shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] text-[#26372D] dark:text-[#E5ECE7] font-bold text-xs transition border border-[#D5DDD6]/60 dark:border-[#2C3E33]/50"
          >
            <Download className="w-4 h-4 text-[#728078] dark:text-[#98A79D]" />
            <span>Export Invoices CSV</span>
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[5px_5px_12px_rgba(175,188,177,0.45),-5px_-5px_12px_rgba(255,255,255,0.75)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.5),-3px_-3px_8px_rgba(255,255,255,0.03)] border border-[#D5DDD6]/60 dark:border-[#2C3E33]/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#728078] dark:text-[#98A79D] uppercase tracking-wider">Gross Revenue Billed</span>
            <DollarSign className="w-4 h-4 text-[#25845A] dark:text-[#4ADE80]" />
          </div>
          <p className="text-2xl font-black text-[#26372D] dark:text-[#E5ECE7]">
            ₹{totalBilled.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#728078] dark:text-[#98A79D]">Across {invoices.length} Tax Invoices</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[5px_5px_12px_rgba(175,188,177,0.45),-5px_-5px_12px_rgba(255,255,255,0.75)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.5),-3px_-3px_8px_rgba(255,255,255,0.03)] border border-[#D5DDD6]/60 dark:border-[#2C3E33]/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#728078] dark:text-[#98A79D] uppercase tracking-wider">Total Cash Collected</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{totalCollected.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#728078] dark:text-[#98A79D]">Realized bank & cash payments</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[5px_5px_12px_rgba(175,188,177,0.45),-5px_-5px_12px_rgba(255,255,255,0.75)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.5),-3px_-3px_8px_rgba(255,255,255,0.03)] border border-[#D5DDD6]/60 dark:border-[#2C3E33]/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#728078] dark:text-[#98A79D] uppercase tracking-wider">Total Operational Expenses</span>
            <DollarSign className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
            ₹{totalExpenses.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#728078] dark:text-[#98A79D]">Fuel, transport, labour & materials</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[5px_5px_12px_rgba(175,188,177,0.45),-5px_-5px_12px_rgba(255,255,255,0.75)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.5),-3px_-3px_8px_rgba(255,255,255,0.03)] border border-[#D5DDD6]/60 dark:border-[#2C3E33]/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#728078] dark:text-[#98A79D] uppercase tracking-wider">Net Realized Margin</span>
            <Sun className="w-4 h-4 text-[#25845A] dark:text-[#4ADE80]" />
          </div>
          <p className="text-2xl font-black text-[#25845A] dark:text-[#4ADE80]">
            ₹{netProfit.toLocaleString()}
          </p>
          <p className="text-[11px] text-[#728078] dark:text-[#98A79D]">{totalKWInstalled} KW Total Power Deployed</p>
        </div>
      </div>

      {/* Export Modules Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] border border-[#D5DDD6]/70 dark:border-[#2C3E33]/60 shadow-[6px_6px_14px_rgba(175,188,177,0.45),-6px_-6px_14px_rgba(255,255,255,0.7)] dark:shadow-[5px_5px_12px_rgba(0,0,0,0.5),-4px_-4px_10px_rgba(255,255,255,0.03)] space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[2px_2px_5px_rgba(175,188,177,0.4),-2px_-2px_5px_rgba(255,255,255,0.7)] text-[#25845A] dark:text-[#4ADE80]">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#26372D] dark:text-[#E5ECE7] text-base">Invoices Ledger</h3>
              <p className="text-xs text-[#728078] dark:text-[#98A79D]">Complete Tax & GST records</p>
            </div>
          </div>
          <p className="text-xs text-[#728078] dark:text-[#98A79D]">
            Download full invoice breakdown including customer GSTIN, tax split, subtotal, and remaining balances.
          </p>
          <button
            onClick={handleExportInvoicesCSV}
            className="w-full py-2.5 rounded-xl bg-[#25845A] hover:bg-[#1E6B49] text-white font-bold text-xs transition shadow-[3px_3px_8px_rgba(37,132,90,0.35)] flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Invoices CSV</span>
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] border border-[#D5DDD6]/70 dark:border-[#2C3E33]/60 shadow-[6px_6px_14px_rgba(175,188,177,0.45),-6px_-6px_14px_rgba(255,255,255,0.7)] dark:shadow-[5px_5px_12px_rgba(0,0,0,0.5),-4px_-4px_10px_rgba(255,255,255,0.03)] space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[2px_2px_5px_rgba(175,188,177,0.4),-2px_-2px_5px_rgba(255,255,255,0.7)] text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#26372D] dark:text-[#E5ECE7] text-base">Payment Receipts</h3>
              <p className="text-xs text-[#728078] dark:text-[#98A79D]">Realized Cash & Bank Logs</p>
            </div>
          </div>
          <p className="text-xs text-[#728078] dark:text-[#98A79D]">
            Export all incoming payment transactions with receipt numbers, transaction references, and payment modes.
          </p>
          <button
            onClick={handleExportPaymentsCSV}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-[3px_3px_8px_rgba(5,150,105,0.35)] flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Payments CSV</span>
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] border border-[#D5DDD6]/70 dark:border-[#2C3E33]/60 shadow-[6px_6px_14px_rgba(175,188,177,0.45),-6px_-6px_14px_rgba(255,255,255,0.7)] dark:shadow-[5px_5px_12px_rgba(0,0,0,0.5),-4px_-4px_10px_rgba(255,255,255,0.03)] space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[2px_2px_5px_rgba(175,188,177,0.4),-2px_-2px_5px_rgba(255,255,255,0.7)] text-rose-600 dark:text-rose-400">
              <PieIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#26372D] dark:text-[#E5ECE7] text-base">Expense Log Audit</h3>
              <p className="text-xs text-[#728078] dark:text-[#98A79D]">Operational Spending</p>
            </div>
          </div>
          <p className="text-xs text-[#728078] dark:text-[#98A79D]">
            Detailed ledger of site expenses, fuel expenses, labour costs, and vendor material payments.
          </p>
          <button
            onClick={handleExportExpensesCSV}
            className="w-full py-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[3px_3px_7px_rgba(175,188,177,0.5),-3px_-3px_7px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_7px_rgba(0,0,0,0.4),-2px_-2px_6px_rgba(255,255,255,0.03)] hover:shadow-[1px_1px_3px_rgba(175,188,177,0.5),-1px_-1px_3px_rgba(255,255,255,0.8)] active:shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] text-[#26372D] dark:text-[#E5ECE7] font-bold text-xs transition border border-[#D5DDD6]/60 dark:border-[#2C3E33]/50 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-[#728078] dark:text-[#98A79D]" />
            <span>Download Expenses CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
