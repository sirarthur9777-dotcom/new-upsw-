import QRCode from 'qrcode';

export interface DynamicUpiOptions {
  upiId?: string;
  payeeName?: string;
  amount: number;
  note?: string;
  transactionRef?: string;
}

/**
 * Builds a standardized NPCI UPI Payment URI string:
 * e.g. upi://pay?pa=usatyam30-5@okicici&pn=Upadhyay%20Brother%20Solar%20Works&am=70.00&cu=INR&tn=Invoice%20UBSW/2026/001
 * 
 * When customer scans this with Google Pay, PhonePe, Paytm, BHIM, Cred, etc.,
 * the app opens with the exact payable amount automatically populated.
 */
export function buildDynamicUpiUri(options: DynamicUpiOptions): string {
  const upiId = (options.upiId || 'usatyam30-5@okicici').trim();
  const payeeName = (options.payeeName || 'Upadhyay Brother Solar Works').trim();
  
  // Format amount to exact 2 decimal places (NPCI UPI standard e.g. 70.00 or 500.00)
  const numAmount = Number(options.amount);
  const cleanAmount = isNaN(numAmount) || numAmount < 0 ? 0 : numAmount;
  const amountStr = cleanAmount.toFixed(2);
  
  const note = (options.note || `Payment of Rs ${amountStr}`).trim();

  // URL-encode all query parameters
  const params: string[] = [
    `pa=${encodeURIComponent(upiId)}`,
    `pn=${encodeURIComponent(payeeName)}`,
    `am=${amountStr}`,
    `cu=INR`,
  ];

  if (note) {
    params.push(`tn=${encodeURIComponent(note)}`);
  }

  if (options.transactionRef) {
    params.push(`tr=${encodeURIComponent(options.transactionRef)}`);
  }

  return `upi://pay?${params.join('&')}`;
}

/**
 * Generates an instant high-resolution QR Code data-URL (offline/client-side using 'qrcode' package).
 * Returns base64 PNG data-URI: data:image/png;base64,...
 */
export async function generateUpiQrDataUrl(options: DynamicUpiOptions): Promise<string> {
  const upiUri = buildDynamicUpiUri(options);
  try {
    return await QRCode.toDataURL(upiUri, {
      margin: 1,
      width: 280,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  } catch (err) {
    console.warn('Local QR generation error, using fallback server QR:', err);
    return getDynamicUpiQrServerUrl(options);
  }
}

/**
 * Returns immediate online fallback QR URL via api.qrserver.com.
 * Guaranteed to have the exact dynamic amount encoded.
 */
export function getDynamicUpiQrServerUrl(options: DynamicUpiOptions): string {
  const upiUri = buildDynamicUpiUri(options);
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=2&data=${encodeURIComponent(upiUri)}`;
}
