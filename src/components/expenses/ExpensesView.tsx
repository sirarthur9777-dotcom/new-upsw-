import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Trash2,
  Search,
  Receipt,
  PieChart as PieIcon,
  X,
  TrendingDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExpenseCategory, PaymentMode } from '../../types';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, deleteExpense } = useApp();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState('Diesel Fuel for Site Pickup Van');
  const [category, setCategory] = useState<ExpenseCategory>('Fuel');
  const [amount, setAmount] = useState<number>(2400);
  const [paidTo, setPaidTo] = useState('Indian Oil Station');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMode>('UPI');
  const [notes, setNotes] = useState('Trip to installation site PRJ-2026-001');

  const categories: ExpenseCategory[] = [
    'Fuel',
    'Transport',
    'Labour',
    'Material Purchase',
    'Office Expense',
    'Electricity',
    'Salary',
    'Miscellaneous',
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      title,
      category,
      amount,
      date: new Date().toISOString().split('T')[0],
      paidTo,
      paymentMethod,
      notes,
    });
    setModalOpen(false);
  };

  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

  const filteredExpenses = expenses.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.paidTo.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#24372D] dark:text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#DCEBE0] text-[#25845A]">
              <Receipt className="w-5 h-5" />
            </span>
            <span>Business Expense Tracker</span>
          </h2>
          <p className="text-xs text-[#68786E] dark:text-[#8E9F94] mt-1 font-medium">
            Record fuel, site transport, daily wages, material purchases & operational overheads
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25845A] hover:bg-[#1D7049] text-white font-bold text-xs transition shadow-[0_4px_12px_rgba(37,132,90,0.25)] border border-[#1D7049] active:translate-y-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Log Expense</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] space-y-1">
          <p className="text-xs font-bold text-[#87938B] dark:text-[#6B7C72] uppercase tracking-wider">Total Logged Expense</p>
          <p className="text-2xl font-black text-[#D83B3B] tabular-nums">₹{totalExpense.toLocaleString()}</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] space-y-1">
          <p className="text-xs font-bold text-[#87938B] dark:text-[#6B7C72] uppercase tracking-wider">Fuel & Transport</p>
          <p className="text-2xl font-black text-[#24372D] dark:text-white tabular-nums">
            ₹
            {expenses
              .filter((e) => e.category === 'Fuel' || e.category === 'Transport')
              .reduce((a, b) => a + b.amount, 0)
              .toLocaleString()}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] space-y-1">
          <p className="text-xs font-bold text-[#87938B] dark:text-[#6B7C72] uppercase tracking-wider">Site Labour & Wages</p>
          <p className="text-2xl font-black text-[#24372D] dark:text-white tabular-nums">
            ₹
            {expenses
              .filter((e) => e.category === 'Labour')
              .reduce((a, b) => a + b.amount, 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#25845A] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, category, recipient..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] placeholder-[#87938B] text-xs focus:outline-none focus:border-[#25845A]"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F1F5F1] dark:bg-[#152019] text-[#68786E] dark:text-[#8E9F94] font-bold uppercase tracking-wider border-b border-[#D9E2DA] dark:border-[#223328]">
                <th className="p-4">Expense Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Paid To</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2DA] dark:divide-[#223328] text-[#24372D] dark:text-[#E6EEE8]">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#87938B]">
                    <Receipt className="w-10 h-10 mx-auto text-[#87938B]/40 mb-2" />
                    <p className="font-bold">No expenses logged</p>
                    <p className="text-[11px] mt-0.5">Click "+ Log Expense" to add operational costs.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#F8FAF8] dark:hover:bg-[#202E25]/50 transition">
                    <td className="p-4">
                      <p className="font-bold text-[#24372D] dark:text-white">{exp.title}</p>
                      <p className="text-[10px] text-[#68786E] dark:text-[#8E9F94]">{exp.notes}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-lg bg-[#DCEBE0] text-[#25845A]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-4 font-black text-[#D83B3B] text-sm tabular-nums">
                      ₹{exp.amount.toLocaleString()}
                    </td>
                    <td className="p-4 font-semibold text-[#24372D] dark:text-[#E6EEE8]">{exp.paidTo}</td>
                    <td className="p-4 text-[#68786E] dark:text-[#8E9F94] font-semibold">{exp.paymentMethod}</td>
                    <td className="p-4 text-[#87938B]">{exp.date}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete expense "${exp.title}"?`)) deleteExpense(exp.id);
                        }}
                        className="p-1.5 rounded-xl text-[#87938B] hover:text-[#D83B3B] bg-[#FFFFFF] dark:bg-[#1A261F] border border-[#D9E2DA] dark:border-[#223328] shadow-[1px_1px_3px_rgba(36,55,45,0.06),-1px_-1px_3px_rgba(255,255,255,0.85)] transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOG EXPENSE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24372D]/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#1B2720] rounded-2xl shadow-[0_10px_35px_rgba(36,55,45,0.2)] border border-[#D9E2DA] dark:border-[#223328] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D9E2DA] dark:border-[#223328]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#DCEBE0] text-[#25845A]">
                  <Receipt className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-[#24372D] dark:text-white text-base">Log Business Expense</h3>
              </div>
              <button 
                onClick={() => setModalOpen(false)} 
                className="p-1.5 rounded-xl text-[#87938B] hover:text-[#24372D] dark:hover:text-white bg-[#F1F5F1] dark:bg-[#121A15] border border-[#D9E2DA] dark:border-[#223328]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1 text-[#24372D] dark:text-[#E6EEE8]">
                  Expense Description *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-[#24372D] dark:text-[#E6EEE8]">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#24372D] dark:text-[#E6EEE8]">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] font-black text-[#D83B3B] text-sm outline-none focus:border-[#25845A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-[#24372D] dark:text-[#E6EEE8]">
                    Paid To (Vendor/Person)
                  </label>
                  <input
                    type="text"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A]"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#24372D] dark:text-[#E6EEE8]">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMode)}
                    className="w-full p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A]"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-[#24372D] dark:text-[#E6EEE8]">
                  Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] text-[#24372D] dark:text-[#E6EEE8] outline-none focus:border-[#25845A]"
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
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
