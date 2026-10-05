import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  ArrowRight,
  Printer,
  X,
  Trash2,
  Edit2,
  Eye,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  Layers,
  Copy,
} from 'lucide-react';
import { useApp, formatINR } from '../../context/AppContext';
import { Quotation, QuotationItem, SystemType, ProjectType } from '../../types';

export const QuotationView: React.FC = () => {
  const {
    quotations,
    customers,
    products,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    convertQuotationToInvoice,
    triggerPrint,
    exportToCSV,
  } = useApp();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // Form State for Add / Edit
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [capacityKW, setCapacityKW] = useState(10);
  const [systemType, setSystemType] = useState<SystemType>('On Grid');
  const [projectType, setProjectType] = useState<ProjectType>('Residential');
  const [validityDays, setValidityDays] = useState(15);
  const [status, setStatus] = useState<'Draft' | 'Sent' | 'Approved' | 'Converted'>('Sent');
  const [terms, setTerms] = useState(
    '1. 50% Advance with PO. 2. 40% on material delivery. 3. 10% post net metering commissioning.'
  );

  const [formItems, setFormItems] = useState<Omit<QuotationItem, 'id'>[]>([
    { description: 'Waaree 540W Mono PERC Solar Panels', qty: 20, unit: 'Nos', rate: 12000, amount: 240000, serialNumbers: '' },
    { description: 'Growatt 10kW On-Grid Inverter', qty: 1, unit: 'Set', rate: 75000, amount: 75000, serialNumbers: '' },
    { description: 'HDG High Structure & Cable Kit', qty: 1, unit: 'Lot', rate: 45000, amount: 45000, serialNumbers: '' },
  ]);

  // Realtime Totals Calculation
  const estimatedCost = formItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const taxAmount = Math.round(estimatedCost * 0.12);
  const grandTotal = estimatedCost + taxAmount;

  const handleAddItemRow = (product?: (typeof products)[0]) => {
    if (product) {
      const rate = product.salePrice || Math.round(product.purchasePrice * (1 + (product.margin ?? 10) / 100));
      setFormItems([
        ...formItems,
        {
          description: `${product.productName || product.name} (${product.make || 'UBSW'})`,
          qty: 1,
          unit: product.unit || 'Nos',
          rate: rate,
          amount: rate,
          serialNumbers: '',
        },
      ]);
    } else {
      setFormItems([
        ...formItems,
        { description: '', qty: 1, unit: 'Nos', rate: 0, amount: 0, serialNumbers: '' },
      ]);
    }
  };

  const handleSelectProductForItem = (index: number, productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;
    const rate = p.salePrice || Math.round(p.purchasePrice * (1 + (p.margin ?? 10) / 100));
    const qty = formItems[index]?.qty || 1;
    const updated = [...formItems];
    updated[index] = {
      ...updated[index],
      description: `${p.productName || p.name} (${p.make || 'UBSW'})`,
      name: p.productName || p.name,
      brand: p.make || p.brand,
      model: p.model,
      hsnCode: p.hsnCode || '85044090',
      unit: p.unit || 'Nos',
      rate: rate,
      amount: Math.round(qty * rate),
      taxRate: p.gstPercent || 12,
    };
    setFormItems(updated);
  };

  const handleRemoveItemRow = (index: number) => {
    if (formItems.length === 1) return;
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof Omit<QuotationItem, 'id'>, value: any) => {
    const updated = [...formItems];
    const current = { ...updated[index], [field]: value };

    // If typing description, check if it matches a catalog product name exactly
    if (field === 'description') {
      const match = products.find(
        (p) =>
          p.productName?.toLowerCase() === String(value).toLowerCase() ||
          `${p.productName} (${p.make})`.toLowerCase() === String(value).toLowerCase()
      );
      if (match) {
        current.rate = match.salePrice || Math.round(match.purchasePrice * (1 + (match.margin ?? 10) / 100));
        current.unit = match.unit || current.unit || 'Nos';
      }
    }

    if (field === 'qty' || field === 'rate' || field === 'description') {
      const q = field === 'qty' ? Number(value) : current.qty;
      const r = field === 'rate' ? Number(value) : current.rate;
      current.amount = Math.round((Number(q) || 0) * (Number(r) || 0));
    }

    updated[index] = current;
    setFormItems(updated);
  };

  // Open Create Modal
  const openCreateModal = () => {
    if (customers.length > 0) setSelectedCustomerId(customers[0].id);
    setCapacityKW(10);
    setSystemType('On Grid');
    setProjectType('Residential');
    setValidityDays(15);
    setStatus('Sent');
    setTerms('1. 50% Advance with PO. 2. 40% on material delivery. 3. 10% post net metering commissioning.');
    setFormItems([
      { description: 'Waaree 540W Mono PERC Solar Panels', qty: 20, unit: 'Nos', rate: 12000, amount: 240000, serialNumbers: '' },
      { description: 'Growatt 10kW On-Grid Inverter', qty: 1, unit: 'Set', rate: 75000, amount: 75000, serialNumbers: '' },
      { description: 'HDG High Structure & Cable Kit', qty: 1, unit: 'Lot', rate: 45000, amount: 45000, serialNumbers: '' },
    ]);
    setAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (q: Quotation) => {
    setSelectedQuotation(q);
    setSelectedCustomerId(q.customerId);
    setCapacityKW(q.capacityKW);
    setSystemType(q.systemType);
    setProjectType(q.projectType);
    setValidityDays(q.validityDays || 15);
    setStatus(q.status);
    setTerms(q.termsAndConditions || '');
    setFormItems(q.items.map((it) => ({
      description: it.description,
      qty: it.qty,
      unit: it.unit,
      rate: it.rate,
      amount: it.amount,
      serialNumbers: it.serialNumbers || '',
      name: it.name,
      brand: it.brand,
      model: it.model,
      hsnCode: it.hsnCode,
      taxRate: it.taxRate,
    })));
    setEditModalOpen(true);
  };

  // Create Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustomerId);
    if (!cust) {
      showToast('Please select a valid customer', 'error');
      return;
    }

    const newQ = addQuotation({
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email || 'customer@gmail.com',
      customerMobile: cust.mobile,
      customerAddress: (cust as any).address || (cust as any).village || 'Jaunpur, Uttar Pradesh',
      customerState: (cust as any).state || 'Uttar Pradesh',
      customerStateCode: (cust as any).stateCode || '09',
      customerGstin: (cust as any).gstNumber || '',
      shippingName: cust.name,
      shippingAddress: (cust as any).address || (cust as any).village || 'Jaunpur, Uttar Pradesh',
      shippingMobile: cust.mobile,
      shippingState: (cust as any).state || 'Uttar Pradesh',
      shippingStateCode: (cust as any).stateCode || '09',
      shippingGstin: (cust as any).gstNumber || '',
      placeOfSupply: '09-Uttar Pradesh',
      reverseCharge: 'No',
      delivery: 'By Road (Direct Dispatch)',
      paymentTerms: '50% Advance, 40% on Delivery, 10% on Commissioning',
      installation: 'Included (as per scope)',
      warranty: 'As per manufacturer / OEM guidelines',
      projectType,
      systemType,
      capacityKW,
      items: formItems.map((it, idx) => ({ id: String(idx + 1), ...it })),
      estimatedCost,
      taxAmount,
      grandTotal,
      validityDays,
      validUntil: new Date(Date.now() + validityDays * 86400000).toISOString().split('T')[0],
      termsAndConditions: terms,
      status,
    });

    setAddModalOpen(false);
    showToast(`Quotation ${newQ.quoteNumber} created successfully!`, 'success');
  };

  // Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuotation) return;

    const cust = customers.find((c) => c.id === selectedCustomerId) || {
      name: selectedQuotation.customerName,
      mobile: selectedQuotation.customerMobile,
      email: selectedQuotation.customerEmail,
    };

    updateQuotation(selectedQuotation.id, {
      customerId: selectedCustomerId,
      customerName: cust.name,
      customerMobile: cust.mobile,
      customerEmail: cust.email || selectedQuotation.customerEmail,
      customerAddress: (cust as any).address || selectedQuotation.customerAddress || 'Jaunpur, Uttar Pradesh',
      customerState: (cust as any).state || selectedQuotation.customerState || 'Uttar Pradesh',
      customerStateCode: (cust as any).stateCode || selectedQuotation.customerStateCode || '09',
      customerGstin: (cust as any).gstNumber || selectedQuotation.customerGstin || '',
      shippingName: cust.name || selectedQuotation.shippingName,
      shippingAddress: (cust as any).address || selectedQuotation.shippingAddress || 'Jaunpur, Uttar Pradesh',
      shippingMobile: cust.mobile || selectedQuotation.shippingMobile,
      shippingState: (cust as any).state || selectedQuotation.shippingState || 'Uttar Pradesh',
      shippingStateCode: (cust as any).stateCode || selectedQuotation.shippingStateCode || '09',
      shippingGstin: (cust as any).gstNumber || selectedQuotation.shippingGstin || '',
      projectType,
      systemType,
      capacityKW,
      items: formItems.map((it, idx) => ({ id: String(idx + 1), ...it })),
      estimatedCost,
      taxAmount,
      grandTotal,
      validityDays,
      validUntil: new Date(Date.now() + validityDays * 86400000).toISOString().split('T')[0],
      termsAndConditions: terms,
      status,
    });

    setEditModalOpen(false);
    showToast(`Quotation ${selectedQuotation.quoteNumber} updated successfully!`, 'success');
  };

  // Delete Confirm
  const handleDeleteConfirm = () => {
    if (!selectedQuotation) return;
    deleteQuotation(selectedQuotation.id);
    setDeleteModalOpen(false);
    showToast(`Quotation ${selectedQuotation.quoteNumber} deleted successfully.`, 'info');
  };

  // Convert Handler
  const handleConvert = (q: Quotation) => {
    const inv = convertQuotationToInvoice(q.id);
    if (inv) {
      showToast(`Quotation converted to Invoice ${inv.invoiceNumber}!`, 'success');
    } else {
      showToast('Failed to convert quotation.', 'error');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const exportRows = quotations.map((q) => ({
      'Quotation ID': q.quoteNumber,
      'Date': q.createdAt,
      'Customer Name': q.customerName,
      'Contact Number': q.customerMobile,
      'Capacity (KW)': `${q.capacityKW} KW`,
      'System Type': q.systemType,
      'Items Count': q.items.length,
      'Estimated Cost (₹)': q.estimatedCost,
      'Tax Amount (₹)': q.taxAmount,
      'Grand Total (₹)': q.grandTotal,
      'Status': q.status,
      'Valid Until': q.validUntil,
    }));
    exportToCSV('Solar_Quotations_Report', exportRows);
    showToast('Exported quotations to CSV', 'success');
  };

  // Filtering
  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerMobile.includes(searchTerm) ||
      q.items.some((i) => i.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination Math
  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage) || 1;
  const paginatedQuotations = filteredQuotations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary Metrics
  const totalValuation = quotations.reduce((acc, q) => acc + q.grandTotal, 0);
  const convertedCount = quotations.filter((q) => q.status === 'Converted').length;
  const pendingCount = quotations.filter((q) => q.status === 'Sent' || q.status === 'Draft').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border font-medium text-xs text-white animate-in slide-in-from-bottom-5 ${
            toastType === 'success'
              ? 'bg-emerald-600 border-emerald-500'
              : toastType === 'error'
              ? 'bg-red-600 border-red-500'
              : 'bg-slate-800 border-slate-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Solar Quotation Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate, customize, track, and convert solar system estimates into official invoices
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Quotation</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Quotations</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{quotations.length}</h3>
            <FileSpreadsheet className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-[10px] text-slate-400">Lifetime quotes generated</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending / Sent</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-amber-500">{pendingCount}</h3>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-[10px] text-slate-400">Awaiting customer approval</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Converted to Invoice</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-emerald-500">{convertedCount}</h3>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-[10px] text-slate-400">Successfully closed orders</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Quoted Value</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">₹{totalValuation.toLocaleString()}</h3>
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-[10px] text-slate-400">Combined estimates value</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search Quote ID, Customer Name, Mobile..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['ALL', 'Draft', 'Sent', 'Approved', 'Converted'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Quotation ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Contact Number</th>
                <th className="p-4">Items / Description</th>
                <th className="p-4 text-center">System / Qty</th>
                <th className="p-4 text-right">Total Amount</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginatedQuotations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    No quotations found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedQuotations.map((q) => {
                  const firstItem = q.items[0]?.description || 'Solar System Package';
                  const extraItemsCount = q.items.length - 1;

                  return (
                    <tr
                      key={q.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="p-4 font-mono font-bold text-amber-500">{q.quoteNumber}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{q.createdAt}</td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {q.customerName}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">
                        {q.customerMobile}
                      </td>
                      <td className="p-4 max-w-xs truncate text-slate-600 dark:text-slate-300">
                        <span>{firstItem}</span>
                        {extraItemsCount > 0 && (
                          <span className="ml-1 text-[10px] text-amber-500 font-semibold">
                            +{extraItemsCount} more
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                          {q.capacityKW} KW ({q.systemType})
                        </span>
                      </td>
                      <td className="p-4 text-right font-extrabold text-slate-900 dark:text-white whitespace-nowrap text-sm">
                        ₹{q.grandTotal.toLocaleString()}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full ${
                            q.status === 'Converted'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : q.status === 'Approved'
                              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                              : q.status === 'Sent'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => triggerPrint('quotation', q)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Preview / Print A4 Quotation"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              const { id, quoteNumber, createdAt, ...rest } = q;
                              const newQ = addQuotation({
                                ...rest,
                                status: 'Draft',
                              });
                              showToast(`Quotation duplicated as ${newQ.quoteNumber}`, 'success');
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Duplicate Quotation"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => triggerPrint('quotation', q)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Print Quotation"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openEditModal(q)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Edit Quotation"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {q.status !== 'Converted' && (
                            <button
                              onClick={() => handleConvert(q)}
                              className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 font-bold text-[11px] transition flex items-center gap-1"
                              title="Convert to Invoice"
                            >
                              <span>Convert</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedQuotation(q);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Delete Quotation"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredQuotations.length)} of {filteredQuotations.length}{' '}
              quotations
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-900 dark:text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewModalOpen && selectedQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-amber-500">{selectedQuotation.quoteNumber}</span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Quotation Details - {selectedQuotation.customerName}
                </h3>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div>
                  <p className="text-slate-400">Customer Mobile:</p>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedQuotation.customerMobile}</p>
                  <p className="text-slate-400 mt-2">Email:</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedQuotation.customerEmail}</p>
                </div>
                <div>
                  <p className="text-slate-400">Plant System:</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {selectedQuotation.capacityKW} KW {selectedQuotation.systemType} ({selectedQuotation.projectType})
                  </p>
                  <p className="text-slate-400 mt-2">Valid Until:</p>
                  <p className="font-semibold text-amber-500">{selectedQuotation.validUntil}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Line Items Breakdown</h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 font-semibold border-b">
                        <th className="p-3">Description</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Rate (₹)</th>
                        <th className="p-3 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedQuotation.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{it.description}</td>
                          <td className="p-3 text-center">{it.qty} {it.unit}</td>
                          <td className="p-3 text-right">₹{it.rate.toLocaleString()}</td>
                          <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                            ₹{it.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Summary Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal Material Cost:</span>
                  <span>₹{selectedQuotation.estimatedCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST Tax (12%):</span>
                  <span>₹{selectedQuotation.taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-extrabold text-slate-900 dark:text-white text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Grand Total:</span>
                  <span className="text-amber-500 text-base">₹{selectedQuotation.grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {selectedQuotation.termsAndConditions && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Terms & Conditions</h4>
                  <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedQuotation.termsAndConditions}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <button
                  onClick={() => triggerPrint('quotation', selectedQuotation)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print A4 Quote</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setViewModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    Close
                  </button>
                  {selectedQuotation.status !== 'Converted' && (
                    <button
                      type="button"
                      onClick={() => {
                        handleConvert(selectedQuotation);
                        setViewModalOpen(false);
                      }}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5"
                    >
                      <span>Convert to Invoice</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {(addModalOpen || editModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {addModalOpen ? 'Create Solar System Quotation' : `Edit Quotation ${selectedQuotation?.quoteNumber}`}
              </h3>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setEditModalOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={addModalOpen ? handleCreateSubmit : handleEditSubmit}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Select Customer *
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.mobile}) - {c.projectType}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Plant Capacity (KW)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={capacityKW}
                    onChange={(e) => setCapacityKW(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold text-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">System Type</label>
                  <select
                    value={systemType}
                    onChange={(e) => setSystemType(e.target.value as SystemType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                  >
                    <option value="On Grid">On Grid</option>
                    <option value="Off Grid">Off Grid</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    value={validityDays}
                    onChange={(e) => setValidityDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Quotation Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Approved">Approved</option>
                    <option value="Converted">Converted</option>
                  </select>
                </div>
              </div>

              {/* Line Items Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white">Line Items & Materials</h4>
                  <button
                    type="button"
                    onClick={() => handleAddItemRow()}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {/* Datalist for autocomplete */}
                <datalist id="quotation-inventory-products">
                  {products.map((p) => (
                    <option
                      key={p.id}
                      value={`${p.productName || p.name} (${p.make || 'UBSW'})`}
                    >
                      Rate: ₹{p.salePrice} | Unit: {p.unit || 'Nos'} | Stock: {p.stock}
                    </option>
                  ))}
                </datalist>

                <div className="space-y-2.5">
                  {formItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5 shadow-sm"
                    >
                      {/* SKU Quick Select Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <Layers className="w-3 h-3 text-amber-500" />
                            <span>Select Product:</span>
                          </span>
                          <select
                            className="flex-1 max-w-sm px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                            onChange={(e) => handleSelectProductForItem(idx, e.target.value)}
                            defaultValue=""
                          >
                            <option value="" disabled>
                              -- Choose Inventory Item (Auto-fills Rate) --
                            </option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                [{p.category}] {p.productName || p.name} ({p.make}) • Sale: ₹{p.salePrice?.toLocaleString()} (Stock: {p.stock})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">Unit:</span>
                          <input
                            type="text"
                            placeholder="Unit"
                            value={item.unit || 'Nos'}
                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                            className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold text-center"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                            title="Delete Item Row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Line Item Inputs */}
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-12 sm:col-span-5">
                          <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                            Item Description / Model *
                          </label>
                          <input
                            type="text"
                            required
                            list="quotation-inventory-products"
                            placeholder="Type to search or enter description"
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="col-span-4 sm:col-span-2">
                          <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min={1}
                            required
                            placeholder="Qty"
                            value={item.qty}
                            onChange={(e) => handleItemChange(idx, 'qty', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold text-center focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="col-span-4 sm:col-span-2">
                          <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                            Rate (₹) <span className="text-amber-500 font-normal">(Auto)</span>
                          </label>
                          <input
                            type="number"
                            required
                            placeholder="Rate (₹)"
                            value={item.rate}
                            onChange={(e) => handleItemChange(idx, 'rate', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 text-xs font-bold text-right focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="col-span-4 sm:col-span-3 text-right">
                          <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                            Line Amount
                          </label>
                          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 font-extrabold text-slate-900 dark:text-white text-xs text-right">
                            ₹{item.amount?.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Product Serial Number(s) - same UX as Create Modern Tax Invoice */}
                      <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-700/60">
                        <div className="flex items-center justify-between mb-1.5 gap-2">
                          <label className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                            SERIAL NUMBER(S)
                          </label>
                          <span className="text-[11px] text-slate-500 text-right">
                            Single or multiple (comma / line break separated)
                          </span>
                        </div>
                        <textarea
                          rows={1}
                          value={item.serialNumbers || ''}
                          onChange={(e) => handleItemChange(idx, 'serialNumbers', e.target.value)}
                          placeholder="e.g. SN001234, SN001235, SN001236"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:border-amber-500 min-h-[38px] resize-y shadow-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automatic Calculation Summary */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
                <div className="flex justify-between font-medium text-slate-500">
                  <span>Subtotal Material:</span>
                  <span>₹{estimatedCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-500">
                  <span>Estimated Tax (12% GST):</span>
                  <span>₹{taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-extrabold text-amber-500 text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Calculated Grand Total:</span>
                  <span className="text-base">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  rows={2}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setEditModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                >
                  {addModalOpen ? 'Save Quotation' : 'Update Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DELETE DIALOG */}
      {deleteModalOpen && selectedQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-3 rounded-full bg-red-500/10">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Delete Quotation</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to delete quotation <strong className="font-mono text-amber-500">{selectedQuotation.quoteNumber}</strong> for customer <strong className="text-slate-900 dark:text-white">{selectedQuotation.customerName}</strong>?
            </p>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
