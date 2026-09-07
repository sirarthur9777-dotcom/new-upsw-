import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Plus,
  Search,
  Building2,
  Package,
  Calendar,
  AlertCircle,
  Download,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { useApp, formatINR } from '../../context/AppContext';
import { PurchaseReturn } from '../../types';
import { PurchaseReturnModal } from './PurchaseReturnModal';

export const PurchaseReturnView: React.FC = () => {
  const {
    purchaseReturns,
    deletePurchaseReturn,
    exportToCSV,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Approved' | 'Pending' | 'Refunded' | 'Replaced'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReturn, setEditingReturn] = useState<PurchaseReturn | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered list
  const filteredReturns = useMemo(() => {
    return (purchaseReturns || []).filter((r) => {
      const matchesSearch =
        (r.distributorName && r.distributorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.productName && r.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.debitNoteNumber && r.debitNoteNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.id && r.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.returnReason && r.returnReason.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [purchaseReturns, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = purchaseReturns.length;
    const totalReturnValue = purchaseReturns.reduce((sum, r) => sum + (Number(r.returnAmount) || 0), 0);
    const approvedCount = purchaseReturns.filter((r) => r.status === 'Approved').length;
    const pendingCount = purchaseReturns.filter((r) => r.status === 'Pending').length;

    return { totalCount, totalReturnValue, approvedCount, pendingCount };
  }, [purchaseReturns]);

  const handleExportCSV = () => {
    const rows = filteredReturns.map((r) => ({
      'Return ID': r.id,
      Date: r.returnDate,
      Distributor: r.distributorName,
      Product: r.productName,
      Quantity: r.quantity,
      'Unit Price (₹)': r.unitPrice,
      'Total Refund (₹)': r.returnAmount,
      Reason: r.returnReason,
      'Debit Note No': r.debitNoteNumber || '',
      Status: r.status,
      Notes: r.notes || '',
    }));
    exportToCSV(`Purchase_Returns_${new Date().toISOString().split('T')[0]}`, rows);
  };

  const handleDelete = async (id: string) => {
    await deletePurchaseReturn(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <RotateCcw className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <span>Purchase Returns & Debit Notes</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage goods return to vendors (RTV), damaged solar equipment, and supplier debit adjustments
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingReturn(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md shadow-rose-600/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Record Purchase Return</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Returns</span>
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <RotateCcw className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{stats.totalCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Recorded vendor return claims</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Return Value</span>
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {formatINR(stats.totalReturnValue)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Total debit note claims</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Approved & Deducted</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.approvedCount}
          </p>
          <p className="text-[11px] text-emerald-600/80 mt-0.5">Inventory auto-deducted</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Review</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {stats.pendingCount}
          </p>
          <p className="text-[11px] text-amber-600/80 mt-0.5">Awaiting vendor confirmation</p>
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search returns, product, vendor, reason..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Status:</span>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['ALL', 'Approved', 'Pending', 'Refunded', 'Replaced'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition ${
                  statusFilter === s
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5 font-bold">Return Date / ID</th>
                <th className="px-4 py-3.5 font-bold">Distributor</th>
                <th className="px-4 py-3.5 font-bold">Product Returned</th>
                <th className="px-4 py-3.5 font-bold text-center">Qty</th>
                <th className="px-4 py-3.5 font-bold text-right">Debit Value (₹)</th>
                <th className="px-4 py-3.5 font-bold">Reason</th>
                <th className="px-4 py-3.5 font-bold text-center">Status</th>
                <th className="px-4 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <RotateCcw className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-semibold">No purchase returns recorded</p>
                    <p className="text-[11px] mt-0.5">Click "+ Record Purchase Return" when goods need to be returned to vendor.</p>
                  </td>
                </tr>
              ) : (
                filteredReturns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 dark:text-white block">{r.id}</span>
                      <span className="text-[11px] text-slate-400">{r.returnDate}</span>
                      {r.debitNoteNumber && (
                        <span className="block font-mono text-[10px] text-slate-500">DN: {r.debitNoteNumber}</span>
                      )}
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {r.distributorName}
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 dark:text-white block">{r.productName}</span>
                    </td>

                    <td className="px-4 py-3 text-center font-bold text-rose-600 dark:text-rose-400">
                      -{r.quantity}
                    </td>

                    <td className="px-4 py-3 text-right font-black text-slate-900 dark:text-white">
                      {formatINR(r.returnAmount)}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {r.returnReason}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : r.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingReturn(r);
                            setModalOpen(true);
                          }}
                          title="Edit Return"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(r.id)}
                          title="Delete Return"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold">Delete Purchase Return?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to delete this purchase return entry?
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
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition shadow-md shadow-rose-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <PurchaseReturnModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingReturn(null);
        }}
        initialData={editingReturn}
      />
    </div>
  );
};
