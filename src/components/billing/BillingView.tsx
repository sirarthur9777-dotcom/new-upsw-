import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  Share2,
  Download,
  Eye,
  X,
  Search,
  DollarSign,
  Calendar,
  Layers,
  Edit2,
  Lock,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Invoice, InvoiceItem, PaymentMode } from '../../types';

// Helper to clean floating-point artifacts for display (e.g., 15400.00000001 -> 15400)
const cleanRate = (val: any): string | number => {
  if (val === '' || val === undefined || val === null) return '';
  const num = Number(val);
  if (isNaN(num)) return val;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export const BillingView: React.FC = () => {
  const { invoices, customers, projects, products, companySettings, addInvoice, updateInvoice, deleteInvoice, triggerPrint } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);

  // New Invoice Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [placeOfSupply, setPlaceOfSupply] = useState('09-Uttar Pradesh');
  const [reverseCharge, setReverseCharge] = useState('No');

  // Transport details
  const [grNo, setGrNo] = useState('');
  const [transportName, setTransportName] = useState('By Road (Direct Dispatch)');
  const [vehicleNo, setVehicleNo] = useState('');
  const [station, setStation] = useState('Site Destination');

  // Shipping details
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingMobile, setShippingMobile] = useState('');
  const [shippingState, setShippingState] = useState('Uttar Pradesh');
  const [shippingStateCode, setShippingStateCode] = useState('09');
  const [shippingGst, setShippingGst] = useState('');
  const [shippingPan, setShippingPan] = useState('');

  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Bank Transfer');
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [notes, setNotes] = useState('50% Advance received. Balance upon net metering.');

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      name: 'Adani 540W Mono PERC Solar Panels',
      description: 'Supply of High Efficiency Mono PERC Solar PV Modules (DCR/Non-DCR)',
      hsnCode: '8541',
      serialNumbers: '',
      quantity: 10,
      unit: 'Nos',
      rate: 11800,
      gstPercent: 12,
      cgstRate: 6,
      cgstAmount: 7080,
      sgstRate: 6,
      sgstAmount: 7080,
      discount: 0,
      subtotal: 118000,
      tax: 14160,
      total: 132160,
    },
    {
      id: '2',
      name: 'Luminous 5KVA Hybrid Solar PCU Inverter',
      description: 'Pure Sine Wave High Frequency Solar PCU Inverter with MPPT',
      hsnCode: '8504',
      serialNumbers: '',
      quantity: 1,
      unit: 'Set',
      rate: 48000,
      gstPercent: 18,
      cgstRate: 9,
      cgstAmount: 4140,
      sgstRate: 9,
      sgstAmount: 4140,
      discount: 2000,
      subtotal: 46000,
      tax: 8280,
      total: 54280,
    },
  ]);

  const openCreateModal = () => {
    setEditingInvoiceId(null);
    setSelectedCustomerId(customers[0]?.id || '');
    setSelectedProjectId(projects[0]?.id || '');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
    setPlaceOfSupply('09-Uttar Pradesh');
    setReverseCharge('No');
    setGrNo('');
    setTransportName('By Road (Direct Dispatch)');
    setVehicleNo('');
    setStation('Site Destination');
    setSameAsBilling(true);
    setShippingName('');
    setShippingAddress('');
    setShippingMobile('');
    setShippingState('Uttar Pradesh');
    setShippingStateCode('09');
    setShippingGst('');
    setShippingPan('');
    setPaymentMode('Bank Transfer');
    setAdvancePaid(0);
    setNotes('50% Advance received. Balance upon net metering.');
    setItems([
      {
        id: '1',
        name: 'Adani 540W Mono PERC Solar Panels',
        description: 'Supply of High Efficiency Mono PERC Solar PV Modules (DCR/Non-DCR)',
        hsnCode: '8541',
        serialNumbers: '',
        quantity: 10,
        unit: 'Nos',
        rate: 11800,
        gstPercent: 12,
        cgstRate: 6,
        cgstAmount: 7080,
        sgstRate: 6,
        sgstAmount: 7080,
        discount: 0,
        subtotal: 118000,
        tax: 14160,
        total: 132160,
      },
    ]);
    setModalOpen(true);
  };

  const openEditModal = (inv: Invoice) => {
    const isLocked = (inv.paymentStatus === 'Paid' && (Number(inv.remainingBalance) || 0) <= 0) || inv.isLocked;
    if (isLocked) {
      alert(
        `Invoice ${inv.invoiceNumber} is fully PAID (Remaining Balance ₹0) and LOCKED for accounting audit integrity.\n\nTo edit this invoice, please reverse its payment transaction in the Accounting module first.`
      );
      return;
    }

    setEditingInvoiceId(inv.id);
    setSelectedCustomerId(inv.customerId || customers[0]?.id || '');
    setSelectedProjectId(inv.projectId || '');
    setInvoiceDate(inv.date || new Date().toISOString().split('T')[0]);
    setDueDate(inv.dueDate || new Date().toISOString().split('T')[0]);
    setPlaceOfSupply(inv.placeOfSupply || '09-Uttar Pradesh');
    setReverseCharge(inv.reverseCharge || 'No');
    setGrNo(inv.grNo || '');
    setTransportName(inv.transportName || 'By Road (Direct Dispatch)');
    setVehicleNo(inv.vehicleNo || '');
    setStation(inv.station || 'Site Destination');
    setSameAsBilling(!inv.shippingName || inv.shippingName === inv.customerName);
    setShippingName(inv.shippingName || '');
    setShippingAddress(inv.shippingAddress || '');
    setShippingMobile(inv.shippingMobile || '');
    setShippingState(inv.shippingState || 'Uttar Pradesh');
    setShippingStateCode(inv.shippingStateCode || '09');
    setShippingGst(inv.shippingGst || '');
    setShippingPan(inv.shippingPan || '');
    setPaymentMode(inv.paymentMode || 'Bank Transfer');
    setAdvancePaid(inv.advancePaid || 0);
    setNotes(inv.notes || '');
    setItems(
      (inv.items && inv.items.length > 0)
        ? inv.items.map((it) => {
            const cleanR = typeof it.rate === 'number' ? Math.round((it.rate + Number.EPSILON) * 100) / 100 : it.rate;
            const cleanSub = typeof it.subtotal === 'number' ? Math.round((it.subtotal + Number.EPSILON) * 100) / 100 : it.subtotal;
            const cleanTax = typeof it.tax === 'number' ? Math.round((it.tax + Number.EPSILON) * 100) / 100 : it.tax;
            const cleanTot = typeof it.total === 'number' ? Math.round((it.total + Number.EPSILON) * 100) / 100 : it.total;
            return {
              ...it,
              rate: cleanR,
              subtotal: cleanSub,
              tax: cleanTax,
              total: cleanTot,
              serialNumbers: it.serialNumbers || '',
            };
          })
        : [
            {
              id: '1',
              name: '',
              description: '',
              hsnCode: '8541',
              serialNumbers: '',
              quantity: 1,
              unit: 'Nos',
              rate: 0,
              gstPercent: 18,
              cgstRate: 9,
              cgstAmount: 0,
              sgstRate: 9,
              sgstAmount: 0,
              discount: 0,
              subtotal: 0,
              tax: 0,
              total: 0,
            },
          ]
    );
    setModalOpen(true);
  };

  const handleAddItem = (product?: (typeof products)[0]) => {
    if (product) {
      const rate = product.salePrice || Math.round(product.purchasePrice * (1 + (product.margin ?? 10) / 100));
      const isSolarEquip = ['VFD', 'Solar Panel', 'Solar Panels', 'Inverters', 'Batteries'].includes(product.category);
      const gstP = isSolarEquip ? 12 : 18;
      const sub = rate;
      const cgstR = gstP / 2;
      const sgstR = gstP / 2;
      const cgstA = Math.round(sub * (cgstR / 100));
      const sgstA = Math.round(sub * (sgstR / 100));
      const tax = cgstA + sgstA;
      let hsn = product.hsnCode;
      if (!hsn) {
        const cat = (product.category || '').toLowerCase();
        if (cat.includes('panel')) hsn = '8541';
        else if (cat.includes('inverter') || cat.includes('vfd')) hsn = '8504';
        else if (cat.includes('battery')) hsn = '8507';
        else if (cat.includes('structure')) hsn = '7308';
        else hsn = '8504';
      }
      const newItem: InvoiceItem = {
        id: String(Date.now()),
        name: `${product.productName || product.name} (${product.make || 'UBSW'})`,
        description: product.model ? `Model: ${product.model}` : '',
        hsnCode: hsn,
        quantity: 1,
        unit: product.unit || 'Nos',
        rate: rate,
        gstPercent: gstP,
        cgstRate: cgstR,
        cgstAmount: cgstA,
        sgstRate: sgstR,
        sgstAmount: sgstA,
        discount: 0,
        subtotal: sub,
        tax: tax,
        total: sub + tax,
      };
      setItems([...items, newItem]);
    } else {
      const newItem: InvoiceItem = {
        id: String(Date.now()),
        name: '',
        description: '',
        hsnCode: '8504',
        quantity: 1,
        unit: 'Nos',
        rate: 0,
        gstPercent: 18,
        cgstRate: 9,
        cgstAmount: 0,
        sgstRate: 9,
        sgstAmount: 0,
        discount: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
      };
      setItems([...items, newItem]);
    }
  };

  const handleSelectProductForItem = (id: string, productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;
    const rate = p.salePrice || Math.round(p.purchasePrice * (1 + (p.margin ?? 10) / 100));
    const isSolarEquip = ['VFD', 'Solar Panel', 'Solar Panels', 'Inverters', 'Batteries'].includes(p.category);
    const gstP = isSolarEquip ? 12 : 18;
    let hsn = p.hsnCode;
    if (!hsn) {
      const cat = (p.category || '').toLowerCase();
      if (cat.includes('panel')) hsn = '8541';
      else if (cat.includes('inverter') || cat.includes('vfd')) hsn = '8504';
      else if (cat.includes('battery')) hsn = '8507';
      else if (cat.includes('structure')) hsn = '7308';
      else hsn = '8504';
    }

    setItems(
      items.map((it) => {
        if (it.id === id) {
          const qty = Number(it.quantity) || 1;
          const disc = Number(it.discount) || 0;
          const sub = Math.max(0, qty * rate - disc);
          const cgstR = gstP / 2;
          const sgstR = gstP / 2;
          const cgstA = Math.round(sub * (cgstR / 100));
          const sgstA = Math.round(sub * (sgstR / 100));
          const tax = cgstA + sgstA;
          return {
            ...it,
            name: `${p.productName || p.name} (${p.make || 'UBSW'})`,
            description: p.model ? `Model: ${p.model}` : '',
            hsnCode: hsn,
            unit: p.unit || 'Nos',
            rate: rate,
            gstPercent: gstP,
            cgstRate: cgstR,
            cgstAmount: cgstA,
            sgstRate: sgstR,
            sgstAmount: sgstA,
            subtotal: sub,
            tax: tax,
            total: sub + tax,
          };
        }
        return it;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((it) => {
        if (it.id === id) {
          const updated = { ...it, [field]: value };

          // If typing product name, auto-detect inventory SKU match
          if (field === 'name') {
            const match = products.find(
              (p) =>
                p.productName?.toLowerCase() === String(value).toLowerCase() ||
                `${p.productName} (${p.make})`.toLowerCase() === String(value).toLowerCase()
            );
            if (match) {
              updated.rate = match.salePrice || Math.round(match.purchasePrice * (1 + (match.margin ?? 10) / 100));
              updated.unit = match.unit || updated.unit || 'Nos';
              const isSolarEquip = ['VFD', 'Solar Panel', 'Solar Panels', 'Inverters', 'Batteries'].includes(match.category);
              updated.gstPercent = isSolarEquip ? 12 : 18;
              if (match.hsnCode) updated.hsnCode = match.hsnCode;
            }
          }

          if (field === 'rate') {
            if (value === '' || value === undefined || value === null) {
              updated.rate = '';
            } else {
              const parsed = parseFloat(value);
              updated.rate = isNaN(parsed) ? 0 : Math.round((parsed + Number.EPSILON) * 100) / 100;
            }
          }

          const qty = Number(updated.quantity) || 0;
          const rate = Number(updated.rate) || 0;
          const disc = Number(updated.discount) || 0;
          const gstP = Number(updated.gstPercent) || 0;

          const sub = Math.max(0, qty * rate - disc);
          const cgstR = gstP / 2;
          const sgstR = gstP / 2;
          const cgstA = Math.round(sub * (cgstR / 100));
          const sgstA = Math.round(sub * (sgstR / 100));
          const tax = cgstA + sgstA;
          const tot = sub + tax;

          return {
            ...updated,
            cgstRate: cgstR,
            cgstAmount: cgstA,
            sgstRate: sgstR,
            sgstAmount: sgstA,
            subtotal: sub,
            tax,
            total: tot,
          };
        }
        return it;
      })
    );
  };

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + it.subtotal, 0);
  const taxTotal = items.reduce((acc, it) => acc + it.tax, 0);
  const cgstTotal = items.reduce((acc, it) => acc + (it.cgstAmount || 0), 0);
  const sgstTotal = items.reduce((acc, it) => acc + (it.sgstAmount || 0), 0);
  const discountTotal = items.reduce((acc, it) => acc + it.discount, 0);
  const grandTotal = items.reduce((acc, it) => acc + it.total, 0);
  const remainingBalance = Math.max(0, grandTotal - advancePaid);

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustomerId);
    if (!cust) return;

    const invoicePayload = {
      customerId: cust.id,
      customerName: cust.name,
      customerMobile: cust.mobile,
      customerAddress: `${cust.address}, ${cust.district}`,
      customerGst: cust.gstNumber || 'Unregistered',
      customerPan: cust.panNumber || '',
      customerState: cust.state || 'Uttar Pradesh',
      customerStateCode: cust.stateCode || '09',
      
      // Shipped To Details
      shippingName: sameAsBilling ? cust.name : (shippingName || cust.name),
      shippingAddress: sameAsBilling ? `${cust.address}, ${cust.district}` : (shippingAddress || `${cust.address}, ${cust.district}`),
      shippingMobile: sameAsBilling ? cust.mobile : (shippingMobile || cust.mobile),
      shippingGst: sameAsBilling ? (cust.gstNumber || 'Unregistered') : (shippingGst || 'Unregistered'),
      shippingPan: sameAsBilling ? (cust.panNumber || '') : (shippingPan || ''),
      shippingState: sameAsBilling ? (cust.state || 'Uttar Pradesh') : (shippingState || 'Uttar Pradesh'),
      shippingStateCode: sameAsBilling ? (cust.stateCode || '09') : (shippingStateCode || '09'),

      placeOfSupply: placeOfSupply || '09-Uttar Pradesh',
      reverseCharge: reverseCharge || 'No',
      grNo: grNo || '',
      transportName: transportName || 'By Road (Direct Dispatch)',
      vehicleNo: vehicleNo || '',
      station: station || 'Site Destination',

      projectId: selectedProjectId || '',
      projectType: cust.projectType || 'Residential',
      date: invoiceDate,
      dueDate,
      items,
      subtotal,
      cgstTotal,
      sgstTotal,
      taxTotal,
      discountTotal,
      grandTotal,
      advancePaid,
      remainingBalance,
      paymentMode,
      paymentStatus: (remainingBalance <= 0 ? 'Paid' : advancePaid > 0 ? 'Partial' : 'Pending') as 'Paid' | 'Partial' | 'Pending',
      notes: notes || '',
    };

    if (editingInvoiceId) {
      updateInvoice(editingInvoiceId, invoicePayload);
    } else {
      addInvoice(invoicePayload);
    }

    setModalOpen(false);
    setEditingInvoiceId(null);
  };

  // 1-Click Excel Export Function for Invoices & Billing
  const handleExportInvoicesExcel = () => {
    if (invoices.length === 0) {
      alert('No invoices available to export.');
      return;
    }

    const headers = [
      'Invoice Number',
      'Customer Name',
      'Mobile',
      'Customer GSTIN',
      'Date',
      'Due Date',
      'Payment Status',
      'Subtotal (₹)',
      'Tax Total (₹)',
      'Discount (₹)',
      'Grand Total (₹)',
      'Advance Paid (₹)',
      'Remaining Balance (₹)',
      'Payment Mode',
      'Notes',
    ];

    const rows = invoices.map((inv) => [
      `"${inv.invoiceNumber || ''}"`,
      `"${inv.customerName || ''}"`,
      `"${inv.customerMobile || ''}"`,
      `"${inv.customerGst || ''}"`,
      `"${inv.date || ''}"`,
      `"${inv.dueDate || ''}"`,
      `"${inv.paymentStatus || ''}"`,
      inv.subtotal || 0,
      inv.taxTotal || 0,
      inv.discountTotal || 0,
      inv.grandTotal || 0,
      inv.advancePaid || 0,
      inv.remainingBalance || 0,
      `"${inv.paymentMode || ''}"`,
      `"${(inv.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `UPSW_Billing_Invoices_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerMobile.includes(search);

    const matchesStatus = statusFilter === 'ALL' || inv.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#24372D] dark:text-white tracking-tight">Billing & Tax Invoices</h2>
          <p className="text-xs text-[#68786E] dark:text-[#8E9F94]">
            Generate A4 GST compliant invoices with company logo, barcode & payment QR code
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportInvoicesExcel}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFFFFF] dark:bg-[#1B2720] text-[#24372D] dark:text-[#E6EEE8] text-xs font-bold border border-[#D9E2DA] dark:border-[#223328] shadow-[2px_2px_6px_rgba(36,55,45,0.06),-2px_-2px_6px_rgba(255,255,255,0.85)] hover:bg-[#F8FAF8] transition"
          >
            <Download className="w-4 h-4 text-[#25845A]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25845A] hover:bg-[#1D7049] text-white font-bold text-xs transition shadow-[0_4px_12px_rgba(37,132,90,0.25)] border border-[#1D7049] active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create GST Invoice</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)] flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#25845A] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice #, customer..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F1F5F1] dark:bg-[#121A15] text-[#24372D] dark:text-[#E6EEE8] text-xs shadow-[inset_1.5px_1.5px_3.5px_rgba(36,55,45,0.05),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.85)] border border-[#D9E2DA] dark:border-[#223328] focus:border-[#25845A] focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'Paid', 'Partial', 'Pending'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-[#25845A] text-white shadow-[0_2px_6px_rgba(37,132,90,0.3)]'
                  : 'bg-[#F1F5F1] dark:bg-[#152019] text-[#68786E] dark:text-[#8E9F94] border border-[#D9E2DA] dark:border-[#223328] hover:bg-[#E9EFEA]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="rounded-2xl bg-[#FFFFFF] dark:bg-[#1B2720] border border-[#D9E2DA] dark:border-[#223328] shadow-[0_4px_12px_rgba(36,55,45,0.07),0_1px_3px_rgba(36,55,45,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F1F5F1] dark:bg-[#152019] text-[#68786E] dark:text-[#8E9F94] text-xs font-bold uppercase tracking-wider border-b border-[#D9E2DA] dark:border-[#223328]">
                <th className="p-4">Invoice #</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Date / Due</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4">Advance Paid</th>
                <th className="p-4">Balance</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Print & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2DA] dark:divide-[#223328] text-xs">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#87938B]">
                    No invoices generated yet.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F8FAF8] dark:hover:bg-[#202E25]/50 transition">
                    <td className="p-4">
                      <span className="font-mono font-bold text-[#25845A] dark:text-[#2DA16E] text-xs">{inv.invoiceNumber}</span>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-[#24372D] dark:text-white">{inv.customerName}</p>
                      <p className="text-[11px] text-[#68786E]">📱 {inv.customerMobile}</p>
                    </td>

                    <td className="p-4 text-[#68786E] dark:text-[#8E9F94]">
                      <p>{inv.date}</p>
                      <p className="text-[10px] text-[#87938B]">Due: {inv.dueDate}</p>
                    </td>

                    <td className="p-4 font-black text-[#24372D] dark:text-white tabular-nums">
                      ₹{inv.grandTotal.toLocaleString()}
                    </td>

                    <td className="p-4 font-bold text-[#25845A] dark:text-[#2DA16E] tabular-nums">
                      ₹{inv.advancePaid.toLocaleString()}
                    </td>

                    <td className="p-4 font-black text-[#D83B3B] tabular-nums">
                      ₹{inv.remainingBalance.toLocaleString()}
                    </td>

                    <td className="p-4">
                      {(inv.paymentStatus === 'Paid' && (Number(inv.remainingBalance) || 0) <= 0) || inv.isLocked ? (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[#DCEBE0] text-[#25845A] dark:text-[#2DA16E] border border-[#25845A]/30"
                          title="Locked (Paid in Full) — Read Only"
                        >
                          <Lock className="w-3 h-3 text-[#25845A] dark:text-[#2DA16E]" />
                          <span>Paid &amp; Locked</span>
                        </span>
                      ) : (
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                            inv.paymentStatus === 'Paid'
                              ? 'bg-[#DCEBE0] text-[#25845A] border border-[#25845A]/30'
                              : inv.paymentStatus === 'Partial'
                              ? 'bg-[#D99A18]/15 text-[#D99A18] border border-[#D99A18]/30'
                              : 'bg-[#D83B3B]/15 text-[#D83B3B] border border-[#D83B3B]/30'
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => triggerPrint('invoice', inv)}
                          className="px-3 py-1.5 rounded-xl bg-[#25845A] hover:bg-[#1D7049] text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-[0_2px_6px_rgba(37,132,90,0.25)]"
                          title="Print or Download PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print A4</span>
                        </button>
                        {(inv.paymentStatus === 'Paid' && (Number(inv.remainingBalance) || 0) <= 0) || inv.isLocked ? (
                          <div
                            className="p-1.5 rounded-xl text-[#87938B] cursor-not-allowed inline-flex items-center justify-center"
                            title="Invoice is fully PAID and locked. To modify or delete, reverse payment in Accounting first."
                          >
                            <Lock className="w-4 h-4 text-[#87938B]" />
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => openEditModal(inv)}
                              className="p-1.5 rounded-xl text-[#68786E] hover:text-[#D99A18] bg-[#FFFFFF] dark:bg-[#1A261F] border border-[#D9E2DA] dark:border-[#223328] shadow-[1px_1px_3px_rgba(36,55,45,0.06),-1px_-1px_3px_rgba(255,255,255,0.85)] transition"
                              title="Edit Invoice"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete Invoice ${inv.invoiceNumber}?`)) deleteInvoice(inv.id);
                              }}
                              className="p-1.5 rounded-xl text-[#68786E] hover:text-[#D83B3B] bg-[#FFFFFF] dark:bg-[#1A261F] border border-[#D9E2DA] dark:border-[#223328] shadow-[1px_1px_3px_rgba(36,55,45,0.06),-1px_-1px_3px_rgba(255,255,255,0.85)] transition"
                              title="Delete Invoice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT INVOICE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-6xl bg-[#FFFFFF] dark:bg-[#1B2720] rounded-3xl shadow-[0_12px_36px_rgba(36,55,45,0.12)] border border-[#D9E2DA] dark:border-[#223328] overflow-hidden my-4 sm:my-6 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#D9E2DA] dark:border-[#223328] bg-[#F1F5F1] dark:bg-[#152019] flex-shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#24372D] dark:text-white flex items-center gap-2">
                  <span>{editingInvoiceId ? 'Edit GST Tax Invoice' : 'Create Modern Tax Invoice'}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#DCEBE0] text-[#25845A] dark:text-[#2DA16E] text-[11px] font-bold border border-[#25845A]/30 uppercase tracking-wider">
                    GST EPC Compliant
                  </span>
                </h3>
                <p className="text-xs text-[#68786E] dark:text-[#8E9F94]">
                  Auto calculates subtotal, GST %, discount & remaining balance
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-[#68786E] hover:text-[#24372D] dark:hover:text-white transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form & Scrollable Content */}
            <form onSubmit={handleCreateInvoiceSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
                {/* Top Details: Customer & Invoice Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-5 bg-[#E1E8E1]/50 dark:bg-[#141E17]/50 rounded-2xl border border-white/60 dark:border-white/5">
                  <div className="sm:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-bold text-[#26372D] dark:text-[#E5ECE7] mb-1.5 whitespace-nowrap">
                      Select Customer (Billed To) *
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] focus:outline-none text-xs sm:text-sm font-semibold"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.mobile}) - {c.district || c.address}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#26372D] dark:text-[#E5ECE7] mb-1.5 whitespace-nowrap">
                      Invoice Date
                    </label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] focus:outline-none text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#26372D] dark:text-[#E5ECE7] mb-1.5 whitespace-nowrap">
                      Payment Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] focus:outline-none text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#26372D] dark:text-[#E5ECE7] mb-1.5 whitespace-nowrap">
                      Place of Supply
                    </label>
                    <input
                      type="text"
                      value={placeOfSupply}
                      onChange={(e) => setPlaceOfSupply(e.target.value)}
                      placeholder="e.g. 09-Uttar Pradesh"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] focus:outline-none text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#26372D] dark:text-[#E5ECE7] mb-1.5 whitespace-nowrap">
                      Reverse Charge
                    </label>
                    <select
                      value={reverseCharge}
                      onChange={(e) => setReverseCharge(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] focus:outline-none text-xs sm:text-sm font-semibold"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#26372D] dark:text-[#E5ECE7] mb-1.5 whitespace-nowrap">
                      GR / RR / DC No.
                    </label>
                    <input
                      type="text"
                      value={grNo}
                      onChange={(e) => setGrNo(e.target.value)}
                      placeholder="e.g. GR-9821"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] focus:outline-none text-xs sm:text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#26372D] dark:text-[#E5ECE7] mb-1.5 whitespace-nowrap">
                      Vehicle Number
                    </label>
                    <input
                      type="text"
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                      placeholder="e.g. UP 62 AB 9988"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] focus:outline-none text-xs sm:text-sm font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Shipped To (Consignee) Details Toggle */}
                <div className="p-4 sm:p-5 bg-[#E1E8E1]/50 dark:bg-[#141E17]/50 rounded-2xl border border-white/60 dark:border-white/5 space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-[#26372D] dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#25845A]" />
                      <span>Consignee / Shipped To Details</span>
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#4A5D51] dark:text-[#A1B2A8]">
                      <input
                        type="checkbox"
                        checked={sameAsBilling}
                        onChange={(e) => setSameAsBilling(e.target.checked)}
                        className="w-4 h-4 rounded text-[#25845A] focus:ring-[#25845A] cursor-pointer"
                      />
                      <span>Same as Billed To (Customer Details)</span>
                    </label>
                  </div>

                  {!sameAsBilling && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-3 border-t border-[#D8E3DA] dark:border-[#223328] animate-in fade-in">
                      <div>
                        <label className="block text-xs font-semibold text-[#4A5D51] dark:text-[#A1B2A8] mb-1">
                          Consignee Name
                        </label>
                        <input
                          type="text"
                          value={shippingName}
                          onChange={(e) => setShippingName(e.target.value)}
                          placeholder="Recipient / Site Contact Name"
                          className="w-full px-3 py-2 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#4A5D51] dark:text-[#A1B2A8] mb-1">
                          Consignee Mobile
                        </label>
                        <input
                          type="text"
                          value={shippingMobile}
                          onChange={(e) => setShippingMobile(e.target.value)}
                          placeholder="Phone Number"
                          className="w-full px-3 py-2 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#4A5D51] dark:text-[#A1B2A8] mb-1">
                          Consignee GSTIN / PAN
                        </label>
                        <input
                          type="text"
                          value={shippingGst}
                          onChange={(e) => setShippingGst(e.target.value)}
                          placeholder="GSTIN or Unregistered"
                          className="w-full px-3 py-2 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] text-xs sm:text-sm font-mono uppercase"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#4A5D51] dark:text-[#A1B2A8] mb-1">
                          Delivery / Site Address
                        </label>
                        <input
                          type="text"
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          placeholder="Full delivery location address"
                          className="w-full px-3 py-2 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#4A5D51] dark:text-[#A1B2A8] mb-1">
                          State & State Code
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={shippingState}
                            onChange={(e) => setShippingState(e.target.value)}
                            placeholder="Uttar Pradesh"
                            className="col-span-2 px-3 py-2 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] text-xs sm:text-sm"
                          />
                          <input
                            type="text"
                            value={shippingStateCode}
                            onChange={(e) => setShippingStateCode(e.target.value)}
                            placeholder="09"
                            className="col-span-1 px-2 py-2 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] text-xs sm:text-sm text-center font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dynamic Items Table */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-[#26372D] dark:text-white text-sm sm:text-base">
                        Invoice Line Items & GST Rates
                      </h4>
                      <p className="text-xs text-[#728078] dark:text-[#8E9F95] mt-0.5">
                        Line items are automatically synchronized and calculated in real-time
                      </p>
                    </div>
                    <button
                      type="button"
                      id="add-invoice-item-btn"
                      onClick={() => handleAddItem()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25845A] hover:bg-[#1E6E4A] text-white font-bold text-xs transition shadow-[2.5px_2.5px_6px_rgba(37,132,90,0.35)] whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  {/* Datalist for autocomplete */}
                  <datalist id="billing-inventory-products">
                    {products.map((p) => (
                      <option
                        key={p.id}
                        value={`${p.productName || p.name} (${p.make || 'UBSW'})`}
                      >
                        HSN: {p.hsnCode || '8541'} | Rate: ₹{p.salePrice} | Unit: {p.unit || 'Nos'}
                      </option>
                    ))}
                  </datalist>

                  <div className="space-y-4">
                    {items.map((item, idx) => (
                      <div
                        key={item.id}
                        id={`invoice-item-card-${idx}`}
                        className="p-4 sm:p-5 bg-[#E1E8E1]/40 dark:bg-[#141E17]/60 rounded-2xl border border-white/60 dark:border-white/5 space-y-4 shadow-sm transition hover:border-[#25845A]/40"
                      >
                        {/* SKU Quick Select Bar */}
                        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#D8E3DA] dark:border-[#223328]">
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#25845A]/15 text-[#25845A] dark:text-[#38B57D] font-bold text-xs uppercase tracking-wider border border-[#25845A]/25">
                              <Layers className="w-3.5 h-3.5 text-[#25845A]" />
                              <span>ITEM #{idx + 1}</span>
                            </span>
                          </div>

                          <div className="flex-1 min-w-[200px]">
                            <select
                              id={`item-inventory-select-${idx}`}
                              className="w-full px-3 py-1.5 rounded-lg bg-[#E1E8E1] dark:bg-[#121A15] border border-transparent focus:border-[#25845A] text-xs font-semibold text-[#26372D] dark:text-[#E5ECE7] shadow-[inset_1px_1px_2.5px_rgba(170,188,173,0.6)] focus:outline-none"
                              onChange={(e) => handleSelectProductForItem(item.id, e.target.value)}
                              defaultValue=""
                              title="Choose from Inventory (Auto-fills HSN & Rate)"
                            >
                              <option value="" disabled>
                                -- Choose from Inventory (Auto-fills HSN & Rate) --
                              </option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  [{p.category}] {p.productName || p.name} ({p.make}) • HSN: {p.hsnCode || '8541'} • ₹{p.salePrice?.toLocaleString('en-IN')}
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            type="button"
                            id={`remove-item-btn-${idx}`}
                            onClick={() => handleRemoveItem(item.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-500 transition whitespace-nowrap flex-shrink-0 cursor-pointer p-1"
                            title="Delete this item"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Delete Item</span>
                          </button>
                        </div>

                        {/* Item Fields: Responsive grid & wrapping matching UI */}
                        <div className="flex flex-wrap items-end gap-3">
                          {/* Description */}
                          <div className="flex-1 min-w-[220px]">
                            <label className="block text-xs font-semibold text-[#4A5D51] dark:text-[#A1B2A8] mb-1.5 whitespace-nowrap">
                              Description of Goods / Services *
                            </label>
                            <input
                              type="text"
                              list="billing-inventory-products"
                              value={item.name}
                              onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                              placeholder="Item name & brand"
                              title={item.name}
                              className="w-full h-10 px-3 py-2 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] text-xs sm:text-sm font-medium focus:outline-none"
                            />
                          </div>

                          {/* HSN/SAC Code */}
                          <div className="w-24 sm:w-28 flex-shrink-0">
                            <label className="block text-xs font-semibold text-[#4A5D51] dark:text-[#A1B2A8] mb-1.5 whitespace-nowrap text-center">
                              HSN/SAC Code
                            </label>
                            <input
                              type="text"
                              value={item.hsnCode || '8541'}
                              onChange={(e) => handleItemChange(item.id, 'hsnCode', e.target.value)}
                              placeholder="8541"
                              className="w-full h-10 px-2 py-2 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] text-center font-mono text-xs sm:text-sm font-bold focus:outline-none"
                            />
                          </div>

                          {/* Qty */}
                          <div className="w-16 sm:w-16 flex-shrink-0">
                            <label className="block text-xs font-semibold text-[#4A5D51] dark:text-[#A1B2A8] mb-1.5 whitespace-nowrap text-center">
                              Qty
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                              className="w-full h-10 px-2 py-2 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] text-center text-xs sm:text-sm font-bold focus:outline-none"
                            />
                          </div>

                          {/* Unit */}
                          <div className="w-16 sm:w-16 flex-shrink-0">
                            <label className="block text-xs font-semibold text-[#4A5D51] dark:text-[#A1B2A8] mb-1.5 whitespace-nowrap text-center">
                              Unit
                            </label>
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                              className="w-full h-10 px-2 py-2 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] text-center text-xs sm:text-sm font-medium focus:outline-none"
                            />
                          </div>

                          {/* Rate (₹) */}
                          <div className="w-28 sm:w-32 flex-shrink-0">
                            <label className="block text-xs font-semibold text-[#4A5D51] dark:text-[#A1B2A8] mb-1.5 whitespace-nowrap">
                              Rate (₹)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={cleanRate(item.rate)}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '') {
                                  handleItemChange(item.id, 'rate', '');
                                } else {
                                  const num = parseFloat(val);
                                  handleItemChange(item.id, 'rate', isNaN(num) ? 0 : Math.round((num + Number.EPSILON) * 100) / 100);
                                }
                              }}
                              placeholder="0.00"
                              className="w-full h-10 px-3 py-2 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#25845A] dark:text-[#38B57D] shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] text-right text-xs sm:text-sm font-bold font-mono focus:outline-none"
                            />
                          </div>

                          {/* GST % */}
                          <div className="w-20 sm:w-24 flex-shrink-0">
                            <label className="block text-xs font-semibold text-[#4A5D51] dark:text-[#A1B2A8] mb-1.5 whitespace-nowrap text-center">
                              GST %
                            </label>
                            <select
                              value={item.gstPercent}
                              onChange={(e) => handleItemChange(item.id, 'gstPercent', e.target.value)}
                              className="w-full h-10 px-2 py-2 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] text-center text-xs sm:text-sm font-bold focus:outline-none cursor-pointer"
                            >
                              <option value={0}>0%</option>
                              <option value={5}>5%</option>
                              <option value={12}>12%</option>
                              <option value={18}>18%</option>
                              <option value={28}>28%</option>
                            </select>
                          </div>

                          {/* Total (₹) */}
                          <div className="w-32 sm:w-36 flex-shrink-0">
                            <label className="block text-xs font-semibold text-[#4A5D51] dark:text-[#A1B2A8] mb-1.5 whitespace-nowrap text-right">
                              Total (₹)
                            </label>
                            <div
                              id={`invoice-item-total-${idx}`}
                              className="w-full h-10 px-3 py-2 rounded-xl bg-[#25845A]/12 dark:bg-[#121A15] border border-[#25845A]/30 text-[#25845A] dark:text-[#38B57D] font-bold font-mono text-xs sm:text-sm text-right whitespace-nowrap flex items-center justify-end select-all shadow-inner tracking-tight"
                              title={`Total: ₹${(Number(item.total) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            >
                              ₹{(Number(item.total) || 0).toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Product Serial Number(s) */}
                        <div className="pt-2.5 border-t border-[#D8E3DA] dark:border-[#223328]">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-bold text-[#728078] tracking-wider uppercase">
                              SERIAL NUMBER(S)
                            </label>
                            <span className="text-[11px] text-[#728078]">
                              Single or multiple (comma / line break separated)
                            </span>
                          </div>
                          <textarea
                            rows={1}
                            value={item.serialNumbers || ''}
                            onChange={(e) => handleItemChange(item.id, 'serialNumbers', e.target.value)}
                            placeholder="e.g. SN001234, SN001235, SN001236"
                            className="w-full px-3 py-2 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] text-xs sm:text-sm font-mono placeholder:font-sans placeholder:text-[#728078] focus:outline-none min-h-[38px] resize-y"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Summary Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-[#D8E3DA] dark:border-[#223328]">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#26372D] dark:text-[#E5ECE7] mb-1.5 whitespace-nowrap">
                        Payment Mode
                      </label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] focus:outline-none text-xs sm:text-sm font-semibold"
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI / Digital QR</option>
                        <option value="Bank Transfer">NEFT / RTGS / Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#26372D] dark:text-[#E5ECE7] mb-1.5 whitespace-nowrap">
                        Advance Received (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={advancePaid === 0 ? '' : advancePaid}
                        onChange={(e) => setAdvancePaid(e.target.value === '' ? 0 : Number(e.target.value))}
                        placeholder="0.00"
                        className="w-full px-3 py-2.5 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] focus:outline-none text-xs sm:text-sm font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#26372D] dark:text-[#E5ECE7] mb-1.5 whitespace-nowrap">
                        Invoice Notes / Terms
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Delivery terms, warranty details, payment conditions, etc."
                        className="w-full px-3 py-2.5 rounded-xl bg-[#E1E8E1] dark:bg-[#121A15] text-[#26372D] dark:text-white shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] border border-transparent focus:border-[#25845A] focus:outline-none text-xs sm:text-sm resize-y min-h-[60px]"
                      />
                    </div>
                  </div>

                  <div className="p-5 bg-[#E1E8E1]/60 dark:bg-[#121A15]/80 rounded-2xl border border-white/60 dark:border-white/5 space-y-2.5 text-xs sm:text-sm shadow-[inset_1.5px_1.5px_3.5px_rgba(170,188,173,0.7),inset_-1.5px_-1.5px_3.5px_rgba(255,255,255,0.9)] dark:shadow-none">
                    <div className="flex justify-between items-center text-[#4A5D51] dark:text-[#A1B2A8]">
                      <span>Taxable Value (Subtotal):</span>
                      <span className="font-bold font-mono text-[#26372D] dark:text-white">
                        ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[#4A5D51] dark:text-[#A1B2A8]">
                      <span>CGST Amount:</span>
                      <span className="font-mono text-[#26372D] dark:text-white">
                        ₹{cgstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[#4A5D51] dark:text-[#A1B2A8]">
                      <span>SGST Amount:</span>
                      <span className="font-mono text-[#26372D] dark:text-white">
                        ₹{sgstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[#4A5D51] dark:text-[#A1B2A8] font-semibold border-t border-[#D8E3DA] dark:border-[#223328] pt-2">
                      <span>Total GST:</span>
                      <span className="font-mono text-[#26372D] dark:text-white">
                        ₹{taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-black text-sm sm:text-base text-[#26372D] dark:text-white pt-2.5 border-t border-[#D8E3DA] dark:border-[#223328]">
                      <span>Invoice Grand Total:</span>
                      <span className="text-[#25845A] dark:text-[#38B57D] font-mono text-base sm:text-lg">
                        ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-[#25845A] dark:text-[#38B57D] pt-1">
                      <span>Advance Received:</span>
                      <span className="font-mono">
                        ₹{advancePaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-black text-sm sm:text-base text-rose-600 dark:text-rose-400 pt-2 border-t border-[#D8E3DA] dark:border-[#223328]">
                      <span>Balance Amount Due:</span>
                      <span className="font-mono text-base sm:text-lg">
                        ₹{remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Bottom Actions Bar */}
              <div className="px-5 sm:px-6 py-3.5 border-t border-[#D8E3DA] dark:border-[#223328] bg-[#E1E8E1]/80 dark:bg-[#141E17]/80 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const cust = customers.find((c) => c.id === selectedCustomerId);
                    if (!cust) return;
                    const previewInv: Invoice = {
                      id: 'preview-' + Date.now(),
                      invoiceNumber: `${companySettings.invoicePrefix || 'UB-INV-'}PREVIEW`,
                      customerId: cust.id,
                      customerName: cust.name,
                      customerMobile: cust.mobile,
                      customerAddress: `${cust.address}, ${cust.district}`,
                      customerGst: cust.gstNumber || 'Unregistered',
                      customerPan: cust.panNumber,
                      customerState: cust.state || 'Uttar Pradesh',
                      customerStateCode: cust.stateCode || '09',
                      shippingName: sameAsBilling ? cust.name : shippingName || cust.name,
                      shippingAddress: sameAsBilling ? `${cust.address}, ${cust.district}` : shippingAddress || `${cust.address}, ${cust.district}`,
                      shippingMobile: sameAsBilling ? cust.mobile : shippingMobile || cust.mobile,
                      shippingGst: sameAsBilling ? (cust.gstNumber || 'Unregistered') : shippingGst || 'Unregistered',
                      shippingPan: sameAsBilling ? cust.panNumber : shippingPan,
                      shippingState: sameAsBilling ? (cust.state || 'Uttar Pradesh') : shippingState,
                      shippingStateCode: sameAsBilling ? (cust.stateCode || '09') : shippingStateCode,
                      placeOfSupply: placeOfSupply || '09-Uttar Pradesh',
                      reverseCharge: reverseCharge || 'No',
                      grNo,
                      transportName,
                      vehicleNo,
                      station,
                      date: invoiceDate,
                      dueDate,
                      items,
                      subtotal,
                      cgstTotal,
                      sgstTotal,
                      taxTotal,
                      discountTotal,
                      grandTotal,
                      advancePaid,
                      remainingBalance,
                      paymentMode,
                      paymentStatus: remainingBalance <= 0 ? 'Paid' : advancePaid > 0 ? 'Partial' : 'Pending',
                      notes,
                    };
                    triggerPrint('invoice', previewInv);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-[#25845A]/40 bg-[#25845A]/10 hover:bg-[#25845A]/20 text-[#25845A] dark:text-[#38B57D] font-bold flex items-center gap-2 text-xs transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Single A4 Invoice</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-[#E9EEE9] hover:bg-[#EDF2ED] dark:bg-[#1A261F] dark:hover:bg-[#202E25] text-[#4A5D51] dark:text-[#A1B2A8] font-bold transition whitespace-nowrap text-xs shadow-[2px_2px_5px_rgba(175,192,178,0.5),-2px_-2px_5px_rgba(255,255,255,0.8)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#25845A] hover:bg-[#1E6E4A] text-white font-bold transition shadow-[3px_3px_8px_rgba(37,132,90,0.35)] whitespace-nowrap text-xs active:shadow-[inset_2px_2px_4px_rgba(16,60,40,0.5)]"
                  >
                    Save & Generate Invoice
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
