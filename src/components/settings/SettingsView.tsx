import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Database,
  Upload,
  Download,
  Moon,
  Sun,
  Shield,
  Palette,
  Save,
  QrCode,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { initialCompanySettings } from '../../data/mockData';
import { ThemeAccent, ThemeStyle } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    companySettings,
    updateCompanySettings,
    isDarkMode,
    toggleDarkMode,
    themeAccent,
    setThemeAccent,
    themeStyle,
    setThemeStyle,
    exportDatabaseJSON,
    importDatabaseJSON,
  } = useApp();

  const [formState, setFormState] = useState({ ...companySettings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(formState);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetToDefault = () => {
    setFormState({ ...initialCompanySettings });
    updateCompanySettings(initialCompanySettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDatabaseJSON(content);
        if (ok) {
          alert('Database restored successfully from backup file!');
        } else {
          alert('Failed to import JSON file. Please check file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: 'logoUrl' | 'upiQrUrl' | 'signatureUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        setFormState((prev) => ({ ...prev, [fieldKey]: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const generateUpiQr = () => {
    if (!formState.upiId) {
      alert('Please enter a valid UPI VPA ID first (e.g. solarix@hdfcbank).');
      return;
    }
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(
      formState.upiId
    )}&pn=${encodeURIComponent(formState.companyName || 'Solarix Energy')}`;
    setFormState((prev) => ({ ...prev, upiQrUrl: qrUrl }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#26372D] dark:text-[#E5ECE7] tracking-tight">ERP System Settings & Profile</h2>
          <p className="text-xs text-[#728078] dark:text-[#98A79D] font-medium">
            Configure company GSTIN, bank details for A4 invoice printouts, theme styling & backup databases
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 rounded-xl bg-[#E9EEE9] dark:bg-[#1C2620] hover:bg-[#dfe6e0] dark:hover:bg-[#233028] text-[#26372D] dark:text-[#E5ECE7] font-bold text-xs transition shadow-[3px_3px_8px_rgba(175,188,177,0.45),-3px_-3px_8px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.4),-2px_-2px_5px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/70 dark:border-[#2C3E33]/70 active:shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.7)]"
          >
            Reset to Upadhyay Brother Profile
          </button>

          {savedSuccess && (
            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-2 border border-emerald-500/30 shadow-[inset_1px_1px_3px_rgba(16,185,129,0.2)]">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Saved!</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Company Profile Section */}
        <div className="p-6 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[4px_4px_10px_rgba(175,188,177,0.45),-4px_-4px_10px_rgba(255,255,255,0.75)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.4),-2px_-2px_6px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/70 dark:border-[#2C3E33]/70 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D5DDD6] dark:border-[#2C3E33] pb-3">
            <Building2 className="w-5 h-5 text-[#25845A]" />
            <h3 className="font-black text-[#26372D] dark:text-[#E5ECE7] text-base">Company Letterhead & GST Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#728078] dark:text-[#98A79D] mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={formState.companyName}
                onChange={(e) => setFormState({ ...formState, companyName: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/80 dark:border-[#2C3E33] font-black text-[#26372D] dark:text-[#E5ECE7] focus:outline-none focus:border-[#25845A]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#728078] dark:text-[#98A79D] mb-1">Company Tagline / Subtitle</label>
              <input
                type="text"
                value={formState.tagline}
                onChange={(e) => setFormState({ ...formState, tagline: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/80 dark:border-[#2C3E33] text-[#26372D] dark:text-[#E5ECE7] focus:outline-none focus:border-[#25845A]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#728078] dark:text-[#98A79D] mb-1">GSTIN Number *</label>
              <input
                type="text"
                required
                value={formState.gstNumber}
                onChange={(e) => setFormState({ ...formState, gstNumber: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/80 dark:border-[#2C3E33] font-mono text-[#25845A] font-bold focus:outline-none focus:border-[#25845A]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#728078] dark:text-[#98A79D] mb-1">Company PAN Number</label>
              <input
                type="text"
                value={formState.panNumber || ''}
                onChange={(e) => setFormState({ ...formState, panNumber: e.target.value })}
                placeholder="e.g. AEIPU6555N"
                className="w-full p-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/80 dark:border-[#2C3E33] font-mono font-bold uppercase text-[#26372D] dark:text-[#E5ECE7] focus:outline-none focus:border-[#25845A]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#728078] dark:text-[#98A79D] mb-1">State & State Code</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="State Name (e.g. Uttar Pradesh)"
                  value={formState.state || ''}
                  onChange={(e) => setFormState({ ...formState, state: e.target.value })}
                  className="col-span-2 p-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/80 dark:border-[#2C3E33] text-[#26372D] dark:text-[#E5ECE7] focus:outline-none focus:border-[#25845A]"
                />
                <input
                  type="text"
                  placeholder="Code (09)"
                  value={formState.stateCode || ''}
                  onChange={(e) => setFormState({ ...formState, stateCode: e.target.value })}
                  className="col-span-1 p-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/80 dark:border-[#2C3E33] font-mono text-center font-bold text-[#26372D] dark:text-[#E5ECE7] focus:outline-none focus:border-[#25845A]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#728078] dark:text-[#98A79D] mb-1">Official Phone Number</label>
              <input
                type="text"
                value={formState.phone}
                onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/80 dark:border-[#2C3E33] text-[#26372D] dark:text-[#E5ECE7] focus:outline-none focus:border-[#25845A]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#728078] dark:text-[#98A79D] mb-1">Email Address</label>
              <input
                type="email"
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/80 dark:border-[#2C3E33] text-[#26372D] dark:text-[#E5ECE7] focus:outline-none focus:border-[#25845A]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#728078] dark:text-[#98A79D] mb-1">Invoice Number Prefix</label>
              <input
                type="text"
                value={formState.invoicePrefix}
                onChange={(e) => setFormState({ ...formState, invoicePrefix: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/80 dark:border-[#2C3E33] font-mono text-[#26372D] dark:text-[#E5ECE7] focus:outline-none focus:border-[#25845A]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-[#728078] dark:text-[#98A79D] mb-1">Full Office Address</label>
              <input
                type="text"
                value={formState.address}
                onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/80 dark:border-[#2C3E33] text-[#26372D] dark:text-[#E5ECE7] focus:outline-none focus:border-[#25845A]"
              />
            </div>
          </div>
        </div>

        {/* Bank & Payment Details for Printed Invoices */}
        <div className="p-6 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[4px_4px_10px_rgba(175,188,177,0.45),-4px_-4px_10px_rgba(255,255,255,0.75)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.4),-2px_-2px_6px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/70 dark:border-[#2C3E33]/70 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D5DDD6] dark:border-[#2C3E33] pb-3">
            <QrCode className="w-5 h-5 text-[#25845A]" />
            <h3 className="font-black text-[#26372D] dark:text-[#E5ECE7] text-base">Bank Account & Payment Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#728078] dark:text-[#98A79D] mb-1">Bank Name</label>
              <input
                type="text"
                value={formState.bankName}
                onChange={(e) => setFormState({ ...formState, bankName: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/80 dark:border-[#2C3E33] text-[#26372D] dark:text-[#E5ECE7] focus:outline-none focus:border-[#25845A]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#728078] dark:text-[#98A79D] mb-1">Account Holder Name</label>
              <input
                type="text"
                placeholder="e.g. Upadhyay Brother Solar Works"
                value={formState.accountHolderName || ''}
                onChange={(e) => setFormState({ ...formState, accountHolderName: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/80 dark:border-[#2C3E33] font-bold text-[#26372D] dark:text-[#E5ECE7] focus:outline-none focus:border-[#25845A]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#728078] dark:text-[#98A79D] mb-1">Account Number</label>
              <input
                type="text"
                value={formState.accountNumber}
                onChange={(e) => setFormState({ ...formState, accountNumber: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/80 dark:border-[#2C3E33] font-mono text-[#26372D] dark:text-[#E5ECE7] focus:outline-none focus:border-[#25845A]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#728078] dark:text-[#98A79D] mb-1">IFSC Code</label>
              <input
                type="text"
                value={formState.ifscCode}
                onChange={(e) => setFormState({ ...formState, ifscCode: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/80 dark:border-[#2C3E33] font-mono text-[#26372D] dark:text-[#E5ECE7] focus:outline-none focus:border-[#25845A]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#728078] dark:text-[#98A79D] mb-1">Bank Branch</label>
              <input
                type="text"
                value={formState.bankBranch || ''}
                onChange={(e) => setFormState({ ...formState, bankBranch: e.target.value })}
                placeholder="e.g. Jaunpur Main Branch"
                className="w-full p-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/80 dark:border-[#2C3E33] text-[#26372D] dark:text-[#E5ECE7] focus:outline-none focus:border-[#25845A]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#728078] dark:text-[#98A79D] mb-1">UPI VPA ID</label>
              <input
                type="text"
                value={formState.upiId}
                onChange={(e) => setFormState({ ...formState, upiId: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/80 dark:border-[#2C3E33] font-mono text-[#26372D] dark:text-[#E5ECE7] focus:outline-none focus:border-[#25845A]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-[#728078] dark:text-[#98A79D] mb-1">Standard Invoice Terms & Conditions</label>
              <textarea
                rows={3}
                value={formState.termsAndConditions || ''}
                onChange={(e) => setFormState({ ...formState, termsAndConditions: e.target.value })}
                placeholder="Enter standard terms (one per line)..."
                className="w-full p-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-1px_-1px_3px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/80 dark:border-[#2C3E33] text-xs leading-relaxed text-[#26372D] dark:text-[#E5ECE7] focus:outline-none focus:border-[#25845A]"
              />
            </div>
          </div>
        </div>

        {/* Company Logo, Payment QR Code & Digital Signature */}
        <div className="p-6 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[4px_4px_10px_rgba(175,188,177,0.45),-4px_-4px_10px_rgba(255,255,255,0.75)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.4),-2px_-2px_6px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/70 dark:border-[#2C3E33]/70 space-y-6">
          <div className="flex items-center gap-2 border-b border-[#D5DDD6] dark:border-[#2C3E33] pb-3">
            <Building2 className="w-5 h-5 text-[#25845A]" />
            <h3 className="font-black text-[#26372D] dark:text-[#E5ECE7] text-base">
              Invoice Media, Payment QR Code & Digital Sign
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Company Logo */}
            <div className="p-4 rounded-xl bg-[#E9EEE9] dark:bg-[#18221B] shadow-[2px_2px_6px_rgba(175,188,177,0.35),-2px_-2px_6px_rgba(255,255,255,0.6)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.3),-1px_-1px_4px_rgba(255,255,255,0.03)] border border-[#D5DDD6]/70 dark:border-[#2C3E33]/70 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#26372D] dark:text-[#E5ECE7] text-xs">Company Logo</label>
                <span className="text-[10px] text-[#728078] dark:text-[#98A79D]">Header of A4 Invoice</span>
              </div>

              <div className="w-full h-28 bg-[#DFE6E0] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.6)] rounded-xl border border-dashed border-[#B8C4BA] dark:border-[#2C3E33] flex items-center justify-center p-2 overflow-hidden relative">
                {formState.logoUrl ? (
                  <img
                    src={formState.logoUrl}
                    alt="Company Logo Preview"
                    className="max-h-24 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-[#728078] dark:text-[#98A79D] text-xs italic">No logo image set</span>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Logo Image URL..."
                  value={formState.logoUrl}
                  onChange={(e) => setFormState({ ...formState, logoUrl: e.target.value })}
                  className="w-full p-2 rounded-lg bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_1px_1px_3px_rgba(175,188,177,0.5),inset_-1px_-1px_3px_rgba(255,255,255,0.7)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.4)] border border-[#D5DDD6] dark:border-[#2C3E33] text-[11px] text-[#26372D] dark:text-[#E5ECE7] focus:outline-none"
                />
                <label className="w-full py-1.5 px-3 rounded-lg bg-[#E9EEE9] dark:bg-[#233028] hover:bg-[#dfe6e0] text-[#26372D] dark:text-[#E5ECE7] font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition shadow-[2px_2px_5px_rgba(175,188,177,0.4),-2px_-2px_5px_rgba(255,255,255,0.6)] active:shadow-[inset_1px_1px_3px_rgba(175,188,177,0.5)]">
                  <Upload className="w-3.5 h-3.5 text-[#25845A]" />
                  <span>Upload Custom Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'logoUrl')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* 2. Payment UPI QR Code */}
            <div className="p-4 rounded-xl bg-[#E9EEE9] dark:bg-[#18221B] shadow-[2px_2px_6px_rgba(175,188,177,0.35),-2px_-2px_6px_rgba(255,255,255,0.6)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.3),-1px_-1px_4px_rgba(255,255,255,0.03)] border border-[#D5DDD6]/70 dark:border-[#2C3E33]/70 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#26372D] dark:text-[#E5ECE7] text-xs">UPI Payment QR Code</label>
                <span className="text-[10px] text-[#728078] dark:text-[#98A79D]">Printed on Invoice</span>
              </div>

              <div className="w-full h-28 bg-[#DFE6E0] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.6)] rounded-xl border border-dashed border-[#B8C4BA] dark:border-[#2C3E33] flex items-center justify-center p-2 overflow-hidden relative">
                {formState.upiQrUrl ? (
                  <img
                    src={formState.upiQrUrl}
                    alt="Payment QR Preview"
                    className="max-h-24 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-[#728078] dark:text-[#98A79D] text-xs italic">No QR Code set</span>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="QR Code Image URL..."
                  value={formState.upiQrUrl}
                  onChange={(e) => setFormState({ ...formState, upiQrUrl: e.target.value })}
                  className="w-full p-2 rounded-lg bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_1px_1px_3px_rgba(175,188,177,0.5),inset_-1px_-1px_3px_rgba(255,255,255,0.7)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.4)] border border-[#D5DDD6] dark:border-[#2C3E33] text-[11px] text-[#26372D] dark:text-[#E5ECE7] focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={generateUpiQr}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[#25845A] hover:bg-[#1E6B49] text-white font-bold text-[11px] transition shadow-[2px_2px_5px_rgba(37,132,90,0.35),-2px_-2px_5px_rgba(255,255,255,0.6)] active:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3)]"
                  >
                    Auto Generate QR
                  </button>
                  <label className="py-1.5 px-2 rounded-lg bg-[#E9EEE9] dark:bg-[#233028] hover:bg-[#dfe6e0] text-[#26372D] dark:text-[#E5ECE7] font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition shadow-[2px_2px_5px_rgba(175,188,177,0.4),-2px_-2px_5px_rgba(255,255,255,0.6)] active:shadow-[inset_1px_1px_3px_rgba(175,188,177,0.5)]">
                    <Upload className="w-3.5 h-3.5 text-[#25845A]" />
                    <span>Upload QR</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'upiQrUrl')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* 3. Digital Signature Image & Signatory Title */}
            <div className="p-4 rounded-xl bg-[#E9EEE9] dark:bg-[#18221B] shadow-[2px_2px_6px_rgba(175,188,177,0.35),-2px_-2px_6px_rgba(255,255,255,0.6)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.3),-1px_-1px_4px_rgba(255,255,255,0.03)] border border-[#D5DDD6]/70 dark:border-[#2C3E33]/70 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#26372D] dark:text-[#E5ECE7] text-xs">Digital Signature & Signatory</label>
                <span className="text-[10px] text-[#728078] dark:text-[#98A79D]">Replaces Generic Sign</span>
              </div>

              <div className="w-full h-32 bg-[#DFE6E0] dark:bg-[#151D18] shadow-[inset_2px_2px_4px_rgba(175,188,177,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.6)] rounded-xl border border-dashed border-[#B8C4BA] dark:border-[#2C3E33] flex items-center justify-center p-2 overflow-hidden relative">
                {formState.signatureUrl ? (
                  <img
                    src={formState.signatureUrl}
                    alt="Digital Signature Preview"
                    className="max-h-28 max-w-full object-contain filter contrast-125 dark:invert"
                  />
                ) : (
                  <span className="text-[#728078] dark:text-[#98A79D] text-xs italic">No digital sign image set</span>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <input
                    type="text"
                    placeholder="Signatory Designation (e.g. Managing Director)"
                    value={formState.authorizedSignatoryName || ''}
                    onChange={(e) =>
                      setFormState({ ...formState, authorizedSignatoryName: e.target.value })
                    }
                    className="w-full p-2 rounded-lg bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_1px_1px_3px_rgba(175,188,177,0.5),inset_-1px_-1px_3px_rgba(255,255,255,0.7)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.4)] border border-[#D5DDD6] dark:border-[#2C3E33] text-[11px] font-medium text-[#26372D] dark:text-[#E5ECE7] focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Signature Image URL..."
                    value={formState.signatureUrl || ''}
                    onChange={(e) => setFormState({ ...formState, signatureUrl: e.target.value })}
                    className="w-full p-2 rounded-lg bg-[#E9EEE9] dark:bg-[#151D18] shadow-[inset_1px_1px_3px_rgba(175,188,177,0.5),inset_-1px_-1px_3px_rgba(255,255,255,0.7)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.4)] border border-[#D5DDD6] dark:border-[#2C3E33] text-[11px] text-[#26372D] dark:text-[#E5ECE7] focus:outline-none"
                  />
                  <label className="py-1.5 px-3 rounded-lg bg-[#E9EEE9] dark:bg-[#233028] hover:bg-[#dfe6e0] text-[#26372D] dark:text-[#E5ECE7] font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition shrink-0 shadow-[2px_2px_5px_rgba(175,188,177,0.4),-2px_-2px_5px_rgba(255,255,255,0.6)] active:shadow-[inset_1px_1px_3px_rgba(175,188,177,0.5)]">
                    <Upload className="w-3.5 h-3.5 text-[#25845A]" />
                    <span>Upload Sign</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'signatureUrl')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme & Design Styling */}
        <div className="p-6 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[4px_4px_10px_rgba(175,188,177,0.45),-4px_-4px_10px_rgba(255,255,255,0.75)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.4),-2px_-2px_6px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/70 dark:border-[#2C3E33]/70 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D5DDD6] dark:border-[#2C3E33] pb-3">
            <Palette className="w-5 h-5 text-[#25845A]" />
            <h3 className="font-black text-[#26372D] dark:text-[#E5ECE7] text-base">Visual Appearance & Design Style</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold text-[#728078] dark:text-[#98A79D] mb-2">
                Color Mode
              </label>
              <button
                type="button"
                onClick={toggleDarkMode}
                className="px-4 py-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#151D18] font-bold flex items-center gap-2 text-[#26372D] dark:text-[#E5ECE7] transition shadow-[3px_3px_8px_rgba(175,188,177,0.45),-3px_-3px_8px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.4),-2px_-2px_5px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/70 dark:border-[#2C3E33]/70"
              >
                {isDarkMode ? <Moon className="w-4 h-4 text-[#25845A]" /> : <Sun className="w-4 h-4 text-[#25845A]" />}
                <span>Current Mode: {isDarkMode ? 'Dark Mode' : 'Light Mode (Soft Neumorphic)'}</span>
              </button>
            </div>

            <div>
              <label className="block font-bold text-[#728078] dark:text-[#98A79D] mb-2">
                Accent Theme Color
              </label>
              <div className="flex items-center gap-2">
                {(['amber', 'indigo', 'purple', 'emerald', 'cyan'] as ThemeAccent[]).map((acc) => (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => setThemeAccent(acc)}
                    className={`w-8 h-8 rounded-full border-2 transition ${
                      themeAccent === acc ? 'border-[#26372D] dark:border-white scale-110 shadow-[2px_2px_6px_rgba(0,0,0,0.2)]' : 'border-transparent opacity-75 hover:opacity-100'
                    } ${
                      acc === 'amber'
                        ? 'bg-[#25845A]'
                        : acc === 'indigo'
                        ? 'bg-indigo-600'
                        : acc === 'purple'
                        ? 'bg-purple-600'
                        : acc === 'emerald'
                        ? 'bg-emerald-600'
                        : 'bg-cyan-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Database Backup & Restore */}
        <div className="p-6 rounded-2xl bg-[#E9EEE9] dark:bg-[#1C2620] shadow-[4px_4px_10px_rgba(175,188,177,0.45),-4px_-4px_10px_rgba(255,255,255,0.75)] dark:shadow-[3px_3px_8px_rgba(0,0,0,0.4),-2px_-2px_6px_rgba(255,255,255,0.04)] border border-[#D5DDD6]/70 dark:border-[#2C3E33]/70 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D5DDD6] dark:border-[#2C3E33] pb-3">
            <Database className="w-5 h-5 text-[#25845A]" />
            <h3 className="font-black text-[#26372D] dark:text-[#E5ECE7] text-base">Database Backup, Export & Restore</h3>
          </div>

          <p className="text-xs text-[#728078] dark:text-[#98A79D]">
            Export a complete single-file JSON database dump containing all your customers, project specs, invoices, and stock logs for local safekeeping.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              type="button"
              onClick={exportDatabaseJSON}
              className="px-5 py-2.5 rounded-xl bg-[#25845A] hover:bg-[#1E6B49] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-[4px_4px_10px_rgba(37,132,90,0.35),-2px_-2px_6px_rgba(255,255,255,0.6)]"
            >
              <Download className="w-4 h-4" />
              <span>Export Full ERP Database (JSON)</span>
            </button>

            <label className="px-5 py-2.5 rounded-xl bg-[#E9EEE9] dark:bg-[#151D18] hover:bg-[#dfe6e0] dark:hover:bg-[#233028] text-[#26372D] dark:text-[#E5ECE7] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-[3px_3px_8px_rgba(175,188,177,0.45),-3px_-3px_8px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.4)] border border-[#D5DDD6]/70 dark:border-[#2C3E33]/70">
              <Upload className="w-4 h-4 text-[#25845A]" />
              <span>Restore Database from JSON</span>
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#25845A] hover:bg-[#1E6B49] text-white font-bold text-sm flex items-center gap-2 transition shadow-[4px_4px_12px_rgba(37,132,90,0.35),-2px_-2px_6px_rgba(255,255,255,0.7)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)]"
          >
            <Save className="w-4 h-4" />
            <span>Save Company Profile & Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
