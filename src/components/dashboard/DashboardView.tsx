import React from 'react';
import {
  TrendingUp,
  Sun,
  DollarSign,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Zap,
  Calendar,
  Landmark,
  ArrowDownRight,
  FileText,
  Package,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../../context/AppContext';

export const DashboardView: React.FC = () => {
  const {
    customers,
    projects,
    invoices,
    expenses,
    inventory,
    setActiveTab,
    companySettings,
    totalAvailableCash,
    cashInTransactions,
    cashOutTransactions,
  } = useApp();

  // Cash In / Cash Out Totals
  const totalCashIn = (cashInTransactions || [])
    .filter((t) => t.status === 'Confirmed')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalCashOut = (cashOutTransactions || [])
    .filter((t) => t.status === 'Paid')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Financial Metrics
  const totalRevenue = (invoices || []).reduce((acc, inv) => acc + (Number(inv.grandTotal) || 0), 0);
  const totalReceived = (invoices || []).reduce((acc, inv) => acc + (Number(inv.advancePaid) || 0), 0);
  const totalPending = (invoices || []).reduce((acc, inv) => acc + (Number(inv.remainingBalance) || 0), 0);
  const totalExpenses = (expenses || []).reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0);
  const estimatedProfit = totalRevenue - totalExpenses;

  // Outstanding Invoices
  const outstandingInvoices = (invoices || []).filter((inv) => inv.paymentStatus !== 'Paid');

  // Counts
  const activeProjects = projects.filter((p) => p.status === 'Running' || p.status === 'Pending');
  const completedProjects = projects.filter((p) => p.status === 'Completed');
  const lowStockItems = inventory.filter((i) => i.currentStock <= i.minStockAlert);

  // System Types breakdown for Pie Chart
  const systemTypes = [
    { name: 'On Grid', value: projects.filter((p) => p.systemType === 'On Grid').length },
    { name: 'Off Grid', value: projects.filter((p) => p.systemType === 'Off Grid').length },
    { name: 'Hybrid', value: projects.filter((p) => p.systemType === 'Hybrid').length },
  ];

  const PIE_COLORS = ['#25845A', '#2878C7', '#D99A18'];

  // Monthly Revenue Data for Area Chart
  const monthlyData = [
    { month: 'Mar', revenue: 420000, expense: 180000, profit: 240000 },
    { month: 'Apr', revenue: 650000, expense: 220000, profit: 430000 },
    { month: 'May', revenue: 890000, expense: 310000, profit: 580000 },
    { month: 'Jun', revenue: 1200000, expense: 450000, profit: 750000 },
    { month: 'Jul', revenue: 1819000, expense: 520000, profit: 1299000 },
    { month: 'Aug', revenue: 1450000, expense: 380000, profit: 1070000 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner - Executive Solar Control Center */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)] relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCEBE0] text-[#25845A] dark:text-[#2DA16E] text-xs font-bold border border-[#25845A]/20">
            <Zap className="w-3.5 h-3.5 text-[#25845A]" />
            <span>Solar EPC Live Operations</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#24372D] dark:text-white">
            {companySettings.companyName} Control Center
          </h2>
          <p className="text-xs text-[#68786E] dark:text-[#8E9F94] max-w-xl leading-relaxed">
            Real-time analytics across solar installations, billing, revenue collection, stock alerts, and site progress.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 z-10">
          <button
            onClick={() => setActiveTab('billing')}
            className="px-4 py-2.5 rounded-xl bg-[#25845A] hover:bg-[#1D7049] text-white font-bold text-xs transition shadow-[0_4px_12px_rgba(37,132,90,0.25),0_1px_3px_rgba(37,132,90,0.15)] border border-[#1D7049] active:translate-y-0"
          >
            + Create Invoice
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className="px-4 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#1B2720] hover:bg-[#F8FAF8] text-[#24372D] dark:text-[#E6EEE8] font-bold text-xs shadow-[2px_2px_6px_rgba(36,55,45,0.06),-2px_-2px_6px_rgba(255,255,255,0.85)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.3)] border border-[#D9E2DA] dark:border-[#223328] transition"
          >
            + New Solar Project
          </button>
        </div>
      </div>

      {/* KPI Stats Cards (4 Primary Raised White Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed Revenue */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition hover:shadow-[0_6px_16px_rgba(36,55,45,0.09)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#87938B] dark:text-[#6B7C72] uppercase tracking-wider">
              Total Revenue Billed
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#DCEBE0] text-[#25845A] flex items-center justify-center border border-[#25845A]/20">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-[#24372D] dark:text-white tracking-tight tabular-nums">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-[#25845A] dark:text-[#2DA16E] font-bold flex items-center tabular-nums">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +24%
            </span>
          </div>
          <p className="text-[11px] text-[#68786E] dark:text-[#8E9F94] mt-1 tabular-nums">
            Received: <span className="font-bold text-[#24372D] dark:text-[#E6EEE8]">₹{totalReceived.toLocaleString('en-IN')}</span>
          </p>
        </div>

        {/* Pending Payments */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition hover:shadow-[0_6px_16px_rgba(36,55,45,0.09)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#87938B] dark:text-[#6B7C72] uppercase tracking-wider">
              Pending Amount
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#D83B3B]/10 text-[#D83B3B] flex items-center justify-center border border-[#D83B3B]/20">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-[#D83B3B] tracking-tight tabular-nums">
              ₹{totalPending.toLocaleString('en-IN')}
            </span>
            <button
              onClick={() => setActiveTab('payments')}
              className="text-xs text-[#25845A] dark:text-[#2DA16E] hover:underline font-bold"
            >
              Collect &rarr;
            </button>
          </div>
          <p className="text-[11px] text-[#68786E] dark:text-[#8E9F94] mt-1">
            Across {outstandingInvoices.length} outstanding invoices
          </p>
        </div>

        {/* Active Solar Projects */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition hover:shadow-[0_6px_16px_rgba(36,55,45,0.09)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#87938B] dark:text-[#6B7C72] uppercase tracking-wider">
              Active Installations
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#DCEBE0] text-[#25845A] flex items-center justify-center border border-[#25845A]/20">
              <Sun className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-[#24372D] dark:text-white tracking-tight tabular-nums">
              {activeProjects.length} <span className="text-sm font-semibold text-[#87938B]">sites</span>
            </span>
            <span className="text-xs text-[#25845A] dark:text-[#2DA16E] font-bold">
              {completedProjects.length} completed
            </span>
          </div>
          <p className="text-[11px] text-[#68786E] dark:text-[#8E9F94] mt-1 tabular-nums">
            Total Capacity: {projects.reduce((a, b) => a + Number(b.capacityKW || 0), 0)} KW
          </p>
        </div>

        {/* Low Stock Warning */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition hover:shadow-[0_6px_16px_rgba(36,55,45,0.09)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#87938B] dark:text-[#6B7C72] uppercase tracking-wider">
              Low Stock Alert
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#D99A18]/10 text-[#D99A18] flex items-center justify-center border border-[#D99A18]/20">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-[#D99A18] tracking-tight tabular-nums">
              {lowStockItems.length} <span className="text-sm font-semibold text-[#87938B]">items</span>
            </span>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs text-[#25845A] dark:text-[#2DA16E] hover:underline font-bold"
            >
              Reorder &rarr;
            </button>
          </div>
          <p className="text-[11px] text-[#68786E] dark:text-[#8E9F94] mt-1">
            {lowStockItems.length > 0 ? 'Requires purchase procurement' : 'All warehouse stock optimal'}
          </p>
        </div>
      </div>

      {/* Cash In / Cash Out Live Money Flow Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DCEBE0] text-[#25845A] border border-[#25845A]/20 flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#24372D] dark:text-[#E6EEE8]">
              Cash & Bank Position
            </h4>
            <p className="text-[11px] text-[#68786E] dark:text-[#8E9F94]">
              Connected Cash In / Cash Out Accounting Ledger
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5 sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#DCEBE0] text-[#25845A]">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#87938B] font-bold uppercase">Cash In</span>
              <p className="text-xs font-bold text-[#25845A] dark:text-[#2DA16E] tabular-nums">
                +₹{(totalCashIn || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#D83B3B]/10 text-[#D83B3B]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#87938B] font-bold uppercase">Cash Out</span>
              <p className="text-xs font-bold text-[#D83B3B] tabular-nums">
                -₹{(totalCashOut || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#2878C7]/10 text-[#2878C7]">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#87938B] font-bold uppercase">Net Available</span>
              <p className="text-xs font-bold text-[#24372D] dark:text-[#E6EEE8] tabular-nums">
                ₹{(totalAvailableCash || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('accounting')}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#F1F5F1] dark:bg-[#152019] text-[#25845A] dark:text-[#2DA16E] border border-[#D9E2DA] dark:border-[#223328] hover:bg-[#DCEBE0] transition shadow-xs"
          >
            Open Ledger &rarr;
          </button>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Profit Chart */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-[#24372D] dark:text-white">
                Revenue & Profit Trend (Monthly)
              </h3>
              <p className="text-xs text-[#68786E] dark:text-[#8E9F94]">Monthly performance analysis in ₹</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-[#DCEBE0] text-[#25845A] dark:text-[#2DA16E] rounded-lg border border-[#25845A]/20">
              FY 2026
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#25845A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#25845A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2878C7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2878C7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#D9E2DA" opacity={0.6} />
                <XAxis dataKey="month" stroke="#87938B" fontSize={12} tickLine={false} />
                <YAxis stroke="#87938B" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #D9E2DA', color: '#24372D', fontSize: '12px', boxShadow: '0 4px 12px rgba(36,55,45,0.08)' }}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#25845A" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#2878C7" fillOpacity={1} fill="url(#colorProf)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Types Distribution */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#24372D] dark:text-white">
              Solar System Types
            </h3>
            <p className="text-xs text-[#68786E] dark:text-[#8E9F94]">On Grid vs Off Grid vs Hybrid share</p>

            <div className="h-48 my-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={systemTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={76}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {systemTypes.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #D9E2DA', color: '#24372D', fontSize: '12px', boxShadow: '0 4px 12px rgba(36,55,45,0.08)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#D9E2DA] dark:border-[#223328] text-center">
            {systemTypes.map((st, i) => (
              <div key={st.name} className="p-2 rounded-xl bg-[#F1F5F1] dark:bg-[#152019] border border-[#D9E2DA] dark:border-[#223328]">
                <p className="text-[10px] text-[#68786E] dark:text-[#8E9F94] font-bold flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                  {st.name}
                </p>
                <p className="text-sm font-black text-[#24372D] dark:text-white tabular-nums mt-0.5">{st.value} sites</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Installations Pipeline, Outstanding Invoices & Recent Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Installation & Site Schedule */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#24372D] dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#25845A]" />
              <span>Active Site Pipeline</span>
            </h3>
            <button
              onClick={() => setActiveTab('projects')}
              className="text-xs text-[#25845A] dark:text-[#2DA16E] hover:underline font-bold"
            >
              View All &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {projects.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-[#F1F5F1] dark:bg-[#152019] border border-[#D9E2DA] dark:border-[#223328] flex items-center justify-between transition hover:border-[#25845A]/30"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#25845A] dark:text-[#2DA16E]">{p.projectId}</span>
                    <span className="text-xs font-bold text-[#24372D] dark:text-white truncate max-w-[120px]">
                      {p.customerName}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#68786E] dark:text-[#8E9F94] mt-0.5">
                    {p.capacityKW} KW {p.systemType} · {p.technicianAssigned}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      p.status === 'Completed'
                        ? 'bg-[#DCEBE0] text-[#25845A] border border-[#25845A]/20'
                        : p.status === 'Running'
                        ? 'bg-[#D99A18]/12 text-[#D99A18] border border-[#D99A18]/25'
                        : 'bg-[#68786E]/12 text-[#68786E] border border-[#68786E]/20'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outstanding Invoices Widget */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#24372D] dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2878C7]" />
              <span>Outstanding Invoices</span>
            </h3>
            <button
              onClick={() => setActiveTab('billing')}
              className="text-xs text-[#25845A] dark:text-[#2DA16E] hover:underline font-bold"
            >
              All Invoices &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {outstandingInvoices.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#87938B]">
                All invoices fully collected!
              </div>
            ) : (
              outstandingInvoices.slice(0, 4).map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl bg-[#F1F5F1] dark:bg-[#152019] border border-[#D9E2DA] dark:border-[#223328] flex items-center justify-between transition hover:border-[#2878C7]/30"
                >
                  <div>
                    <p className="text-xs font-bold text-[#24372D] dark:text-white truncate max-w-[130px]">
                      {inv.customerName}
                    </p>
                    <p className="text-[11px] text-[#87938B] font-mono mt-0.5">
                      {inv.invoiceNumber}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-black text-[#D83B3B] tabular-nums">
                      ₹{Number(inv.remainingBalance || 0).toLocaleString('en-IN')}
                    </p>
                    <span className="text-[10px] text-[#68786E]">
                      {inv.paymentStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Billed Customers */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#24372D] dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#25845A]" />
              <span>CRM Customers</span>
            </h3>
            <button
              onClick={() => setActiveTab('customers')}
              className="text-xs text-[#25845A] dark:text-[#2DA16E] hover:underline font-bold"
            >
              Directory &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {customers.slice(0, 4).map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-[#F1F5F1] dark:bg-[#152019] border border-[#D9E2DA] dark:border-[#223328] flex items-center justify-between transition hover:border-[#25845A]/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#25845A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {c.name ? c.name[0].toUpperCase() : 'C'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#24372D] dark:text-white truncate max-w-[120px]">{c.name}</p>
                    <p className="text-[11px] text-[#68786E] dark:text-[#8E9F94]">
                      📱 {c.mobile}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#24372D] dark:text-white">
                    {c.district}
                  </span>
                  <p className="text-[10px] text-[#87938B]">{c.projectType}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
