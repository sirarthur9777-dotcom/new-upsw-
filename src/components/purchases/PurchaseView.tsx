import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Building2,
  Calendar,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Package,
  RotateCcw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp, formatINR } from '../../context/AppContext';
import { Purchase } from '../../types';
import { PurchaseModal } from './PurchaseModal';
import { PurchaseDetailModal } from './PurchaseDetailModal';
import { PurchaseInvoicePrint } from './PurchaseInvoicePrint';

export const PurchaseView: React.FC = () => {
  const {
    purchases,
    distributors,
    deletePurchase,
    exportToCSV,
    companySettings,
    setActiveTab,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Received' | 'Partial' | 'Ordered' | 'Pending'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'Paid' | 'Partial' | 'Unpaid'>('ALL');
  const [distributorFilter, setDistributorFilter] = useState<string>('ALL');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [printPurchase, setPrintPurchase] = useState<Purchase | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered Purchases
  const filteredPurchases = useMemo(() => {
    return (purchases || []).filter((p) => {
      const matchesSearch =
        (p.id && p.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.distributorName && p.distributorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.items && p.items.some((i) => i.productName.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchesPayment = paymentFilter === 'ALL' || p.paymentStatus === paymentFilter;
      const matchesDistributor = distributorFilter === 'ALL' || p.distributorId === distributorFilter;

      return matchesSearch && matchesStatus && matchesPayment && matchesDistributor;
    });
  }, [purchases, searchTerm, statusFilter, paymentFilter, distributorFilter]);

  // Overall Financial Stats
  const stats = useMemo(() => {
    const totalCount = purchases.length;
    const totalValue = purchases.reduce((sum, p) => sum + (Number(p.grandTotal) || 0), 0);
    const totalPaid = purchases.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0);
    const totalDue = purchases.reduce((sum, p) => sum + (Number(p.dueAmount) || 0), 0);
    const receivedCount = purchases.filter((p) => p.status === 'Received').length;

    return { totalCount, totalValue, totalPaid, totalDue, receivedCount };
  }, [purchases]);

  const handleExportCSV = () => {
    const rows = filteredPurchases.map((p) => ({
      'PO Number': p.id,
      'Vendor Invoice No': p.invoiceNumber,
      Date: p.purchaseDate,
      Distributor: p.distributorName,
      'GSTIN': p.distributorGst || '',
      'Items Count': p.items?.length || 0,
      'Subtotal (₹)': p.subtotal,
      'GST Tax (₹)': p.totalTax,
      'Shipping (₹)': p.shippingCharges || 0,
      'Grand Total (₹)': p.grandTotal,
      'Paid Amount (₹)': p.paidAmount || 0,
      'Due Amount (₹)': p.dueAmount || 0,
      'Payment Status': p.paymentStatus,
      'Receiving Status': p.status,
    }));
    exportToCSV(`Purchases_Ledger_${new Date().toISOString().split('T')[0]}`, rows);
  };

  const handleDelete = async (id: string) => {
    await deletePurchase(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#26372D] dark:text-[#E5ECE7] tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[3px_3px_7px_rgba(175,188,177,0.5),-3px_-3px_7px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_7px_rgba(0,0,0,0.4),-2px_-2px_6px_rgba(255,255,255,0.03)] text-[#25845A] dark:text-[#4ADE80]">
              <ShoppingCart className="w-5 h-5" />
            </span>
            <span>Product Purchases & Stock Inward (GRN)</span>
          </h2>
          <p className="text-xs text-[#728078] dark:text-[#98A79D] mt-1 font-medium">
            Procurement management directly linked with single-source inventory stock and vendor billing
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveTab('distributors')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[3px_3px_7px_rgba(175,188,177,0.5),-3px_-3px_7px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_7px_rgba(0,0,0,0.4),-2px_-2px_6px_rgba(255,255,255,0.03)] hover:shadow-[1px_1px_3px_rgba(175,188,177,0.5),-1px_-1px_3px_rgba(255,255,255,0.8)] active:shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] text-[#26372D] dark:text-[#E5ECE7] text-xs font-bold transition border border-[#D5DDD6]/60 dark:border-[#2C3E33]/50"
          >
            <Building2 className="w-4 h-4 text-[#728078] dark:text-[#98A79D]" />
            <span>Distributors ({distributors.length})</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[3px_3px_7px_rgba(175,188,177,0.5),-3px_-3px_7px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_7px_rgba(0,0,0,0.4),-2px_-2px_6px_rgba(255,255,255,0.03)] hover:shadow-[1px_1px_3px_rgba(175,188,177,0.5),-1px_-1px_3px_rgba(255,255,255,0.8)] active:shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] text-[#26372D] dark:text-[#E5ECE7] text-xs font-bold transition border border-[#D5DDD6]/60 dark:border-[#2C3E33]/50"
          >
            <Download className="w-4 h-4 text-[#728078] dark:text-[#98A79D]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingPurchase(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25845A] hover:bg-[#1E6B49] text-white text-xs font-bold transition shadow-[4px_4px_10px_rgba(37,132,90,0.35),-2px_-2px_6px_rgba(255,255,255,0.5)] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ New Purchase</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[5px_5px_12px_rgba(175,188,177,0.45),-5px_-5px_12px_rgba(255,255,255,0.75)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.5),-3px_-3px_8px_rgba(255,255,255,0.03)] border border-[#D5DDD6]/60 dark:border-[#2C3E33]/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#728078] dark:text-[#98A79D]">Total Purchases Value</span>
            <span className="p-2 rounded-xl bg-[#25845A]/10 text-[#25845A] dark:text-[#4ADE80]">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-[#26372D] dark:text-[#E5ECE7] mt-2">
            {formatINR(stats.totalValue)}
          </p>
          <p className="text-[11px] text-[#728078] dark:text-[#98A79D] mt-0.5 font-medium">
            {stats.totalCount} Purchase Bills Recorded
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[5px_5px_12px_rgba(175,188,177,0.45),-5px_-5px_12px_rgba(255,255,255,0.75)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.5),-3px_-3px_8px_rgba(255,255,255,0.03)] border border-[#D5DDD6]/60 dark:border-[#2C3E33]/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#728078] dark:text-[#98A79D]">Paid to Vendors</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {formatINR(stats.totalPaid)}
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 font-medium">
            Settled Supplier Payments
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[5px_5px_12px_rgba(175,188,177,0.45),-5px_-5px_12px_rgba(255,255,255,0.75)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.5),-3px_-3px_8px_rgba(255,255,255,0.03)] border border-[#D5DDD6]/60 dark:border-[#2C3E33]/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#728078] dark:text-[#98A79D]">Outstanding Payables</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {formatINR(stats.totalDue)}
          </p>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 font-medium">
            Pending Vendor Balances
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[5px_5px_12px_rgba(175,188,177,0.45),-5px_-5px_12px_rgba(255,255,255,0.75)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.5),-3px_-3px_8px_rgba(255,255,255,0.03)] border border-[#D5DDD6]/60 dark:border-[#2C3E33]/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#728078] dark:text-[#98A79D]">Stock Receiving Rate</span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-[#26372D] dark:text-[#E5ECE7] mt-2">
            {stats.receivedCount} / {stats.totalCount}
          </p>
          <p className="text-[11px] text-[#25845A] dark:text-[#4ADE80] mt-0.5 font-medium">
            Goods Fully Received & Inwarded
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[4px_4px_10px_rgba(175,188,177,0.45),-4px_-4px_10px_rgba(255,255,255,0.75)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.4),-2px_-2px_6px_rgba(255,255,255,0.03)] border border-[#D5DDD6]/60 dark:border-[#2C3E33]/50 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#728078] dark:text-[#98A79D]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by PO, vendor invoice, supplier, product..."
            className="w-full pl-9 pr-3 py-2 bg-[#E1E7E1] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5),inset_-1px_-1px_3px_rgba(255,255,255,0.02)] border border-[#D5DDD6]/60 dark:border-[#2C3E33]/50 rounded-xl text-xs text-[#26372D] dark:text-[#E5ECE7] placeholder-[#728078]/70 dark:placeholder-[#98A79D]/60 focus:ring-2 focus:ring-[#25845A] outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#728078] dark:text-[#98A79D]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-[#E1E7E1] dark:bg-[#151D18] shadow-[inset_1px_1px_3px_rgba(175,188,177,0.35),inset_-1px_-1px_3px_rgba(255,255,255,0.6)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.4)] border border-[#D5DDD6]/60 dark:border-[#2C3E33]/50 rounded-xl text-xs text-[#26372D] dark:text-[#E5ECE7] focus:ring-2 focus:ring-[#25845A] outline-none font-medium"
            >
              <option value="ALL">All Status</option>
              <option value="Received">Received</option>
              <option value="Partial">Partial</option>
              <option value="Ordered">Ordered</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#728078] dark:text-[#98A79D]">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-[#E1E7E1] dark:bg-[#151D18] shadow-[inset_1px_1px_3px_rgba(175,188,177,0.35),inset_-1px_-1px_3px_rgba(255,255,255,0.6)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.4)] border border-[#D5DDD6]/60 dark:border-[#2C3E33]/50 rounded-xl text-xs text-[#26372D] dark:text-[#E5ECE7] focus:ring-2 focus:ring-[#25845A] outline-none font-medium"
            >
              <option value="ALL">All Payment</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          {/* Distributor Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#728078] dark:text-[#98A79D]">Vendor:</span>
            <select
              value={distributorFilter}
              onChange={(e) => setDistributorFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#E1E7E1] dark:bg-[#151D18] shadow-[inset_1px_1px_3px_rgba(175,188,177,0.35),inset_-1px_-1px_3px_rgba(255,255,255,0.6)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.4)] border border-[#D5DDD6]/60 dark:border-[#2C3E33]/50 rounded-xl text-xs text-[#26372D] dark:text-[#E5ECE7] focus:ring-2 focus:ring-[#25845A] outline-none font-medium max-w-[160px] truncate"
            >
              <option value="ALL">All Vendors</option>
              {distributors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.companyName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Purchases Data Table */}
      <div className="bg-[#E9EEE9] dark:bg-[#1C2620] rounded-2xl border border-[#D5DDD6]/70 dark:border-[#2C3E33]/60 shadow-[6px_6px_14px_rgba(175,188,177,0.45),-6px_-6px_14px_rgba(255,255,255,0.7)] dark:shadow-[5px_5px_12px_rgba(0,0,0,0.5),-4px_-4px_10px_rgba(255,255,255,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#DEE5DE]/80 dark:bg-[#161F1A]/80 text-[#728078] dark:text-[#98A79D] border-b border-[#D5DDD6] dark:border-[#2C3E33] font-bold">
              <tr>
                <th className="px-4 py-3.5">PO & Invoice No</th>
                <th className="px-4 py-3.5">Distributor / Supplier</th>
                <th className="px-4 py-3.5">Equipment / Items</th>
                <th className="px-4 py-3.5 text-center">Inward Progress</th>
                <th className="px-4 py-3.5 text-right">Grand Total</th>
                <th className="px-4 py-3.5 text-center">Payment</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5DDD6]/50 dark:divide-[#2C3E33]/40 text-[#26372D] dark:text-[#E5ECE7]">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#728078] dark:text-[#98A79D]">
                    <ShoppingCart className="w-10 h-10 mx-auto text-[#728078]/40 dark:text-[#98A79D]/30 mb-2" />
                    <p className="font-bold">No purchase bills found</p>
                    <p className="text-[11px] mt-0.5">Click "+ New Purchase" to inward stock from distributors.</p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => {
                  const totalOrdered = p.items?.reduce((s, i) => s + (Number(i.orderedQuantity) || 0), 0) || 0;
                  const totalReceived = p.items?.reduce((s, i) => s + (Number(i.receivedQuantity) || 0), 0) || 0;
                  const percentReceived = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 100;

                  return (
                    <tr key={p.id} className="hover:bg-[#DEE5DE]/40 dark:hover:bg-[#222E26]/40 transition">
                      <td className="px-4 py-3">
                        <span className="font-bold text-[#26372D] dark:text-[#E5ECE7] block">{p.id}</span>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#728078] dark:text-[#98A79D] mt-0.5">
                          <span className="font-mono">{p.invoiceNumber}</span>
                          <span>•</span>
                          <span>{p.purchaseDate}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-bold text-[#26372D] dark:text-[#E5ECE7] block">
                          {p.distributorName}
                        </span>
                        <span className="text-[11px] text-[#728078] dark:text-[#98A79D] font-mono block">
                          {p.distributorGst || 'Unregistered'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="max-w-xs truncate font-medium text-[#26372D] dark:text-[#E5ECE7]">
                          {p.items?.map((item) => `${item.productName} (${item.receivedQuantity || item.orderedQuantity})`).join(', ')}
                        </div>
                        <span className="text-[10px] text-[#728078] dark:text-[#98A79D]">
                          {p.items?.length || 0} product line{p.items?.length !== 1 ? 's' : ''}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-[11px] font-bold text-[#26372D] dark:text-[#E5ECE7]">
                            {totalReceived} / {totalOrdered}
                          </span>
                          <div className="w-16 h-1.5 bg-[#D5DDD6] dark:bg-[#2C3E33] rounded-full overflow-hidden mt-1 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.15)]">
                            <div
                              className={`h-full rounded-full ${
                                percentReceived === 100
                                  ? 'bg-[#25845A]'
                                  : percentReceived > 0
                                  ? 'bg-blue-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${percentReceived}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span className="font-black text-[#26372D] dark:text-[#E5ECE7] block">
                          {formatINR(p.grandTotal)}
                        </span>
                        {p.dueAmount > 0 ? (
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">
                            Due: {formatINR(p.dueAmount)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                            Fully Settled
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.paymentStatus === 'Paid'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                              : p.paymentStatus === 'Partial'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                              : 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30'
                          }`}
                        >
                          {p.paymentStatus}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'Received'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                              : p.status === 'Partial'
                              ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                              : p.status === 'Ordered'
                              ? 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30'
                              : 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPurchase(p)}
                            title="View Purchase Detail"
                            className="p-1.5 rounded-lg text-[#728078] dark:text-[#98A79D] hover:text-[#25845A] dark:hover:text-[#4ADE80] bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[2px_2px_5px_rgba(175,188,177,0.4),-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.4)] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setPrintPurchase(p)}
                            title="Print Purchase Bill / GRN"
                            className="p-1.5 rounded-lg text-[#728078] dark:text-[#98A79D] hover:text-[#25845A] dark:hover:text-[#4ADE80] bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[2px_2px_5px_rgba(175,188,177,0.4),-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.4)] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] transition"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingPurchase(p);
                              setModalOpen(true);
                            }}
                            title="Edit Purchase"
                            className="p-1.5 rounded-lg text-[#728078] dark:text-[#98A79D] hover:text-amber-600 bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[2px_2px_5px_rgba(175,188,177,0.4),-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.4)] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            title="Delete Purchase"
                            className="p-1.5 rounded-lg text-[#728078] dark:text-[#98A79D] hover:text-red-600 bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[2px_2px_5px_rgba(175,188,177,0.4),-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.4)] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#26372D]/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#E9EEE9] dark:bg-[#1C2620] rounded-2xl p-6 border border-[#D5DDD6] dark:border-[#2C3E33] shadow-[10px_10px_25px_rgba(0,0,0,0.25)] space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold">Delete Purchase Bill?</h3>
            </div>
            <p className="text-xs text-[#26372D] dark:text-[#E5ECE7] leading-relaxed">
              Are you sure you want to delete this purchase bill? The received items will be deducted from your Inventory stock automatically.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl text-[#728078] dark:text-[#98A79D] hover:bg-[#DEE5DE] dark:hover:bg-[#2C3E33] transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition shadow-md shadow-red-600/20"
              >
                Confirm Delete & Revert Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Purchase Modal */}
      <PurchaseModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPurchase(null);
        }}
        initialData={editingPurchase}
      />

      {/* Detail Modal */}
      {selectedPurchase && (
        <PurchaseDetailModal
          purchase={selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
          onEdit={() => {
            const p = selectedPurchase;
            setSelectedPurchase(null);
            setEditingPurchase(p);
            setModalOpen(true);
          }}
        />
      )}

      {/* Print View Modal */}
      {printPurchase && (
        <PurchaseInvoicePrint
          purchase={printPurchase}
          companySettings={companySettings}
          onClose={() => setPrintPurchase(null)}
        />
      )}
    </div>
  );
};
