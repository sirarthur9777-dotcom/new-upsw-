import React, { useState, useEffect } from 'react';
import {
  DynamicUpiOptions,
  buildDynamicUpiUri,
  generateUpiQrDataUrl,
  getDynamicUpiQrServerUrl,
} from '../../utils/qrCode';

export interface DynamicUpiQrProps extends DynamicUpiOptions {
  className?: string;
  imageClassName?: string;
  size?: number;
  showAmountText?: boolean;
  amountTextPrefix?: string;
  amountTextClassName?: string;
  alt?: string;
}

/**
 * DynamicUpiQr Component
 * 
 * - Generates a dynamic UPI payment QR with the exact Total Payable amount.
 * - Customer scanning with GPay, PhonePe, Paytm, BHIM, Cred gets the exact amount prefilled.
 * - Updates dynamically whenever the bill or receipt amount changes (e.g. ₹70 -> ₹500).
 * - Never reuses old QR codes for new amounts.
 */
export const DynamicUpiQr: React.FC<DynamicUpiQrProps> = ({
  amount,
  upiId,
  payeeName,
  note,
  transactionRef,
  className = '',
  imageClassName = '',
  size = 64,
  showAmountText = false,
  amountTextPrefix = '',
  amountTextClassName = '',
  alt = 'UPI Payment QR',
}) => {
  // Start with immediate synchronous server URL so there is 0 blank flash
  const [qrSrc, setQrSrc] = useState<string>(() =>
    getDynamicUpiQrServerUrl({ amount, upiId, payeeName, note, transactionRef })
  );

  useEffect(() => {
    let isMounted = true;
    
    // Always regenerate whenever amount, upiId, payeeName, note, or ref change
    generateUpiQrDataUrl({ amount, upiId, payeeName, note, transactionRef }).then((dataUri) => {
      if (isMounted && dataUri) {
        setQrSrc(dataUri);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [amount, upiId, payeeName, note, transactionRef]);

  const cleanAmount = Number(amount) || 0;
  const formattedAmount = cleanAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <img
        src={qrSrc}
        alt={alt}
        className={imageClassName}
        style={{ width: `${size}px`, height: `${size}px` }}
        loading="eager"
      />
      {showAmountText && (
        <span className={`text-[8.5px] font-bold text-black text-center tracking-tight mt-0.5 whitespace-nowrap ${amountTextClassName}`}>
          {amountTextPrefix}₹{formattedAmount}
        </span>
      )}
    </div>
  );
};
