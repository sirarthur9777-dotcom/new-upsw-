import React, { useState } from 'react';
import { Search, X, User, FileText, Sun, Package, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GlobalSearchModal: React.FC = () => {
  const {
    globalSearchOpen,
    setGlobalSearchOpen,
    customers,
    invoices,
    projects,
    inventory,
    setActiveTab,
  } = useApp();

  const [query, setQuery] = useState('');

  if (!globalSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedCustomers = q
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.mobile.includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q)
      )
    : [];

  const matchedInvoices = q
    ? invoices.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q) ||
          inv.customerMobile.includes(q)
      )
    : [];

  const matchedProjects = q
    ? projects.filter(
        (p) =>
          p.projectId.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      )
    : [];

  const matchedInventory = q
    ? inventory.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.brand.toLowerCase().includes(q) ||
          i.barcode.includes(q)
      )
    : [];

  const hasResults =
    matchedCustomers.length > 0 ||
    matchedInvoices.length > 0 ||
    matchedProjects.length > 0 ||
    matchedInventory.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-amber-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by customer name, mobile, invoice #, project ID, barcode..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={() => setGlobalSearchOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!q && (
            <div className="text-center py-10 text-xs text-slate-400">
              Type anything to search across Customers, Invoices, Solar Projects, and Stock.
            </div>
          )}

          {q && !hasResults && (
            <div className="text-center py-10 text-xs text-slate-400">
              No matching records found for "{query}".
            </div>
          )}

          {matchedCustomers.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Customers ({matchedCustomers.length})</span>
              </div>
              <div className="space-y-1">
                {matchedCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveTab('customers');
                      setGlobalSearchOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-500/10 dark:hover:bg-amber-500/10 border border-slate-100 dark:border-slate-800 cursor-pointer flex items-center justify-between transition"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{c.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        📱 {c.mobile} | 📍 {c.district}, {c.state}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedInvoices.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Invoices ({matchedInvoices.length})</span>
              </div>
              <div className="space-y-1">
                {matchedInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      setActiveTab('billing');
                      setGlobalSearchOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-500/10 border border-slate-100 dark:border-slate-800 cursor-pointer flex items-center justify-between transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-500">{inv.invoiceNumber}</span>
                        <span className="text-xs font-medium text-slate-900 dark:text-white">
                          {inv.customerName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Grand Total: ₹{inv.grandTotal.toLocaleString()} | Status: {inv.paymentStatus}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedProjects.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" />
                <span>Solar Projects ({matchedProjects.length})</span>
              </div>
              <div className="space-y-1">
                {matchedProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActiveTab('projects');
                      setGlobalSearchOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-500/10 border border-slate-100 dark:border-slate-800 cursor-pointer flex items-center justify-between transition"
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-500">{p.projectId}</span>
                      <p className="text-xs font-medium text-slate-900 dark:text-white">
                        {p.customerName} ({p.capacityKW} KW {p.systemType})
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedInventory.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-cyan-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                <span>Stock Items ({matchedInventory.length})</span>
              </div>
              <div className="space-y-1">
                {matchedInventory.map((i) => (
                  <div
                    key={i.id}
                    onClick={() => {
                      setActiveTab('inventory');
                      setGlobalSearchOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-cyan-500/10 border border-slate-100 dark:border-slate-800 cursor-pointer flex items-center justify-between transition"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{i.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Stock: {i.currentStock} {i.unit} | Price: ₹{i.unitPrice} | Barcode: {i.barcode}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
