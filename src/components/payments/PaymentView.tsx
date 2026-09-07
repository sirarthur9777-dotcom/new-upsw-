import React, { useState } from 'react';
import { CreditCard, Plus, Printer, Search, DollarSign, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMode } from '../../types';

export const PaymentView: React.FC = () => {
  const { payments, invoices, addPayment, triggerPrint } = useApp();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const pendingInvoices = invoices.filter((i) => i.remainingBalance > 0);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(pendingInvoices[0]?.id || '');
  const [paymentAmount, setPaymentAmount] = useState<number>(50000);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [transactionRef, setTransactionRef] = useState('UPI/2026/889900');
  const [notes, setNotes] = useState('Part payment received');

  const handleReceivePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find((i) => i.id === selectedInvoiceId);
    if (!inv) return;

    addPayment({
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customerId,
      customerName: inv.customerName,
      amount: paymentAmount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode,
      transactionRef,
      notes,
    });

    setModalOpen(false);
  };

  const filteredPayments = payments.filter((p) =>
    p.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
    p.customerName.toLowerCase().includes(search.toLowerCase()) ||
    p.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payment Collections & Receipts</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Record customer payment transactions and print payment receipts
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>+ Receive Payment</span>
        </button>
      </div>

      {/* Filter */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipt #, customer name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Payment Receipts Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b">
                <th className="p-4">Receipt #</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Against Invoice</th>
                <th className="p-4">Amount Paid</th>
                <th className="p-4">Mode & Ref</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="p-4 font-mono font-bold text-amber-500">{p.receiptNo}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{p.customerName}</td>
                  <td className="p-4 font-mono text-slate-500">{p.invoiceNumber}</td>
                  <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                    ₹{p.amount.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <p className="font-semibold">{p.paymentMode}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{p.transactionRef}</p>
                  </td>
                  <td className="p-4 text-slate-500">{p.paymentDate}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => triggerPrint('receipt', p)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-bold text-[11px] inline-flex items-center gap-1 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIVE PAYMENT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Receive Payment</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReceivePaymentSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">
                  Select Pending Invoice
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    setSelectedInvoiceId(e.target.value);
                    const inv = invoices.find((i) => i.id === e.target.value);
                    if (inv) setPaymentAmount(inv.remainingBalance);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700"
                >
                  {pendingInvoices.length === 0 ? (
                    <option value="">No pending invoices</option>
                  ) : (
                    pendingInvoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} - {inv.customerName} (Bal: ₹{inv.remainingBalance.toLocaleString()})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-bold text-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700"
                >
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">
                  Transaction / Cheque Ref #
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 font-mono"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Submit Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
