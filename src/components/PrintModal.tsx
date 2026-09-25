import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck, Save, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GSTTaxInvoice } from './billing/GSTTaxInvoice';
import { GSTQuotationDocument } from './quotations/GSTQuotationDocument';

function numberToWordsINR(num: number): string {
  if (!num || isNaN(num) || num === 0) return 'Rupees Zero Only';

  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + a[n % 10];
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000);
  }

  const integerPart = Math.floor(num);
  const words = inWords(integerPart).trim();
  return `Rupees ${words} Only`;
}

export const PrintModal: React.FC = () => {
  const { printData, setPrintData, companySettings, customers, convertQuotationToInvoice, addQuotation } = useApp();

  if (!printData) return null;

  const { type, payload } = printData;

  // For Tax Invoice / Bill of Supply, use the dedicated professional 100% matched component
  if (type === 'invoice') {
    return (
      <div id="print-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in overflow-y-auto print:p-0 print:bg-white print:static print:h-auto print:w-auto print:overflow-visible print:block print:!transform-none print:!filter-none">
        <div id="print-modal-shell" className="w-full max-w-5xl h-full sm:h-[95vh] bg-slate-900 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-800 print:border-0 print:shadow-none print:bg-white print:h-auto print:w-auto print:max-w-none print:rounded-none print:overflow-visible print:block print:!transform-none print:!filter-none">
          <GSTTaxInvoice
            invoice={payload}
            companySettings={companySettings}
            onClose={() => setPrintData(null)}
          />
        </div>
      </div>
    );
  }

  // For Solar Quotation, use the dedicated A4 professional GST document component
  if (type === 'quotation') {
    const cust = customers?.find((c) => c.id === payload.customerId) || null;
    return (
      <div id="print-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in overflow-y-auto print:p-0 print:bg-white print:static print:h-auto print:w-auto print:overflow-visible print:block print:!transform-none print:!filter-none">
        <div id="print-modal-shell" className="w-full max-w-5xl h-full sm:h-[95vh] bg-slate-900 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-800 print:border-0 print:shadow-none print:bg-white print:h-auto print:w-auto print:max-w-none print:rounded-none print:overflow-visible print:block print:!transform-none print:!filter-none">
          <GSTQuotationDocument
            quotation={payload}
            companySettings={companySettings}
            customer={cust}
            onClose={() => setPrintData(null)}
            onConvert={(q) => {
              convertQuotationToInvoice(q.id);
              setPrintData(null);
            }}
            onDuplicate={(q) => {
              const { id, quoteNumber, createdAt, ...rest } = q;
              const newQ = addQuotation({
                ...rest,
                status: 'Draft',
              });
              setPrintData({ type: 'quotation', payload: newQ });
            }}
          />
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleSaveInvoiceData = () => {
    const jsonStr = JSON.stringify(printData.payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${printData.type}_${
      printData.payload?.invoiceNumber || printData.payload?.quoteNumber || 'doc'
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto print:p-0 print:bg-white print:static print:h-auto print:overflow-visible">
      <div className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 flex flex-col max-h-[92vh] print:max-h-none print:border-0 print:shadow-none print:my-0 print:rounded-none">
        {/* Top Header Bar (Hidden when printing) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Tax Document Preview - {type.replace('_', ' ').toUpperCase()}</span>
            </h3>
            <p className="text-xs text-slate-400">GST Compliant A4 High Resolution Printable Format</p>
          </div>

          <button
            onClick={() => setPrintData(null)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Canvas (Scrollable) */}
        <div className="overflow-y-auto flex-1 p-6 print:p-0 print:m-0 print:overflow-visible bg-white text-slate-900 font-sans" id="printable-container">

          {/* 1. TAX INVOICE PRINT LAYOUT */}
          {type === 'invoice' && (
            <div className="space-y-4 print:space-y-2">
              {/* Company Letterhead Header */}
              <div className="flex justify-between items-start border-b-2 border-blue-600 pb-3 print:pb-1.5">
                <div className="flex items-start gap-3">
                  {companySettings.logoUrl && (
                    <img
                      src={companySettings.logoUrl}
                      alt="Company Logo"
                      className="w-16 h-16 print:w-14 print:h-14 object-contain rounded-xl border border-slate-200 p-1 bg-white shrink-0 shadow-xs"
                    />
                  )}
                  <div>
                    <h1
                      className="text-xl print:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 font-serif"
                      style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}
                    >
                      <span>{companySettings.companyName || 'Upadhyay Brother Solar Works'}</span>
                    </h1>
                    <p
                      className="text-xs font-bold text-blue-600 mt-0.5 italic font-serif"
                      style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}
                    >
                      {companySettings.tagline}
                    </p>
                    <p className="text-[11px] text-slate-600 max-w-md mt-0.5 leading-snug">{companySettings.address}</p>
                    <div className="text-[10px] text-slate-600 mt-1 flex flex-wrap gap-x-3">
                      <span>GSTIN: <strong className="font-mono text-slate-900">{companySettings.gstNumber}</strong></span>
                      <span>Phone: <strong>{companySettings.phone}</strong></span>
                      <span>Email: <strong>{companySettings.email}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-block px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-black tracking-wider uppercase rounded-md mb-1 shadow-xs">
                    TAX INVOICE
                  </div>
                  <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                    Original for Recipient
                  </p>
                  <div className="text-[11px] space-y-0.5 mt-1">
                    <p className="text-slate-600">
                      Invoice No:{' '}
                      <span className="font-mono font-black text-blue-600 text-xs">
                        {payload.invoiceNumber}
                      </span>
                    </p>
                    <p className="text-slate-600">
                      Date: <span className="font-semibold text-slate-900">{payload.date}</span>
                    </p>
                    <p className="text-slate-600">
                      Due Date: <span className="font-semibold text-slate-900">{payload.dueDate}</span>
                    </p>
                    <div className="pt-0.5">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Status: {payload.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer & Project Detail Cards */}
              <div className="grid grid-cols-2 gap-4 print:gap-2 p-3 print:p-2 bg-slate-50/80 rounded-xl border border-slate-200/90 text-xs">
                <div>
                  <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span>BILLED TO (CUSTOMER DETAILS):</span>
                  </p>
                  <p className="text-xs font-bold text-slate-900">{payload.customerName}</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">{payload.customerAddress}</p>
                  <p className="text-slate-600 text-[11px]">Phone: <strong className="text-slate-800">{payload.customerMobile}</strong></p>
                  {payload.customerGst ? (
                    <p className="text-slate-600 text-[11px]">
                      GSTIN: <span className="font-mono font-bold text-slate-900">{payload.customerGst}</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">GSTIN: Unregistered Consumer</p>
                  )}
                </div>

                <div>
                  <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                    SOLAR EPC DISPATCH & INSTALLATION SPECS:
                  </p>
                  <p className="text-slate-700 text-[11px]">
                    <span className="font-semibold text-slate-500">Project Type:</span>{' '}
                    <strong className="text-slate-900">{payload.projectType || 'Solar EPC System'}</strong>
                  </p>
                  <p className="text-slate-700 text-[11px]">
                    <span className="font-semibold text-slate-500">Payment Mode:</span>{' '}
                    <strong className="text-slate-900">{payload.paymentMode}</strong>
                  </p>
                  <p className="text-slate-700 text-[11px]">
                    <span className="font-semibold text-slate-500">Place of Supply:</span>{' '}
                    <strong className="text-slate-900">Interstate / State EPC</strong>
                  </p>
                  {payload.notes && (
                    <p className="text-[10px] text-slate-500 italic mt-0.5 bg-white p-1 rounded border border-slate-200">
                      Note: {payload.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Item Specifications Table */}
              <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-wider">
                    <th className="p-2 font-bold w-10 text-center">S.N.</th>
                    <th className="p-2 font-bold">Description of Goods / Services</th>
                    <th className="p-2 font-bold text-center w-20">HSN/SAC</th>
                    <th className="p-2 font-bold text-center w-20">Qty / Unit</th>
                    <th className="p-2 font-bold text-right w-24">Rate (₹)</th>
                    <th className="p-2 font-bold text-right w-16">GST %</th>
                    <th className="p-2 font-bold text-right w-28">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
                  {payload.items?.map((item: any, idx: number) => (
                    <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-2 print:p-1.5 font-medium text-slate-500 text-center">{idx + 1}</td>
                      <td className="p-2 print:p-1.5">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        {item.description ? (
                          <p className="text-[9px] text-slate-500 leading-snug">{item.description}</p>
                        ) : (
                          <p className="text-[9px] text-slate-500">
                            High grade solar component with GST warranty & BIS approval.
                          </p>
                        )}
                        {item.serialNumbers && item.serialNumbers.trim() && (
                          <p className="text-[9px] text-slate-800 font-mono mt-0.5 leading-tight break-words">
                            <strong className="font-sans font-bold text-slate-900">Serial No(s):</strong>{' '}
                            {item.serialNumbers.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean).join(', ')}
                          </p>
                        )}
                      </td>
                      <td className="p-2 print:p-1.5 text-center font-mono text-[10px] text-slate-600">
                        {item.gstPercent === 12 ? '8541' : '8504'}
                      </td>
                      <td className="p-2 print:p-1.5 text-center font-medium">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="p-2 print:p-1.5 text-right font-medium">₹{item.rate?.toLocaleString()}</td>
                      <td className="p-2 print:p-1.5 text-right font-medium">{item.gstPercent}%</td>
                      <td className="p-2 print:p-1.5 text-right font-extrabold text-blue-600">
                        ₹{item.total?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Amount in Words Banner */}
              <div className="p-2 print:p-1.5 bg-blue-50/70 border border-blue-200 rounded-lg text-[11px] flex items-center justify-between">
                <span className="font-bold text-blue-900">Amount in Words:</span>
                <span className="font-bold text-slate-900 italic">
                  {numberToWordsINR(payload.grandTotal)}
                </span>
              </div>

              {/* Bank Details & Totals Breakdown */}
              <div className="flex justify-between items-start pt-1 gap-4 print:gap-2">
                {/* Bank Account & Payment QR */}
                <div className="p-3 print:p-2 bg-slate-50 rounded-xl border border-slate-200 flex-1 space-y-2">
                  <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1 border-b pb-1 border-slate-200">
                    <Zap className="w-3 h-3 text-blue-600" />
                    <span>Bank Transfer & Instant UPI Payment Details:</span>
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[9px]">Bank Name:</span>
                      <strong className="text-slate-900">{companySettings.bankName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Account Number:</span>
                      <strong className="font-mono text-slate-900">{companySettings.accountNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">IFSC Code:</span>
                      <strong className="font-mono text-slate-900">{companySettings.ifscCode}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Branch:</span>
                      <strong className="text-slate-900">{companySettings.bankBranch}</strong>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200 flex items-center gap-3">
                    {companySettings.upiQrUrl ? (
                      <img
                        src={companySettings.upiQrUrl}
                        alt="UPI Payment QR Code"
                        className="w-16 h-16 print:w-14 print:h-14 border rounded-lg object-contain bg-white p-1 shrink-0 shadow-xs"
                      />
                    ) : (
                      <div className="w-16 h-16 print:w-14 print:h-14 border rounded-lg bg-slate-200 flex items-center justify-center text-[9px] text-slate-400 text-center shrink-0">
                        No QR Set
                      </div>
                    )}
                    <div className="text-[10px] text-slate-600 space-y-0.5">
                      <p className="font-bold text-slate-900">Scan & Pay via BHIM / UPI</p>
                      <p className="text-[9px] text-slate-500">UPI ID:</p>
                      <p className="font-mono font-bold text-blue-600 text-[11px]">{companySettings.upiId}</p>
                    </div>
                  </div>
                </div>

                {/* Amount Calculation Box */}
                <div className="w-72 space-y-1.5 text-[11px] p-3 print:p-2 bg-slate-50/50 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Value (Subtotal):</span>
                    <span className="font-semibold text-slate-900">₹{payload.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (6%):</span>
                    <span className="font-semibold text-slate-900">₹{((payload.taxTotal || 0) / 2).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST (6%):</span>
                    <span className="font-semibold text-slate-900">₹{((payload.taxTotal || 0) / 2).toLocaleString()}</span>
                  </div>
                  {payload.discountTotal > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount Offered:</span>
                      <span className="font-semibold">- ₹{payload.discountTotal?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-black text-slate-900 pt-1 border-t border-slate-300">
                    <span>Grand Total (Incl. GST):</span>
                    <span className="text-blue-600 text-sm">₹{payload.grandTotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 pt-0.5">
                    <span>Advance Received:</span>
                    <span className="font-bold text-emerald-600">₹{payload.advancePaid?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-black text-red-600 pt-1 border-t border-slate-300">
                    <span>Net Balance Payable:</span>
                    <span className="text-sm">₹{payload.remainingBalance?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Official Seal & Digital Signature Section */}
              <div className="flex justify-between items-end pt-3 print:pt-2 border-t border-slate-200 mt-2">
                {/* Official Stamp */}
                <div className="text-center">
                  <div className="w-20 h-20 print:w-16 print:h-16 border-2 border-blue-600/40 rounded-full flex flex-col items-center justify-center p-1 text-[8px] text-blue-900 font-bold uppercase tracking-tighter bg-blue-50/40 shadow-inner mx-auto mb-1 border-dashed">
                    <div className="text-[9px] text-blue-900 font-black">{companySettings.companyName.split(' ')[0]}</div>
                    <div className="text-[7px] text-slate-500">SEAL & STAMP</div>
                    <div className="text-[7px] text-blue-700 font-extrabold">VERIFIED</div>
                  </div>
                  <p className="text-[9px] font-semibold text-slate-500">Official Company Seal</p>
                </div>

                {/* Terms Note */}
                <div className="max-w-xs text-[9px] text-slate-400 space-y-0.5">
                  <p className="font-bold text-slate-600">Terms & Conditions:</p>
                  <p>1. Goods once sold will not be taken back without approval.</p>
                  <p>2. Subject to local jurisdiction. Warranties as per OEM terms.</p>
                </div>

                {/* Digital Signature & Signatory Designation */}
                <div className="text-center min-w-[210px] flex flex-col items-center">
                  <p className="text-[10px] font-black text-slate-950 uppercase tracking-wide mb-1">
                    For {companySettings.companyName || 'UPADHYAY BROTHER SOLAR WORKS'}
                  </p>
                  <div className="h-12 border-b border-slate-400 mb-1 flex items-center justify-center pb-1 w-full max-w-[210px]">
                    {companySettings.signatureUrl ? (
                      <img
                        src={companySettings.signatureUrl}
                        alt="Authorized Signature"
                        className="max-h-11 max-w-[160px] h-full object-contain filter contrast-125 mx-auto"
                      />
                    ) : (
                      <span className="font-serif italic text-sm text-slate-800 font-bold">
                        Signature
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-slate-900 leading-tight">
                    Authorized Signature
                  </p>
                  <p className="text-[9px] font-semibold text-slate-600 leading-tight">
                    Authorized Signatory - {companySettings.companyName || 'Upadhyay Brother Solar Works'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. CUSTOMER MEMBER CARD LAYOUT */}
          {type === 'customer_card' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-[420px] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 shadow-2xl border-2 border-blue-500/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
                      ☀️
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-amber-400 tracking-wide uppercase truncate max-w-[200px]">
                        {companySettings.companyName} Member Card
                      </h3>
                      <p className="text-[10px] text-slate-400">EPC Enterprise System</p>
                    </div>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>

                <div className="flex gap-4 items-center">
                  <img
                    src={
                      payload.photoUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt="Customer Photo"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-400 shadow-md"
                  />
                  <div className="space-y-1 text-xs">
                    <p className="font-mono text-[11px] text-blue-400 font-bold">{payload.id}</p>
                    <h4 className="font-bold text-base text-white">{payload.name}</h4>
                    <p className="text-slate-300 text-[11px]">S/O: {payload.fatherName || 'N/A'}</p>
                    <p className="text-slate-300 text-[11px]">📱 {payload.mobile}</p>
                    <p className="text-slate-300 text-[11px]">📍 {payload.district}, {payload.state}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/80 flex justify-between items-center text-[10px] text-slate-400">
                  <div>
                    <span className="text-slate-500">Project Type:</span>{' '}
                    <span className="font-bold text-white">{payload.projectType}</span>
                  </div>
                  <div className="font-mono">
                    Aadhar: {payload.aadharNumber || 'XXXX-XXXX-1234'}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">Print Customer ID Pass for site verification.</p>
            </div>
          )}

          {/* 3. QUOTATION PRINT LAYOUT */}
          {type === 'quotation' && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b-2 border-blue-600 pb-6">
                <div className="flex items-center gap-3">
                  {companySettings.logoUrl && (
                    <img
                      src={companySettings.logoUrl}
                      alt="Company Logo"
                      className="w-16 h-16 object-contain rounded-lg border p-1"
                    />
                  )}
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      SOLAR SYSTEM QUOTATION
                    </h1>
                    <p className="text-sm font-bold text-blue-600 mt-0.5">{companySettings.companyName}</p>
                    <p className="text-xs text-slate-600">{companySettings.address}</p>
                    <p className="text-xs text-slate-600">
                      Phone: {companySettings.phone} | Email: {companySettings.email}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs space-y-1">
                  <p>Quote #: <span className="font-mono font-bold text-blue-600">{payload.quoteNumber}</span></p>
                  <p>Date: <span className="font-semibold">{payload.createdAt}</span></p>
                  <p>Valid Until: <span className="font-semibold">{payload.validUntil}</span></p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-900 text-sm">Prepared For: {payload.customerName}</p>
                <p className="text-slate-600">Email: {payload.customerEmail} | Phone: {payload.customerMobile}</p>
                <p className="text-slate-600">
                  System Estimate: <span className="font-bold">{payload.capacityKW} KW {payload.systemType} ({payload.projectType})</span>
                </p>
              </div>

              <table className="w-full text-left border-collapse border rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-900 text-white text-xs uppercase">
                    <th className="p-3">S.N.</th>
                    <th className="p-3">Component Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Rate (₹)</th>
                    <th className="p-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {payload.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-3 text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-semibold">{item.description}</td>
                      <td className="p-3 text-center">{item.qty} {item.unit}</td>
                      <td className="p-3 text-right">₹{item.rate?.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold text-blue-600">₹{item.amount?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end pt-4 border-t">
                <div className="w-64 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Estimated Cost:</span>
                    <span className="font-bold">₹{payload.estimatedCost?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated GST (12%):</span>
                    <span className="font-bold">₹{payload.taxAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-blue-600 pt-2 border-t">
                    <span>Grand Total:</span>
                    <span>₹{payload.grandTotal?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 text-xs text-blue-950 space-y-1">
                <p className="font-bold">Terms & Conditions:</p>
                <p>{payload.termsAndConditions}</p>
              </div>

              {/* Signature */}
              <div className="flex justify-end pt-6">
                <div className="text-center min-w-[220px]">
                  <div className="h-20 border-b border-slate-400 mb-1 flex items-end justify-center pb-1">
                    {companySettings.signatureUrl ? (
                      <img src={companySettings.signatureUrl} alt="Sign" className="max-h-20 max-w-[240px] h-full object-contain filter contrast-125" />
                    ) : (
                      <span className="font-serif italic text-base text-slate-700">Authorized Signatory</span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    {companySettings.authorizedSignatoryName || 'Authorized Signatory'}
                  </p>
                  <p className="text-[10px] font-semibold text-amber-600">For {companySettings.companyName}</p>
                </div>
              </div>
            </div>
          )}

          {/* 4. PAYMENT RECEIPT LAYOUT */}
          {type === 'receipt' && (
            <div className="max-w-lg mx-auto p-6 border-2 border-slate-900 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 uppercase">OFFICIAL PAYMENT RECEIPT</h2>
                  <p className="text-xs font-bold text-blue-600">{companySettings.companyName}</p>
                  <p className="text-[10px] text-slate-500">{companySettings.phone}</p>
                </div>
                {companySettings.logoUrl && (
                  <img src={companySettings.logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
                )}
              </div>

              <div className="flex justify-between text-xs">
                <span>Receipt #: <strong className="font-mono">{payload.receiptNo}</strong></span>
                <span>Date: <strong>{payload.paymentDate}</strong></span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2 border">
                <p>Received with thanks from: <strong className="text-slate-900">{payload.customerName}</strong></p>
                <p>
                  Amount Received:{' '}
                  <strong className="text-base text-emerald-600 font-extrabold">
                    ₹{payload.amount?.toLocaleString()}
                  </strong>
                </p>
                <p>Payment Mode: <strong>{payload.paymentMode}</strong> ({payload.transactionRef})</p>
                <p>Against Invoice #: <strong className="font-mono text-blue-600">{payload.invoiceNumber}</strong></p>
              </div>

              <div className="flex justify-between items-end pt-6">
                <div className="text-[10px] text-slate-400">Computer Generated Receipt</div>
                <div className="text-center text-xs min-w-[180px]">
                  <div className="h-16 border-b border-slate-400 mb-1 flex items-end justify-center pb-1">
                    {companySettings.signatureUrl && (
                      <img src={companySettings.signatureUrl} alt="Sign" className="max-h-16 max-w-[200px] h-full object-contain filter contrast-125" />
                    )}
                  </div>
                  <span className="font-bold text-slate-900 block">{companySettings.authorizedSignatoryName || 'Authorized Stamp'}</span>
                  <span className="text-[10px] font-semibold text-amber-600 block">For {companySettings.companyName}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PROMINENT BOTTOM ACTION BAR (Print and Save buttons at bottom) */}
        <div className="no-print bg-slate-100 dark:bg-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Ready to Print / Save to Device</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleSaveInvoiceData}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition shadow-xs"
            >
              <Save className="w-4 h-4 text-slate-700" />
              <span>Save Invoice Data</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-lg shadow-blue-600/25"
            >
              <Printer className="w-4 h-4" />
              <span>Print Tax Invoice / Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
