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
  FileSpreadsheet,
  FileText,
  CreditCard,
  UserPlus,
  Package,
  ChevronRight,
  Sparkles,
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

  const COLORS = ['#f59e0b', '#0284c7', '#059669'];

  // Monthly Revenue Data for Area Chart
  const monthlyData = [
    { month: 'मार्च (Mar)', revenue: 420000, expense: 180000, profit: 240000 },
    { month: 'अप्रैल (Apr)', revenue: 650000, expense: 220000, profit: 430000 },
    { month: 'मई (May)', revenue: 890000, expense: 310000, profit: 580000 },
    { month: 'जून (Jun)', revenue: 1200000, expense: 450000, profit: 750000 },
    { month: 'जुलाई (Jul)', revenue: 1819000, expense: 520000, profit: 1299000 },
    { month: 'अगस्त (Aug)', revenue: 1450000, expense: 380000, profit: 1070000 },
  ];

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* Top Banner - Executive Solar Control Center (Indian Saffron 3D Master Card) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-[0_14px_36px_rgba(217,119,6,0.28)] border-b-4 border-amber-700 relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Subtle decorative sun rays & glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-28 -mt-28" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-yellow-300/20 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-black shadow-xs">
            <Sun className="w-4 h-4 text-amber-200 animate-[spin_10s_linear_infinite]" />
            <span>सूर्य किरण सोलर ईपीसी लाइव ऑपरेशन्स (Solar EPC Live)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
            {companySettings.companyName}
          </h2>
          <p className="text-xs sm:text-sm text-amber-50 max-w-2xl leading-relaxed font-medium">
            जौनपुर एवं पूर्वांचल का विश्वसनीय सोलर पॉवर कंट्रोल सेंटर • रीयल-टाइम सोलर इंस्टालेशन, जीएसटी बिलिंग, कोटेशन एवं इन्वेंट्री।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 z-10">
          <button
            onClick={() => setActiveTab('quotation')}
            className="btn-3d-white flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            <span>+ नया सोलर कोटेशन</span>
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className="btn-3d-white flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>+ जीएसटी बिल (Invoice)</span>
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className="btn-3d-emerald flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black"
          >
            <Sun className="w-4 h-4" />
            <span>+ नया सोलर साइट</span>
          </button>
        </div>
      </div>

      {/* 3D Tactile Interactive Action Station (Easy 1-Click Operations) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-black text-amber-900/80 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>त्वरित कार्य स्टेशन (Easy 1-Click Operations)</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            क्लिक करके तुरंत कार्य शुरू करें
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {/* Tile 1: Quotation Generator */}
          <div
            onClick={() => setActiveTab('quotation')}
            className="card-3d-interactive p-4 rounded-2xl flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 border-b-2 border-amber-600 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                सोलर कोटेशन
              </p>
              <p className="text-[10.5px] text-amber-700 dark:text-amber-400 font-bold mt-0.5">
                Quotation Generator
              </p>
              <p className="text-[10px] text-slate-400 mt-1">अनुमानित खर्च व विवरण</p>
            </div>
          </div>

          {/* Tile 2: GST Billing */}
          <div
            onClick={() => setActiveTab('billing')}
            className="card-3d-interactive p-4 rounded-2xl flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 border-b-2 border-blue-700 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                जीएसटी बिलिंग
              </p>
              <p className="text-[10.5px] text-blue-700 dark:text-blue-400 font-bold mt-0.5">
                Tax Invoices
              </p>
              <p className="text-[10px] text-slate-400 mt-1">A4 पक्का जीएसटी बिल</p>
            </div>
          </div>

          {/* Tile 3: Collect Payment */}
          <div
            onClick={() => setActiveTab('payments')}
            className="card-3d-interactive p-4 rounded-2xl flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 border-b-2 border-emerald-700 group-hover:scale-105 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                भुगतान दर्ज करें
              </p>
              <p className="text-[10.5px] text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">
                Record Payment
              </p>
              <p className="text-[10px] text-slate-400 mt-1">कैश / ऑनलाइन रसीद</p>
            </div>
          </div>

          {/* Tile 4: Add Customer */}
          <div
            onClick={() => setActiveTab('customers')}
            className="card-3d-interactive p-4 rounded-2xl flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25 border-b-2 border-purple-700 group-hover:scale-105 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                नया ग्राहक
              </p>
              <p className="text-[10.5px] text-purple-700 dark:text-purple-400 font-bold mt-0.5">
                Add Customer
              </p>
              <p className="text-[10px] text-slate-400 mt-1">पता, मोबाइल, लोड</p>
            </div>
          </div>

          {/* Tile 5: Inventory & Panels */}
          <div
            onClick={() => setActiveTab('inventory')}
            className="card-3d-interactive p-4 rounded-2xl flex flex-col justify-between group col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/25 border-b-2 border-orange-700 group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                सोलर इन्वेंट्री
              </p>
              <p className="text-[10.5px] text-orange-700 dark:text-orange-400 font-bold mt-0.5">
                Solar Inventory
              </p>
              <p className="text-[10px] text-slate-400 mt-1">पैनल, इन्वर्टर, वायर स्टॉक</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards (3D Elevated) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed Revenue */}
        <div className="card-3d p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-900/70 dark:text-amber-400 uppercase tracking-wider">
              कुल बिलिंग (Total Revenue)
            </span>
            <div className="w-10 h-10 rounded-xl icon-plate-3d text-amber-700 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +24%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            प्राप्त राशि: <span className="font-bold text-emerald-700 dark:text-emerald-400">₹{totalReceived.toLocaleString('en-IN')}</span>
          </p>
        </div>

        {/* Pending Payments */}
        <div className="card-3d p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-rose-800 dark:text-rose-400 uppercase tracking-wider">
              बाकी भुगतान (Pending Due)
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-100 to-rose-200 text-rose-700 border border-rose-300 border-b-2 border-b-rose-400 flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight tabular-nums">
              ₹{totalPending.toLocaleString('en-IN')}
            </span>
            <button
              onClick={() => setActiveTab('payments')}
              className="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-900 font-black flex items-center gap-0.5 underline cursor-pointer"
            >
              वसूली करें &rarr;
            </button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            कुल {invoices.length} बिलों पर बकाया
          </p>
        </div>

        {/* Active Solar Projects */}
        <div className="card-3d p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
              सक्रिय इंस्टालेशन (Active Sites)
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-100 to-emerald-200 text-emerald-700 border border-emerald-300 border-b-2 border-b-emerald-400 flex items-center justify-center shadow-xs">
              <Sun className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
              {activeProjects.length} <span className="text-sm font-bold text-slate-500">साइट्स</span>
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {completedProjects.length} पूर्ण
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            कुल क्षमता: <span className="font-bold text-slate-800">{projects.reduce((a, b) => a + b.capacityKW, 0)} किलोवाट (KW)</span>
          </p>
        </div>

        {/* Low Stock Warning */}
        <div className="card-3d p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-900 dark:text-amber-400 uppercase tracking-wider">
              स्टॉक चेतावनी (Low Stock)
            </span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-100 to-amber-200 text-amber-700 border border-amber-300 border-b-2 border-b-amber-400 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400 tracking-tight tabular-nums">
              {lowStockItems.length} <span className="text-sm font-bold text-slate-500">उत्पाद</span>
            </span>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-900 font-black flex items-center gap-0.5 underline cursor-pointer"
            >
              आर्डर करें &rarr;
            </button>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            पैनल व इन्वर्टर स्टॉक की जांच करें
          </p>
        </div>
      </div>

      {/* Cash In / Cash Out Live Money Flow Banner (3D Card) */}
      <div className="card-3d p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md border-b-2 border-indigo-700">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              खाता एवं बैंक बैलेंस स्थिति (Live Cash & Bank Position)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              कैश इन / कैश आउट रीयल-टाइम बहीखाता (Connected Accounting Ledger)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2.5 p-2 bg-emerald-50 rounded-xl border border-emerald-200 shadow-2xs">
            <div className="p-1 rounded-lg bg-emerald-500 text-white">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9.5px] text-emerald-800 font-black uppercase">कैश इन (Cash In)</span>
              <p className="text-xs sm:text-sm font-black text-emerald-700 tabular-nums">
                +₹{(totalCashIn || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 bg-rose-50 rounded-xl border border-rose-200 shadow-2xs">
            <div className="p-1 rounded-lg bg-rose-500 text-white">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9.5px] text-rose-800 font-black uppercase">खर्च (Cash Out)</span>
              <p className="text-xs sm:text-sm font-black text-rose-700 tabular-nums">
                -₹{(totalCashOut || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 bg-indigo-50 rounded-xl border border-indigo-200 shadow-2xs">
            <div className="p-1 rounded-lg bg-indigo-600 text-white">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9.5px] text-indigo-900 font-black uppercase">उपलब्ध शेष (Net)</span>
              <p className="text-xs sm:text-sm font-black text-indigo-700 tabular-nums">
                ₹{(totalAvailableCash || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('accounting')}
            className="btn-3d-amber px-3.5 py-2 text-xs font-bold rounded-xl transition"
          >
            बहीखाता खोलें &rarr;
          </button>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Profit Chart */}
        <div className="lg:col-span-2 card-3d p-5 sm:p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                मासिक आमदनी एवं मुनाफा रुझान (Revenue & Profit Trend)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">वित्तीय वृद्धि ग्राफ़ (भारतीय रुपये ₹ में)</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg shadow-2xs">
              वित्तीय वर्ष 2026-27
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '2px solid #f59e0b', color: '#0f172a', fontSize: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" name="कुल राजस्व (Revenue)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                <Area type="monotone" dataKey="profit" name="शुद्ध लाभ (Profit)" stroke="#059669" fillOpacity={1} fill="url(#colorProf)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Types Distribution */}
        <div className="card-3d p-5 sm:p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              सोलर सिस्टम प्रकार (System Types)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">ऑन ग्रिड, ऑफ ग्रिड, हाइब्रिड हिस्सेदारी</p>

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
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '2px solid #f59e0b', color: '#0f172a', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-amber-100 dark:border-slate-800 text-center">
            {systemTypes.map((st) => (
              <div key={st.name} className="p-2 bg-amber-50/60 rounded-xl border border-amber-200/50">
                <p className="text-[10px] text-amber-900 font-extrabold">{st.name}</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">{st.value} साइट्स</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Installations Pipeline & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Sites */}
        <div className="card-3d p-5 sm:p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-amber-600" />
              <span>आज का इंस्टालेशन शेड्यूल (Today's Schedule)</span>
            </h3>
            <button
              onClick={() => setActiveTab('projects')}
              className="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-900 font-black cursor-pointer"
            >
              सभी देखें &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {projects.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-slate-800/40 hover:bg-amber-100/50 dark:hover:bg-slate-800/70 border border-amber-200/70 dark:border-slate-800 flex items-center justify-between transition shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-amber-800 dark:text-amber-400 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      {p.projectId}
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {p.customerName}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-medium">
                    {p.capacityKW} KW {p.systemType} | तकनीशियन: {p.technicianAssigned}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`px-2.5 py-1 text-[10px] font-black rounded-full shadow-2xs ${
                      p.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : p.status === 'Running'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
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
        <div className="card-3d p-5 sm:p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-indigo-600" />
              <span>हाल के ग्राहक (Recent Billed Customers)</span>
            </h3>
            <button
              onClick={() => setActiveTab('customers')}
              className="text-xs text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 font-black cursor-pointer"
            >
              प्रबंधन करें &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {customers.slice(0, 4).map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-indigo-50/40 dark:bg-slate-800/40 hover:bg-indigo-100/40 dark:hover:bg-slate-800/70 border border-indigo-200/60 dark:border-slate-800 flex items-center justify-between transition shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs border-b-2 border-indigo-700">
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{c.name}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      📱 {c.mobile} | {c.projectType}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-black text-indigo-900 dark:text-slate-100 bg-indigo-100/80 px-2 py-0.5 rounded border border-indigo-200">
                    {c.id}
                  </span>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">{c.district}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

