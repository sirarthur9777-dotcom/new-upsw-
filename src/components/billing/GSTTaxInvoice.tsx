import React, { useState } from 'react';
import {
  Printer,
  Download,
  Save,
  X,
  Check,
  Copy,
  FileText,
  ExternalLink,
  ArrowLeft,
  Building2,
  Eye,
} from 'lucide-react';
import { Invoice, InvoiceItem, CompanySettings } from '../../types';
import { COMPANY_LOGO_DATA_URI } from '../../data/mockData';

interface GSTTaxInvoiceProps {
  invoice: Invoice;
  companySettings: CompanySettings;
  onClose?: () => void;
  onEdit?: (invoice: Invoice) => void;
}

// Convert numbers into Indian Currency Words (Lakhs, Crores, Thousands)
export function numberToWordsINR(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount) || amount === 0) {
    return 'Rupees Zero Only';
  }

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n < 20) return ones[n];
    const unit = n % 10;
    return tens[Math.floor(n / 10)] + (unit ? ' ' + ones[unit] : '');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let result = '';
    if (hundred > 0) {
      result += ones[hundred] + ' Hundred';
      if (rest > 0) result += ' ';
    }
    if (rest > 0) {
      result += convertTwoDigits(rest);
    }
    return result;
  }

  const roundedAmount = Math.round((Number(amount) || 0) * 100) / 100;
  const integerPart = Math.floor(roundedAmount);
  const paisePart = Math.round((roundedAmount - integerPart) * 100);

  if (integerPart === 0 && paisePart === 0) return 'Rupees Zero Only';

  let numStr = integerPart.toString();
  let words = '';

  // Crores
  if (integerPart >= 10000000) {
    const crore = Math.floor(integerPart / 10000000);
    words += convertTwoDigits(crore) + ' Crore ';
    numStr = (integerPart % 10000000).toString().padStart(7, '0');
  }

  // Lakhs (next 2 digits in 7-digit remainder)
  if (numStr.length >= 6) {
    const lakh = parseInt(numStr.slice(0, numStr.length - 5), 10);
    if (lakh > 0) {
      words += convertTwoDigits(lakh) + ' Lakh ';
    }
    numStr = numStr.slice(numStr.length - 5);
  }

  // Thousands (next 2 digits in 5-digit remainder)
  if (numStr.length >= 4) {
    const thousand = parseInt(numStr.slice(0, numStr.length - 3), 10);
    if (thousand > 0) {
      words += convertTwoDigits(thousand) + ' Thousand ';
    }
    numStr = numStr.slice(numStr.length - 3);
  }

  // Hundreds & units
  const hundredsAndUnits = parseInt(numStr, 10);
  if (hundredsAndUnits > 0) {
    words += convertThreeDigits(hundredsAndUnits) + ' ';
  }

  let finalStr = 'Rupees ' + words.trim();

  if (paisePart > 0) {
    finalStr += ' and ' + convertTwoDigits(paisePart) + ' Paise';
  }

  return finalStr.trim() + ' Only';
}

export const GSTTaxInvoice: React.FC<GSTTaxInvoiceProps> = ({
  invoice,
  companySettings,
  onClose,
  onEdit,
}) => {
  // Document Title: Default to 'BILL OF SUPPLY' to match user's template 100%, with option for 'TAX INVOICE'
  const [docTitle, setDocTitle] = useState<string>(
    invoice.invoiceType === 'Tax Invoice' ? 'TAX INVOICE' : 'BILL OF SUPPLY'
  );
  const [copyType, setCopyType] = useState<string>('Original Copy');
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const getStandaloneA4Html = (): string => {
    const printableElement = document.getElementById('printable-area');
    const content = printableElement ? printableElement.outerHTML : '';

    // Reuse the already-generated application CSS so the standalone print tab
    // keeps the same bill layout instead of losing Tailwind utility classes.
    let appCss = '';
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        appCss += Array.from(sheet.cssRules).map((rule) => rule.cssText).join('\n');
      } catch {
        // Ignore cross-origin stylesheets that the browser does not expose.
      }
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${docTitle} - ${invoice.invoiceNumber || 'UBSW-2026-002'}</title>
  <style>${appCss}</style>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
      color: #000 !important;
      width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
      overflow: visible !important;
      font-family: 'Plus Jakarta Sans', Arial, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @page {
      size: A4 portrait;
      margin: 6mm 5mm !important;
    }
    #printable-area {
      display: block !important;
      position: relative !important;
      width: 200mm !important;
      max-width: 200mm !important;
      min-width: 200mm !important;
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
      margin: 0 auto !important;
      padding: 0 !important;
      border: 1px solid #000 !important;
      box-sizing: border-box !important;
      overflow: visible !important;
      background: #fff !important;
      color: #000 !important;
      box-decoration-break: clone !important;
      -webkit-box-decoration-break: clone !important;
    }
    .bill-top-line,
    .bill-header,
    .bill-invoice-meta,
    .bill-party,
    .bill-summary,
    .bill-bank,
    .bill-footer {
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      overflow: visible !important;
    }
    .bill-header img,
    .bill-header > div:first-child,
    .bill-header > div:first-child > img {
      width: 16mm !important;
      height: 16mm !important;
    }
    .bill-party > div,
    .bill-footer > div {
      min-height: 0 !important;
      height: auto !important;
    }
    .bill-items {
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
      overflow: visible !important;
    }
    .bill-items-table {
      width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
    }
    .bill-items-table thead {
      display: table-header-group !important;
      height: auto !important;
    }
    .bill-items-table thead tr {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      border-top: 1px solid #000 !important;
      border-bottom: 1px solid #000 !important;
    }
    .bill-items-table tbody {
      display: table-row-group !important;
      height: auto !important;
    }
    .bill-items-table tbody tr {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    .bill-items-table th,
    .bill-items-table td {
      box-sizing: border-box !important;
      vertical-align: top !important;
    }
    .bill-items-table th:nth-child(1), .bill-items-table td:nth-child(1) { width: 11mm !important; }
    .bill-items-table th:nth-child(3), .bill-items-table td:nth-child(3) { width: 21mm !important; }
    .bill-items-table th:nth-child(4), .bill-items-table td:nth-child(4) { width: 16.5mm !important; }
    .bill-items-table th:nth-child(5), .bill-items-table td:nth-child(5) { width: 14mm !important; }
    .bill-items-table th:nth-child(6), .bill-items-table td:nth-child(6) { width: 26mm !important; }
    .bill-items-table th:nth-child(7), .bill-items-table td:nth-child(7) { width: 31mm !important; }
    .bill-items-filler { height: auto !important; }
    .bill-items-total {
      height: auto !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      border-top: 1px solid #000 !important;
    }
    .bill-summary table {
      height: auto !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
    }
    .bill-bank img {
      width: 16mm !important;
      height: 16mm !important;
    }
    @media print {
      .no-print, .no-print * { display: none !important; visibility: hidden !important; }
      html, body { width: 100% !important; height: auto !important; overflow: visible !important; }
      #printable-area { position: relative !important; left: auto !important; top: auto !important; width: 200mm !important; height: auto !important; }
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
  };

  const handlePrint = () => {
    try {
      window.focus();
      window.print();
    } catch (e) {
      console.warn('Direct print error, falling back:', e);
      try {
        window.print();
      } catch (err) {
        console.error('Print failed:', err);
      }
    }
  };

  const handleSaveA4Document = () => {
    // 1. Trigger A4 HTML file download for instant offline record
    try {
      const htmlContent = getStandaloneA4Html();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cleanNum = (invoice.invoiceNumber || 'UBSW-2026-002').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `Tax_Invoice_${cleanNum}_A4.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSaveSuccessMsg('A4 Invoice downloaded! You can also select "Save as PDF" in the print dialog.');
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    } catch (err) {
      console.warn('Download error:', err);
    }

    // 2. Also open the system print dialog so user can select 'Save as PDF' directly
    setTimeout(() => {
      handlePrint();
    }, 400);
  };

  const handleOpenInNewTab = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(getStandaloneA4Html());
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
      }, 300);
    }
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify({ invoice, companySettings }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bill_${invoice.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `${docTitle}: ${invoice.invoiceNumber}\nCustomer: ${invoice.customerName}\nTotal Amount: ₹${invoice.grandTotal?.toLocaleString('en-IN')}\nDate: ${invoice.date}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Ensure normalized items with calculated GST values
  const rawItems = invoice.items && invoice.items.length > 0 ? invoice.items : [
    {
      id: '1',
      name: 'Waree 585 Watt N-Type Topcon Mono B/F DCR Panel (Waree)',
      description: 'Model: Waree 585 Watt N-Type Topcon Mono B/F DCR Panel',
      hsnCode: '8541',
      quantity: 10,
      unit: 'Pcs',
      rate: 20900,
      gstPercent: 12,
      subtotal: 209000,
      tax: 25080,
      total: 234080,
    }
  ];

  const items: InvoiceItem[] = rawItems.map((item, idx) => {
    const qty = Number(item.quantity) || 1;
    const rate = Number(item.rate) || 0;
    const disc = Number(item.discount) || 0;
    const taxable = Math.max(0, qty * rate - disc);
    const gstP = Number(item.gstPercent) || (item.name?.toLowerCase().includes('panel') ? 12 : 12);
    const cgstRate = gstP / 2;
    const sgstRate = gstP / 2;
    const cgstAmt = Math.round((taxable * (cgstRate / 100)) * 100) / 100;
    const sgstAmt = Math.round((taxable * (sgstRate / 100)) * 100) / 100;
    const totalTax = cgstAmt + sgstAmt;
    const itemTotal = taxable + totalTax;

    let hsn = item.hsnCode;
    if (!hsn) {
      const lower = (item.name || '').toLowerCase();
      if (lower.includes('panel')) hsn = '8541';
      else if (lower.includes('inverter') || lower.includes('vfd') || lower.includes('pcu')) hsn = '8504';
      else if (lower.includes('battery') || lower.includes('cell')) hsn = '8507';
      else if (lower.includes('structure') || lower.includes('gi') || lower.includes('galvanized')) hsn = '7308';
      else if (lower.includes('wire') || lower.includes('cable') || lower.includes('mcb')) hsn = '8544';
      else if (lower.includes('install') || lower.includes('service') || lower.includes('labour')) hsn = '9954';
      else hsn = '8541';
    }

    return {
      ...item,
      id: item.id || String(idx + 1),
      hsnCode: hsn,
      quantity: qty,
      unit: item.unit || 'Pcs',
      rate: rate,
      discount: disc,
      subtotal: taxable,
      gstPercent: gstP,
      cgstRate,
      cgstAmount: cgstAmt,
      sgstRate,
      sgstAmount: sgstAmt,
      tax: totalTax,
      total: itemTotal,
    };
  });

  // Calculate totals
  const totalQuantity = items.reduce((acc, it) => acc + (it.quantity || 0), 0);
  const subtotal = items.reduce((acc, it) => acc + (it.subtotal || 0), 0);
  const cgstTotal = items.reduce((acc, it) => acc + (it.cgstAmount || 0), 0);
  const sgstTotal = items.reduce((acc, it) => acc + (it.sgstAmount || 0), 0);
  const taxTotal = cgstTotal + sgstTotal;
  const rawGrandTotal = subtotal + taxTotal + (Number(invoice.otherCharges) || 0);
  const roundedGrandTotal = Math.round(rawGrandTotal);
  const finalGrandTotal = invoice.grandTotal ?? roundedGrandTotal;

  // Group items for HSN/SAC summary table
  const hsnGroups = items.reduce((acc: Record<string, { hsn: string; gstRate: number; taxable: number; cgst: number; sgst: number; totalTax: number }>, item) => {
    const key = `${item.hsnCode}_${item.gstPercent}`;
    if (!acc[key]) {
      acc[key] = {
        hsn: item.hsnCode || '8541',
        gstRate: item.gstPercent,
        taxable: 0,
        cgst: 0,
        sgst: 0,
        totalTax: 0,
      };
    }
    acc[key].taxable += item.subtotal;
    acc[key].cgst += item.cgstAmount || 0;
    acc[key].sgst += item.sgstAmount || 0;
    acc[key].totalTax += item.tax || 0;
    return acc;
  }, {});

  const hsnSummaryList = Object.values(hsnGroups);

  // Addresses & details
  const customerName = invoice.customerName || 'kd';
  const customerAddress = invoice.customerAddress || ',';
  const customerMobile = invoice.customerMobile || '79056688826';
  const customerState = invoice.customerState || 'Uttar Pradesh';
  const customerStateCode = invoice.customerStateCode || '09';
  const customerGstin = invoice.customerGst || 'Unregistered';

  const shippingName = invoice.shippingName || customerName;
  const shippingAddress = invoice.shippingAddress || customerAddress;
  const shippingMobile = invoice.shippingMobile || customerMobile;
  const shippingState = invoice.shippingState || customerState;
  const shippingStateCode = invoice.shippingStateCode || customerStateCode;
  const shippingGstin = invoice.shippingGst || customerGstin;

  const placeOfSupply = invoice.placeOfSupply || '09-Uttar Pradesh';
  const reverseCharge = invoice.reverseCharge || 'No';

  const transport = invoice.transportName || 'By Road (Direct Dispatch)';
  const station = invoice.station || 'Site Destination';
  const vehicleNo = invoice.vehicleNo || '';
  const grNo = invoice.grNo || '';

  // QR Code URL: UPI payment QR
  const upiQrCodeUrl =
    companySettings.upiQrUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
      `upi://pay?pa=${companySettings.upiId || 'usatyam30-5@okicici'}&pn=${encodeURIComponent(
        companySettings.companyName || 'Upadhyay Brother Solar Works'
      )}&am=${finalGrandTotal}&cu=INR`
    )}`;

  // Logo selection
  const logoUrl = companySettings.logoUrl || COMPANY_LOGO_DATA_URI;

  return (
    <div id="print-modal-root" className="flex flex-col h-full bg-slate-900/90 text-slate-100 print:h-auto print:bg-white print:overflow-visible print:block">
      {/* ------------------------------------------------------------- */}
      {/* TOOLBAR CONTROLS (HIDDEN DURING PRINT) */}
      {/* ------------------------------------------------------------- */}
      <div className="no-print bg-slate-900 text-white px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {docTitle} Print Layout
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Exact Matching
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {invoice.invoiceNumber || 'UBSW/2026/002'} • {invoice.date || '2026-09-06'}
            </p>
          </div>
        </div>

        {/* Options & Print Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Format Title Toggle */}
          <select
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            title="Document Title"
          >
            <option value="BILL OF SUPPLY">BILL OF SUPPLY</option>
            <option value="TAX INVOICE">TAX INVOICE</option>
          </select>

          {/* Copy Type Selector */}
          <select
            value={copyType}
            onChange={(e) => setCopyType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            title="Copy Indicator"
          >
            <option value="Original Copy">Original Copy</option>
            <option value="Duplicate Copy">Duplicate Copy</option>
            <option value="Triplicate Copy">Triplicate Copy</option>
            <option value="Office Copy">Office Copy</option>
          </select>

          {onEdit && (
            <button
              onClick={() => onEdit(invoice)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700"
            >
              Edit Bill
            </button>
          )}

          <button
            onClick={handleShare}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 flex items-center gap-1.5"
            title="Copy Summary to Clipboard"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
          </button>

          <button
            onClick={handleOpenInNewTab}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 flex items-center gap-1.5"
            title="Open Clean A4 Bill in New Tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">New Tab</span>
          </button>

          <button
            onClick={handleSaveA4Document}
            className="p-1.5 sm:px-3.5 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            title="Save / Download Offline Printable A4 Bill"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save A4</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
            title="Print or Save as PDF (A4)"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF (A4)</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Helper Notification Banner */}
      {saveSuccessMsg && (
        <div className="no-print bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-300 text-xs px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Printable Area Instruction */}
      <div className="no-print bg-slate-800/60 border-b border-slate-700/60 text-slate-400 text-[11px] px-4 py-1.5 text-center flex items-center justify-center gap-2">
        <span className="text-amber-400">💡 Tip:</span>
        <span>To save to your computer as PDF, click <strong>Print / Save PDF (A4)</strong> and set Destination to <strong>Save as PDF</strong>.</span>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 100% EXACT A4 PRINT CANVAS */}
      {/* ------------------------------------------------------------- */}
      <div id="print-canvas" className="flex-1 overflow-y-auto p-2 sm:p-6 flex justify-center items-start bg-slate-950/60 print:p-0 print:m-0 print:bg-white">

        <div
          id="printable-area"
          className="bg-white text-black font-sans shadow-2xl border border-black box-border print:border-black"
          style={{
            width: '200mm',
            maxWidth: '200mm',
            margin: '0 auto',
            padding: '0',
            boxSizing: 'border-box',
            fontSize: '11px',
            lineHeight: '1.3',
            color: '#000000',
            backgroundColor: '#ffffff',
          }}
        >
          {/* 1. TOP LINE: GSTIN & ORIGINAL COPY */}
          <div className="bill-top-line flex justify-between items-center px-3 py-1 text-[11px] font-bold border-b border-black">
            <div>GSTIN : {companySettings.gstNumber || '09AEIPU6555N1Z1'}</div>
            <div>{copyType}</div>
          </div>

          {/* 2. COMPANY HEADER BOX (LOGO ON LEFT, CENTERED COMPANY DETAILS) */}
          <div className="bill-header relative flex items-center justify-between px-3 py-2.5 border-b border-black">
            {/* Left Circular Logo */}
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Upadhyay Solar Works Logo"
                  className="w-16 h-16 object-contain rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full border-2 border-red-600 flex items-center justify-center font-bold text-[9px] text-center text-red-700 leading-tight p-1">
                  UPADHYAY SOLAR WORKS
                </div>
              )}
            </div>

            {/* Center Company Information */}
            <div className="flex-1 text-center pr-16">
              <div className="text-[12px] font-bold tracking-wide uppercase">
                {docTitle}
              </div>
              <h1 className="text-[19px] font-black text-black leading-tight mt-0.5 tracking-tight">
                {companySettings.companyName || 'Upadhyay Brother Solar Works'}
              </h1>
              <p className="text-[11px] text-black leading-tight mt-0.5">
                {companySettings.address ? companySettings.address.replace(', Uttar Pradesh - 222001', '') : 'Babhanauli Damrua, Jaunpur'}
              </p>
              <p className="text-[10.5px] text-black leading-tight mt-0.5 font-normal">
                Tel.: {companySettings.phone || '+91 98193 91461'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;email : {companySettings.email || 'usatyam30-5@okicici'}
              </p>
            </div>
          </div>

          {/* 3. INVOICE & DISPATCH DETAILS (TWO COLUMNS DIVIDED BY VERTICAL LINE) */}
          <div className="bill-invoice-meta grid grid-cols-2 divide-x divide-black border-b border-black text-[10.5px]">
            {/* Left Column */}
            <div className="px-3 py-1.5 space-y-0.5">
              <div className="flex">
                <span className="w-32 inline-block">Invoice No.</span>
                <span className="mr-1">:</span>
                <span className="font-semibold">{invoice.invoiceNumber || 'UBSW/2026/002'}</span>
              </div>
              <div className="flex">
                <span className="w-32 inline-block">Dated</span>
                <span className="mr-1">:</span>
                <span>{invoice.date || '2026-09-06'}</span>
              </div>
              <div className="flex">
                <span className="w-32 inline-block">Place of Supply</span>
                <span className="mr-1">:</span>
                <span>{placeOfSupply}</span>
              </div>
              <div className="flex">
                <span className="w-32 inline-block">Reverse Charge</span>
                <span className="mr-1">:</span>
                <span>{reverseCharge}</span>
              </div>
            </div>

            {/* Right Column */}
            <div className="px-3 py-1.5 space-y-0.5">
              <div className="flex">
                <span className="w-28 inline-block">GR/RR No.</span>
                <span className="mr-1">:</span>
                <span>{grNo}</span>
              </div>
              <div className="flex">
                <span className="w-28 inline-block">Transport</span>
                <span className="mr-1">:</span>
                <span>{transport}</span>
              </div>
              <div className="flex">
                <span className="w-28 inline-block">Vehicle No.</span>
                <span className="mr-1">:</span>
                <span>{vehicleNo}</span>
              </div>
              <div className="flex">
                <span className="w-28 inline-block">Station</span>
                <span className="mr-1">:</span>
                <span>{station}</span>
              </div>
            </div>
          </div>

          {/* 4. BILLED TO & SHIPPED TO (TWO COLUMNS DIVIDED BY VERTICAL LINE) */}
          <div className="bill-party grid grid-cols-2 divide-x divide-black border-b border-black text-[10.5px]">
            {/* Left Column: Billed To */}
            <div className="px-3 py-2 flex flex-col justify-between min-h-[96px]">
              <div>
                <div className="font-bold">Billed to :</div>
                <div className="font-semibold mt-0.5">{customerName}</div>
                <div className="text-[10px] leading-tight mt-0.5">{customerAddress}</div>
              </div>
              <div className="mt-2 space-y-0.5">
                <div className="flex">
                  <span className="w-32 inline-block">Party Mobile No</span>
                  <span className="mr-1">:</span>
                  <span>{customerMobile}</span>
                </div>
                <div className="flex">
                  <span className="w-32 inline-block">State</span>
                  <span className="mr-1">:</span>
                  <span>{customerState} ({customerStateCode})</span>
                </div>
                <div className="flex">
                  <span className="w-32 inline-block">GSTIN / UIN</span>
                  <span className="mr-1">:</span>
                  <span>{customerGstin}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Shipped To */}
            <div className="px-3 py-2 flex flex-col justify-between min-h-[96px]">
              <div>
                <div className="font-bold">Shipped to :</div>
                <div className="font-semibold mt-0.5">{shippingName}</div>
                <div className="text-[10px] leading-tight mt-0.5">{shippingAddress}</div>
              </div>
              <div className="mt-2 space-y-0.5">
                <div className="flex">
                  <span className="w-32 inline-block">Party Mobile No</span>
                  <span className="mr-1">:</span>
                  <span>{shippingMobile}</span>
                </div>
                <div className="flex">
                  <span className="w-32 inline-block">State</span>
                  <span className="mr-1">:</span>
                  <span>{shippingState} ({shippingStateCode})</span>
                </div>
                <div className="flex">
                  <span className="w-32 inline-block">GSTIN / UIN</span>
                  <span className="mr-1">:</span>
                  <span>{shippingGstin}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. ITEMS TABLE (DESCRIPTION OF GOODS) WITH PRECISE COLUMNS & BORDERS */}
          <div className={`bill-items bill-items-count-${Math.min(items.length, 5)} border-b border-black`}>
            <table className="bill-items-table w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="border-b border-black font-bold text-[10px] text-black">
                  <th className="py-1.5 px-2 text-center w-[36px] border-r border-black font-bold">
                    S.N.
                  </th>
                  <th className="py-1.5 px-2 border-r border-black font-bold">
                    Description of Goods
                  </th>
                  <th className="py-1.5 px-1 text-center w-[76px] border-r border-black font-bold leading-tight">
                    <div>HSN/SAC</div>
                    <div>Code</div>
                  </th>
                  <th className="py-1.5 px-1 text-center w-[58px] border-r border-black font-bold">
                    Qty.
                  </th>
                  <th className="py-1.5 px-1 text-center w-[52px] border-r border-black font-bold">
                    Unit
                  </th>
                  <th className="py-1.5 px-2 text-right w-[94px] border-r border-black font-bold">
                    Price
                  </th>
                  <th className="py-1.5 px-2 text-right w-[114px] font-bold">
                    Amount(₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const modelText =
                    item.model ||
                    (item.description && !item.description.startsWith('Model:')
                      ? `Model: ${item.description}`
                      : item.description || `Model: ${item.name}`);

                  return (
                    <tr key={item.id || idx} className="align-top">
                      <td className="py-2 px-2 text-center border-r border-black">
                        {idx + 1}.
                      </td>
                      <td className="py-2 px-2 border-r border-black leading-tight">
                        <div className="font-bold text-[10.5px]">{item.name}</div>
                        {modelText && (
                          <div className="text-[9.5px] mt-0.5 text-black">{modelText}</div>
                        )}
                        {item.serialNumbers && item.serialNumbers.trim() && (
                          <div className="text-[9px] font-mono mt-0.5">
                            SN: {item.serialNumbers.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-1 text-center border-r border-black font-mono">
                        {item.hsnCode}
                      </td>
                      <td className="py-2 px-1 text-center border-r border-black font-mono">
                        {Number(item.quantity).toFixed(2)}
                      </td>
                      <td className="py-2 px-1 text-center border-r border-black">
                        {item.unit || 'Pcs'}
                      </td>
                      <td className="py-1.5 px-2 text-right border-r border-black font-mono">
                        {Number(item.rate).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono font-medium">
                        {Number(item.subtotal && item.subtotal > 0 ? item.subtotal : (item.quantity * item.rate)).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  );
                })}

                {/* Blank spacing filler rows to preserve the classic look while fitting single A4 */}
                {items.length <= 2 && (
                  <tr className="bill-items-filler align-top">
                    <td className="border-r border-black">&nbsp;</td>
                    <td className="border-r border-black">&nbsp;</td>
                    <td className="border-r border-black">&nbsp;</td>
                    <td className="border-r border-black">&nbsp;</td>
                    <td className="border-r border-black">&nbsp;</td>
                    <td className="border-r border-black">&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                )}

                {/* GRAND TOTAL ROW */}
                <tr className="bill-items-total border-t border-black font-bold text-[10.5px]">
                  <td colSpan={2} className="py-1.5 px-3 text-right border-r border-black">
                    Grand Total
                  </td>
                  <td className="py-1.5 px-1 text-center border-r border-black font-mono">
                    {/* HSN Column Empty in Grand Total */}
                  </td>
                  <td className="py-1.5 px-1 text-center border-r border-black font-mono">
                    {totalQuantity.toFixed(2)}
                  </td>
                  <td className="py-1.5 px-1 text-center border-r border-black">
                    {items[0]?.unit ? `${items[0].unit}.` : 'Pcs.'}
                  </td>
                  <td className="py-1.5 px-2 text-right border-r border-black">
                    ₹
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono font-black text-[11px]">
                    {finalGrandTotal.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 6. HSN/SAC TAX BREAKDOWN TABLE */}
          <div className="bill-summary border-b border-black text-[9.5px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black font-bold text-center text-[9.5px]">
                  <th className="py-1 px-2 border-r border-black">HSN/SAC</th>
                  <th className="py-1 px-2 border-r border-black">Tax Rate</th>
                  <th className="py-1 px-2 border-r border-black text-right">Zero Rated</th>
                  <th className="py-1 px-2 border-r border-black text-right">Taxable</th>
                  <th className="py-1 px-2 border-r border-black text-right">CGST</th>
                  <th className="py-1 px-2 border-r border-black text-right">SGST</th>
                  <th className="py-1 px-2 text-right">Total Tax</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[9px]">
                {hsnSummaryList.map((h, i) => (
                  <tr key={i}>
                    <td className="py-0.5 px-2 text-center border-r border-black">{h.hsn}</td>
                    <td className="py-0.5 px-2 text-center border-r border-black">{h.gstRate}%</td>
                    <td className="py-0.5 px-2 text-right border-r border-black">0.00</td>
                    <td className="py-0.5 px-2 text-right border-r border-black">
                      {h.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-0.5 px-2 text-right border-r border-black">
                      {h.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-0.5 px-2 text-right border-r border-black">
                      {h.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-0.5 px-2 text-right">
                      {h.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* AMOUNT IN WORDS DIRECTLY UNDER HSN SUMMARY */}
            <div className="px-2.5 py-1.5 text-[10px] font-bold text-black border-t border-black">
              {numberToWordsINR(finalGrandTotal)}
            </div>
          </div>

          {/* 7. BANK DETAILS & UPI QR CODE */}
          <div className="bill-bank flex justify-between items-center px-3 py-1.5 border-b border-black text-[10px]">
            {/* Left Bank Details */}
            <div className="space-y-0.5">
              <div className="font-bold text-[10.5px]">Bank Details</div>
              <div className="flex">
                <span className="w-20 inline-block">Name</span>
                <span className="mr-1">:</span>
                <span className="font-medium">{companySettings.accountHolderName || companySettings.companyName || 'Upadhyay Brother Solar Works'}</span>
              </div>
              <div className="flex">
                <span className="w-20 inline-block">A/c No</span>
                <span className="mr-1">:</span>
                <span className="font-mono font-medium">{companySettings.accountNumber || '655509AEIPU1234'}</span>
              </div>
              <div className="flex">
                <span className="w-20 inline-block">IFSC</span>
                <span className="mr-1">:</span>
                <span className="font-mono font-medium">{companySettings.ifscCode || 'ICIC0006555'}</span>
              </div>
            </div>

            {/* Right QR Code */}
            <div className="shrink-0 flex items-center justify-center pr-2">
              <img
                src={upiQrCodeUrl}
                alt="UPI Payment QR"
                className="w-16 h-16 object-contain border border-black p-0.5 bg-white"
              />
            </div>
          </div>

          {/* 8. TERMS & CONDITIONS AND SIGNATURES (TWO COLUMNS) */}
          <div className="bill-footer grid grid-cols-2 divide-x divide-black text-[9.5px]">
            {/* Left: Terms & Conditions */}
            <div className="px-3 py-2 flex flex-col justify-start">
              <div className="font-bold text-[10px]">Terms & Conditions</div>
              <div className="pl-2.5 space-y-0.5 text-[9px] mt-0.5 text-black leading-tight">
                <div>E.& O.E.</div>
                <div>Goods once sold will not be taken back.</div>
                <div>Interest @ 18% p.a. will be charged if the payment is not made within the stipulated time.</div>
                <div>Subject to local jurisdiction only.</div>
              </div>
            </div>

            {/* Right: Receiver's Signature & Authorised Signatory */}
            <div className="px-3 py-2 flex flex-col justify-between min-h-[96px]">
              <div className="font-bold text-[10px]">Receiver's Signature :</div>

              <div className="text-center mt-2 flex flex-col items-center">
                <div className="font-bold text-[9px] uppercase tracking-wide">
                  For {companySettings.companyName?.toUpperCase() || 'UPADHYAY BROTHER SOLAR WORKS'}
                </div>

                {/* Signature Image */}
                <div className="h-8 flex items-center justify-center my-0.5">
                  {companySettings.signatureUrl ? (
                    <img
                      src={companySettings.signatureUrl}
                      alt="Authorized signature"
                      className="h-7 max-h-7 object-contain"
                    />
                  ) : (
                    <span className="font-serif italic text-[11px] text-slate-700 font-bold">
                      Authorized signature
                    </span>
                  )}
                </div>

                <div className="font-bold text-[9px] border-t border-black pt-0.5 w-44 text-center">
                  Authorised Signatory
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
