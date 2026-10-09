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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#24372D] dark:text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#DCEBE0] text-[#25845A]">
              <CreditCard className="w-5 h-5" />
            </span>
            <span>Payment Collections & Receipts</span>
          </h2>
          <p className="text-xs text-[#68786E] dark:text-[#8E9F94] mt-1 font-medium">
            Record customer payment transactions and print payment receipts
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25845A] hover:bg-[#1D7049] text-white font-bold text-xs transition shadow-[0_4px_12px_rgba(37,132,90,0.25)] border border-[#1D7049] active:translate-y-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Receive Payment</span>
        </button>
      </div>

      {/* Filter */}
      <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#25845A] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipt #, customer name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] placeholder-[#87938B] text-xs focus:outline-none focus:border-[#25845A]"
          />
        </div>
      </div>

      {/* Payment Receipts Table */}
      <div className="rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F1F5F1] dark:bg-[#152019] text-[#68786E] dark:text-[#8E9F94] font-bold uppercase tracking-wider border-b border-[#D9E2DA] dark:border-[#223328]">
                <th className="p-4">Receipt #</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Against Invoice</th>
                <th className="p-4">Amount Paid</th>
                <th className="p-4">Mode & Ref</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2DA] dark:divide-[#223328] text-[#24372D] dark:text-[#E6EEE8]">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#87938B]">
                    <CreditCard className="w-10 h-10 mx-auto text-[#87938B]/40 mb-2" />
                    <p className="font-bold">No payment collections found</p>
                    <p className="text-[11px] mt-0.5">Click "+ Receive Payment" to record customer collections.</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8FAF8] dark:hover:bg-[#202E25]/50 transition">
                    <td className="p-4 font-mono font-bold text-[#25845A] dark:text-[#2DA16E]">{p.receiptNo}</td>
                    <td className="p-4 font-bold text-[#24372D] dark:text-white">{p.customerName}</td>
                    <td className="p-4 font-mono text-[#68786E] dark:text-[#8E9F94]">{p.invoiceNumber}</td>
                    <td className="p-4 font-extrabold text-[#25845A] dark:text-[#2DA16E]">
                      ₹{p.amount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold">{p.paymentMode}</p>
                      <p className="text-[10px] text-[#87938B] font-mono">{p.transactionRef}</p>
                    </td>
                    <td className="p-4 text-[#68786E] dark:text-[#8E9F94] font-medium">{p.paymentDate}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => triggerPrint('receipt', p)}
                        className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] dark:bg-[#1A261F] shadow-[1px_1px_4px_rgba(36,55,45,0.06),-1px_-1px_4px_rgba(255,255,255,0.85)] hover:bg-[#F8FAF8] text-[#24372D] dark:text-[#E6EEE8] hover:text-[#25845A] font-bold text-[11px] inline-flex items-center gap-1.5 transition border border-[#D9E2DA] dark:border-[#223328]"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#25845A]" />
                        <span>Print Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIVE PAYMENT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24372D]/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#1B2720] rounded-2xl shadow-[0_10px_35px_rgba(36,55,45,0.2)] border border-[#D9E2DA] dark:border-[#223328] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D9E2DA] dark:border-[#223328]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#DCEBE0] text-[#25845A]">
                  <CreditCard className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-[#24372D] dark:text-white text-base">Receive Payment</h3>
              </div>
              <button 
                onClick={() => setModalOpen(false)} 
                className="p-1.5 rounded-xl text-[#87938B] hover:text-[#24372D] dark:hover:text-white bg-[#F1F5F1] dark:bg-[#121A15] border border-[#D9E2DA] dark:border-[#223328]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReceivePaymentSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1 text-[#24372D] dark:text-[#E6EEE8]">
                  Select Pending Invoice
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    setSelectedInvoiceId(e.target.value);
                    const inv = invoices.find((i) => i.id === e.target.value);
                    if (inv) setPaymentAmount(inv.remainingBalance);
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] font-medium outline-none focus:border-[#25845A]"
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
                <label className="block font-bold mb-1 text-[#24372D] dark:text-[#E6EEE8]">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] font-black text-[#25845A] text-sm outline-none focus:border-[#25845A]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#24372D] dark:text-[#E6EEE8]">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                  className="w-full p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] font-medium outline-none focus:border-[#25845A]"
                >
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#24372D] dark:text-[#E6EEE8]">
                  Transaction / Cheque Ref #
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] font-mono text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A]"
                />
              </div>

              <div className="pt-4 border-t border-[#D9E2DA] dark:border-[#223328] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-[#68786E] dark:text-[#8E9F94] font-bold border border-[#D9E2DA] dark:border-[#223328]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#25845A] hover:bg-[#1D7049] text-white font-bold shadow-[0_4px_12px_rgba(37,132,90,0.25)] border border-[#1D7049] transition"
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
