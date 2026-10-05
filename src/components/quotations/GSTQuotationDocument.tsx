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
  Edit2,
  Calendar,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  User,
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { Quotation, QuotationItem, CompanySettings, Customer } from '../../types';
import { COMPANY_LOGO_DATA_URI } from '../../data/mockData';
import { numberToWordsINR } from '../billing/GSTTaxInvoice';

interface GSTQuotationDocumentProps {
  quotation: Quotation;
  companySettings: CompanySettings;
  customer?: Customer | null;
  onClose?: () => void;
  onEdit?: (quotation: Quotation) => void;
  onConvert?: (quotation: Quotation) => void;
  onDuplicate?: (quotation: Quotation) => void;
}

export const GSTQuotationDocument: React.FC<GSTQuotationDocumentProps> = ({
  quotation,
  companySettings,
  customer,
  onClose,
  onEdit,
  onConvert,
  onDuplicate,
}) => {
  const [docTitle, setDocTitle] = useState<string>('QUOTATION');
  const [copyType, setCopyType] = useState<string>('ORIGINAL COPY');
  const [zoom, setZoom] = useState<number>(100);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Normalize customer and party values
  const customerName = quotation.customerName || customer?.name || 'Customer Name';
  const customerMobile = quotation.customerMobile || customer?.mobile || 'N/A';
  const customerEmail = quotation.customerEmail || customer?.email || '';
  const customerAddress =
    quotation.customerAddress ||
    customer?.address ||
    (customer ? `${customer.village || ''} ${customer.district || ''}`.trim() : '');
  const customerState = quotation.customerState || customer?.state || 'Uttar Pradesh';
  const customerStateCode = quotation.customerStateCode || customer?.stateCode || '09';
  const customerGstin = quotation.customerGstin || customer?.gstNumber || '';

  // Shipping details fallback to billing if same/unspecified
  const shippingName = quotation.shippingName || customer?.shippingName || customerName;
  const shippingAddress = quotation.shippingAddress || customer?.shippingAddress || customerAddress;
  const shippingMobile = quotation.shippingMobile || customer?.shippingMobile || customerMobile;
  const shippingState = quotation.shippingState || customer?.shippingState || customerState;
  const shippingStateCode = quotation.shippingStateCode || customer?.shippingStateCode || customerStateCode;
  const shippingGstin = quotation.shippingGstin || customer?.shippingGst || customerGstin;

  // Quotation metadata
  const quoteNumber = quotation.quoteNumber || 'QUO/2026/001';
  const quoteDate = quotation.createdAt || new Date().toISOString().split('T')[0];
  const validUntil = quotation.validUntil || '';
  const placeOfSupply = quotation.placeOfSupply || '09-Uttar Pradesh';
  const reverseCharge = quotation.reverseCharge || 'No';

  // System & Delivery specification values
  const projectSystem = `${quotation.capacityKW || 10} KW ${quotation.systemType || 'Hybrid'} (${quotation.projectType || 'Residential'})`;
  const delivery = quotation.delivery || 'By Road (Direct Dispatch)';
  const paymentTerms = quotation.paymentTerms || '50% Advance, 40% on Delivery, 10% on Commissioning';
  const installation = quotation.installation || 'Included (as per scope)';
  const warranty = quotation.warranty || 'As per manufacturer';

  const items: QuotationItem[] = quotation.items && quotation.items.length > 0 ? quotation.items : [];

  // Totals calculations
  const totalQuantity = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
  const subtotal = quotation.estimatedCost || items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  const taxAmount = quotation.taxAmount !== undefined ? quotation.taxAmount : Math.round(subtotal * 0.12);
  const grandTotal = quotation.grandTotal || subtotal + taxAmount;

  // Dynamic GST Summary Breakdown (defaults to 12% if unspecified, with 6% CGST + 6% SGST)
  // Group by HSN/SAC
  const hsnMap: { [hsn: string]: { hsn: string; gstRate: number; taxable: number; cgst: number; sgst: number; totalTax: number } } = {};
  items.forEach((item) => {
    const hsn = item.hsnCode || '85044090';
    const ratePercent = item.taxRate !== undefined ? item.taxRate : 12;
    const taxable = Number(item.amount) || 0;
    const cgst = Math.round(((taxable * (ratePercent / 2)) / 100) * 100) / 100;
    const sgst = Math.round(((taxable * (ratePercent / 2)) / 100) * 100) / 100;
    const totalTax = cgst + sgst;

    if (!hsnMap[hsn]) {
      hsnMap[hsn] = { hsn, gstRate: ratePercent, taxable: 0, cgst: 0, sgst: 0, totalTax: 0 };
    }
    hsnMap[hsn].taxable += taxable;
    hsnMap[hsn].cgst += cgst;
    hsnMap[hsn].sgst += sgst;
    hsnMap[hsn].totalTax += totalTax;
  });

  const hsnSummaryList = Object.values(hsnMap);
  if (hsnSummaryList.length === 0) {
    const cgst = Math.round((taxAmount / 2) * 100) / 100;
    const sgst = Math.round((taxAmount / 2) * 100) / 100;
    hsnSummaryList.push({
      hsn: '85044090',
      gstRate: 12,
      taxable: subtotal,
      cgst,
      sgst,
      totalTax: taxAmount,
    });
  }

  // QR Code URL: UPI payment QR
  const upiQrCodeUrl =
    companySettings.upiQrUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
      `upi://pay?pa=${companySettings.upiId || 'kdsingh9777@gmail.com'}&pn=${encodeURIComponent(
        companySettings.companyName || 'Upadhyay Brother Solar Works'
      )}&am=${grandTotal}&cu=INR`
    )}`;

  const logoUrl = companySettings.logoUrl || COMPANY_LOGO_DATA_URI;

  // Master Layout & Pagination Rules:
  // For 1 to 7 items, fits completely onto exactly ONE A4 page.
  // Full balanced item area is maintained (~105mm table height on Page 1) without spilling to Page 2.
  const estimatedItemsHeight = items.reduce((acc, item) => {
    let h = 11;
    if (item.description && item.description.length > 40) h += 4;
    if (item.brand || item.model) h += 4;

    // Serial numbers are rendered inside the description cell and may wrap
    // to multiple lines. Reserve enough height so they never overlap
    // subsequent rows/content or get clipped on the first A4 page.
    const serialCount = item.serialNumbers
      ? item.serialNumbers.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean).length
      : 0;
    const serialTextLength = item.serialNumbers?.trim().length || 0;
    if (serialCount > 0) {
      h += 5 + Math.min(24, Math.max(4, Math.ceil(serialTextLength / 48) * 4));
    }

    return acc + h;
  }, 0);
  const isMultiPage = items.length > 7 || estimatedItemsHeight > 88;

  const getStandaloneA4Html = (): string => {
    const printableElement = document.getElementById('printable-quotation-area');
    const content = printableElement ? printableElement.outerHTML : '';

    let appCss = '';
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        appCss += Array.from(sheet.cssRules).map((rule) => rule.cssText).join('\n');
      } catch {
        // Ignore cross-origin
      }
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quotation - ${quoteNumber}</title>
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
      font-family: Arial, Helvetica, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @page {
      size: A4 portrait;
      margin: 4mm 5mm !important;
    }
    #printable-quotation-area {
      display: block !important;
      position: relative !important;
      width: 200mm !important;
      max-width: 200mm !important;
      min-width: 200mm !important;
      height: auto !important;
      min-height: 0 !important;
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
    .quote-top-line {
      height: 5.5mm !important;
      min-height: 5.5mm !important;
      box-sizing: border-box !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    .quote-header {
      height: 19mm !important;
      min-height: 19mm !important;
      padding-top: 1mm !important;
      padding-bottom: 1mm !important;
      box-sizing: border-box !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    .quote-header img,
    .quote-header > div:first-child,
    .quote-header > div:first-child > img {
      width: 16mm !important;
      height: 16mm !important;
    }
    .quote-meta-section {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      height: auto !important;
      min-height: 18mm !important;
      box-sizing: border-box !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      overflow: visible !important;
    }
    .info-column {
      display: flex !important;
      flex-direction: column !important;
      height: auto !important;
      min-height: 0 !important;
      box-sizing: border-box !important;
    }
    .info-row {
      display: grid !important;
      grid-template-columns: 105px minmax(0, 1fr) !important;
      align-items: start !important;
      column-gap: 6px !important;
      min-height: 15px !important;
      height: auto !important;
      padding: 1px 0 !important;
      box-sizing: border-box !important;
    }
    .info-label {
      display: flex !important;
      justify-content: space-between !important;
      align-items: flex-start !important;
      font-weight: 600 !important;
      white-space: nowrap !important;
      box-sizing: border-box !important;
    }
    .info-label .colon {
      font-weight: normal !important;
      margin-left: 2px !important;
    }
    .info-value {
      min-width: 0 !important;
      max-width: 100% !important;
      white-space: normal !important;
      overflow-wrap: anywhere !important;
      word-break: normal !important;
      line-height: 1.25 !important;
      box-sizing: border-box !important;
    }
    .quote-party-section {
      height: 38mm !important;
      min-height: 38mm !important;
      box-sizing: border-box !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    .quote-party-section > div {
      min-height: 38mm !important;
      height: 38mm !important;
    }
    #printable-quotation-area:not(.multi-page) .quote-items-container {
      height: 100mm !important;
      min-height: 100mm !important;
      box-sizing: border-box !important;
    }
    #printable-quotation-area:not(.multi-page) .quote-items-table {
      height: 100mm !important;
      min-height: 100mm !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
    }
    #printable-quotation-area.multi-page .quote-items-container {
      height: auto !important;
      min-height: 0 !important;
      overflow: visible !important;
    }
    #printable-quotation-area.multi-page .quote-items-table {
      height: auto !important;
      min-height: 0 !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
    }
    .quote-items-table thead {
      display: table-header-group !important;
      height: auto !important;
    }
    .quote-items-table thead tr {
      height: 7mm !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      border-top: 1px solid #000 !important;
      border-bottom: 1px solid #000 !important;
    }
    .quote-items-table tbody {
      display: table-row-group !important;
    }
    .quote-items-table tbody tr.quote-item-row {
      height: 1px !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    .quote-items-table tbody tr.quote-items-filler {
      height: 100% !important;
    }
    .quote-items-table tbody tr.quote-items-filler td {
      height: 100% !important;
    }
    .quote-items-table th,
    .quote-items-table td {
      box-sizing: border-box !important;
      vertical-align: top !important;
    }
    .quote-items-table th:nth-child(1), .quote-items-table td:nth-child(1) { width: 11mm !important; }
    .quote-items-table th:nth-child(3), .quote-items-table td:nth-child(3) { width: 21mm !important; }
    .quote-items-table th:nth-child(4), .quote-items-table td:nth-child(4) { width: 16.5mm !important; }
    .quote-items-table th:nth-child(5), .quote-items-table td:nth-child(5) { width: 14mm !important; }
    .quote-items-table th:nth-child(6), .quote-items-table td:nth-child(6) { width: 26mm !important; }
    .quote-items-table th:nth-child(7), .quote-items-table td:nth-child(7) { width: 31mm !important; }
    .quote-items-total {
      height: 7.5mm !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      border-top: 1px solid #000 !important;
    }
    .quote-summary {
      height: auto !important;
      min-height: 16mm !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      overflow: visible !important;
    }
    .quote-summary table {
      table-layout: fixed !important;
      border-collapse: collapse !important;
    }
    .quote-bank {
      height: 17.5mm !important;
      min-height: 17.5mm !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      overflow: visible !important;
    }
    .quote-bank img {
      width: 16mm !important;
      height: 16mm !important;
    }
    .quote-footer {
      height: 27.5mm !important;
      min-height: 27.5mm !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      overflow: visible !important;
    }
    .quote-footer > div {
      min-height: 27.5mm !important;
      height: 27.5mm !important;
    }
    @media print {
      .no-print, .no-print * { display: none !important; visibility: hidden !important; }
      html, body { width: 100% !important; height: auto !important; overflow: visible !important; }
      #printable-quotation-area { position: relative !important; left: auto !important; top: auto !important; width: 200mm !important; min-height: 0 !important; height: auto !important; }
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
      console.warn('Print error fallback:', e);
      window.print();
    }
  };

  const handleSaveHtml = () => {
    try {
      const htmlContent = getStandaloneA4Html();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Quotation_${quoteNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSaveSuccessMsg('A4 Quotation HTML file downloaded.');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleSaveJson = () => {
    try {
      const jsonStr = JSON.stringify(quotation, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Quotation_${quoteNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSaveSuccessMsg('Quotation JSON data downloaded.');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      console.error('JSON export error:', err);
    }
  };

  return (
    <div id="quotation-modal-root" className="flex flex-col h-full bg-slate-900/90 text-slate-100 print:h-auto print:bg-white print:overflow-visible print:block">
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
                Professional Quotation Preview
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                A4 Exact Format
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {quoteNumber} • {customerName}
            </p>
          </div>
        </div>

        {/* Toolbar Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Copy Selector */}
          <select
            value={copyType}
            onChange={(e) => setCopyType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            title="Quotation Copy"
          >
            <option value="ORIGINAL COPY">ORIGINAL COPY</option>
            <option value="CUSTOMER COPY">CUSTOMER COPY</option>
            <option value="OFFICE COPY">OFFICE COPY</option>
            <option value="DUPLICATE COPY">DUPLICATE COPY</option>
          </select>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5" title="Preview Zoom Controls">
            <button
              onClick={() => setZoom((prev) => Math.max(50, prev - 10))}
              disabled={zoom <= 50}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="px-2 py-0.5 text-[11px] font-mono font-bold text-amber-400 hover:text-amber-300 transition"
              title="Reset Zoom to 100%"
            >
              {zoom}%
            </button>
            <button
              onClick={() => setZoom((prev) => Math.min(150, prev + 10))}
              disabled={zoom >= 150}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(zoom === 85 ? 100 : 85)}
              className="px-1.5 py-0.5 text-[10px] font-medium text-slate-300 hover:text-white border-l border-slate-700 hover:bg-slate-700 rounded-r transition"
              title="Fit to Width (85%)"
            >
              Fit
            </button>
          </div>

          {onDuplicate && (
            <button
              onClick={() => onDuplicate(quotation)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
              title="Duplicate this Quotation"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>Duplicate</span>
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(quotation)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
              title="Edit Quotation Form"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}

          {onConvert && quotation.status !== 'Converted' && (
            <button
              onClick={() => onConvert(quotation)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Convert this quotation to GST Tax Invoice"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Convert to Invoice</span>
            </button>
          )}

          <button
            onClick={handleSaveHtml}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
            title="Download Standalone A4 HTML File"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Download HTML</span>
          </button>

          <button
            onClick={handleSaveJson}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
            title="Download JSON Data Backup"
          >
            <Save className="w-3.5 h-3.5 text-slate-400" />
            <span>Save JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            title="Print Quotation or Save as PDF"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>Print / Save PDF (A4)</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Save Success Alert Notification */}
      {saveSuccessMsg && (
        <div className="no-print bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 text-xs px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Printable Area Instruction Banner */}
      <div className="no-print bg-slate-800/60 border-b border-slate-700/60 text-slate-400 text-[11px] px-4 py-1.5 text-center flex items-center justify-center gap-2">
        <span className="text-amber-400">💡 Tip:</span>
        <span>To save to your computer as PDF, click <strong>Print / Save PDF (A4)</strong> and set Destination to <strong>Save as PDF</strong>.</span>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 100% EXACT A4 PRINT CANVAS */}
      {/* ------------------------------------------------------------- */}
      <div id="quotation-print-canvas" className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-8 flex justify-center items-start bg-slate-200/90 dark:bg-slate-950/80 print:p-0 print:m-0 print:bg-white print:overflow-visible">
        <div
          id="quotation-zoom-wrapper"
          style={{
            transform: zoom !== 100 ? `scale(${zoom / 100})` : 'none',
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="print:!transform-none print:m-0 print:p-0 flex justify-center"
        >
          <div
            id="printable-quotation-area"
            className={`bg-white text-black font-sans shadow-2xl border border-black box-border print:border-black print:shadow-none ${isMultiPage ? 'multi-page' : 'single-page'}`}
            style={{
              width: '200mm',
              maxWidth: '200mm',
              minHeight: '0',
              height: 'auto',
              margin: '0 auto',
              padding: '0',
              boxSizing: 'border-box',
              fontSize: '11px',
              lineHeight: '1.3',
              color: '#000000',
              backgroundColor: '#ffffff',
              fontFamily: 'Arial, Helvetica, sans-serif',
            }}
          >
          {/* 1. TOP LINE: GSTIN & ORIGINAL COPY */}
          <div className="quote-top-line flex justify-between items-center px-3 py-1 text-[11px] font-bold border-b border-black">
            <div>GSTIN : {companySettings.gstNumber || '09AEIPU6555N1Z1'}</div>
            <div>{copyType}</div>
          </div>

          {/* 2. COMPANY HEADER BOX (LOGO ON LEFT, CENTERED COMPANY DETAILS, RIGHT QUOTATION TITLE) */}
          <div className="quote-header relative flex items-center justify-between px-3 py-2 border-b border-black">
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
            <div className="flex-1 text-center px-2">
              <h1 className="text-[18px] font-black text-black leading-tight tracking-tight uppercase">
                {companySettings.companyName || 'UPADHYAY BROTHER SOLAR WORKS'}
              </h1>
              <p className="text-[11px] text-black leading-tight mt-0.5">
                Babhanauli Damrua, Jaunpur, Uttar Pradesh - 222001
              </p>
              <p className="text-[10.5px] text-black leading-tight mt-0.5 font-normal">
                Tel.: {companySettings.phone || '+91 98193 91461'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Email : {companySettings.email || 'kdsingh9777@gmail.com'}
              </p>
            </div>

            {/* Right Quotation Badge & Key Numbers */}
            <div className="text-right shrink-0 min-w-[130px] border-l border-black pl-3 py-0.5">
              <div className="text-[14px] font-black tracking-wider uppercase text-black">
                {docTitle}
              </div>
              <div className="text-[9.5px] space-y-0.5 mt-0.5">
                <div>Quote: <strong className="font-mono">{quoteNumber}</strong></div>
                <div>Date: <span>{quoteDate}</span></div>
                {validUntil && <div>Valid: <span>{validUntil}</span></div>}
              </div>
            </div>
          </div>

          {/* 3. QUOTATION INFORMATION SECTION (TWO-COLUMN BORDERED SECTION) */}
          <div className="quote-meta-section grid grid-cols-2 divide-x divide-black border-b border-black text-[10px] h-auto min-h-[18mm]">
            {/* Left Column: Quotation Metadata */}
            <div className="info-column px-3 py-1.5 flex flex-col h-auto min-h-0">
              <div className="info-row grid grid-cols-[105px_minmax(0,1fr)] items-start gap-x-1.5 min-h-[15px] h-auto py-[1px]">
                <span className="info-label flex justify-between items-start font-semibold whitespace-nowrap">
                  <span>Quotation No.</span>
                  <span className="colon font-normal">:</span>
                </span>
                <span className="info-value min-w-0 max-w-full font-bold font-mono normal-case break-words leading-tight">
                  {quoteNumber}
                </span>
              </div>
              <div className="info-row grid grid-cols-[105px_minmax(0,1fr)] items-start gap-x-1.5 min-h-[15px] h-auto py-[1px]">
                <span className="info-label flex justify-between items-start font-normal whitespace-nowrap">
                  <span>Quotation Date</span>
                  <span className="colon font-normal">:</span>
                </span>
                <span className="info-value min-w-0 max-w-full normal-case break-words leading-tight">
                  {quoteDate}
                </span>
              </div>
              <div className="info-row grid grid-cols-[105px_minmax(0,1fr)] items-start gap-x-1.5 min-h-[15px] h-auto py-[1px]">
                <span className="info-label flex justify-between items-start font-normal whitespace-nowrap">
                  <span>Valid Until</span>
                  <span className="colon font-normal">:</span>
                </span>
                <span className="info-value min-w-0 max-w-full normal-case break-words leading-tight">
                  {validUntil || '15 Days from Issue'}
                </span>
              </div>
              <div className="info-row grid grid-cols-[105px_minmax(0,1fr)] items-start gap-x-1.5 min-h-[15px] h-auto py-[1px]">
                <span className="info-label flex justify-between items-start font-normal whitespace-nowrap">
                  <span>Place of Supply</span>
                  <span className="colon font-normal">:</span>
                </span>
                <span className="info-value min-w-0 max-w-full normal-case break-words leading-tight">
                  {placeOfSupply}
                </span>
              </div>
              <div className="info-row grid grid-cols-[105px_minmax(0,1fr)] items-start gap-x-1.5 min-h-[15px] h-auto py-[1px]">
                <span className="info-label flex justify-between items-start font-normal whitespace-nowrap">
                  <span>Reverse Charge</span>
                  <span className="colon font-normal">:</span>
                </span>
                <span className="info-value min-w-0 max-w-full normal-case break-words leading-tight">
                  {reverseCharge}
                </span>
              </div>
            </div>

            {/* Right Column: Project & System Scope */}
            <div className="info-column px-3 py-1.5 flex flex-col h-auto min-h-0">
              <div className="info-row grid grid-cols-[105px_minmax(0,1fr)] items-start gap-x-1.5 min-h-[15px] h-auto py-[1px]">
                <span className="info-label flex justify-between items-start font-semibold whitespace-nowrap">
                  <span>Project / System</span>
                  <span className="colon font-normal">:</span>
                </span>
                <span className="info-value min-w-0 max-w-full font-bold normal-case break-words leading-tight">
                  {projectSystem}
                </span>
              </div>
              <div className="info-row grid grid-cols-[105px_minmax(0,1fr)] items-start gap-x-1.5 min-h-[15px] h-auto py-[1px]">
                <span className="info-label flex justify-between items-start font-normal whitespace-nowrap">
                  <span>Delivery</span>
                  <span className="colon font-normal">:</span>
                </span>
                <span className="info-value min-w-0 max-w-full normal-case break-words leading-tight">
                  {delivery}
                </span>
              </div>
              <div className="info-row grid grid-cols-[105px_minmax(0,1fr)] items-start gap-x-1.5 min-h-[15px] h-auto py-[1px]">
                <span className="info-label flex justify-between items-start font-normal whitespace-nowrap">
                  <span>Payment Terms</span>
                  <span className="colon font-normal">:</span>
                </span>
                <span className="info-value min-w-0 max-w-full normal-case break-words leading-tight">
                  {paymentTerms}
                </span>
              </div>
              <div className="info-row grid grid-cols-[105px_minmax(0,1fr)] items-start gap-x-1.5 min-h-[15px] h-auto py-[1px]">
                <span className="info-label flex justify-between items-start font-normal whitespace-nowrap">
                  <span>Installation</span>
                  <span className="colon font-normal">:</span>
                </span>
                <span className="info-value min-w-0 max-w-full normal-case break-words leading-tight">
                  {installation}
                </span>
              </div>
              <div className="info-row grid grid-cols-[105px_minmax(0,1fr)] items-start gap-x-1.5 min-h-[15px] h-auto py-[1px]">
                <span className="info-label flex justify-between items-start font-normal whitespace-nowrap">
                  <span>Warranty</span>
                  <span className="colon font-normal">:</span>
                </span>
                <span className="info-value min-w-0 max-w-full normal-case break-words leading-tight">
                  {warranty}
                </span>
              </div>
            </div>
          </div>

          {/* 4. CUSTOMER SECTION (PREPARED FOR / BILLED TO & SHIPPED TO) */}
          <div className="quote-party-section grid grid-cols-2 divide-x divide-black border-b border-black text-[10px]">
            {/* Left Column: Prepared For / Billed To */}
            <div className="px-3 py-1.5 flex flex-col justify-between min-h-[96px]">
              <div>
                <div className="font-bold uppercase text-[10px]">PREPARED FOR / BILLED TO</div>
                <div className="font-bold text-[10.5px] mt-0.5">{customerName}</div>
                {customerAddress ? (
                  <div className="text-[9.5px] leading-tight mt-0.5">{customerAddress}</div>
                ) : null}
              </div>
              <div className="mt-1 space-y-0.5">
                {customerMobile && (
                  <div className="flex">
                    <span className="w-28 inline-block">Party Mobile No</span>
                    <span className="mr-1">:</span>
                    <span className="font-mono">{customerMobile}</span>
                  </div>
                )}
                {customerEmail && (
                  <div className="flex">
                    <span className="w-28 inline-block">Email</span>
                    <span className="mr-1">:</span>
                    <span>{customerEmail}</span>
                  </div>
                )}
                <div className="flex">
                  <span className="w-28 inline-block">State</span>
                  <span className="mr-1">:</span>
                  <span>{customerState} ({customerStateCode})</span>
                </div>
                {customerGstin && (
                  <div className="flex">
                    <span className="w-28 inline-block">GSTIN / UIN</span>
                    <span className="mr-1">:</span>
                    <span className="font-mono font-semibold">{customerGstin}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Shipped To */}
            <div className="px-3 py-1.5 flex flex-col justify-between min-h-[96px]">
              <div>
                <div className="font-bold uppercase text-[10px]">SHIPPED TO</div>
                <div className="font-bold text-[10.5px] mt-0.5">{shippingName}</div>
                {shippingAddress ? (
                  <div className="text-[9.5px] leading-tight mt-0.5">{shippingAddress}</div>
                ) : null}
              </div>
              <div className="mt-1 space-y-0.5">
                {shippingMobile && (
                  <div className="flex">
                    <span className="w-28 inline-block">Party Mobile No</span>
                    <span className="mr-1">:</span>
                    <span className="font-mono">{shippingMobile}</span>
                  </div>
                )}
                {customerEmail && (
                  <div className="flex">
                    <span className="w-28 inline-block">Email</span>
                    <span className="mr-1">:</span>
                    <span>{customerEmail}</span>
                  </div>
                )}
                <div className="flex">
                  <span className="w-28 inline-block">State</span>
                  <span className="mr-1">:</span>
                  <span>{shippingState} ({shippingStateCode})</span>
                </div>
                {shippingGstin && (
                  <div className="flex">
                    <span className="w-28 inline-block">GSTIN / UIN</span>
                    <span className="mr-1">:</span>
                    <span className="font-mono font-semibold">{shippingGstin}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 5. MAIN PRODUCT TABLE (STRONG BORDERS, EXACT ALIGNMENT & RATIOS) */}
          <div
            className={`quote-items-container border-b border-black`}
            style={!isMultiPage ? { height: '100mm', minHeight: '100mm' } : undefined}
          >
            <table
              className="quote-items-table w-full text-left border-collapse text-[10px]"
              style={!isMultiPage ? { height: '100mm', minHeight: '100mm' } : undefined}
            >
              <thead>
                <tr className="border-b border-black font-bold text-[10px] text-black">
                  <th className="py-1.5 px-2 text-center w-[36px] border-r border-black font-bold">
                    S.N.
                  </th>
                  <th className="py-1.5 px-2 border-r border-black font-bold">
                    DESCRIPTION OF GOODS
                  </th>
                  <th className="py-1.5 px-1 text-center w-[76px] border-r border-black font-bold leading-tight">
                    <div>HSN/SAC</div>
                    <div>CODE</div>
                  </th>
                  <th className="py-1.5 px-1 text-center w-[58px] border-r border-black font-bold">
                    QTY.
                  </th>
                  <th className="py-1.5 px-1 text-center w-[52px] border-r border-black font-bold">
                    UNIT
                  </th>
                  <th className="py-1.5 px-2 text-right w-[94px] border-r border-black font-bold">
                    RATE (₹)
                  </th>
                  <th className="py-1.5 px-2 text-right w-[114px] font-bold">
                    AMOUNT (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const title = item.name || item.description || `Solar Equipment Item #${idx + 1}`;
                  const brand = item.brand;
                  const model = item.model;
                  const hsn = item.hsnCode || '85044090';

                  return (
                    <tr key={item.id || idx} className="quote-item-row align-top">
                      <td className="py-2 px-2 text-center border-r border-black">
                        {idx + 1}.
                      </td>
                      <td className="py-2 px-2 border-r border-black leading-tight">
                        <div className="font-bold text-[10.5px]">{title}</div>
                        {(brand || model) && (
                          <div className="text-[9px] text-black mt-0.5 flex flex-wrap gap-x-3">
                            {brand && <span>Brand : <strong>{brand}</strong></span>}
                            {model && <span>Model : <strong>{model}</strong></span>}
                          </div>
                        )}
                        {item.description && item.description !== title && !item.description.startsWith('Brand :') && (
                          <div className="text-[9px] text-slate-800 mt-0.5 break-words">
                            {item.description}
                          </div>
                        )}
                        {item.serialNumbers && item.serialNumbers.trim() && (
                          <div className="text-[8.5px] text-black mt-1 leading-tight break-words whitespace-normal overflow-wrap-anywhere">
                            {item.serialNumbers
                              .split(/[\n,]+/)
                              .map((s) => s.trim())
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-1 text-center border-r border-black font-mono">
                        {hsn}
                      </td>
                      <td className="py-2 px-1 text-center border-r border-black font-mono">
                        {Number(item.qty).toFixed(2)}
                      </td>
                      <td className="py-2 px-1 text-center border-r border-black">
                        {item.unit || 'Nos'}
                      </td>
                      <td className="py-1.5 px-2 text-right border-r border-black font-mono">
                        {Number(item.rate).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono font-medium">
                        {Number(item.amount).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  );
                })}

                {/* Intentional blank space filler area: preserves the full original item-table height & balanced layout */}
                {!isMultiPage && (
                  <tr className="quote-items-filler align-top" style={{ height: '100%' }}>
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
                <tr className="quote-items-total border-t border-black font-bold text-[10.5px]">
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
                    {items[0]?.unit ? `${items[0].unit}.` : 'Nos.'}
                  </td>
                  <td className="py-1.5 px-2 text-right border-r border-black">
                    ₹
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono font-black text-[11px]">
                    {grandTotal.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 6. HSN/SAC TAX SUMMARY & AMOUNT IN WORDS */}
          <div className="quote-summary border-b border-black text-[9.5px]">
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

            {/* AMOUNT IN WORDS DIRECTLY UNDER TAX SUMMARY */}
            <div className="px-2.5 py-1.5 text-[10px] font-bold text-black border-t border-black">
              {numberToWordsINR(grandTotal)}
            </div>
          </div>

          {/* 7. BANK DETAILS & UPI QR CODE */}
          <div className="quote-bank flex justify-between items-center px-3 py-1.5 border-b border-black text-[10px]">
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
          <div className="quote-footer grid grid-cols-2 divide-x divide-black text-[9.5px]">
            {/* Left: Terms & Conditions */}
            <div className="px-3 py-2 flex flex-col justify-start">
              <div className="font-bold text-[10px]">Terms & Conditions</div>
              <div className="pl-2.5 space-y-0.5 text-[9px] mt-0.5 text-black leading-tight">
                {quotation.termsAndConditions && quotation.termsAndConditions.trim() ? (
                  quotation.termsAndConditions.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))
                ) : (
                  <>
                    <div>1. Quotation valid for 15 days from the date of issue.</div>
                    <div>2. 50% Advance with Purchase Order, 40% against material delivery, 10% on commissioning.</div>
                    <div>3. Solar panels carry 25 years performance warranty as per OEM manufacturer.</div>
                    <div>4. Inverter carries 5 years manufacturer replacement / repair warranty.</div>
                    <div>5. Net metering approvals subject to DISCOM DISPATCH rules & local jurisdiction.</div>
                  </>
                )}
              </div>
            </div>

            {/* Right: Receiver's Signature & Authorised Signatory */}
            <div className="px-3 py-2 flex flex-col justify-between min-h-[96px]">
              <div className="font-bold text-[10px]">Customer Acceptance Signature :</div>

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
  </div>
);
};
