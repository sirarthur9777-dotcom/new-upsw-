import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ShoppingCart,
  Plus,
  Trash2,
  Building2,
  Calendar,
  CreditCard,
  Truck,
  FileText,
  AlertCircle,
  CheckCircle2,
  Package,
  ArrowRight,
  UserPlus,
  Percent,
  Hash,
  DollarSign
} from 'lucide-react';
import { useApp, formatINR } from '../../context/AppContext';
import { Purchase, PurchaseItem, Distributor, Product } from '../../types';
import { DistributorModal } from './DistributorModal';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Purchase | null;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const {
    products,
    distributors,
    companySettings,
    addPurchase,
    updatePurchase,
    addDistributor,
  } = useApp();

  // Distributor selection
  const [distributorId, setDistributorId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');

  // Items
  const [items, setItems] = useState<PurchaseItem[]>([]);

  // Charges & Shipping
  const [shippingCharges, setShippingCharges] = useState<number>(0);
  const [roundOff, setRoundOff] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [waybillNumber, setWaybillNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [dispatchLocation, setDispatchLocation] = useState('');

  // Payment
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Partial' | 'Unpaid'>('Unpaid');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<
    'Cash' | 'Bank Transfer' | 'Cheque' | 'UPI' | 'RTGS' | 'Credit'
  >('Bank Transfer');
  const [paymentReference, setPaymentReference] = useState('');

  // Receiving Status
  const [status, setStatus] = useState<'Ordered' | 'Partial' | 'Received' | 'Pending' | 'Cancelled'>('Received');

  // Sub-modal for creating quick distributor
  const [distributorModalOpen, setDistributorModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected distributor object
  const selectedDistributor = useMemo(() => {
    return distributors.find((d) => d.id === distributorId) || null;
  }, [distributors, distributorId]);

  // Is intra-state tax (CGST+SGST) or inter-state (IGST)?
  const isIntraState = useMemo(() => {
    if (!selectedDistributor) return true;
    const companyState = (companySettings.state || 'Uttar Pradesh').trim().toLowerCase();
    const vendorState = (selectedDistributor.state || 'Uttar Pradesh').trim().toLowerCase();
    return companyState === vendorState;
  }, [companySettings.state, selectedDistributor]);

  // Reset or initialize on open
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setDistributorId(initialData.distributorId || '');
      setInvoiceNumber(initialData.invoiceNumber || '');
      setPurchaseDate(initialData.purchaseDate || new Date().toISOString().split('T')[0]);
      setDueDate(initialData.dueDate || '');
      setPaymentTerms(initialData.paymentTerms || 'Net 30');
      setItems(initialData.items ? JSON.parse(JSON.stringify(initialData.items)) : []);
      setShippingCharges(Number(initialData.shippingCharges) || 0);
      setRoundOff(Number(initialData.roundOff) || 0);
      setNotes(initialData.notes || '');
      setWaybillNumber(initialData.waybillNumber || '');
      setVehicleNumber(initialData.vehicleNumber || '');
      setDispatchLocation(initialData.dispatchLocation || '');
      setPaymentStatus(initialData.paymentStatus || 'Unpaid');
      setPaidAmount(Number(initialData.paidAmount) || 0);
      setPaymentMode(initialData.paymentMode || 'Bank Transfer');
      setPaymentReference(initialData.paymentReference || '');
      setStatus(initialData.status || 'Received');
    } else {
      setDistributorId('');
      setInvoiceNumber(`INV-PUR-${Date.now().toString().slice(-5)}`);
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setDueDate('');
      setPaymentTerms('Net 30');
      setShippingCharges(0);
      setRoundOff(0);
      setNotes('');
      setWaybillNumber('');
      setVehicleNumber('');
      setDispatchLocation('');
      setPaymentStatus('Unpaid');
      setPaidAmount(0);
      setPaymentMode('Bank Transfer');
      setPaymentReference('');
      setStatus('Received');

      // Initialize with 1 empty item line if active products exist
      const activeProducts = products.filter((p) => p.status === 'Active');
      if (activeProducts.length > 0) {
        const firstProd = activeProducts[0];
        const defaultGst = Number(firstProd.gstRate) || 18;
        const defaultRate = Number(firstProd.purchasePrice) || 0;
        const taxable = defaultRate * 1;
        const gstAmt = (taxable * defaultGst) / 100;
        const total = taxable + gstAmt;

        setItems([
          {
            id: `item-${Date.now()}-1`,
            productId: firstProd.id,
            productName: firstProd.name,
            make: firstProd.make,
            model: firstProd.model,
            category: firstProd.category,
            hsnCode: firstProd.hsnCode || '85414300',
            unit: firstProd.unit || 'Nos',
            orderedQuantity: 1,
            receivedQuantity: 1,
            unitPrice: defaultRate,
            discountPercent: 0,
            discountAmount: 0,
            taxableAmount: taxable,
            gstRate: defaultGst,
            cgstAmount: isIntraState ? gstAmt / 2 : 0,
            sgstAmount: isIntraState ? gstAmt / 2 : 0,
            igstAmount: !isIntraState ? gstAmt : 0,
            totalAmount: total,
            serialNumbers: [],
          },
        ]);
      } else {
        setItems([]);
      }
    }
    setError(null);
  }, [isOpen, initialData, products]);

  // Recalculate item financials whenever unitPrice, quantity, discount, gstRate changes
  const calculateItemRow = (
    item: PurchaseItem,
    field: keyof PurchaseItem,
    value: any
  ): PurchaseItem => {
    const updated: any = { ...item, [field]: value };

    // If product selection changed, populate product defaults
    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        updated.productName = prod.name;
        updated.make = prod.make;
        updated.model = prod.model;
        updated.category = prod.category;
        updated.hsnCode = prod.hsnCode || '85414300';
        updated.unit = prod.unit || 'Nos';
        updated.unitPrice = Number(prod.purchasePrice) || 0;
        updated.gstRate = Number(prod.gstRate) || 18;
      }
    }

    const orderedQty = Math.max(0, Number(updated.orderedQuantity) || 0);
    const unitPrice = Math.max(0, Number(updated.unitPrice) || 0);
    const discountPct = Math.max(0, Number(updated.discountPercent) || 0);
    const gstRate = Math.max(0, Number(updated.gstRate) || 0);

    const baseAmount = orderedQty * unitPrice;
    const discountAmt = (baseAmount * discountPct) / 100;
    const taxableAmt = Math.max(0, baseAmount - discountAmt);
    const gstTotal = (taxableAmt * gstRate) / 100;

    updated.discountAmount = Number(discountAmt.toFixed(2));
    updated.taxableAmount = Number(taxableAmt.toFixed(2));

    if (isIntraState) {
      updated.cgstAmount = Number((gstTotal / 2).toFixed(2));
      updated.sgstAmount = Number((gstTotal / 2).toFixed(2));
      updated.igstAmount = 0;
    } else {
      updated.cgstAmount = 0;
      updated.sgstAmount = 0;
      updated.igstAmount = Number(gstTotal.toFixed(2));
    }

    updated.totalAmount = Number((taxableAmt + gstTotal).toFixed(2));
    return updated;
  };

  const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = calculateItemRow(copy[index], field, value);
      return copy;
    });
  };

  const handleAddItem = () => {
    const activeProducts = products.filter((p) => p.status === 'Active');
    const prod = activeProducts[0] || products[0];
    if (!prod) return;

    const defaultGst = Number(prod.gstRate) || 18;
    const defaultRate = Number(prod.purchasePrice) || 0;
    const taxable = defaultRate * 1;
    const gstAmt = (taxable * defaultGst) / 100;

    const newItem: PurchaseItem = {
      id: `item-${Date.now()}-${items.length + 1}`,
      productId: prod.id,
      productName: prod.name,
      make: prod.make,
      model: prod.model,
      category: prod.category,
      hsnCode: prod.hsnCode || '85414300',
      unit: prod.unit || 'Nos',
      orderedQuantity: 1,
      receivedQuantity: 1,
      unitPrice: defaultRate,
      discountPercent: 0,
      discountAmount: 0,
      taxableAmount: taxable,
      gstRate: defaultGst,
      cgstAmount: isIntraState ? gstAmt / 2 : 0,
      sgstAmount: isIntraState ? gstAmt / 2 : 0,
      igstAmount: !isIntraState ? gstAmt : 0,
      totalAmount: taxable + gstAmt,
      serialNumbers: [],
    };

    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Financial Totals Summary
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.taxableAmount) || 0), 0);
    const totalCGST = items.reduce((sum, item) => sum + (Number(item.cgstAmount) || 0), 0);
    const totalSGST = items.reduce((sum, item) => sum + (Number(item.sgstAmount) || 0), 0);
    const totalIGST = items.reduce((sum, item) => sum + (Number(item.igstAmount) || 0), 0);
    const totalTax = totalCGST + totalSGST + totalIGST;
    const totalDiscount = items.reduce((sum, item) => sum + (Number(item.discountAmount) || 0), 0);

    const calculatedGrand = subtotal + totalTax + Number(shippingCharges || 0) + Number(roundOff || 0);
    const due = Math.max(0, calculatedGrand - Number(paidAmount || 0));

    return {
      subtotal: Number(subtotal.toFixed(2)),
      totalCGST: Number(totalCGST.toFixed(2)),
      totalSGST: Number(totalSGST.toFixed(2)),
      totalIGST: Number(totalIGST.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      totalDiscount: Number(totalDiscount.toFixed(2)),
      grandTotal: Number(calculatedGrand.toFixed(2)),
      dueAmount: Number(due.toFixed(2)),
    };
  }, [items, shippingCharges, roundOff, paidAmount]);

  // Sync payment status when paidAmount changes
  const handlePaidAmountChange = (amt: number) => {
    setPaidAmount(amt);
    if (amt >= totals.grandTotal && totals.grandTotal > 0) {
      setPaymentStatus('Paid');
    } else if (amt > 0) {
      setPaymentStatus('Partial');
    } else {
      setPaymentStatus('Unpaid');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distributorId) {
      setError('Please select a distributor/supplier');
      return;
    }
    if (items.length === 0) {
      setError('Please add at least one product line item to this purchase');
      return;
    }
    for (const item of items) {
      if (!item.productId) {
        setError('All line items must be mapped to an existing product');
        return;
      }
      if (item.orderedQuantity <= 0) {
        setError(`Quantity for ${item.productName || 'item'} must be greater than 0`);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    const purchasePayload: Omit<Purchase, 'id' | 'createdAt'> = {
      purchaseOrderNumber: initialData?.purchaseOrderNumber || `PO-${Date.now().toString().slice(-6)}`,
      invoiceNumber: invoiceNumber.trim(),
      distributorId,
      distributorName: selectedDistributor?.companyName || 'Supplier',
      distributorGst: selectedDistributor?.gstNumber || '',
      purchaseDate,
      dueDate: dueDate || purchaseDate,
      paymentTerms,
      items,
      subtotal: totals.subtotal,
      totalDiscount: totals.totalDiscount,
      totalTax: totals.totalTax,
      cgstTotal: totals.totalCGST,
      sgstTotal: totals.totalSGST,
      igstTotal: totals.totalIGST,
      shippingCharges: Number(shippingCharges) || 0,
      roundOff: Number(roundOff) || 0,
      grandTotal: totals.grandTotal,
      paidAmount: Number(paidAmount) || 0,
      dueAmount: totals.dueAmount,
      paymentStatus,
      paymentMode,
      paymentReference: paymentReference.trim(),
      status,
      waybillNumber: waybillNumber.trim(),
      vehicleNumber: vehicleNumber.trim(),
      dispatchLocation: dispatchLocation.trim(),
      notes: notes.trim(),
    };

    try {
      if (initialData) {
        await updatePurchase(initialData.id, purchasePayload);
      } else {
        await addPurchase(purchasePayload);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save purchase bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-4 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {initialData ? `Edit Purchase Bill (${initialData.id})` : 'New Product Purchase & GRN'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inward stock receiving & vendor billing directly linked to single-source Inventory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-3 text-xs text-red-600 dark:text-red-400 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Distributor & Bill References */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>1. Distributor & Inward Document References</span>
              </h3>
              <button
                type="button"
                onClick={() => setDistributorModalOpen(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add New Vendor</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Distributor / Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={distributorId}
                  onChange={(e) => setDistributorId(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                >
                  <option value="">-- Choose Distributor --</option>
                  {distributors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.companyName} ({d.city || 'UP'} {d.gstNumber ? `• ${d.gstNumber}` : ''})
                    </option>
                  ))}
                </select>
                {selectedDistributor && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                    <span>GSTIN: {selectedDistributor.gstNumber || 'Unregistered'}</span>
                    <span>•</span>
                    <span className={isIntraState ? 'text-emerald-600' : 'text-blue-600'}>
                      {isIntraState ? 'Intra-State (CGST+SGST)' : 'Inter-State (IGST)'}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Vendor Invoice / Bill No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g. WE-2026-9812"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bill / Purchase Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Terms
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Immediate">Immediate / Advance</option>
                  <option value="Net 7">Net 7 Days</option>
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Net 45">Net 45 Days</option>
                  <option value="Net 60">Net 60 Days</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  E-Waybill / LR No
                </label>
                <input
                  type="text"
                  value={waybillNumber}
                  onChange={(e) => setWaybillNumber(e.target.value)}
                  placeholder="e.g. 541298412091"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Receiving Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Received">Goods Fully Received (GRN)</option>
                  <option value="Partial">Partial Stock Received</option>
                  <option value="Ordered">PO Dispatched (Pending Arrival)</option>
                  <option value="Pending">Draft / Awaiting Supplier</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Products & Line Items (SINGLE SOURCE OF TRUTH INVENTORY) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>2. Purchased Items & Stock Inward (Linked to Inventory)</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Received quantities automatically add to existing inventory stock on saving
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Add Product Line</span>
              </button>
            </div>

            {/* Line items table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3 min-w-[220px]">Product / Equipment</th>
                      <th className="p-3 w-20 text-center">HSN</th>
                      <th className="p-3 w-24 text-right">Qty Ordered</th>
                      <th className="p-3 w-24 text-right bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">
                        Qty Inward
                      </th>
                      <th className="p-3 w-28 text-right">Unit Rate (₹)</th>
                      <th className="p-3 w-20 text-right">Disc %</th>
                      <th className="p-3 w-24 text-right">Taxable (₹)</th>
                      <th className="p-3 w-20 text-right">GST %</th>
                      <th className="p-3 w-28 text-right">Line Total (₹)</th>
                      <th className="p-3 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-slate-400">
                          No items added yet. Click "+ Add Product Line" above.
                        </td>
                      </tr>
                    ) : (
                      items.map((item, idx) => {
                        const selectedProd = products.find((p) => p.id === item.productId);
                        return (
                          <tr key={item.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            {/* Product Selector */}
                            <td className="p-2.5">
                              <select
                                value={item.productId}
                                onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                              >
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} [{p.category}] - Stock: {p.currentStock} {p.unit}
                                  </option>
                                ))}
                              </select>
                              {selectedProd && (
                                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                                  <span>Make: {selectedProd.make || '-'}</span>
                                  <span>•</span>
                                  <span>Stock: {selectedProd.currentStock} {selectedProd.unit}</span>
                                </div>
                              )}
                            </td>

                            {/* HSN */}
                            <td className="p-2.5 text-center font-mono text-[11px] text-slate-500">
                              {item.hsnCode || '85414300'}
                            </td>

                            {/* Ordered Qty */}
                            <td className="p-2.5">
                              <input
                                type="number"
                                min={1}
                                value={item.orderedQuantity}
                                onChange={(e) =>
                                  handleItemChange(idx, 'orderedQuantity', parseFloat(e.target.value) || 0)
                                }
                                className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-right text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </td>

                            {/* Received Qty (GRN Inward) */}
                            <td className="p-2.5 bg-blue-50/40 dark:bg-blue-950/20">
                              <input
                                type="number"
                                min={0}
                                max={item.orderedQuantity}
                                value={item.receivedQuantity}
                                onChange={(e) =>
                                  handleItemChange(idx, 'receivedQuantity', parseFloat(e.target.value) || 0)
                                }
                                className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded-lg text-right text-xs font-bold text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </td>

                            {/* Unit Rate */}
                            <td className="p-2.5">
                              <input
                                type="number"
                                step="0.01"
                                min={0}
                                value={item.unitPrice}
                                onChange={(e) =>
                                  handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                                }
                                className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-right text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </td>

                            {/* Disc % */}
                            <td className="p-2.5">
                              <input
                                type="number"
                                step="0.1"
                                min={0}
                                max={100}
                                value={item.discountPercent || 0}
                                onChange={(e) =>
                                  handleItemChange(idx, 'discountPercent', parseFloat(e.target.value) || 0)
                                }
                                className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-right text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            </td>

                            {/* Taxable Amt */}
                            <td className="p-2.5 text-right font-medium">
                              ₹{(item.taxableAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>

                            {/* GST % */}
                            <td className="p-2.5">
                              <select
                                value={item.gstRate}
                                onChange={(e) =>
                                  handleItemChange(idx, 'gstRate', parseFloat(e.target.value) || 0)
                                }
                                className="w-full px-1.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-right text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                              >
                                <option value={0}>0%</option>
                                <option value={5}>5%</option>
                                <option value={12}>12%</option>
                                <option value={18}>18%</option>
                                <option value={28}>28%</option>
                              </select>
                            </td>

                            {/* Line Total */}
                            <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">
                              ₹{(item.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>

                            {/* Delete */}
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1 rounded-md text-slate-400 hover:text-red-500 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 3: Summary, Tax Breakup & Freight */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side: Delivery notes, dispatch location */}
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dispatch & Delivery Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Received in 2 pallets at warehouse, panel barcodes verified, zero transit damages."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vehicle / Truck No
                  </label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="UP 62 AB 1234"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dispatch Location
                  </label>
                  <input
                    type="text"
                    value={dispatchLocation}
                    onChange={(e) => setDispatchLocation(e.target.value)}
                    placeholder="Noida Warehouse"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right side: Calculation Breakdown Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-700">
                Purchase Order Valuation Breakdown
              </h4>

              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Taxable Subtotal:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatINR(totals.subtotal)}</span>
              </div>

              {totals.totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Trade Discount:</span>
                  <span>-{formatINR(totals.totalDiscount)}</span>
                </div>
              )}

              {isIntraState ? (
                <>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>CGST:</span>
                    <span>{formatINR(totals.totalCGST)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>SGST:</span>
                    <span>{formatINR(totals.totalSGST)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>IGST (Inter-State):</span>
                  <span>{formatINR(totals.totalIGST)}</span>
                </div>
              )}

              {/* Shipping Freight */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <span className="text-slate-600 dark:text-slate-300">Freight & Shipping (₹):</span>
                <input
                  type="number"
                  min={0}
                  value={shippingCharges}
                  onChange={(e) => setShippingCharges(parseFloat(e.target.value) || 0)}
                  className="w-28 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-right font-semibold text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Round off */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-600 dark:text-slate-300">Round Off:</span>
                <input
                  type="number"
                  step="0.01"
                  value={roundOff}
                  onChange={(e) => setRoundOff(parseFloat(e.target.value) || 0)}
                  className="w-28 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-right text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white">
                <span>Grand Total:</span>
                <span className="text-base text-blue-600 dark:text-blue-400">{formatINR(totals.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Settlement & Payment Details */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>4. Vendor Settlement & Payment Entry</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => {
                    const next = e.target.value as any;
                    setPaymentStatus(next);
                    if (next === 'Paid') setPaidAmount(totals.grandTotal);
                    if (next === 'Unpaid') setPaidAmount(0);
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Unpaid">Unpaid (Full Due)</option>
                  <option value="Partial">Partial Paid</option>
                  <option value="Paid">Fully Paid</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Paid Amount (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  max={totals.grandTotal}
                  value={paidAmount}
                  onChange={(e) => handlePaidAmountChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  <option value="RTGS">RTGS</option>
                  <option value="UPI">UPI / QR</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit">Credit Ledger</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ref / UTR / Cheque No
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g. UTR-982104928"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                Outstanding Balance to Distributor:
              </span>
              <span className="font-black text-amber-700 dark:text-amber-300 text-sm">
                {formatINR(totals.dueAmount)}
              </span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Single-Source Inventory Integration Active</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : initialData ? 'Update Purchase & Stock' : 'Save Purchase & Inward Stock'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Distributor Sub-Modal */}
      <DistributorModal
        isOpen={distributorModalOpen}
        onClose={() => setDistributorModalOpen(false)}
        onSave={async (newDist) => {
          const created = await addDistributor(newDist);
          if (created?.id) {
            setDistributorId(created.id);
          }
        }}
      />
    </div>
  );
};
