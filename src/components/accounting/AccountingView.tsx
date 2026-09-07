import React, { useState, useMemo } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Building2,
  Wallet,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  Clock,
  RotateCcw,
  Receipt,
  Layers,
  Sparkles,
  HelpCircle,
  ChevronRight,
  FileText,
  Tag,
  ArrowDownLeft,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useApp } from '../../context/AppContext';
import {
  CashInTransaction,
  CashOutTransaction,
  CashBankAccount,
  AccountingPaymentMethod,
  ChequeStatus,
} from '../../types';
import { RecordCashInModal } from './RecordCashInModal';
import { RecordCashOutModal } from './RecordCashOutModal';
import { AccountTransferModal } from './AccountTransferModal';
import { AddAccountModal } from './AddAccountModal';
import { ChequeClearingModal } from './ChequeClearingModal';
import { ReverseTransactionModal } from './ReverseTransactionModal';

type AccountingTab =
  | 'overview'
  | 'cash-in'
  | 'cash-out'
  | 'accounts'
  | 'cheques'
  | 'gst';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'last_month' | 'fy';

export const AccountingView: React.FC = () => {
  const {
    accounts,
    cashInTransactions,
    cashOutTransactions,
    accountTransfers,
    projects,
    invoices,
    purchases,
    expenses,
    customers,
    getAccountCalculatedBalance,
    totalAvailableCash,
    reverseTransaction,
    setPrintData,
  } = useApp();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<AccountingTab>('overview');

  // Filters
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cashInSourceFilter, setCashInSourceFilter] = useState<'all' | 'billing-advances' | 'direct'>('all');

  // Modals state
  const [cashInModalOpen, setCashInModalOpen] = useState(false);
  const [cashOutModalOpen, setCashOutModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [addAccountModalOpen, setAddAccountModalOpen] = useState(false);
  const [chequeModalData, setChequeModalData] = useState<{
    isOpen: boolean;
    type: 'Cash In' | 'Cash Out';
    id: string;
    chequeNumber?: string;
    bankName?: string;
    status?: ChequeStatus;
    amount: number;
    party: string;
  } | null>(null);
  const [reverseModalData, setReverseModalData] = useState<{
    isOpen: boolean;
    type: 'cash_in' | 'cash_out';
    transaction: CashInTransaction | CashOutTransaction | null;
  } | null>(null);

  // Quick GST Modal state
  const [defaultCashOutCat, setDefaultCashOutCat] = useState<any>(undefined);
  const [defaultCashOutPaidTo, setDefaultCashOutPaidTo] = useState<string | undefined>(undefined);
  const [defaultCashOutAmount, setDefaultCashOutAmount] = useState<number | undefined>(undefined);

  // Date Filtering Helper
  const isWithinDateFilter = (dateStr: string) => {
    if (!dateStr || dateFilter === 'all') return true;
    const itemDate = new Date(dateStr);
    const now = new Date();

    if (dateFilter === 'today') {
      return itemDate.toDateString() === now.toDateString();
    }
    if (dateFilter === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return itemDate >= startOfWeek;
    }
    if (dateFilter === 'month') {
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }
    if (dateFilter === 'last_month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return (
        itemDate.getMonth() === lastMonth.getMonth() &&
        itemDate.getFullYear() === lastMonth.getFullYear()
      );
    }
    if (dateFilter === 'fy') {
      const currentYear = now.getFullYear();
      const fyStart = now.getMonth() >= 3 ? new Date(currentYear, 3, 1) : new Date(currentYear - 1, 3, 1);
      return itemDate >= fyStart;
    }
    return true;
  };

  // Filtered Cash In
  const filteredCashIn = useMemo(() => {
    return cashInTransactions.filter((tx) => {
      if (!isWithinDateFilter(tx.date)) return false;
      if (selectedAccountId !== 'all' && tx.accountId !== selectedAccountId) return false;
      if (selectedProjectId !== 'all' && tx.projectId !== selectedProjectId) return false;

      // Source Filter (All vs Billing & Invoices Advance vs Direct)
      const isBillingAdvance =
        tx.sourceModule === 'billing' ||
        tx.sourceType === 'Advance from Customer' ||
        Boolean(tx.invoiceId) ||
        (tx.referenceNo && tx.referenceNo.startsWith('INV-'));

      if (cashInSourceFilter === 'billing-advances' && !isBillingAdvance) return false;
      if (cashInSourceFilter === 'direct' && isBillingAdvance) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matches =
          (tx.fromWhom && tx.fromWhom.toLowerCase().includes(query)) ||
          (tx.referenceNo && tx.referenceNo.toLowerCase().includes(query)) ||
          (tx.sourceType && tx.sourceType.toLowerCase().includes(query)) ||
          (tx.projectName && tx.projectName.toLowerCase().includes(query)) ||
          (tx.invoiceId && tx.invoiceId.toLowerCase().includes(query)) ||
          (tx.accountName && tx.accountName.toLowerCase().includes(query)) ||
          (tx.paymentMethod && tx.paymentMethod.toLowerCase().includes(query)) ||
          (tx.notes && tx.notes.toLowerCase().includes(query));
        if (!matches) return false;
      }
      return true;
    });
  }, [cashInTransactions, dateFilter, selectedAccountId, selectedProjectId, searchTerm, cashInSourceFilter]);

  // Billing Advances Specific Metrics
  const totalBillingAdvances = useMemo(() => {
    return cashInTransactions
      .filter(
        (tx) =>
          (tx.sourceModule === 'billing' ||
            tx.sourceType === 'Advance from Customer' ||
            Boolean(tx.invoiceId) ||
            (tx.referenceNo && tx.referenceNo.startsWith('INV-'))) &&
          tx.status === 'Confirmed'
      )
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  }, [cashInTransactions]);

  const billingAdvancesCount = useMemo(() => {
    return cashInTransactions.filter(
      (tx) =>
        tx.sourceModule === 'billing' ||
        tx.sourceType === 'Advance from Customer' ||
        Boolean(tx.invoiceId) ||
        (tx.referenceNo && tx.referenceNo.startsWith('INV-'))
    ).length;
  }, [cashInTransactions]);

  // Filtered Cash Out
  const filteredCashOut = useMemo(() => {
    return cashOutTransactions.filter((tx) => {
      if (!isWithinDateFilter(tx.date)) return false;
      if (selectedAccountId !== 'all' && tx.accountId !== selectedAccountId) return false;
      if (selectedProjectId !== 'all' && tx.projectId !== selectedProjectId) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matches =
          tx.paidTo.toLowerCase().includes(query) ||
          tx.referenceNo.toLowerCase().includes(query) ||
          tx.category.toLowerCase().includes(query) ||
          (tx.projectName && tx.projectName.toLowerCase().includes(query)) ||
          tx.paymentMethod.toLowerCase().includes(query);
        if (!matches) return false;
      }
      return true;
    });
  }, [cashOutTransactions, dateFilter, selectedAccountId, selectedProjectId, searchTerm]);

  // Metrics (Strictly calculated from confirmed transactions)
  const totalCashInAmount = useMemo(() => {
    return filteredCashIn
      .filter((tx) => tx.status === 'Confirmed')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  }, [filteredCashIn]);

  const pendingCashInAmount = useMemo(() => {
    return filteredCashIn
      .filter((tx) => tx.status === 'Pending')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  }, [filteredCashIn]);

  const totalCashOutAmount = useMemo(() => {
    return filteredCashOut
      .filter((tx) => tx.status === 'Paid')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  }, [filteredCashOut]);

  const pendingCashOutAmount = useMemo(() => {
    return filteredCashOut
      .filter((tx) => tx.status === 'Pending')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  }, [filteredCashOut]);

  const netCashFlow = totalCashInAmount - totalCashOutAmount;

  // Check if any account is below alert limit
  const lowBalanceAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const bal = getAccountCalculatedBalance(acc.id);
      return bal <= acc.minBalanceAlert;
    });
  }, [accounts, getAccountCalculatedBalance]);

  // Monthly Cash Flow Chart data (last 6 months)
  const chartData = useMemo(() => {
    const monthsMap: Record<string, { month: string; cashIn: number; cashOut: number; net: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7); // YYYY-MM
      const label = d.toLocaleDateString('default', { month: 'short', year: '2-digit' });
      monthsMap[key] = { month: label, cashIn: 0, cashOut: 0, net: 0 };
    }

    cashInTransactions.forEach((tx) => {
      if (tx.status === 'Confirmed') {
        const key = tx.date.slice(0, 7);
        if (monthsMap[key]) {
          monthsMap[key].cashIn += Number(tx.amount);
          monthsMap[key].net += Number(tx.amount);
        }
      }
    });

    cashOutTransactions.forEach((tx) => {
      if (tx.status === 'Paid') {
        const key = tx.date.slice(0, 7);
        if (monthsMap[key]) {
          monthsMap[key].cashOut += Number(tx.amount);
          monthsMap[key].net -= Number(tx.amount);
        }
      }
    });

    return Object.values(monthsMap);
  }, [cashInTransactions, cashOutTransactions]);

  // Cheques tracking count
  const pendingChequesIn = cashInTransactions.filter(
    (tx) => tx.paymentMethod === 'Cheque' && tx.chequeStatus === 'Pending'
  );
  const pendingChequesOut = cashOutTransactions.filter(
    (tx) => tx.paymentMethod === 'Cheque' && tx.chequeStatus === 'Pending'
  );

  // GST Calculations
  const gstMetrics = useMemo(() => {
    // Output GST from Invoices (CGST + SGST + IGST)
    const outputGst = invoices.reduce((acc, inv) => {
      return acc + (Number(inv.taxTotal) || 0);
    }, 0);

    // Input Tax Credit (ITC) from Purchases
    const inputGst = purchases.reduce((acc, pur) => {
      return acc + (Number(pur.totalGst || pur.totalTax) || 0);
    }, 0);

    // Total GST paid via Cash Out
    const gstPaid = cashOutTransactions
      .filter((tx) => tx.category === 'GST Payment' && tx.status === 'Paid')
      .reduce((acc, tx) => acc + Number(tx.amount), 0);

    const netPayable = Math.max(0, outputGst - inputGst - gstPaid);

    return { outputGst, inputGst, gstPaid, netPayable };
  }, [invoices, purchases, cashOutTransactions]);

  // Export CSV handler
  const handleExportCSV = (type: 'cash-in' | 'cash-out') => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = '';

    if (type === 'cash-in') {
      headers = ['Date', 'Time', 'From Whom', 'Category', 'Ref No', 'Project', 'Account', 'Method', 'Amount', 'Status'];
      rows = filteredCashIn.map((tx) => [
        tx.date,
        tx.time || '',
        `"${tx.fromWhom}"`,
        `"${tx.sourceType}"`,
        tx.referenceNo,
        `"${tx.projectName || ''}"`,
        `"${tx.accountName}"`,
        tx.paymentMethod,
        tx.amount.toString(),
        tx.status,
      ]);
      filename = `Cash_In_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    } else {
      headers = ['Date', 'Time', 'Paid To', 'Category', 'Ref No', 'Project', 'Account', 'Method', 'Amount', 'Status'];
      rows = filteredCashOut.map((tx) => [
        tx.date,
        tx.time || '',
        `"${tx.paidTo}"`,
        `"${tx.category}"`,
        tx.referenceNo,
        `"${tx.projectName || ''}"`,
        `"${tx.accountName}"`,
        tx.paymentMethod,
        tx.amount.toString(),
        tx.status,
      ]);
      filename = `Cash_Out_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick Open GST Payment modal
  const handleOpenGstPayment = () => {
    setDefaultCashOutCat('GST Payment');
    setDefaultCashOutPaidTo('GST Portal / Government of India');
    setDefaultCashOutAmount(gstMetrics.netPayable > 0 ? gstMetrics.netPayable : undefined);
    setCashOutModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Accounting & GST Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connected Cash In / Cash Out system with real-time bank ledger & GST reconciliation
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setTransferModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition shadow-sm"
          >
            <ArrowLeftRight className="w-4 h-4 text-blue-500" />
            <span>Contra Transfer</span>
          </button>
          <button
            onClick={() => {
              setDefaultCashOutCat(undefined);
              setDefaultCashOutPaidTo(undefined);
              setDefaultCashOutAmount(undefined);
              setCashOutModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 transition"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>- Record Cash Out</span>
          </button>
          <button
            onClick={() => setCashInModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>+ Record Cash In</span>
          </button>
        </div>
      </div>

      {/* Low Balance Alert Banner */}
      {lowBalanceAccounts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-800 dark:text-amber-300 animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="text-xs">
              <span className="font-bold">Low Balance Warning: </span>
              {lowBalanceAccounts.map((a) => `${a.name} (₹${(getAccountCalculatedBalance(a.id) || 0).toLocaleString('en-IN')})`).join(', ')}{' '}
              is below minimum threshold!
            </div>
          </div>
          <button
            onClick={() => setActiveTab('accounts')}
            className="text-xs font-bold underline flex-shrink-0 hover:text-amber-900 dark:hover:text-amber-100"
          >
            Review Accounts &rarr;
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. PROMINENT CASH IN & CASH OUT TOP HERO SECTIONS
          (As requested in user prompt)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* PROMINENT CASH IN CARD */}
        <div
          onClick={() => setActiveTab('cash-in')}
          className="cursor-pointer relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-xl shadow-emerald-500/5 hover:border-emerald-500 transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30 group-hover:scale-110 transition duration-200">
                <ArrowDownRight className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  CASH IN
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Total Money Inflow</p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {filteredCashIn.length} txns
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ₹{totalCashInAmount.toLocaleString('en-IN')}
            </div>
            {pendingCashInAmount > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>₹{pendingCashInAmount.toLocaleString('en-IN')} pending clearance</span>
              </p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold">
            <span>View Inward Ledger</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* PROMINENT CASH OUT CARD */}
        <div
          onClick={() => setActiveTab('cash-out')}
          className="cursor-pointer relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border-2 border-rose-500/40 dark:border-rose-500/30 shadow-xl shadow-rose-500/5 hover:border-rose-500 transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-600/30 group-hover:scale-110 transition duration-200">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  CASH OUT
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Total Money Outflow</p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              {filteredCashOut.length} txns
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ₹{totalCashOutAmount.toLocaleString('en-IN')}
            </div>
            {pendingCashOutAmount > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>₹{pendingCashOutAmount.toLocaleString('en-IN')} uncleared cheques</span>
              </p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-rose-500/20 flex items-center justify-between text-xs text-rose-700 dark:text-rose-400 font-bold">
            <span>View Outward Ledger</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* NET CASH FLOW CARD */}
        <div className="relative overflow-hidden p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`p-2.5 rounded-2xl ${
                  netCashFlow >= 0
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                }`}
              >
                {netCashFlow >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  NET CASH FLOW
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Cash In - Cash Out</p>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                netCashFlow >= 0
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              }`}
            >
              {netCashFlow >= 0 ? '+ Surplus' : '- Deficit'}
            </span>
          </div>
          <div className="space-y-1">
            <div
              className={`text-2xl lg:text-3xl font-black tracking-tight ${
                netCashFlow >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              ₹{netCashFlow.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500">
              Operating cash balance during period
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
            <span>In/Out Ratio:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {totalCashOutAmount > 0
                ? `${((totalCashInAmount / totalCashOutAmount) * 100).toFixed(0)}%`
                : '100%'}
            </span>
          </div>
        </div>

        {/* TOTAL AVAILABLE BALANCE CARD */}
        <div
          onClick={() => setActiveTab('accounts')}
          className="cursor-pointer relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-xl shadow-indigo-950/20 hover:scale-[1.01] transition"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-white/10 text-indigo-300">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                  AVAILABLE FUNDS
                </span>
                <p className="text-[11px] text-slate-300">Bank + Cash on Hand</p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/10 text-emerald-300">
              Live
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              ₹{(totalAvailableCash || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-indigo-200">
              Across {accounts.length} active registered accounts
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-indigo-300 font-bold">
            <span>Manage Accounts</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Overview & Analytics
          </button>
          <button
            onClick={() => setActiveTab('cash-in')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'cash-in'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Cash In Ledger</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20">
              {filteredCashIn.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('cash-out')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'cash-out'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Cash Out Ledger</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20">
              {filteredCashOut.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'accounts'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Bank & Cash Accounts</span>
          </button>
          <button
            onClick={() => setActiveTab('cheques')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'cheques'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Cheque Desk</span>
            {(pendingChequesIn.length > 0 || pendingChequesOut.length > 0) && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-black">
                {pendingChequesIn.length + pendingChequesOut.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('gst')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'gst'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>GST Settlement</span>
          </button>
        </div>

        {/* Global Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, party..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date Range Selector */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="fy">This FY (2025-26)</option>
          </select>

          {/* Account filter */}
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none max-w-[130px] truncate"
          >
            <option value="all">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>

          {/* Export button */}
          {(activeTab === 'cash-in' || activeTab === 'cash-out') && (
            <button
              onClick={() => handleExportCSV(activeTab as any)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB CONTENT
         ───────────────────────────────────────────────────────────── */}

      {/* 1. OVERVIEW & ANALYTICS TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cash Flow Monthly Trends */}
            <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Cash In vs Cash Out Trends (Last 6 Months)
                  </h3>
                  <p className="text-xs text-slate-500">Comparison of inflows, outflows, and net cash retained</p>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="cashIn" name="Cash In" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="cashOut" name="Cash Out" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Bank Accounts Status widget */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Account Balances</h3>
                <button
                  onClick={() => setAddAccountModalOpen(true)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {accounts.map((acc) => {
                  const bal = getAccountCalculatedBalance(acc.id) || 0;
                  const isLow = bal <= acc.minBalanceAlert;
                  return (
                    <div
                      key={acc.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {acc.name}
                          </span>
                          {isLow && (
                            <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded-full bg-rose-500 text-white">
                              LOW
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {acc.accountType} {acc.accountNumber ? `••••${acc.accountNumber.slice(-4)}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-xs font-black ${
                            isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          ₹{(bal || 0).toLocaleString('en-IN')}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedAccountId(acc.id);
                            setActiveTab('cash-in');
                          }}
                          className="text-[10px] text-blue-600 hover:underline"
                        >
                          Ledger &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setTransferModalOpen(true)}
                className="w-full py-2 text-xs font-bold rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition flex items-center justify-center gap-1.5"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Execute Contra Fund Transfer</span>
              </button>
            </div>
          </div>

          {/* Combined Live Money Flow Stream (Recent In & Out) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Real-time Money Movement Feed
                </h3>
                <p className="text-xs text-slate-500">Latest synchronized entries from Invoices, Purchases, and Expenses</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Live ERP Sync
                </span>
              </div>
            </div>

            {/* List of recent mixed transactions */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                ...cashInTransactions.map((tx) => ({ ...tx, kind: 'in' as const })),
                ...cashOutTransactions.map((tx) => ({ ...tx, kind: 'out' as const })),
              ]
                .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
                .slice(0, 8)
                .map((item) => {
                  const isIn = item.kind === 'in';
                  return (
                    <div
                      key={item.id}
                      className="py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition px-2 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl ${
                            isIn
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          }`}
                        >
                          {isIn ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                              {isIn ? (item as CashInTransaction).fromWhom : (item as CashOutTransaction).paidTo}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                                isIn
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                              }`}
                            >
                              {isIn
                                ? (item as CashInTransaction).sourceType
                                : (item as CashOutTransaction).category}
                            </span>
                            {item.sourceModule && item.sourceModule !== 'manual' && (
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                                via {item.sourceModule}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{item.date}</span>
                            <span>•</span>
                            <span>{item.paymentMethod}</span>
                            <span>•</span>
                            <span>Ref: {item.referenceNo}</span>
                            <span>•</span>
                            <span>{item.accountName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-sm font-black ${
                            isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isIn ? '+' : '-'} ₹{Number(item.amount).toLocaleString('en-IN')}
                        </div>
                        <span
                          className={`text-[10px] font-bold ${
                            item.status === 'Confirmed' || item.status === 'Paid'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* 2. CASH IN LEDGER TAB */}
      {activeTab === 'cash-in' && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          {/* Header & Quick Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Cash In Transaction Ledger (कैश इन खाता)
              </h3>
              <p className="text-xs text-slate-500">
                All inward funds from Billing Advances, customer payments, subsidies, and manual receipts
              </p>
            </div>
            <button
              onClick={() => setCashInModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Inflow</span>
            </button>
          </div>

          {/* Key Summary Cards - Highlighting Billing Advances */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                  Total Confirmed Inflow
                </span>
                <ArrowDownRight className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xl font-black text-emerald-950 dark:text-emerald-100 mt-1">
                ₹{totalCashInAmount.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                Across {filteredCashIn.length} transactions
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-700/80 ring-1 ring-amber-500/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Billing & Invoice Advances
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                  Auto-Synced
                </span>
              </div>
              <p className="text-xl font-black text-amber-950 dark:text-amber-100 mt-1">
                ₹{totalBillingAdvances.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-amber-700 dark:text-amber-300 mt-0.5 font-medium">
                {billingAdvancesCount} advances received from customer invoices
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Direct / Other Inflows
                </span>
                <Wallet className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                ₹{Math.max(0, totalCashInAmount - totalBillingAdvances).toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Manual receipts, subsidies & capital
              </p>
            </div>
          </div>

          {/* Quick Filter Buttons for Origin / Source */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mr-1">
              Source Filter:
            </span>
            <button
              onClick={() => setCashInSourceFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                cashInSourceFilter === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Cash In ({cashInTransactions.length})
            </button>
            <button
              onClick={() => setCashInSourceFilter('billing-advances')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                cashInSourceFilter === 'billing-advances'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>🧾 Advance from Billing ({billingAdvancesCount})</span>
            </button>
            <button
              onClick={() => setCashInSourceFilter('direct')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                cashInSourceFilter === 'direct'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Direct Receipts ({Math.max(0, cashInTransactions.length - billingAdvancesCount)})
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Customer / From Whom</th>
                  <th className="py-3 px-4">Origin / Where Received From</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Credited Account</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredCashIn.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-400">
                      No Cash In transactions found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredCashIn.map((tx) => {
                    const isBillingAdvance =
                      tx.sourceModule === 'billing' ||
                      tx.sourceType === 'Advance from Customer' ||
                      Boolean(tx.invoiceId) ||
                      (tx.referenceNo && tx.referenceNo.startsWith('INV-'));

                    // Lookup customer & invoice info if available
                    const matchedCustomer = customers?.find(
                      (c) => c.name.toLowerCase() === tx.fromWhom.toLowerCase() || (tx.customerId && c.id === tx.customerId)
                    );
                    const matchedInvoice = invoices?.find(
                      (i) => i.id === tx.invoiceId || i.invoiceNumber === tx.referenceNo
                    );

                    return (
                      <tr
                        key={tx.id}
                        className={`transition ${
                          isBillingAdvance
                            ? 'bg-amber-50/30 dark:bg-amber-950/10 hover:bg-amber-50/70 dark:hover:bg-amber-950/20'
                            : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold">{tx.date}</div>
                          <div className="text-[10px] text-slate-400">{tx.time || '12:00'}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{tx.fromWhom}</span>
                            {isBillingAdvance && (
                              <span className="px-1.5 py-0.2 text-[9px] font-black rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                                Client
                              </span>
                            )}
                          </div>
                          {matchedCustomer && (
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                              📱 {matchedCustomer.mobile} {matchedCustomer.district ? `• 📍 ${matchedCustomer.district}` : ''}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {isBillingAdvance ? (
                            <div className="space-y-1">
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                                <FileText className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                <span>Advance: {tx.referenceNo}</span>
                              </div>
                              {matchedInvoice ? (
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                  <span>Inv Total: ₹{Number(matchedInvoice.grandTotal).toLocaleString('en-IN')}</span>
                                  {Number(matchedInvoice.remainingBalance) > 0 && (
                                    <span className="text-amber-600 dark:text-amber-400 font-semibold ml-1">
                                      (Bal: ₹{Number(matchedInvoice.remainingBalance).toLocaleString('en-IN')})
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-400">
                                  Billing Module Advance Payment
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                {tx.sourceType}
                              </span>
                              <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                                Ref: {tx.referenceNo}
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-500 max-w-[120px] truncate">
                          {tx.projectName || '-'}
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          {tx.accountName}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-medium">{tx.paymentMethod}</span>
                          {tx.paymentMethod === 'Cheque' && tx.chequeNumber && (
                            <span className="block text-[10px] text-slate-400">#{tx.chequeNumber}</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm whitespace-nowrap">
                          +₹{Number(tx.amount).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {tx.isReversed || tx.status === 'Cancelled' ? (
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                              title={tx.reversalReason || 'Reversed Transaction'}
                            >
                              Reversed
                            </span>
                          ) : (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                tx.status === 'Confirmed'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                  : tx.status === 'Pending'
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                  : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              {tx.status}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            {tx.paymentMethod === 'Cheque' && tx.chequeStatus !== 'Cleared' && tx.status !== 'Cancelled' && !tx.isReversed && (
                              <button
                                onClick={() =>
                                  setChequeModalData({
                                    isOpen: true,
                                    type: 'Cash In',
                                    id: tx.id,
                                    chequeNumber: tx.chequeNumber,
                                    bankName: tx.chequeBankName,
                                    status: tx.chequeStatus,
                                    amount: tx.amount,
                                    party: tx.fromWhom,
                                  })
                                }
                                className="px-2 py-1 text-[10px] font-bold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition"
                                title="Clear Cheque"
                              >
                                Clear
                              </button>
                            )}
                            {tx.status !== 'Cancelled' && !tx.isReversed && (
                              <button
                                onClick={() =>
                                  setReverseModalData({
                                    isOpen: true,
                                    type: 'cash_in',
                                    transaction: tx,
                                  })
                                }
                                className="px-2 py-1 text-[10px] font-bold rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 flex items-center gap-1 transition shadow-xs"
                                title="Reverse Transaction (Adjusts Ledger & Unlocks Invoice)"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reverse</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Summary */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between text-xs gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-emerald-900 dark:text-emerald-300">
                Filtered Inflow ({filteredCashIn.length} txns):
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 font-semibold">
                Billing Advances: ₹{totalBillingAdvances.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>
                Confirmed:{' '}
                <strong className="text-emerald-700 dark:text-emerald-300">
                  ₹{totalCashInAmount.toLocaleString('en-IN')}
                </strong>
              </span>
              {pendingCashInAmount > 0 && (
                <span>
                  Pending Clearance:{' '}
                  <strong className="text-amber-700 dark:text-amber-300">
                    ₹{pendingCashInAmount.toLocaleString('en-IN')}
                  </strong>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. CASH OUT LEDGER TAB */}
      {activeTab === 'cash-out' && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                Cash Out Transaction Ledger
              </h3>
              <p className="text-xs text-slate-500">
                All outward funds for supplier bills, salaries, GST payments, site expenses, and transport
              </p>
            </div>
            <button
              onClick={() => {
                setDefaultCashOutCat(undefined);
                setDefaultCashOutPaidTo(undefined);
                setDefaultCashOutAmount(undefined);
                setCashOutModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 transition self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Outflow</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Paid To</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Bill / Ref No</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Deducted From</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredCashOut.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      No Cash Out transactions found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredCashOut.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold">{tx.date}</div>
                        <div className="text-[10px] text-slate-400">{tx.time || '12:00'}</div>
                      </td>
                      <td className="py-3 px-4 font-bold">{tx.paidTo}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {tx.referenceNo}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-[120px] truncate">
                        {tx.projectName || '-'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {tx.accountName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{tx.paymentMethod}</span>
                        {tx.paymentMethod === 'Cheque' && tx.chequeNumber && (
                          <span className="block text-[10px] text-slate-400">#{tx.chequeNumber}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-rose-600 dark:text-rose-400 text-sm whitespace-nowrap">
                        -₹{Number(tx.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {tx.isReversed || tx.status === 'Cancelled' ? (
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                            title={tx.reversalReason || 'Reversed Transaction'}
                          >
                            Reversed
                          </span>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.status === 'Paid'
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                : tx.status === 'Pending'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {tx.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {tx.paymentMethod === 'Cheque' && tx.chequeStatus !== 'Cleared' && tx.status !== 'Cancelled' && !tx.isReversed && (
                            <button
                              onClick={() =>
                                setChequeModalData({
                                  isOpen: true,
                                  type: 'Cash Out',
                                  id: tx.id,
                                  chequeNumber: tx.chequeNumber,
                                  bankName: tx.chequeBankName,
                                  status: tx.chequeStatus,
                                  amount: tx.amount,
                                  party: tx.paidTo,
                                })
                              }
                              className="px-2 py-1 text-[10px] font-bold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition"
                              title="Clear Issued Cheque"
                            >
                              Clear
                            </button>
                          )}
                          {tx.status !== 'Cancelled' && !tx.isReversed && (
                            <button
                              onClick={() =>
                                setReverseModalData({
                                  isOpen: true,
                                  type: 'cash_out',
                                  transaction: tx,
                                })
                              }
                              className="px-2 py-1 text-[10px] font-bold rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 flex items-center gap-1 transition shadow-xs"
                              title="Reverse Payment Transaction"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reverse</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Summary */}
          <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 flex flex-wrap items-center justify-between text-xs gap-3">
            <span className="font-bold text-rose-900 dark:text-rose-300">
              Total Recorded Outflow ({filteredCashOut.length} transactions):
            </span>
            <div className="flex items-center gap-4">
              <span>
                Paid Out:{' '}
                <strong className="text-rose-700 dark:text-rose-300">
                  ₹{totalCashOutAmount.toLocaleString('en-IN')}
                </strong>
              </span>
              {pendingCashOutAmount > 0 && (
                <span>
                  Pending Cleared:{' '}
                  <strong className="text-amber-700 dark:text-amber-300">
                    ₹{pendingCashOutAmount.toLocaleString('en-IN')}
                  </strong>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. BANK & CASH ACCOUNTS TAB */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                Company Cash Registers & Bank Accounts
              </h3>
              <p className="text-xs text-slate-500">
                Live calculated balances, opening balances, and low-balance warning triggers
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTransferModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 transition"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Transfer Funds</span>
              </button>
              <button
                onClick={() => setAddAccountModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Account</span>
              </button>
            </div>
          </div>

          {/* Account Cards Grid */}
          {accounts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800">
              <Building2 className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <h4 className="text-base font-bold text-slate-900 dark:text-white">No Bank or Cash Accounts Configured</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                Register your business bank accounts (SBI, HDFC, ICICI, etc.) or petty cash register to start tracking inflow, outflow, and balances.
              </p>
              <button
                onClick={() => setAddAccountModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Account</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((acc) => {
                const currentBal = getAccountCalculatedBalance(acc.id) || 0;
              const isLow = currentBal <= acc.minBalanceAlert;

              // Calculate in and out for this account
              const accIn = cashInTransactions
                .filter((tx) => tx.accountId === acc.id && tx.status === 'Confirmed')
                .reduce((s, tx) => s + Number(tx.amount || 0), 0);
              const accOut = cashOutTransactions
                .filter((tx) => tx.accountId === acc.id && tx.status === 'Paid')
                .reduce((s, tx) => s + Number(tx.amount || 0), 0);

              return (
                <div
                  key={acc.id}
                  className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all ${
                    isLow
                      ? 'border-rose-300 dark:border-rose-900/60 shadow-lg shadow-rose-500/5'
                      : 'border-slate-200 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2.5 rounded-2xl ${
                          acc.accountType === 'Cash'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {acc.accountType === 'Cash' ? (
                          <Wallet className="w-5 h-5" />
                        ) : (
                          <Building2 className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{acc.name}</h4>
                        <p className="text-[11px] text-slate-500">{acc.accountType}</p>
                      </div>
                    </div>
                    {isLow && (
                      <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Low Bal
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mb-4">
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                      Live Available Balance
                    </span>
                    <div
                      className={`text-2xl font-black ${
                        isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      ₹{(currentBal || 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  {acc.accountNumber && (
                    <div className="text-[11px] text-slate-500 space-y-0.5 mb-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between">
                        <span>A/c Number:</span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                          {acc.accountNumber}
                        </span>
                      </div>
                      {acc.ifscCode && (
                        <div className="flex justify-between">
                          <span>IFSC Code:</span>
                          <span className="font-mono">{acc.ifscCode}</span>
                        </div>
                      )}
                      {acc.upiId && (
                        <div className="flex justify-between">
                          <span>UPI ID:</span>
                          <span>{acc.upiId}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-400">Total In:</span>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">
                        +₹{(accIn || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400">Total Out:</span>
                      <p className="font-bold text-rose-600 dark:text-rose-400">
                        -₹{(accOut || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setSelectedAccountId(acc.id);
                        setActiveTab('cash-in');
                      }}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      View Transactions
                    </button>
                    <button
                      onClick={() => setTransferModalOpen(true)}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                    >
                      Transfer &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

          {/* Account Transfers History */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-blue-500" />
              Recent Contra Fund Transfers
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">From (Source)</th>
                    <th className="py-2.5 px-4">To (Destination)</th>
                    <th className="py-2.5 px-4">Ref / UTR</th>
                    <th className="py-2.5 px-4">Notes</th>
                    <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {accountTransfers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No contra transfers recorded yet.
                      </td>
                    </tr>
                  ) : (
                    accountTransfers.map((tr) => (
                      <tr key={tr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 font-medium">{tr.transferDate}</td>
                        <td className="py-2.5 px-4 font-bold text-rose-600 dark:text-rose-400">
                          {tr.fromAccountName}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {tr.toAccountName}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px]">{tr.referenceNo}</td>
                        <td className="py-2.5 px-4 text-slate-500">{tr.notes || '-'}</td>
                        <td className="py-2.5 px-4 text-right font-black text-blue-600 dark:text-blue-400">
                          ₹{tr.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. CHEQUE CLEARING DESK TAB */}
      {activeTab === 'cheques' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Cheque Clearing & Realization Desk
              </h3>
              <p className="text-xs text-slate-500">
                Cheques remain 'Pending' until cleared by bank; clearing immediately reflects into company available balance.
              </p>
            </div>

            {/* Inward Cheques (Customer Cheques Received) */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <ArrowDownRight className="w-4 h-4" />
                Customer Cheques Received (Inward)
              </h4>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Received From</th>
                      <th className="py-2.5 px-4">Cheque #</th>
                      <th className="py-2.5 px-4">Drawee Bank</th>
                      <th className="py-2.5 px-4">Deposit Account</th>
                      <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                      <th className="py-2.5 px-4 text-center">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {cashInTransactions
                      .filter((tx) => tx.paymentMethod === 'Cheque')
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-4">{tx.date}</td>
                          <td className="py-2.5 px-4 font-bold">{tx.fromWhom}</td>
                          <td className="py-2.5 px-4 font-mono font-bold">{tx.chequeNumber || 'N/A'}</td>
                          <td className="py-2.5 px-4 text-slate-500">{tx.chequeBankName || '-'}</td>
                          <td className="py-2.5 px-4">{tx.accountName}</td>
                          <td className="py-2.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                            ₹{tx.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                tx.chequeStatus === 'Cleared'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : tx.chequeStatus === 'Bounced'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                            >
                              {tx.chequeStatus || tx.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <button
                              onClick={() =>
                                setChequeModalData({
                                  isOpen: true,
                                  type: 'Cash In',
                                  id: tx.id,
                                  chequeNumber: tx.chequeNumber,
                                  bankName: tx.chequeBankName,
                                  status: tx.chequeStatus,
                                  amount: tx.amount,
                                  party: tx.fromWhom,
                                })
                              }
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 transition"
                            >
                              Update &rarr;
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Outward Cheques (Vendor / Expense Cheques Issued) */}
            <div className="space-y-3 pt-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4" />
                Company Cheques Issued (Outward)
              </h4>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Paid To</th>
                      <th className="py-2.5 px-4">Cheque #</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Bank Account</th>
                      <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                      <th className="py-2.5 px-4 text-center">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {cashOutTransactions
                      .filter((tx) => tx.paymentMethod === 'Cheque')
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-4">{tx.date}</td>
                          <td className="py-2.5 px-4 font-bold">{tx.paidTo}</td>
                          <td className="py-2.5 px-4 font-mono font-bold">{tx.chequeNumber || 'N/A'}</td>
                          <td className="py-2.5 px-4 text-slate-500">{tx.category}</td>
                          <td className="py-2.5 px-4">{tx.accountName}</td>
                          <td className="py-2.5 px-4 text-right font-black text-rose-600 dark:text-rose-400">
                            ₹{tx.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                tx.chequeStatus === 'Cleared'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : tx.chequeStatus === 'Bounced'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                            >
                              {tx.chequeStatus || tx.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <button
                              onClick={() =>
                                setChequeModalData({
                                  isOpen: true,
                                  type: 'Cash Out',
                                  id: tx.id,
                                  chequeNumber: tx.chequeNumber,
                                  bankName: tx.chequeBankName,
                                  status: tx.chequeStatus,
                                  amount: tx.amount,
                                  party: tx.paidTo,
                                })
                              }
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 transition"
                            >
                              Update &rarr;
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. GST SETTLEMENT DESK TAB */}
      {activeTab === 'gst' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Output GST */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Output GST (Sales)
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                ₹{gstMetrics.outputGst.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500">Collected from Customer Invoices</p>
            </div>

            {/* Input Tax Credit */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Input Tax Credit (ITC)
              </span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{gstMetrics.inputGst.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500">Claimable from Material Purchases</p>
            </div>

            {/* GST Paid */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Challans Paid
              </span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                ₹{gstMetrics.gstPaid.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500">Settled via Cash Out Ledger</p>
            </div>

            {/* Net GST Payable */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white shadow-lg shadow-purple-950/20 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200">
                Net GST Liability
              </span>
              <div className="text-2xl font-black text-white">
                ₹{gstMetrics.netPayable.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-purple-200">Output GST - ITC - Paid</p>
            </div>
          </div>

          {/* Action Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Pay GST Challan (PMT-06 / GSTR-3B)
              </h4>
              <p className="text-xs text-slate-500">
                Record GST payment directly into Cash Out. Automatically updates your company's bank balance and reconciles tax liability.
              </p>
            </div>
            <button
              onClick={handleOpenGstPayment}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30 transition whitespace-nowrap"
            >
              <Receipt className="w-4 h-4" />
              <span>Record GST Challan Payment</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODALS
         ───────────────────────────────────────────────────────────── */}
      <RecordCashInModal
        isOpen={cashInModalOpen}
        onClose={() => setCashInModalOpen(false)}
      />

      <RecordCashOutModal
        isOpen={cashOutModalOpen}
        onClose={() => setCashOutModalOpen(false)}
        defaultCategory={defaultCashOutCat}
        defaultPaidTo={defaultCashOutPaidTo}
        defaultAmount={defaultCashOutAmount}
      />

      <AccountTransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
      />

      <AddAccountModal
        isOpen={addAccountModalOpen}
        onClose={() => setAddAccountModalOpen(false)}
      />

      {chequeModalData && (
        <ChequeClearingModal
          isOpen={chequeModalData.isOpen}
          onClose={() => setChequeModalData(null)}
          transactionType={chequeModalData.type}
          transactionId={chequeModalData.id}
          chequeNumber={chequeModalData.chequeNumber}
          chequeBankName={chequeModalData.bankName}
          currentStatus={chequeModalData.status}
          amount={chequeModalData.amount}
          partyName={chequeModalData.party}
        />
      )}

      {reverseModalData && (
        <ReverseTransactionModal
          isOpen={reverseModalData.isOpen}
          onClose={() => setReverseModalData(null)}
          transactionType={reverseModalData.type}
          transaction={reverseModalData.transaction}
        />
      )}
    </div>
  );
};
