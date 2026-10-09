import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Printer,
  Edit2,
  Trash2,
  Eye,
  X,
  Sparkles,
  FileCheck,
  Download,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer, ProjectType } from '../../types';

export const CustomerView: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, triggerPrint, exportToCSV } = useApp();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    mobile: '',
    altMobile: '',
    email: '',
    address: '',
    village: '',
    block: '',
    district: '',
    state: 'Uttar Pradesh',
    pincode: '',
    aadharNumber: '',
    gstNumber: '',
    projectType: 'Residential' as ProjectType,
    photoUrl: '',
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      fatherName: '',
      mobile: '',
      altMobile: '',
      email: '',
      address: '',
      village: '',
      block: '',
      district: '',
      state: 'Uttar Pradesh',
      pincode: '',
      aadharNumber: '',
      gstNumber: '',
      projectType: 'Residential',
      photoUrl: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      fatherName: c.fatherName,
      mobile: c.mobile,
      altMobile: c.altMobile || '',
      email: c.email,
      address: c.address,
      village: c.village,
      block: c.block,
      district: c.district,
      state: c.state,
      pincode: c.pincode,
      aadharNumber: c.aadharNumber,
      gstNumber: c.gstNumber || '',
      projectType: c.projectType,
      photoUrl: c.photoUrl || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.mobile?.trim()) {
      alert('Please fill in required fields (Name and Mobile Number)');
      return;
    }

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
        setToastMessage(`Customer ${formData.name} updated successfully`);
        setHighlightedId(editingCustomer.id);
      } else {
        const newId = await addCustomer(formData);
        setToastMessage(`New customer ${formData.name} added successfully`);
        if (newId) setHighlightedId(newId);
      }
      setModalOpen(false);
      setTimeout(() => {
        setToastMessage(null);
        setHighlightedId(null);
      }, 4000);
    } catch (err) {
      console.error(err);
      alert('Error saving customer record');
    }
  };

  const filteredCustomers = useMemo(() => {
    return (customers || []).filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        (c.name || '').toLowerCase().includes(q) ||
        (c.mobile || '').includes(q) ||
        (c.id || '').toLowerCase().includes(q) ||
        (c.district || '').toLowerCase().includes(q) ||
        (c.village || '').toLowerCase().includes(q);

      const matchesType = filterType === 'ALL' || c.projectType === filterType;
      return matchesSearch && matchesType;
    });
  }, [customers, search, filterType]);

  const handleExportCustomers = () => {
    exportToCSV('customers');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-[#DCEBE0] border border-[#25845A]/30 text-[#25845A] font-bold text-xs flex items-center justify-between shadow-[0_4px_12px_rgba(37,132,90,0.15)] animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#25845A]" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:text-[#1D7049]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#24372D] dark:text-[#E6EEE8] tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[2px_2px_6px_rgba(36,55,45,0.06),-2px_-2px_6px_rgba(255,255,255,0.85)] text-[#25845A]">
              <Users className="w-5 h-5" />
            </span>
            <span>Customer Directory & CRM</span>
          </h2>
          <p className="text-xs text-[#68786E] dark:text-[#8E9F94] mt-1 font-medium">
            Manage solar consumers, KYC documents, plant specifications, and contact records
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCustomers}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] dark:bg-[#1B2720] text-[#24372D] dark:text-[#E6EEE8] text-xs font-bold border border-[#D9E2DA] dark:border-[#223328] shadow-[2px_2px_6px_rgba(36,55,45,0.06),-2px_-2px_6px_rgba(255,255,255,0.85)] hover:bg-[#F8FAF8] transition"
          >
            <Download className="w-4 h-4 text-[#68786E]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25845A] hover:bg-[#1D7049] text-white font-bold text-xs transition shadow-[0_4px_12px_rgba(37,132,90,0.25)] border border-[#1D7049] active:translate-y-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#25845A] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, mobile, district..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-[#24372D] dark:text-white text-xs shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] focus:border-[#25845A] focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'Residential', 'Commercial', 'Industrial', 'Government'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterType === type
                  ? 'bg-[#25845A] text-white shadow-[0_2px_6px_rgba(37,132,90,0.3)]'
                  : 'bg-[#F1F5F1] dark:bg-[#152019] text-[#68786E] dark:text-[#8E9F94] border border-[#D9E2DA] dark:border-[#223328] hover:bg-[#E9EFEA]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table Container */}
      <div className="rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F1F5F1] dark:bg-[#152019] text-[#68786E] dark:text-[#8E9F94] text-xs font-bold uppercase tracking-wider border-b border-[#D9E2DA] dark:border-[#223328]">
                <th className="p-4">Customer Info</th>
                <th className="p-4">Father Name</th>
                <th className="p-4">Mobile & Email</th>
                <th className="p-4">Location</th>
                <th className="p-4">Project Type</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2DA] dark:divide-[#223328] text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#87938B]">
                    No customers found matching search filters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const isHighlighted = c.id === highlightedId;
                  return (
                    <tr
                      key={c.id}
                      className={`transition ${
                        isHighlighted
                          ? 'bg-[#DCEBE0]/50 border-l-4 border-[#25845A]'
                          : 'hover:bg-[#F8FAF8] dark:hover:bg-[#202E25]/50'
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#25845A] text-white flex items-center justify-center font-bold text-sm shadow-[0_2px_6px_rgba(37,132,90,0.3)] shrink-0">
                            {c.name ? c.name[0].toUpperCase() : 'C'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-[#24372D] dark:text-white text-sm">{c.name}</p>
                              {isHighlighted && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#25845A] text-white">
                                  <Sparkles className="w-2.5 h-2.5" /> Just Added
                                </span>
                              )}
                            </div>
                            <p className="font-mono text-[10px] text-[#25845A] dark:text-[#2DA16E] font-bold">{c.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-[#68786E] dark:text-[#8E9F94] font-medium">
                        {c.fatherName || 'N/A'}
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-[#24372D] dark:text-white tabular-nums">📱 {c.mobile}</p>
                          <p className="text-[11px] text-[#87938B] truncate max-w-[150px]">{c.email || 'No email'}</p>
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="text-[#24372D] dark:text-[#E6EEE8] font-medium">{c.district}, {c.state}</p>
                        <p className="text-[10px] text-[#87938B]">{c.address}</p>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                            c.projectType === 'Residential'
                              ? 'bg-[#DCEBE0] text-[#25845A] border border-[#25845A]/25'
                              : c.projectType === 'Commercial'
                              ? 'bg-[#2878C7]/12 text-[#2878C7] border border-[#2878C7]/25'
                              : c.projectType === 'Industrial'
                              ? 'bg-[#D99A18]/12 text-[#D99A18] border border-[#D99A18]/25'
                              : 'bg-[#68786E]/12 text-[#68786E] border border-[#68786E]/25'
                          }`}
                        >
                          {c.projectType}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailCustomer(c)}
                            className="p-1.5 rounded-lg text-[#68786E] hover:text-[#25845A] bg-[#FFFFFF] dark:bg-[#1A261F] border border-[#D9E2DA] dark:border-[#223328] shadow-[1px_1px_3px_rgba(36,55,45,0.06),-1px_-1px_3px_rgba(255,255,255,0.85)] transition"
                            title="View Profile & Documents"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => triggerPrint('customer_card', c)}
                            className="p-1.5 rounded-lg text-[#68786E] hover:text-[#25845A] bg-[#FFFFFF] dark:bg-[#1A261F] border border-[#D9E2DA] dark:border-[#223328] shadow-[1px_1px_3px_rgba(36,55,45,0.06),-1px_-1px_3px_rgba(255,255,255,0.85)] transition"
                            title="Print Customer Card"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 rounded-lg text-[#68786E] hover:text-[#D99A18] bg-[#FFFFFF] dark:bg-[#1A261F] border border-[#D9E2DA] dark:border-[#223328] shadow-[1px_1px_3px_rgba(36,55,45,0.06),-1px_-1px_3px_rgba(255,255,255,0.85)] transition"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete customer ${c.name}?`)) deleteCustomer(c.id);
                            }}
                            className="p-1.5 rounded-lg text-[#68786E] hover:text-[#D83B3B] bg-[#FFFFFF] dark:bg-[#1A261F] border border-[#D9E2DA] dark:border-[#223328] shadow-[1px_1px_3px_rgba(36,55,45,0.06),-1px_-1px_3px_rgba(255,255,255,0.85)] transition"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT CUSTOMER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-3xl bg-[#FFFFFF] dark:bg-[#1B2720] rounded-3xl shadow-[0_12px_36px_rgba(36,55,45,0.12)] border border-[#D9E2DA] dark:border-[#223328] overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D9E2DA] dark:border-[#223328] bg-[#F1F5F1] dark:bg-[#152019]">
              <h3 className="text-base font-bold text-[#24372D] dark:text-white">
                {editingCustomer ? 'Edit Customer Details' : 'Add New Solar Customer'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-[#68786E] hover:text-[#24372D] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-xs text-[#24372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] focus:border-[#25845A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    Father Name
                  </label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="e.g. Ram Kumar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-xs text-[#24372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] focus:border-[#25845A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="10 Digit Mobile"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-xs text-[#24372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] focus:border-[#25845A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    Alternative Number
                  </label>
                  <input
                    type="text"
                    value={formData.altMobile}
                    onChange={(e) => setFormData({ ...formData, altMobile: e.target.value })}
                    placeholder="Alternate Mobile"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-xs text-[#24372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] focus:border-[#25845A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-xs text-[#24372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] focus:border-[#25845A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    Project Type
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value as ProjectType })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-xs text-[#24372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] focus:border-[#25845A] focus:outline-none"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Government">Government</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    Village / Locality
                  </label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="Village Name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-xs text-[#24372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] focus:border-[#25845A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    Block / Tehsil
                  </label>
                  <input
                    type="text"
                    value={formData.block}
                    onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                    placeholder="Tehsil / Block"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-xs text-[#24372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] focus:border-[#25845A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="District"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-xs text-[#24372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] focus:border-[#25845A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-xs text-[#24372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] focus:border-[#25845A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="6 Digit PIN"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-xs text-[#24372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] focus:border-[#25845A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    Aadhar Number
                  </label>
                  <input
                    type="text"
                    value={formData.aadharNumber}
                    onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                    placeholder="12 Digit Aadhar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-xs text-[#24372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] focus:border-[#25845A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    GST Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    placeholder="15 Digit GSTIN"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-xs text-[#24372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] focus:border-[#25845A] focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#24372D] dark:text-[#E6EEE8] mb-1">
                    Full Installation Address
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House No, Street, Landmark..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-xs text-[#24372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] focus:border-[#25845A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#D9E2DA] dark:border-[#223328] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F1F5F1] dark:bg-[#152019] text-[#68786E] dark:text-[#8E9F94] text-xs font-bold border border-[#D9E2DA] dark:border-[#223328] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#25845A] hover:bg-[#1D7049] text-white text-xs font-bold transition shadow-[0_4px_12px_rgba(37,132,90,0.25)]"
                >
                  Save Customer Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL PROFILE DRAWER */}
      {detailCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#1B2720] h-full p-6 shadow-2xl border-l border-[#D9E2DA] dark:border-[#223328] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-[#D9E2DA] dark:border-[#223328] pb-4">
              <h3 className="font-bold text-[#24372D] dark:text-white text-base">Customer Profile</h3>
              <button
                onClick={() => setDetailCustomer(null)}
                className="p-1.5 rounded-xl text-[#68786E] hover:text-[#24372D] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#25845A] text-white flex items-center justify-center font-black text-2xl shadow-[0_4px_12px_rgba(37,132,90,0.3)] shrink-0">
                {detailCustomer.name ? detailCustomer.name[0].toUpperCase() : 'C'}
              </div>
              <div>
                <h4 className="font-black text-[#24372D] dark:text-white text-base">
                  {detailCustomer.name}
                </h4>
                <p className="font-mono text-xs text-[#25845A] dark:text-[#2DA16E] font-bold">{detailCustomer.id}</p>
                <p className="text-xs text-[#68786E]">Project: {detailCustomer.projectType}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-[#F1F5F1] dark:bg-[#152019] p-4 rounded-2xl border border-[#D9E2DA] dark:border-[#223328]">
              <p><strong className="text-[#24372D] dark:text-white">Father Name:</strong> {detailCustomer.fatherName || 'N/A'}</p>
              <p><strong className="text-[#24372D] dark:text-white">Mobile:</strong> {detailCustomer.mobile}</p>
              <p><strong className="text-[#24372D] dark:text-white">Alt Mobile:</strong> {detailCustomer.altMobile || 'N/A'}</p>
              <p><strong className="text-[#24372D] dark:text-white">Email:</strong> {detailCustomer.email || 'N/A'}</p>
              <p><strong className="text-[#24372D] dark:text-white">Aadhar Number:</strong> {detailCustomer.aadharNumber || 'N/A'}</p>
              <p><strong className="text-[#24372D] dark:text-white">GSTIN:</strong> {detailCustomer.gstNumber || 'N/A'}</p>
              <p><strong className="text-[#24372D] dark:text-white">Location:</strong> {detailCustomer.village}, {detailCustomer.district}, {detailCustomer.state} - {detailCustomer.pincode}</p>
              <p><strong className="text-[#24372D] dark:text-white">Full Address:</strong> {detailCustomer.address}</p>
            </div>

            {/* Documents List */}
            <div>
              <h5 className="font-bold text-[#24372D] dark:text-white text-xs mb-3 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#25845A]" />
                <span>Uploaded Solar Documents ({detailCustomer.documents?.length || 0})</span>
              </h5>

              <div className="space-y-2">
                {detailCustomer.documents?.map((doc) => (
                  <div key={doc.id} className="p-3 bg-[#F1F5F1] dark:bg-[#152019] border border-[#D9E2DA] dark:border-[#223328] rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#24372D] dark:text-white">{doc.title}</p>
                      <p className="text-[10px] text-[#87938B]">{doc.fileType} · {doc.size} · {doc.uploadDate}</p>
                    </div>
                    <span className="text-[#25845A] dark:text-[#2DA16E] font-bold text-[10px]">Verified</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                triggerPrint('customer_card', detailCustomer);
                setDetailCustomer(null);
              }}
              className="w-full py-2.5 rounded-xl bg-[#25845A] hover:bg-[#1D7049] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-[0_4px_12px_rgba(37,132,90,0.25)]"
            >
              <Printer className="w-4 h-4" />
              <span>Print Customer Pass Card</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
