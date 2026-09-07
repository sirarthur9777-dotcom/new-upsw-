import React from 'react';
import { Printer, X, Download, ShoppingCart, Building2, Package, CheckCircle, Zap } from 'lucide-react';
import { Purchase, CompanySettings } from '../../types';
import { formatINR } from '../../context/AppContext';

interface PurchaseInvoicePrintProps {
  purchase: Purchase;
  companySettings: CompanySettings;
  onClose: () => void;
}

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

export const PurchaseInvoicePrint: React.FC<PurchaseInvoicePrintProps> = ({
  purchase,
  companySettings,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const isIntraState = purchase.cgstTotal > 0 || purchase.sgstTotal > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden my-4 border border-slate-200 flex flex-col max-h-[95vh]">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Purchase Inward Voucher & Goods Receipt Note (GRN)</span>
            </h3>
            <p className="text-xs text-slate-400">
              PO #{purchase.id} • Vendor Inv: {purchase.invoiceNumber}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable A4 Voucher Content */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 text-xs leading-relaxed font-sans printable-area">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
            <div className="flex items-center gap-4">
              {companySettings.logoUrl ? (
                <img
                  src={companySettings.logoUrl}
                  alt="Logo"
                  className="w-16 h-16 object-contain rounded-lg border border-slate-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                  <Zap className="w-8 h-8 text-amber-400" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  {companySettings.companyName}
                </h1>
                <p className="text-xs font-semibold text-slate-600">{companySettings.tagline || 'Solar EPC & Power Solutions'}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {companySettings.address}, {companySettings.city}, {companySettings.state} - {companySettings.pincode}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  GSTIN: {companySettings.gstNumber} • Mobile: {companySettings.mobile}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-md">
                PURCHASE & GRN VOUCHER
              </span>
              <div className="mt-2 space-y-0.5 text-xs">
                <p className="font-bold text-slate-900">Voucher No: <span className="font-mono">{purchase.id}</span></p>
                <p className="text-slate-600">Vendor Inv No: <span className="font-mono font-bold text-slate-900">{purchase.invoiceNumber}</span></p>
                <p className="text-slate-600">Date: <span className="font-medium">{purchase.purchaseDate}</span></p>
                <p className="text-slate-600">Payment Status: <span className="font-bold text-blue-600">{purchase.paymentStatus}</span></p>
              </div>
            </div>
          </div>

          {/* Supplier and Shipment Details */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Vendor / Distributor Details:
              </span>
              <p className="font-extrabold text-sm text-slate-900">{purchase.distributorName}</p>
              <p className="font-mono text-slate-700 mt-0.5">GSTIN: {purchase.distributorGst || 'N/A'}</p>
              <p className="text-slate-600 mt-0.5">Credit Terms: {purchase.paymentTerms || 'Net 30'}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Shipment & Inward Info:
              </span>
              <p className="text-slate-700">Status: <span className="font-bold text-emerald-700">{purchase.status}</span></p>
              {purchase.waybillNumber && <p className="font-mono text-slate-600">E-Waybill: {purchase.waybillNumber}</p>}
              {purchase.vehicleNumber && <p className="font-mono text-slate-600">Vehicle: {purchase.vehicleNumber}</p>}
              {purchase.dispatchLocation && <p className="text-slate-600">Dispatch: {purchase.dispatchLocation}</p>}
            </div>
          </div>

          {/* Material Items Table */}
          <table className="w-full text-left text-xs mb-6 border-collapse">
            <thead>
              <tr className="border-y-2 border-slate-800 bg-slate-100 text-slate-900 font-bold">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-2 text-center">HSN</th>
                <th className="py-2.5 px-2 text-right">Qty Ordered</th>
                <th className="py-2.5 px-2 text-right font-bold text-blue-900">Qty Inward</th>
                <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                <th className="py-2.5 px-3 text-right">Taxable (₹)</th>
                <th className="py-2.5 px-2 text-center">GST</th>
                <th className="py-2.5 px-3 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {purchase.items?.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-2.5 px-3 font-semibold text-slate-500">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-900 block">{item.productName}</span>
                    <span className="text-[10px] text-slate-500">
                      {item.make ? `Make: ${item.make}` : ''} {item.model ? `• Model: ${item.model}` : ''}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono text-[11px] text-slate-600">{item.hsnCode || '-'}</td>
                  <td className="py-2.5 px-2 text-right">{item.orderedQuantity} {item.unit || 'Nos'}</td>
                  <td className="py-2.5 px-2 text-right font-bold text-blue-800 bg-blue-50/50">
                    {item.receivedQuantity} {item.unit || 'Nos'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">{formatINR(item.unitPrice)}</td>
                  <td className="py-2.5 px-3 text-right font-mono">{formatINR(item.taxableAmount)}</td>
                  <td className="py-2.5 px-2 text-center font-mono">{item.gstRate}%</td>
                  <td className="py-2.5 px-3 text-right font-bold font-mono">{formatINR(item.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bottom Valuation & Tax Breakup */}
          <div className="grid grid-cols-2 gap-6 items-start border-t border-slate-200 pt-4 mb-8">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Amount in Words:
              </span>
              <p className="font-bold text-slate-800 text-xs italic">
                {numberToWordsINR(purchase.grandTotal)}
              </p>

              {purchase.notes && (
                <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                  <span className="font-bold block text-slate-700">Remarks:</span>
                  {purchase.notes}
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Taxable Value:</span>
                <span className="font-semibold">{formatINR(purchase.subtotal)}</span>
              </div>

              {isIntraState ? (
                <>
                  <div className="flex justify-between text-slate-500">
                    <span>CGST:</span>
                    <span>{formatINR(purchase.cgstTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>SGST:</span>
                    <span>{formatINR(purchase.sgstTotal)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-slate-500">
                  <span>IGST:</span>
                  <span>{formatINR(purchase.igstTotal)}</span>
                </div>
              )}

              {purchase.shippingCharges > 0 && (
                <div className="flex justify-between">
                  <span>Freight & Handling:</span>
                  <span>{formatINR(purchase.shippingCharges)}</span>
                </div>
              )}

              {purchase.roundOff !== 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Round Off:</span>
                  <span>{formatINR(purchase.roundOff)}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-2 border-y-2 border-slate-800 font-black text-sm text-slate-900">
                <span>Grand Total:</span>
                <span className="text-base">{formatINR(purchase.grandTotal)}</span>
              </div>

              <div className="flex justify-between text-slate-600 pt-1">
                <span>Paid to Supplier:</span>
                <span className="font-bold text-emerald-700">{formatINR(purchase.paidAmount || 0)}</span>
              </div>

              <div className="flex justify-between text-slate-600 font-bold">
                <span>Balance Due:</span>
                <span className="text-amber-700">{formatINR(purchase.dueAmount || 0)}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-12 text-center text-xs">
            <div>
              <div className="border-t border-slate-300 pt-2 w-48 mx-auto font-semibold text-slate-600">
                Store / Inward Inspector
              </div>
            </div>
            <div>
              <div className="border-t border-slate-300 pt-2 w-48 mx-auto font-bold text-slate-900">
                Authorized Signatory
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{companySettings.companyName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
