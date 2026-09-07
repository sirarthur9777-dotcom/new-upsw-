import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  Edit2,
  Trash2,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { useApp, formatINR } from '../../context/AppContext';
import { Distributor, Purchase } from '../../types';
import { DistributorModal } from './DistributorModal';

export const DistributorView: React.FC = () => {
  const {
    distributors,
    purchases,
    addDistributor,
    updateDistributor,
    deleteDistributor,
    exportToCSV,
    setActiveTab,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Inactive'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDistributor, setEditingDistributor] = useState<Distributor | null>(null);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered Distributors
  const filteredDistributors = useMemo(() => {
    return (distributors || []).filter((d) => {
      const matchesSearch =
        d.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.contactPerson && d.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.gstNumber && d.gstNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.city && d.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.mobile && d.mobile.includes(searchTerm));

      const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [distributors, searchTerm, statusFilter]);

  // Quick KPI summary
  const stats = useMemo(() => {
    const totalCount = distributors.length;
    const activeCount = distributors.filter((d) => d.status === 'Active').length;
    const totalProcured = distributors.reduce((sum, d) => sum + (Number(d.totalPurchases) || 0), 0);
    const totalPayable = distributors.reduce((sum, d) => sum + (Number(d.outstandingAmount) || 0), 0);

    return { totalCount, activeCount, totalProcured, totalPayable };
  }, [distributors]);

  const handleExportCSV = () => {
    const rows = filteredDistributors.map((d) => ({
      ID: d.id,
      'Company Name': d.companyName,
      'Contact Person': d.contactPerson || '',
      Mobile: d.mobile,
      Email: d.email || '',
      GSTIN: d.gstNumber || '',
      PAN: d.panNumber || '',
      City: d.city || '',
      State: d.state || '',
      'Payment Terms': d.paymentTerms || '',
      'Total Purchases (₹)': d.totalPurchases || 0,
      'Outstanding Balance (₹)': d.outstandingAmount || 0,
      Status: d.status,
    }));
    exportToCSV(`Distributors_List_${new Date().toISOString().split('T')[0]}`, rows);
  };

  const handleSaveDistributor = async (data: Omit<Distributor, 'id' | 'createdAt'>) => {
    if (editingDistributor) {
      await updateDistributor(editingDistributor.id, data);
    } else {
      await addDistributor(data);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDistributor(id);
    setDeleteConfirmId(null);
  };

  // Get purchase history for selected distributor
  const distributorPurchases = useMemo(() => {
    if (!selectedDistributor) return [];
    return (purchases || []).filter((p) => p.distributorId === selectedDistributor.id);
  }, [purchases, selectedDistributor]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Distributors & Suppliers</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage solar equipment manufacturers, authorized dealers, and vendor ledgers
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
              setEditingDistributor(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Distributor</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Vendors</span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{stats.totalCount}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
            {stats.activeCount} Active Vendors
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Procured</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {formatINR(stats.totalProcured)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Lifetime solar purchases
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Payables Due</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {formatINR(stats.totalPayable)}
          </p>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5 font-medium">
            Outstanding vendor balances
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Quick Action</span>
            <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">Create Purchase Bill</p>
          </div>
          <button
            onClick={() => setActiveTab('purchases')}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 text-xs font-bold transition group"
          >
            <span>Go to Purchases</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by vendor, GSTIN, city, phone..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status:</span>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['ALL', 'Active', 'Inactive'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  statusFilter === s
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Distributors Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5 font-bold">Distributor & Contact</th>
                <th className="px-4 py-3.5 font-bold">GSTIN / City</th>
                <th className="px-4 py-3.5 font-bold">Payment Terms</th>
                <th className="px-4 py-3.5 font-bold text-right">Total Purchases</th>
                <th className="px-4 py-3.5 font-bold text-right">Outstanding Due</th>
                <th className="px-4 py-3.5 font-bold text-center">Status</th>
                <th className="px-4 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              {filteredDistributors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-semibold">No distributors found</p>
                    <p className="text-[11px] mt-0.5">Click "+ Add Distributor" to register your first supplier.</p>
                  </td>
                </tr>
              ) : (
                filteredDistributors.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {d.companyName}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {d.contactPerson && <span>{d.contactPerson}</span>}
                          {d.contactPerson && d.mobile && <span>•</span>}
                          {d.mobile && (
                            <a
                              href={`tel:${d.mobile}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{d.mobile}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div>
                        {d.gstNumber ? (
                          <span className="font-mono text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                            {d.gstNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Unregistered</span>
                        )}
                        <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {d.city || 'Jaunpur'}, {d.state || 'UP'}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {d.paymentTerms || 'Net 30'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                      {formatINR(d.totalPurchases || 0)}
                    </td>

                    <td className="px-4 py-3 text-right font-bold">
                      {(d.outstandingAmount || 0) > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          {formatINR(d.outstandingAmount || 0)}
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">₹0.00</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                        }`}
                      >
                        {d.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{d.status}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedDistributor(d)}
                          title="View Ledger & Purchases"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingDistributor(d);
                            setModalOpen(true);
                          }}
                          title="Edit Distributor"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(d.id)}
                          title="Delete Distributor"
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
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold">Delete Distributor?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to remove this distributor profile? Existing purchase order history will remain preserved in the ERP.
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
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Distributor Ledger & Detail Modal */}
      {selectedDistributor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedDistributor.companyName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Vendor Ledger & Purchase Order Procurement History
                </p>
              </div>
              <button
                onClick={() => setSelectedDistributor(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Profile Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block">Contact Details</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedDistributor.contactPerson || 'N/A'}</p>
                  <p className="text-slate-600 dark:text-slate-300">{selectedDistributor.mobile}</p>
                  {selectedDistributor.email && <p className="text-slate-500">{selectedDistributor.email}</p>}
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block">Tax & Registration</span>
                  <p className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                    GSTIN: {selectedDistributor.gstNumber || 'Unregistered'}
                  </p>
                  <p className="font-mono text-slate-500">PAN: {selectedDistributor.panNumber || 'N/A'}</p>
                  <p className="text-slate-500">Terms: {selectedDistributor.paymentTerms || 'Net 30'}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block">Bank Account</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedDistributor.bankName || 'N/A'}</p>
                  <p className="font-mono text-slate-500">A/C: {selectedDistributor.accountNumber || 'N/A'}</p>
                  <p className="font-mono text-slate-500">IFSC: {selectedDistributor.ifscCode || 'N/A'}</p>
                </div>
              </div>

              {/* Financial Balance Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Total Lifetime Purchases</span>
                  <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                    {formatINR(selectedDistributor.totalPurchases || 0)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase">Current Payable Balance</span>
                  <p className="text-xl font-black text-amber-700 dark:text-amber-300 mt-1">
                    {formatINR(selectedDistributor.outstandingAmount || 0)}
                  </p>
                </div>
              </div>

              {/* Associated Purchase Orders Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Procurement Orders & Invoices ({distributorPurchases.length})
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
                      <tr>
                        <th className="p-2.5 font-semibold">Date / PO No</th>
                        <th className="p-2.5 font-semibold">Invoice No</th>
                        <th className="p-2.5 font-semibold">Items</th>
                        <th className="p-2.5 font-semibold text-right">Amount</th>
                        <th className="p-2.5 font-semibold text-right">Due</th>
                        <th className="p-2.5 font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {distributorPurchases.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-slate-400">
                            No purchases recorded from this distributor yet.
                          </td>
                        </tr>
                      ) : (
                        distributorPurchases.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-2.5">
                              <span className="font-semibold text-slate-900 dark:text-white block">{p.id}</span>
                              <span className="text-[10px] text-slate-400">{p.purchaseDate}</span>
                            </td>
                            <td className="p-2.5 font-mono text-[11px]">{p.invoiceNumber || '-'}</td>
                            <td className="p-2.5">{p.items?.length || 0} Products</td>
                            <td className="p-2.5 text-right font-bold">{formatINR(p.grandTotal)}</td>
                            <td className="p-2.5 text-right font-semibold text-amber-600 dark:text-amber-400">
                              {formatINR(p.dueAmount || 0)}
                            </td>
                            <td className="p-2.5 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-800/60">
              <button
                onClick={() => setSelectedDistributor(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <DistributorModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingDistributor(null);
        }}
        onSave={handleSaveDistributor}
        initialData={editingDistributor}
      />
    </div>
  );
};
