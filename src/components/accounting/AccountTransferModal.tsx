import React, { useState } from 'react';
import { X, ArrowLeftRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AccountingPaymentMethod } from '../../types';

interface AccountTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFromAccountId?: string;
}

export const AccountTransferModal: React.FC<AccountTransferModalProps> = ({
  isOpen,
  onClose,
  defaultFromAccountId,
}) => {
  const { accounts, addAccountTransfer, getAccountCalculatedBalance, user } = useApp();

  const [fromAccountId, setFromAccountId] = useState(defaultFromAccountId || accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(
    accounts.find((a) => a.id !== (defaultFromAccountId || accounts[0]?.id))?.id || accounts[1]?.id || ''
  );
  const [amount, setAmount] = useState<number | ''>('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<AccountingPaymentMethod>('Bank Transfer');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const fromAcc = accounts.find((a) => a.id === fromAccountId);
  const toAcc = accounts.find((a) => a.id === toAccountId);
  const fromBalance = getAccountCalculatedBalance(fromAccountId) || 0;
  const toBalance = getAccountCalculatedBalance(toAccountId) || 0;

  const isInsufficient = typeof amount === 'number' && amount > fromBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid transfer amount');
      return;
    }
    if (fromAccountId === toAccountId) {
      alert('Source and destination accounts must be different');
      return;
    }
    if (!fromAcc || !toAcc) {
      alert('Invalid accounts selected');
      return;
    }

    setIsSubmitting(true);
    try {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await addAccountTransfer({
        transferDate,
        time: nowTime,
        fromAccountId,
        fromAccountName: fromAcc.name,
        toAccountId,
        toAccountName: toAcc.name,
        amount: Number(amount),
        paymentMethod,
        referenceNo: referenceNo.trim() || `CONTRA-${Date.now()}`,
        notes: notes.trim(),
        createdBy: user?.displayName || 'Accounts Manager',
      });

      onClose();
    } catch (err) {
      console.error('Error executing account transfer:', err);
      alert('Failed to execute account transfer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Contra / Fund Transfer</h3>
              <p className="text-xs text-blue-100">
                Move funds between Cash in Hand and Company Bank Accounts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Visual Transfer preview cards */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                From Account (Debit Out)
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {fromAcc?.name || 'Select Account'}
              </p>
              <p className="text-xs text-slate-500">
                Live Bal: ₹{fromBalance.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                To Account (Credit In)
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {toAcc?.name || 'Select Account'}
              </p>
              <p className="text-xs text-slate-500">
                Live Bal: ₹{toBalance.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* From Account */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                From Account (Source) *
              </label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.accountType})
                  </option>
                ))}
              </select>
            </div>

            {/* To Account */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                To Account (Destination) *
              </label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
              >
                {accounts
                  .filter((acc) => acc.id !== fromAccountId)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.accountType})
                    </option>
                  ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Transfer Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-8 pr-3 py-2 text-base font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              {isInsufficient && (
                <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Amount exceeds available source balance (₹{fromBalance.toLocaleString('en-IN')})
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Transfer Date *
              </label>
              <input
                type="date"
                required
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Transfer Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Method / Mode *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as AccountingPaymentMethod)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="Cash">Cash Deposit / Cash Withdrawal (ATM)</option>
                <option value="UPI">UPI / Net Banking</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Reference */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reference / UTR / Cheque #
              </label>
              <input
                type="text"
                placeholder="e.g. ATM-REC-482, UTR9823412"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Transfer Narration / Reason
            </label>
            <input
              type="text"
              placeholder="e.g. Cash withdrawal from HDFC for site expense float"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Transferring...' : 'Execute Contra Transfer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
