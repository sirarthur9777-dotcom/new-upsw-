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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Product Purchases & Stock Inward (GRN)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Procurement management directly linked with single-source inventory stock and vendor billing
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveTab('distributors')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>Distributors ({distributors.length})</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingPurchase(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ New Purchase</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Purchases Value</span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {formatINR(stats.totalValue)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
            {stats.totalCount} Purchase Bills Recorded
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Paid to Vendors</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {formatINR(stats.totalPaid)}
          </p>
          <p className="text-[11px] text-emerald-600/80 mt-0.5 font-medium">
            Settled Supplier Payments
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Outstanding Payables</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {formatINR(stats.totalDue)}
          </p>
          <p className="text-[11px] text-amber-600/80 mt-0.5 font-medium">
            Pending Vendor Balances
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Stock Receiving Rate</span>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {stats.receivedCount} / {stats.totalCount}
          </p>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5 font-medium">
            Goods Fully Received & Inwarded
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by PO, vendor invoice, supplier, product..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
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
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">All Payment</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          {/* Distributor Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Vendor:</span>
            <select
              value={distributorFilter}
              onChange={(e) => setDistributorFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none max-w-[160px] truncate"
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-semibold">No purchase bills found</p>
                    <p className="text-[11px] mt-0.5">Click "+ New Purchase" to inward stock from distributors.</p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => {
                  const totalOrdered = p.items?.reduce((s, i) => s + (Number(i.orderedQuantity) || 0), 0) || 0;
                  const totalReceived = p.items?.reduce((s, i) => s + (Number(i.receivedQuantity) || 0), 0) || 0;
                  const percentReceived = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 100;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 dark:text-white block">{p.id}</span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="font-mono">{p.invoiceNumber}</span>
                          <span>•</span>
                          <span>{p.purchaseDate}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {p.distributorName}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono block">
                          {p.distributorGst || 'Unregistered'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="max-w-xs truncate font-medium text-slate-800 dark:text-slate-200">
                          {p.items?.map((item) => `${item.productName} (${item.receivedQuantity || item.orderedQuantity})`).join(', ')}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {p.items?.length || 0} product line{p.items?.length !== 1 ? 's' : ''}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                            {totalReceived} / {totalOrdered}
                          </span>
                          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full ${
                                percentReceived === 100
                                  ? 'bg-emerald-500'
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
                        <span className="font-black text-slate-900 dark:text-white block">
                          {formatINR(p.grandTotal)}
                        </span>
                        {p.dueAmount > 0 ? (
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">
                            Due: {formatINR(p.dueAmount)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                            Fully Settled
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.paymentStatus === 'Paid'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : p.paymentStatus === 'Partial'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                          }`}
                        >
                          {p.paymentStatus}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'Received'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : p.status === 'Partial'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : p.status === 'Ordered'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                              : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedPurchase(p)}
                            title="View Purchase Detail"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setPrintPurchase(p)}
                            title="Print Purchase Bill / GRN"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingPurchase(p);
                              setModalOpen(true);
                            }}
                            title="Edit Purchase"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            title="Delete Purchase"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold">Delete Purchase Bill?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete this purchase bill? The received items will be deducted from your Inventory stock automatically.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
