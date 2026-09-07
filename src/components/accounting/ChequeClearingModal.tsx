import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Ban } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChequeStatus } from '../../types';

interface ChequeClearingModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionType: 'Cash In' | 'Cash Out';
  transactionId: string;
  chequeNumber?: string;
  chequeBankName?: string;
  currentStatus?: ChequeStatus;
  amount: number;
  partyName: string;
}

export const ChequeClearingModal: React.FC<ChequeClearingModalProps> = ({
  isOpen,
  onClose,
  transactionType,
  transactionId,
  chequeNumber,
  chequeBankName,
  currentStatus,
  amount,
  partyName,
}) => {
  const { updateChequeStatus } = useApp();

  const [status, setStatus] = useState<ChequeStatus>(currentStatus || 'Cleared');
  const [clearedDate, setClearedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateChequeStatus(
        transactionType === 'Cash In' ? 'cash_in' : 'cash_out',
        transactionId,
        status,
        status === 'Cleared' ? clearedDate : undefined
      );
      onClose();
    } catch (err) {
      console.error('Error updating cheque status:', err);
      alert('Failed to update cheque status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 bg-gradient-to-r from-amber-600 to-orange-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Update Cheque Clearing Status</h3>
              <p className="text-xs text-amber-100">
                {transactionType === 'Cash In' ? 'Cheque Received' : 'Cheque Issued'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Party / Contact:</span>
              <span className="font-bold text-slate-900 dark:text-white">{partyName}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Cheque Amount:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                ₹{Number(amount || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Cheque Number:</span>
              <span className="font-semibold">{chequeNumber || 'N/A'}</span>
            </div>
            {chequeBankName && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Bank:</span>
                <span className="font-medium">{chequeBankName}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Cheque Status *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Pending', 'Deposited', 'Cleared', 'Bounced', 'Cancelled'] as ChequeStatus[]).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                    status === st
                      ? st === 'Cleared'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30'
                        : st === 'Bounced'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/30'
                        : 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/30'
                      : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {st === 'Cleared' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {st === 'Bounced' && <Ban className="w-3.5 h-3.5" />}
                  <span>{st}</span>
                </button>
              ))}
            </div>
          </div>

          {status === 'Cleared' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bank Realization / Cleared Date *
              </label>
              <input
                type="date"
                required
                value={clearedDate}
                onChange={(e) => setClearedDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                Marking as "Cleared" will immediately reflect this amount in the available account balance.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Remarks / Clearing Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Cleared via clearing house cycle 2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

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
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/30 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Updating...' : 'Update Status'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
