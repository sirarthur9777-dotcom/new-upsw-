import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AccountingPaymentMethod, CashOutCategory, CashBankAccount } from '../../types';

interface RecordCashOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: CashOutCategory;
  defaultPaidTo?: string;
  defaultAmount?: number;
  defaultReferenceNo?: string;
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

export const RecordCashOutModal: React.FC<RecordCashOutModalProps> = ({
  isOpen,
  onClose,
  defaultCategory,
  defaultPaidTo,
  defaultAmount,
  defaultReferenceNo,
}) => {
  const {
    accounts,
    distributors,
    purchases,
    employees,
    projects,
    addCashOut,
    getAccountCalculatedBalance,
    user,
  } = useApp();

  const availableAccounts = accounts && accounts.length > 0 ? accounts : [defaultCashAccount];

  const [paidTo, setPaidTo] = useState(defaultPaidTo || '');
  const [category, setCategory] = useState<CashOutCategory>(defaultCategory || 'Purchase Bill Payment');
  const [reason, setReason] = useState('');
  const [referenceNo, setReferenceNo] = useState(defaultReferenceNo || '');
  const [distributorId, setDistributorId] = useState('');
  const [purchaseId, setPurchaseId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [amount, setAmount] = useState<number | ''>(defaultAmount || '');
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

  const currentAccBalance = getAccountCalculatedBalance(accountId) || 0;
  const isBalanceLow = typeof amount === 'number' && amount > currentAccBalance;

  // Handle Distributor select
  const handleDistributorChange = (dId: string) => {
    setDistributorId(dId);
    const dist = distributors.find((d) => d.id === dId);
    if (dist) {
      setPaidTo(dist.companyName);
      setCategory('Purchase Bill Payment');
      const unpaidPur = purchases.find((p) => p.distributorId === dId && p.dueAmount > 0);
      if (unpaidPur) {
        setPurchaseId(unpaidPur.id);
        setReferenceNo(unpaidPur.invoiceNumber || unpaidPur.id);
        if (!amount) setAmount(unpaidPur.dueAmount);
      }
    }
  };

  // Handle Employee select
  const handleEmployeeChange = (eId: string) => {
    setEmployeeId(eId);
    const emp = employees.find((e) => e.id === eId);
    if (emp) {
      setPaidTo(emp.name);
      setCategory('Salary & Wages');
      setReason(`Salary disbarment for ${emp.name} (${emp.designation})`);
      setReferenceNo(`SAL-${emp.code}-${new Date().toISOString().slice(0, 7)}`);
      if (!amount) setAmount(emp.salary);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!paidTo.trim()) {
      alert('Please specify who the money was paid to');
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

      await addCashOut({
        date,
        time: nowTime,
        paidTo: paidTo.trim(),
        category,
        reason: reason.trim() || category,
        referenceNo: referenceNo.trim() || `VOUCH-${Date.now()}`,
        distributorId: distributorId || undefined,
        purchaseId: purchaseId || undefined,
        employeeId: employeeId || undefined,
        projectId: projectId || undefined,
        projectName: selectedProject?.projectName,
        paymentMethod,
        accountId: selectedAccount.id,
        accountName: selectedAccount.name,
        amount: Number(amount),
        status: paymentMethod === 'Cheque' ? 'Pending' : 'Paid',
        chequeNumber: paymentMethod === 'Cheque' ? chequeNumber : undefined,
        chequeBankName: paymentMethod === 'Cheque' ? chequeBankName : undefined,
        chequeDate: paymentMethod === 'Cheque' ? chequeDate : undefined,
        chequeStatus: paymentMethod === 'Cheque' ? 'Pending' : undefined,
        notes: notes.trim(),
        createdBy: user?.displayName || 'Accounts Staff',
        sourceModule: 'manual',
        debitAccount: `${category} / ${paidTo.trim()}`,
        creditAccount: selectedAccount.name,
      });

      onClose();
    } catch (err) {
      console.error('Error recording Cash Out:', err);
      alert('Failed to record Cash Out. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Record Cash Out (Expense / Payment)</h3>
              <p className="text-xs text-rose-100">Money departing company bank accounts or cash register</p>
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
                Payment Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CashOutCategory)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              >
                <option value="Purchase Bill Payment">Purchase Bill Payment (Material Procurement)</option>
                <option value="Supplier Advance">Supplier Advance Payment</option>
                <option value="Salary & Wages">Salary & Employee Wages</option>
                <option value="Labour Payment">Labour / Site Installation Contractors</option>
                <option value="Transport Payment">Freight & Transport Charges</option>
                <option value="GST Payment">GST Challan Settlement (Tax Dept)</option>
                <option value="Tax Payment">TDS / Income Tax Payment</option>
                <option value="Office Rent">Office & Godown Rent</option>
                <option value="Electricity Bill">Electricity & Utility Bills</option>
                <option value="Equipment Rental">Equipment Rental / Crane / Machinery</option>
                <option value="Fuel Expense">Fuel & Travel Expenses</option>
                <option value="Tea & Refreshments">Tea, Snacks & Staff Welfare</option>
                <option value="Printing & Stationery">Printing & Stationery</option>
                <option value="Advertising / Marketing">Advertising / Marketing / Leads</option>
                <option value="Loan Repayment">Bank Loan / EMI Repayment</option>
                <option value="Bank Charges">Bank Processing & Transaction Charges</option>
                <option value="Refund to Customer">Customer Refund</option>
                <option value="Other Payments">Other Payments</option>
              </select>
            </div>

            {/* Quick Distributor picker */}
            {category.includes('Purchase') || category.includes('Supplier') ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Supplier / Distributor
                </label>
                <select
                  value={distributorId}
                  onChange={(e) => handleDistributorChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                >
                  <option value="">-- Choose Supplier --</option>
                  {distributors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.companyName} (Due: ₹{d.outstandingAmount || 0})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {/* Quick Employee picker */}
            {category.includes('Salary') ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Employee
                </label>
                <select
                  value={employeeId}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.code} - ₹{emp.salary}/mo)
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {/* Paid To Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Paid To (Vendor / Person / Authority) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Adani Solar, Driver Rajesh, Landlord, GST Portal"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>

            {/* Bill / Voucher / Ref # */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bill / Voucher / Invoice Ref #
              </label>
              <input
                type="text"
                placeholder="e.g. PUR-2026-0012, BILL-9821, CHAL-55"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>

            {/* Optional Project Tag */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Allocate to Project / Site (Optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              >
                <option value="">-- No project allocation --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName} ({p.capacityKW}kW - {p.customerName})
                  </option>
                ))}
              </select>
            </div>

            {/* Paid From Account */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Deduct From Account *
                </label>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Avail: ₹{currentAccBalance.toLocaleString('en-IN')}
                </span>
              </div>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none font-semibold"
              >
                {availableAccounts.map((acc) => {
                  const bal = getAccountCalculatedBalance(acc.id);
                  return (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.accountType}) — Bal: ₹{bal.toLocaleString('en-IN')}
                    </option>
                  );
                })}
              </select>
              {(!accounts || accounts.length === 0) && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                  Primary Cash in Hand register. Additional bank accounts can be added under Accounting &gt; Accounts.
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount Paid (₹) *
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
                  className="w-full pl-8 pr-3 py-2 text-base font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
              {isBalanceLow && (
                <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Warning: Amount exceeds calculated available balance (₹{currentAccBalance.toLocaleString('en-IN')})
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
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque Issued</option>
                <option value="Credit Card">Corporate Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Cheque Specific Fields */}
          {paymentMethod === 'Cheque' && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-4 h-4" />
                <span>Cheque Issued Tracking Details</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                The cheque will be placed in the Cheque Book / Clearing Desk until it is cleared by the bank.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Cheque Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 001924"
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Issuing Bank</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank"
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

          {/* Reason & Notes */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Purpose / Particulars
              </label>
              <input
                type="text"
                placeholder="e.g. Payment for 20kW Solar Inverter shipment or Site labour work"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Internal Remarks / Narration
              </label>
              <textarea
                rows={2}
                placeholder="Additional details for audit trail..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>
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
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording...' : 'Confirm Cash Out Entry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
