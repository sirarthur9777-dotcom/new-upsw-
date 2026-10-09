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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#E9EEE9] dark:bg-[#1C2620] rounded-3xl shadow-[10px_10px_30px_rgba(175,188,177,0.7),-10px_-10px_30px_rgba(255,255,255,0.9)] dark:shadow-[8px_8px_24px_rgba(0,0,0,0.6)] border border-[#D5DDD6]/80 dark:border-[#2C3E33]/80 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#D5DDD6] dark:border-[#2C3E33] bg-[#E1E8E1]/50 dark:bg-[#151D18]/50">
          <Search className="w-5 h-5 text-[#25845A] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by customer name, mobile, invoice #, project ID, barcode..."
            className="w-full bg-transparent text-sm text-[#26372D] dark:text-[#E5ECE7] font-medium placeholder-[#728078] dark:placeholder-[#98A79D] focus:outline-none"
          />
          <button
            onClick={() => setGlobalSearchOpen(false)}
            className="p-1.5 rounded-xl text-[#728078] hover:text-[#26372D] dark:hover:text-[#E5ECE7] bg-[#E9EEE9] dark:bg-[#151D18] shadow-[2px_2px_5px_rgba(175,188,177,0.4),-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.4)] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!q && (
            <div className="text-center py-10 text-xs text-[#728078] dark:text-[#98A79D]">
              Type anything to search across Customers, Invoices, Solar Projects, and Stock.
            </div>
          )}

          {q && !hasResults && (
            <div className="text-center py-10 text-xs text-[#728078] dark:text-[#98A79D]">
              No matching records found for "{query}".
            </div>
          )}

          {matchedCustomers.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-[#25845A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Customers ({matchedCustomers.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchedCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveTab('customers');
                      setGlobalSearchOpen(false);
                    }}
                    className="p-3 rounded-2xl bg-[#E9EEE9] dark:bg-[#151D18] hover:bg-[#dfe6e0] dark:hover:bg-[#202E25] shadow-[2px_2px_6px_rgba(175,188,177,0.35),-2px_-2px_6px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.3)] border border-[#D5DDD6]/70 dark:border-[#2C3E33]/70 cursor-pointer flex items-center justify-between transition"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#26372D] dark:text-[#E5ECE7]">{c.name}</p>
                      <p className="text-[11px] text-[#728078] dark:text-[#98A79D] font-medium">
                        📱 {c.mobile} | 📍 {c.district}, {c.state}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#25845A]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedInvoices.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Invoices ({matchedInvoices.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchedInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      setActiveTab('billing');
                      setGlobalSearchOpen(false);
                    }}
                    className="p-3 rounded-2xl bg-[#E9EEE9] dark:bg-[#151D18] hover:bg-[#dfe6e0] dark:hover:bg-[#202E25] shadow-[2px_2px_6px_rgba(175,188,177,0.35),-2px_-2px_6px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.3)] border border-[#D5DDD6]/70 dark:border-[#2C3E33]/70 cursor-pointer flex items-center justify-between transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#25845A]">{inv.invoiceNumber}</span>
                        <span className="text-xs font-bold text-[#26372D] dark:text-[#E5ECE7]">
                          {inv.customerName}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#728078] dark:text-[#98A79D] font-medium">
                        Grand Total: ₹{inv.grandTotal.toLocaleString()} | Status: {inv.paymentStatus}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#25845A]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedProjects.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-[#25845A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" />
                <span>Solar Projects ({matchedProjects.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchedProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActiveTab('projects');
                      setGlobalSearchOpen(false);
                    }}
                    className="p-3 rounded-2xl bg-[#E9EEE9] dark:bg-[#151D18] hover:bg-[#dfe6e0] dark:hover:bg-[#202E25] shadow-[2px_2px_6px_rgba(175,188,177,0.35),-2px_-2px_6px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.3)] border border-[#D5DDD6]/70 dark:border-[#2C3E33]/70 cursor-pointer flex items-center justify-between transition"
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-[#25845A]">{p.projectId}</span>
                      <p className="text-xs font-bold text-[#26372D] dark:text-[#E5ECE7]">
                        {p.customerName} ({p.capacityKW} KW {p.systemType})
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#25845A]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedInventory.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                <span>Stock Items ({matchedInventory.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchedInventory.map((i) => (
                  <div
                    key={i.id}
                    onClick={() => {
                      setActiveTab('inventory');
                      setGlobalSearchOpen(false);
                    }}
                    className="p-3 rounded-2xl bg-[#E9EEE9] dark:bg-[#151D18] hover:bg-[#dfe6e0] dark:hover:bg-[#202E25] shadow-[2px_2px_6px_rgba(175,188,177,0.35),-2px_-2px_6px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.3)] border border-[#D5DDD6]/70 dark:border-[#2C3E33]/70 cursor-pointer flex items-center justify-between transition"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#26372D] dark:text-[#E5ECE7]">{i.name}</p>
                      <p className="text-[11px] text-[#728078] dark:text-[#98A79D] font-medium">
                        Stock: {i.currentStock} {i.unit} | Price: ₹{i.unitPrice} | Barcode: {i.barcode}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#25845A]" />
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
