import React, { useState, useEffect } from 'react';
import { X, RotateCcw, AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CashInTransaction, CashOutTransaction } from '../../types';

interface ReverseTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionType: 'cash_in' | 'cash_out';
  transaction: CashInTransaction | CashOutTransaction | null;
  onSuccess?: () => void;
}

const COMMON_REASONS = [
  'Accidental duplicate entry',
  'Incorrect amount entered',
  'Wrong bank/cash account selected',
  'Customer cheque dishonoured/bounced',
  'Customer cancelled order/booking',
  'Payment entry correction',
];

export const ReverseTransactionModal: React.FC<ReverseTransactionModalProps> = ({
  isOpen,
  onClose,
  transactionType,
  transaction,
  onSuccess,
}) => {
  const { reverseTransaction, invoices, purchases } = useApp();

  const [reason, setReason] = useState('Accidental duplicate entry');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason('Accidental duplicate entry');
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen || !transaction) return null;

  const isCashIn = transactionType === 'cash_in';
  const partyName = isCashIn
    ? (transaction as CashInTransaction).fromWhom || 'Customer'
    : (transaction as CashOutTransaction).paidTo || 'Vendor / Payee';

  const linkedInvoice = isCashIn
    ? invoices.find(
        (i) =>
          i.id === (transaction as CashInTransaction).invoiceId ||
          (transaction.referenceNo && i.invoiceNumber === transaction.referenceNo)
      )
    : null;

  const linkedPurchase = !isCashIn
    ? purchases.find(
        (p) =>
          p.id === (transaction as CashOutTransaction).purchaseId ||
          (transaction.referenceNo && p.billNumber === transaction.referenceNo)
      )
    : null;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('Please specify a reason for reversing this transaction.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await reverseTransaction(transactionType, transaction.id, reason.trim());
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to reverse transaction:', err);
      setErrorMsg(err?.message || 'Failed to reverse transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
              <RotateCcw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Reverse Transaction</h3>
              <p className="text-xs text-rose-100/90 font-medium">
                {isCashIn ? 'Reverse Customer Collection (Cash In)' : 'Reverse Payment Outflow (Cash Out)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition text-white/90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleConfirm} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Transaction Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isCashIn
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                  }`}
                >
                  {isCashIn ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                  {isCashIn ? 'Cash In' : 'Cash Out'}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {transaction.referenceNo || transaction.id}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">{transaction.date}</span>
            </div>

            <div className="flex items-baseline justify-between border-t border-slate-200 dark:border-slate-700/60 pt-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {isCashIn ? 'Received From' : 'Paid To'}
                </p>
                <p className="font-bold text-sm text-slate-900 dark:text-white">{partyName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {transaction.accountName} • {transaction.paymentMethod}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Amount</p>
                <p
                  className={`text-xl font-extrabold ${
                    isCashIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  ₹{Number(transaction.amount).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          {/* Impact Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Accounting & Ledger Audit Impact</span>
            </div>
            <ul className="text-[11px] text-amber-900/80 dark:text-amber-200/90 space-y-1 list-disc list-inside">
              <li>
                <strong>{transaction.accountName}</strong> ledger balance will immediately adjust by ₹
                {Number(transaction.amount).toLocaleString('en-IN')}.
              </li>
              {isCashIn && linkedInvoice && (
                <li>
                  Invoice <strong>{linkedInvoice.invoiceNumber}</strong> paid amount will be reduced by ₹
                  {Number(transaction.amount).toLocaleString('en-IN')}, and will be{' '}
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">unlocked for editing</span>.
                </li>
              )}
              {!isCashIn && linkedPurchase && (
                <li>
                  Purchase Bill <strong>{linkedPurchase.billNumber || linkedPurchase.invoiceNumber}</strong> outstanding
                  balance will be restored.
                </li>
              )}
              <li>A reversal audit entry with your reason and timestamp will be permanently logged.</li>
            </ul>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Reason for Reversal <span className="text-rose-500">*</span>
            </label>

            {/* Quick Reason Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_REASONS.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setReason(r)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition ${
                    reason === r
                      ? 'bg-rose-500 text-white font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              required
              placeholder="Provide a reason for auditing and compliance..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none resize-none font-medium"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 rounded-xl shadow-md shadow-rose-600/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Reversing...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Confirm & Reverse</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
