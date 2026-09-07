import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AccountingPaymentMethod, CashInSourceType, CashBankAccount } from '../../types';

interface RecordCashInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultCashAccount: CashBankAccount = {
  id: 'ACC-CASH',
  name: 'Cash in Hand',
  accountType: 'Cash',
  openingBalance: 0,
  currentBalance: 0,
  status: 'Active',
  isDefault: true,
  createdAt: '2026-01-01',
};

export const RecordCashInModal: React.FC<RecordCashInModalProps> = ({ isOpen, onClose }) => {
  const { accounts, customers, projects, invoices, addCashIn, user } = useApp();

  const availableAccounts = accounts && accounts.length > 0 ? accounts : [defaultCashAccount];

  const [fromWhom, setFromWhom] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [sourceType, setSourceType] = useState<CashInSourceType>('Customer Invoice Payment');
  const [invoiceId, setInvoiceId] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [projectId, setProjectId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<AccountingPaymentMethod>('Bank Transfer');
  const [accountId, setAccountId] = useState(accounts[0]?.id || 'ACC-CASH');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [chequeNumber, setChequeNumber] = useState('');
  const [chequeBankName, setChequeBankName] = useState('');
  const [chequeDate, setChequeDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync accountId when accounts load or change
  useEffect(() => {
    if (accounts && accounts.length > 0) {
      if (!accountId || !accounts.some((a) => a.id === accountId)) {
        setAccountId(accounts[0].id);
      }
    } else {
      setAccountId('ACC-CASH');
    }
  }, [accounts, accountId]);

  if (!isOpen) return null;

  // Auto-fill when customer is selected
  const handleCustomerChange = (cId: string) => {
    setCustomerId(cId);
    const cust = customers.find((c) => c.id === cId);
    if (cust) {
      setFromWhom(cust.name);
      // find active project
      const proj = projects.find((p) => p.customerId === cId);
      if (proj) {
        setProjectId(proj.id);
      }
      // find unpaid invoice
      const inv = invoices.find((i) => i.customerId === cId && i.remainingBalance > 0);
      if (inv) {
        setInvoiceId(inv.id);
        setReferenceNo(inv.invoiceNumber);
        if (!amount) setAmount(inv.remainingBalance);
      }
    }
  };

  const handleInvoiceChange = (invId: string) => {
    setInvoiceId(invId);
    const inv = invoices.find((i) => i.id === invId);
    if (inv) {
      setReferenceNo(inv.invoiceNumber);
      setFromWhom(inv.customerName);
      setCustomerId(inv.customerId);
      if (inv.projectId) setProjectId(inv.projectId);
      setAmount(inv.remainingBalance > 0 ? inv.remainingBalance : inv.grandTotal);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!fromWhom.trim()) {
      alert('Please enter who the money is received from');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedAccount =
        accounts.find((a) => a.id === accountId) ||
        accounts[0] ||
        defaultCashAccount;
      const selectedProject = projects.find((p) => p.id === projectId);
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      await addCashIn({
        date,
        time: nowTime,
        fromWhom: fromWhom.trim(),
        sourceType,
        referenceNo: referenceNo.trim() || `REF-${Date.now()}`,
        customerId: customerId || undefined,
        invoiceId: invoiceId || undefined,
        projectId: projectId || undefined,
        projectName: selectedProject?.projectName,
        paymentMethod,
        accountId: selectedAccount.id,
        accountName: selectedAccount.name,
        amount: Number(amount),
        status: paymentMethod === 'Cheque' ? 'Pending' : 'Confirmed',
        chequeNumber: paymentMethod === 'Cheque' ? chequeNumber : undefined,
        chequeBankName: paymentMethod === 'Cheque' ? chequeBankName : undefined,
        chequeDate: paymentMethod === 'Cheque' ? chequeDate : undefined,
        chequeStatus: paymentMethod === 'Cheque' ? 'Pending' : undefined,
        notes: notes.trim(),
        createdBy: user?.displayName || 'Accounts Staff',
        sourceModule: 'manual',
        debitAccount: selectedAccount.name,
        creditAccount: fromWhom.trim(),
      });

      onClose();
    } catch (err) {
      console.error('Error recording Cash In:', err);
      alert('Failed to record Cash In. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Record Cash In (Money Receipt)</h3>
              <p className="text-xs text-emerald-100">Money entering the company bank or cash register</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Transaction Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Source Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Receipt Category / Source *
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as CashInSourceType)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Customer Invoice Payment">Customer Invoice Payment</option>
                <option value="Advance from Customer">Advance from Customer</option>
                <option value="Direct Sales Receipt">Direct Sales Receipt</option>
                <option value="Government Subsidy Receipt">Government Subsidy Receipt</option>
                <option value="Solar Subsidy Disbursal">Solar Subsidy Disbursal</option>
                <option value="Capital Infusion">Capital Infusion (Director / Partner)</option>
                <option value="Bank Loan Disbursal">Bank Loan Disbursal</option>
                <option value="Scrap Sale / Asset Sale">Scrap Sale / Asset Sale</option>
                <option value="Interest Received">Interest Received</option>
                <option value="Supplier Refund">Supplier Refund</option>
                <option value="Other Receipts">Other Receipts</option>
              </select>
            </div>

            {/* Optional Customer Link */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Customer (Optional)
              </label>
              <select
                value={customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.mobile || c.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Received From Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Received From (Person / Entity) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Patel, MNRE Subsidy, etc."
                value={fromWhom}
                onChange={(e) => setFromWhom(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Optional Invoice Link */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Link to Invoice (Optional)
              </label>
              <select
                value={invoiceId}
                onChange={(e) => handleInvoiceChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">-- No specific invoice --</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} - {inv.customerName} (₹{inv.remainingBalance} due)
                  </option>
                ))}
              </select>
            </div>

            {/* Reference / Receipt # */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reference / Receipt / UTR #
              </label>
              <input
                type="text"
                placeholder="e.g. UTR12345678, RCT-001"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Optional Project Tag */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Link to Project (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="">-- No project link --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName} ({p.capacityKW}kW - {p.customerName})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount Received (₹) *
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
                  className="w-full pl-8 pr-3 py-2 text-base font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Deposited To Account */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deposit Into Account *
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
              >
                {availableAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.accountType}) {acc.accountNumber ? `••••${acc.accountNumber.slice(-4)}` : ''}
                  </option>
                ))}
              </select>
              {(!accounts || accounts.length === 0) && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                  Primary Cash in Hand register. Additional bank accounts can be added under Accounting &gt; Accounts.
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as AccountingPaymentMethod)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque (Clearing Desk)</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Direct Deposit">Direct Deposit</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Cheque Specific Fields */}
          {paymentMethod === 'Cheque' && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4" />
                <span>Cheque Clearing Tracker Information</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Cheques will be marked as "Pending" and can be cleared in the Cheque Clearing Desk to reflect in available balance.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Cheque Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 000452"
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Drawee Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. State Bank of India"
                    value={chequeBankName}
                    onChange={(e) => setChequeBankName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Cheque Date</label>
                  <input
                    type="date"
                    value={chequeDate}
                    onChange={(e) => setChequeDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Remarks / Narration / Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 2nd Milestone payment for 10kW On-Grid Rooftop project"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
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
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording...' : 'Confirm Cash In Entry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
