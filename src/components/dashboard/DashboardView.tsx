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
  Layers,
  Landmark,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981'];

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
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Solar EPC Live Operations</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {companySettings.companyName} Control Center
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Real-time analytics across solar installations, billing, revenue collection, stock alerts, and site progress.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 z-10">
          <button
            onClick={() => setActiveTab('billing')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-xs"
          >
            + Create Invoice
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
          >
            + New Solar Project
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Revenue Billed
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ₹{totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +24%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Received: <span className="font-semibold text-slate-700 dark:text-slate-300">₹{totalReceived.toLocaleString()}</span>
          </p>
        </div>

        {/* Pending Payments */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Amount
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400 tracking-tight">
              ₹{totalPending.toLocaleString()}
            </span>
            <button
              onClick={() => setActiveTab('payments')}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
            >
              Collect &rarr;
            </button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Across {invoices.length} active invoices
          </p>
        </div>

        {/* Active Solar Projects */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Installations
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sun className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeProjects.length} <span className="text-sm font-medium text-slate-500">sites</span>
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              {completedProjects.length} done
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Total Capacity: {projects.reduce((a, b) => a + b.capacityKW, 0)} KW
          </p>
        </div>

        {/* Low Stock Warning */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Low Stock Alert
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
              {lowStockItems.length} <span className="text-sm font-medium text-slate-500">items</span>
            </span>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
            >
              Reorder &rarr;
            </button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Panels & Wire stock critical
          </p>
        </div>
      </div>

      {/* Cash In / Cash Out Live Money Flow Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Live Cash & Bank Position
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Connected Cash In / Cash Out Accounting Ledger
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5 sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Cash In</span>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                +₹{(totalCashIn || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Cash Out</span>
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                -₹{(totalCashOut || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Net Available</span>
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                ₹{(totalAvailableCash || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('accounting')}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
          >
            Open Ledger &rarr;
          </button>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Profit Chart */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Revenue & Profit Trend (Monthly)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Financial growth trajectory in ₹</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              2026 Fiscal
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#f8fafc', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#f59e0b" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProf)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Types Distribution */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Solar System Types
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">On Grid vs Off Grid vs Hybrid share</p>

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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#f8fafc', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            {systemTypes.map((st) => (
              <div key={st.name}>
                <p className="text-[10px] text-slate-500 font-semibold">{st.name}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{st.value} sites</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Installations Pipeline & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Sites */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Today's Installation & Site Schedule</span>
            </h3>
            <button
              onClick={() => setActiveTab('projects')}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
            >
              View All &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {projects.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">{p.projectId}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {p.customerName}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {p.capacityKW} KW {p.systemType} | Assigned: {p.technicianAssigned}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      p.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : p.status === 'Running'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {p.status} ({p.progressPercent}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers & Recent Invoices */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>Recent Billed Customers</span>
            </h3>
            <button
              onClick={() => setActiveTab('customers')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Manage &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {customers.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{c.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      📱 {c.mobile} | {c.projectType}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                    {c.id}
                  </span>
                  <p className="text-[10px] text-slate-400">{c.district}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
