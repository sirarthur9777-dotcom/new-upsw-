import React, { useState } from 'react';
import {
  X,
  ShoppingCart,
  Printer,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Truck,
  Edit2,
  Save,
  Package,
  AlertTriangle,
  ArrowUpRight,
  FileText
} from 'lucide-react';
import { Purchase, PurchaseItem } from '../../types';
import { useApp, formatINR } from '../../context/AppContext';
import { PurchaseInvoicePrint } from './PurchaseInvoicePrint';

interface PurchaseDetailModalProps {
  purchase: Purchase;
  onClose: () => void;
  onEdit: () => void;
}

export const PurchaseDetailModal: React.FC<PurchaseDetailModalProps> = ({
  purchase,
  onClose,
  onEdit,
}) => {
  const { companySettings, updatePurchase } = useApp();
  const [printOpen, setPrintOpen] = useState(false);
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [additionalPayment, setAdditionalPayment] = useState<number>(purchase.dueAmount || 0);
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (additionalPayment <= 0) return;

    setIsUpdating(true);
    const newPaid = (Number(purchase.paidAmount) || 0) + additionalPayment;
    const newDue = Math.max(0, (Number(purchase.grandTotal) || 0) - newPaid);
    const newPaymentStatus = newDue === 0 ? 'Paid' : 'Partial';

    await updatePurchase(purchase.id, {
      paidAmount: newPaid,
      dueAmount: newDue,
      paymentStatus: newPaymentStatus,
      paymentReference: paymentRef ? `${purchase.paymentReference || ''} | ${paymentRef}`.trim() : purchase.paymentReference,
    });

    setIsUpdating(false);
    setSettlementOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-4 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Purchase #{purchase.id}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    purchase.paymentStatus === 'Paid'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : purchase.paymentStatus === 'Partial'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                  }`}
                >
                  {purchase.paymentStatus}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {purchase.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vendor: {purchase.distributorName} • Inv: {purchase.invoiceNumber} • Date: {purchase.purchaseDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPrintOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Print GRN</span>
            </button>
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Distributor / Vendor
              </span>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                {purchase.distributorName}
              </p>
              <p className="font-mono text-slate-600 dark:text-slate-400 mt-0.5">
                GSTIN: {purchase.distributorGst || 'Unregistered'}
              </p>
              <p className="text-slate-500 mt-0.5">Terms: {purchase.paymentTerms || 'Net 30'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Shipment & Inward Info
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                Status: <span className="font-bold text-blue-600 dark:text-blue-400">{purchase.status}</span>
              </p>
              {purchase.waybillNumber && (
                <p className="font-mono text-slate-600 dark:text-slate-400">Waybill: {purchase.waybillNumber}</p>
              )}
              {purchase.vehicleNumber && (
                <p className="font-mono text-slate-600 dark:text-slate-400">Vehicle: {purchase.vehicleNumber}</p>
              )}
              {purchase.dispatchLocation && (
                <p className="text-slate-500">Location: {purchase.dispatchLocation}</p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Valuation & Settlement
              </span>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {formatINR(purchase.grandTotal)}
              </p>
              <div className="flex items-center justify-between text-[11px] mt-1">
                <span className="text-slate-500">Paid: {formatINR(purchase.paidAmount || 0)}</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  Due: {formatINR(purchase.dueAmount || 0)}
                </span>
              </div>
              {purchase.dueAmount > 0 && (
                <button
                  onClick={() => setSettlementOpen(true)}
                  className="mt-2 w-full py-1.5 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] transition shadow-xs flex items-center justify-center gap-1"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Record Vendor Payment</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Payment Settlement Drawer */}
          {settlementOpen && (
            <form
              onSubmit={handleRecordPayment}
              className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3 animate-in fade-in"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Record Payment to {purchase.distributorName}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setSettlementOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount to Pay (₹)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={purchase.dueAmount}
                    value={additionalPayment}
                    onChange={(e) => setAdditionalPayment(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="RTGS">RTGS</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Transaction / Cheque Reference
                  </label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="UTR / Cheque No"
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-lg text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSettlementOpen(false)}
                  className="px-3 py-1 text-xs rounded-lg text-slate-600 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                >
                  {isUpdating ? 'Saving...' : 'Save Payment Entry'}
                </button>
              </div>
            </form>
          )}

          {/* Line Items Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Purchased Equipment Items & Inventory Inward</span>
            </h4>
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3 text-center">HSN</th>
                    <th className="p-3 text-right">Ordered</th>
                    <th className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">Inward Received</th>
                    <th className="p-3 text-right">Unit Rate</th>
                    <th className="p-3 text-right">Taxable</th>
                    <th className="p-3 text-center">GST %</th>
                    <th className="p-3 text-right font-bold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {purchase.items?.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="p-3">
                        <span className="font-bold text-slate-900 dark:text-white block">{item.productName}</span>
                        <span className="text-[10px] text-slate-400">
                          {item.make ? `Make: ${item.make}` : ''} {item.model ? `• Model: ${item.model}` : ''}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-slate-500">{item.hsnCode || '-'}</td>
                      <td className="p-3 text-right">{item.orderedQuantity} {item.unit || 'Nos'}</td>
                      <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/20">
                        {item.receivedQuantity} {item.unit || 'Nos'}
                      </td>
                      <td className="p-3 text-right font-mono">{formatINR(item.unitPrice)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(item.taxableAmount)}</td>
                      <td className="p-3 text-center font-mono">{item.gstRate}%</td>
                      <td className="p-3 text-right font-bold font-mono">{formatINR(item.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Remarks / Inward Notes
              </span>
              <p className="text-slate-700 dark:text-slate-300">
                {purchase.notes || 'No special notes recorded.'}
              </p>
              {purchase.paymentReference && (
                <p className="text-[11px] text-slate-500 mt-2 font-mono">
                  Ref/UTR: {purchase.paymentReference}
                </p>
              )}
            </div>

            <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatINR(purchase.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Tax (GST):</span>
                <span>{formatINR(purchase.totalTax)}</span>
              </div>
              {purchase.shippingCharges > 0 && (
                <div className="flex justify-between">
                  <span>Shipping & Freight:</span>
                  <span>{formatINR(purchase.shippingCharges)}</span>
                </div>
              )}
              {purchase.roundOff !== 0 && (
                <div className="flex justify-between">
                  <span>Round Off:</span>
                  <span>{formatINR(purchase.roundOff)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 font-black text-sm text-slate-900 dark:text-white">
                <span>Grand Total:</span>
                <span className="text-base text-blue-600 dark:text-blue-400">{formatINR(purchase.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 flex-shrink-0">
          <button
            onClick={() => setPrintOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Print Tax Purchase Bill</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition shadow-md shadow-blue-600/20"
          >
            Done
          </button>
        </div>
      </div>

      {/* Print Modal View */}
      {printOpen && (
        <PurchaseInvoicePrint
          purchase={purchase}
          companySettings={companySettings}
          onClose={() => setPrintOpen(false)}
        />
      )}
    </div>
  );
};
