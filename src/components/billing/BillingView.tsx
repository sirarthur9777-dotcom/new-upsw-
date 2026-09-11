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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Billing & Tax Invoices</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate A4 GST compliant invoices with company logo, barcode & payment QR code
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportInvoicesExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Invoices Excel</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create GST Invoice</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice #, customer..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'Paid', 'Partial', 'Pending'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No invoices generated yet.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">{inv.invoiceNumber}</span>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white">{inv.customerName}</p>
                      <p className="text-[11px] text-slate-400">📱 {inv.customerMobile}</p>
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      <p>{inv.date}</p>
                      <p className="text-[10px] text-slate-400">Due: {inv.dueDate}</p>
                    </td>

                    <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                      ₹{inv.grandTotal.toLocaleString()}
                    </td>

                    <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400">
                      ₹{inv.advancePaid.toLocaleString()}
                    </td>

                    <td className="p-4 font-extrabold text-red-600 dark:text-red-400">
                      ₹{inv.remainingBalance.toLocaleString()}
                    </td>

                    <td className="p-4">
                      {(inv.paymentStatus === 'Paid' && (Number(inv.remainingBalance) || 0) <= 0) || inv.isLocked ? (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          title="Locked (Paid in Full) — Read Only"
                        >
                          <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Paid &amp; Locked</span>
                        </span>
                      ) : (
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                            inv.paymentStatus === 'Paid'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : inv.paymentStatus === 'Partial'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => triggerPrint('invoice', inv)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 transition shadow-xs"
                          title="Print or Download PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print A4</span>
                        </button>
                        {(inv.paymentStatus === 'Paid' && (Number(inv.remainingBalance) || 0) <= 0) || inv.isLocked ? (
                          <div
                            className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 cursor-not-allowed inline-flex items-center justify-center"
                            title="Invoice is fully PAID and locked. To modify or delete, reverse payment in Accounting first."
                          >
                            <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => openEditModal(inv)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="Edit Invoice"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete Invoice ${inv.invoiceNumber}?`)) deleteInvoice(inv.id);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 sm:my-6 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 bg-white dark:bg-slate-900">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{editingInvoiceId ? 'Edit GST Tax Invoice' : 'Create Modern Tax Invoice'}</span>
                  {editingInvoiceId && (
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold border border-amber-500/20">
                      ID: {editingInvoiceId}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Auto calculates subtotal, GST %, discount & remaining balance
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form & Scrollable Content */}
            <form onSubmit={handleCreateInvoiceSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
                {/* Top Details: Customer & Invoice Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="sm:col-span-2 lg:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 whitespace-nowrap">
                      Select Customer (Billed To) *
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500 text-xs sm:text-sm font-semibold shadow-xs"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.mobile}) - {c.district || c.address}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 whitespace-nowrap">
                      Invoice Date
                    </label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500 text-xs sm:text-sm font-medium shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 whitespace-nowrap">
                      Payment Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500 text-xs sm:text-sm font-medium shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 whitespace-nowrap">
                      Place of Supply
                    </label>
                    <input
                      type="text"
                      value={placeOfSupply}
                      onChange={(e) => setPlaceOfSupply(e.target.value)}
                      placeholder="e.g. 09-Uttar Pradesh"
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500 text-xs sm:text-sm font-medium shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 whitespace-nowrap">
                      Reverse Charge
                    </label>
                    <select
                      value={reverseCharge}
                      onChange={(e) => setReverseCharge(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500 text-xs sm:text-sm font-semibold shadow-xs"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 whitespace-nowrap">
                      GR / RR / DC No.
                    </label>
                    <input
                      type="text"
                      value={grNo}
                      onChange={(e) => setGrNo(e.target.value)}
                      placeholder="e.g. GR-9821"
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500 text-xs sm:text-sm font-mono shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 whitespace-nowrap">
                      Vehicle Number
                    </label>
                    <input
                      type="text"
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                      placeholder="e.g. UP 62 AB 9988"
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500 text-xs sm:text-sm font-mono uppercase shadow-xs"
                    />
                  </div>
                </div>

                {/* Shipped To (Consignee) Details Toggle */}
                <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-amber-500" />
                      <span>Consignee / Shipped To Details</span>
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={sameAsBilling}
                        onChange={(e) => setSameAsBilling(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                      />
                      <span>Same as Billed To (Customer Details)</span>
                    </label>
                  </div>

                  {!sameAsBilling && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-3 border-t border-slate-200 dark:border-slate-700 animate-in fade-in">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Consignee Name
                        </label>
                        <input
                          type="text"
                          value={shippingName}
                          onChange={(e) => setShippingName(e.target.value)}
                          placeholder="Recipient / Site Contact Name"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Consignee Mobile
                        </label>
                        <input
                          type="text"
                          value={shippingMobile}
                          onChange={(e) => setShippingMobile(e.target.value)}
                          placeholder="Phone Number"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Consignee GSTIN / PAN
                        </label>
                        <input
                          type="text"
                          value={shippingGst}
                          onChange={(e) => setShippingGst(e.target.value)}
                          placeholder="GSTIN or Unregistered"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono uppercase shadow-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Delivery / Site Address
                        </label>
                        <input
                          type="text"
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          placeholder="Full delivery location address"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          State & State Code
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={shippingState}
                            onChange={(e) => setShippingState(e.target.value)}
                            placeholder="Uttar Pradesh"
                            className="col-span-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm shadow-xs"
                          />
                          <input
                            type="text"
                            value={shippingStateCode}
                            onChange={(e) => setShippingStateCode(e.target.value)}
                            placeholder="09"
                            className="col-span-1 px-2 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-center font-mono shadow-xs"
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
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-500" />
                        <span>Invoice Line Items & GST Rates</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Configure description, HSN code, quantities, rates, and taxes
                      </p>
                    </div>
                    <button
                      type="button"
                      id="add-invoice-item-btn"
                      onClick={() => handleAddItem()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-xs transition shadow-sm whitespace-nowrap"
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
                        className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4 shadow-xs transition hover:border-slate-300 dark:hover:border-slate-600"
                      >
                        {/* SKU Quick Select Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-200/80 dark:border-slate-700/60">
                          <div className="flex items-center gap-2.5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider border border-amber-500/20">
                              <Layers className="w-3.5 h-3.5 text-amber-500" />
                              <span>ITEM #{idx + 1}</span>
                            </span>
                            {item.name ? (
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden md:inline-block max-w-sm truncate" title={item.name}>
                                {item.name}
                              </span>
                            ) : null}
                          </div>

                          <div className="flex items-center gap-2 flex-1 max-w-2xl justify-end">
                            <div className="flex-1 min-w-[220px] max-w-lg">
                              <select
                                id={`item-inventory-select-${idx}`}
                                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 shadow-xs"
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
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition whitespace-nowrap flex-shrink-0"
                              title="Delete this item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Delete Item</span>
                            </button>
                          </div>
                        </div>

                        {/* Item Fields: Responsive grid & wrapping */}
                        <div className="flex flex-wrap items-start gap-3">
                          {/* Description */}
                          <div className="flex-1 min-w-[260px]">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 whitespace-nowrap">
                              Description of Goods / Services *
                            </label>
                            <input
                              type="text"
                              list="billing-inventory-products"
                              value={item.name}
                              onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                              placeholder="Item name & brand"
                              title={item.name}
                              className="w-full h-10 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500 shadow-xs"
                            />
                          </div>

                          {/* HSN/SAC Code */}
                          <div className="w-28 sm:w-32 flex-shrink-0 min-w-[110px]">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 whitespace-nowrap">
                              HSN/SAC Code
                            </label>
                            <input
                              type="text"
                              value={item.hsnCode || '8541'}
                              onChange={(e) => handleItemChange(item.id, 'hsnCode', e.target.value)}
                              placeholder="8541"
                              className="w-full h-10 px-2 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-center font-mono text-xs sm:text-sm font-bold focus:outline-none focus:border-amber-500 shadow-xs"
                            />
                          </div>

                          {/* Qty */}
                          <div className="w-20 sm:w-20 flex-shrink-0 min-w-[70px]">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 whitespace-nowrap">
                              Qty
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                              className="w-full h-10 px-2 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-center text-xs sm:text-sm font-bold focus:outline-none focus:border-amber-500 shadow-xs"
                            />
                          </div>

                          {/* Unit */}
                          <div className="w-20 sm:w-20 flex-shrink-0 min-w-[70px]">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 whitespace-nowrap">
                              Unit
                            </label>
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                              className="w-full h-10 px-2 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-center text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500 shadow-xs"
                            />
                          </div>

                          {/* Rate (₹) */}
                          <div className="w-36 sm:w-44 flex-shrink-0 min-w-[145px]">
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                Rate (₹)
                              </label>
                              {item.rate ? (
                                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
                                  ₹{Number(item.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              ) : null}
                            </div>
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
                              className="w-full h-10 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700 text-right text-xs sm:text-sm font-bold font-mono focus:outline-none focus:border-amber-500 shadow-xs"
                            />
                          </div>

                          {/* GST % */}
                          <div className="w-24 sm:w-24 flex-shrink-0 min-w-[85px]">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 whitespace-nowrap">
                              GST %
                            </label>
                            <select
                              value={item.gstPercent}
                              onChange={(e) => handleItemChange(item.id, 'gstPercent', e.target.value)}
                              className="w-full h-10 px-2 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-center text-xs sm:text-sm font-bold focus:outline-none focus:border-amber-500 shadow-xs cursor-pointer"
                            >
                              <option value={0}>0%</option>
                              <option value={5}>5%</option>
                              <option value={12}>12%</option>
                              <option value={18}>18%</option>
                              <option value={28}>28%</option>
                            </select>
                          </div>

                          {/* Total (₹) */}
                          <div className="w-full sm:w-52 flex-shrink-0 min-w-[185px]">
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                Total (₹)
                              </label>
                              <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">
                                Incl. GST
                              </span>
                            </div>
                            <div
                              id={`invoice-item-total-${idx}`}
                              className="w-full h-10 px-3 py-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-black font-mono text-xs sm:text-sm text-right whitespace-nowrap flex items-center justify-end select-all shadow-inner tracking-tight"
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
                        <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-700/60">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                              Serial Number(s)
                            </label>
                            <span className="text-[11px] text-slate-400">
                              Single or multiple (comma / line break separated)
                            </span>
                          </div>
                          <textarea
                            rows={1}
                            value={item.serialNumbers || ''}
                            onChange={(e) => handleItemChange(item.id, 'serialNumbers', e.target.value)}
                            placeholder="e.g. SN001234, SN001235, SN001236"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:border-amber-500 min-h-[38px] resize-y shadow-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Summary Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 whitespace-nowrap">
                        Payment Mode
                      </label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold shadow-xs"
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI / Digital QR</option>
                        <option value="Bank Transfer">NEFT / RTGS / Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 whitespace-nowrap">
                        Advance Received (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={advancePaid === 0 ? '' : advancePaid}
                        onChange={(e) => setAdvancePaid(e.target.value === '' ? 0 : Number(e.target.value))}
                        placeholder="0.00"
                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold font-mono shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 whitespace-nowrap">
                        Invoice Notes / Terms
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Delivery terms, warranty details, payment conditions, etc."
                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs sm:text-sm shadow-xs resize-y min-h-[60px]"
                      />
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs sm:text-sm shadow-sm">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Taxable Value (Subtotal):</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-slate-100">
                        ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>CGST Amount:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        ₹{cgstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>SGST Amount:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        ₹{sgstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 font-semibold border-t border-slate-200/80 dark:border-slate-700/80 pt-2">
                      <span>Total GST:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        ₹{taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-extrabold text-sm sm:text-base text-slate-900 dark:text-white pt-2.5 border-t border-slate-200 dark:border-slate-700">
                      <span>Invoice Grand Total:</span>
                      <span className="text-amber-500 font-mono text-base sm:text-lg">
                        ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                      <span>Advance Received:</span>
                      <span className="font-mono">
                        ₹{advancePaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-extrabold text-sm sm:text-base text-red-500 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span>Balance Amount Due:</span>
                      <span className="font-mono text-base sm:text-lg">
                        ₹{remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Bottom Actions Bar */}
              <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
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
                  className="px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 flex items-center gap-2 transition whitespace-nowrap text-xs"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview A4 Invoice / Print</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition whitespace-nowrap text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-md shadow-amber-500/20 whitespace-nowrap text-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save & Generate Invoice</span>
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
