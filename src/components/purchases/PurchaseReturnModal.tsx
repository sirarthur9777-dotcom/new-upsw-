import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  RotateCcw,
  Building2,
  Package,
  Calendar,
  AlertCircle,
  Save,
  DollarSign,
  FileText
} from 'lucide-react';
import { useApp, formatINR } from '../../context/AppContext';
import { PurchaseReturn, Product, Distributor } from '../../types';

interface PurchaseReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: PurchaseReturn | null;
}

export const PurchaseReturnModal: React.FC<PurchaseReturnModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const {
    products,
    distributors,
    purchases,
    addPurchaseReturn,
    updatePurchaseReturn,
  } = useApp();

  const [purchaseId, setPurchaseId] = useState('');
  const [distributorId, setDistributorId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [returnReason, setReturnReason] = useState<
    'Damaged in Transit' | 'Defective' | 'Wrong Specification' | 'Excess Stock' | 'Warranty Replacement'
  >('Defective');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [debitNoteNumber, setDebitNoteNumber] = useState('');
  const [status, setStatus] = useState<'Pending' | 'Approved' | 'Refunded' | 'Replaced'>('Approved');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected product & distributor
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === productId) || null;
  }, [products, productId]);

  const selectedDistributor = useMemo(() => {
    return distributors.find((d) => d.id === distributorId) || null;
  }, [distributors, distributorId]);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setPurchaseId(initialData.purchaseId || '');
      setDistributorId(initialData.distributorId || '');
      setProductId(initialData.productId || '');
      setQuantity(Number(initialData.quantity) || 1);
      setUnitPrice(Number(initialData.unitPrice) || 0);
      setReturnReason(initialData.returnReason || 'Defective');
      setReturnDate(initialData.returnDate || new Date().toISOString().split('T')[0]);
      setDebitNoteNumber(initialData.debitNoteNumber || '');
      setStatus(initialData.status || 'Approved');
      setNotes(initialData.notes || '');
    } else {
      setPurchaseId('');
      setDistributorId(distributors[0]?.id || '');
      const firstProd = products[0];
      setProductId(firstProd?.id || '');
      setQuantity(1);
      setUnitPrice(Number(firstProd?.purchasePrice) || 0);
      setReturnReason('Defective');
      setReturnDate(new Date().toISOString().split('T')[0]);
      setDebitNoteNumber(`DN-${Date.now().toString().slice(-6)}`);
      setStatus('Approved');
      setNotes('');
    }
    setError(null);
  }, [isOpen, initialData, products, distributors]);

  // If user selects a purchase, auto-fill distributor & items
  const handlePurchaseSelect = (pId: string) => {
    setPurchaseId(pId);
    const purchase = purchases.find((p) => p.id === pId);
    if (purchase) {
      if (purchase.distributorId) setDistributorId(purchase.distributorId);
      if (purchase.items && purchase.items.length > 0) {
        const firstItem = purchase.items[0];
        setProductId(firstItem.productId);
        setUnitPrice(firstItem.unitPrice);
        setQuantity(Math.min(1, firstItem.receivedQuantity || 1));
      }
    }
  };

  const handleProductSelect = (pId: string) => {
    setProductId(pId);
    const prod = products.find((p) => p.id === pId);
    if (prod) {
      setUnitPrice(Number(prod.purchasePrice) || 0);
    }
  };

  const returnAmount = Number((quantity * unitPrice).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distributorId) {
      setError('Please select a distributor');
      return;
    }
    if (!productId) {
      setError('Please select a product from inventory');
      return;
    }
    if (quantity <= 0) {
      setError('Return quantity must be greater than 0');
      return;
    }

    if (selectedProduct && quantity > selectedProduct.currentStock && !initialData) {
      setError(
        `Cannot return ${quantity} ${selectedProduct.unit}. Current stock in inventory is only ${selectedProduct.currentStock} ${selectedProduct.unit}.`
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: Omit<PurchaseReturn, 'id' | 'createdAt'> = {
      purchaseId: purchaseId || undefined,
      distributorId,
      distributorName: selectedDistributor?.companyName || 'Supplier',
      productId,
      productName: selectedProduct?.name || 'Product',
      quantity,
      unitPrice,
      returnAmount,
      returnReason,
      returnDate,
      debitNoteNumber: debitNoteNumber.trim(),
      status,
      notes: notes.trim(),
    };

    try {
      if (initialData) {
        await updatePurchaseReturn(initialData.id, payload);
      } else {
        await addPurchaseReturn(payload);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save purchase return');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-4 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {initialData ? 'Edit Purchase Return' : 'Record Purchase Return & Debit Note'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Return damaged/excess goods to vendor & automatically deduct stock from inventory
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-3 text-xs text-red-600 dark:text-red-400 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Reference Purchase Order (Optional) */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Link Original Purchase Bill (Optional)
            </label>
            <select
              value={purchaseId}
              onChange={(e) => handlePurchaseSelect(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Direct Vendor Return (No PO linked) --</option>
              {purchases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} • {p.distributorName} • Inv: {p.invoiceNumber} (₹{p.grandTotal})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Distributor / Vendor <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={distributorId}
                onChange={(e) => setDistributorId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              >
                <option value="">-- Select Distributor --</option>
                {distributors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.companyName} ({d.city || 'UP'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Debit Note / Ref Number
              </label>
              <input
                type="text"
                value={debitNoteNumber}
                onChange={(e) => setDebitNoteNumber(e.target.value)}
                placeholder="DN-2026-001"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Product from Inventory <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={productId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Select Product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} [{p.category}] - In Stock: {p.currentStock} {p.unit} (Rate: ₹{p.purchasePrice})
                </option>
              ))}
            </select>
            {selectedProduct && (
              <p className="text-[11px] text-slate-500 mt-1">
                Current Inventory Stock: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedProduct.currentStock} {selectedProduct.unit}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Return Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unit Purchase Price (₹)
              </label>
              <input
                type="number"
                min={0}
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Refund Value
              </label>
              <div className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400">
                {formatINR(returnAmount)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Return Reason
              </label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Defective">Defective / Non-Functional</option>
                <option value="Damaged in Transit">Damaged in Transit / Glass Crack</option>
                <option value="Wrong Specification">Wrong Specification / Wattage</option>
                <option value="Warranty Replacement">Warranty Replacement</option>
                <option value="Excess Stock">Excess Stock Return</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Return Date
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Return Settlement Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Approved">Approved & Adjusted</option>
                <option value="Pending">Pending Vendor Acknowledgment</option>
                <option value="Refunded">Refund Received in Bank</option>
                <option value="Replaced">Replacement Unit Received</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Reason / Vendor Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 2 micro inverters failed on-site testing; distributor approved replacement via courier."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-800/60 flex-shrink-0">
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
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition shadow-md shadow-rose-600/20 disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isSubmitting ? 'Recording...' : 'Record Return & Adjust Stock'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
