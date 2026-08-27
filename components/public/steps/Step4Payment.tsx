'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, QrCode, AlertCircle, Check, Loader2, Info } from 'lucide-react';
import { validateFile, formatPeso } from '@/lib/utils';
import { PAYMENT_METHODS } from '@/lib/constants';
import type { Step4Data } from '@/types';

interface Step4PaymentProps {
  data: Step4Data;
  onChange: (data: Step4Data) => void;
  totalAmount: number;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError: string | null;
}

export function Step4Payment({
  data,
  onChange,
  totalAmount,
  onBack,
  onSubmit,
  isSubmitting,
  submitError,
}: Step4PaymentProps) {
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Preserve and display preview when file prop exists (e.g. going back/forward to this step)
  useEffect(() => {
    if (data.paymentReceiptFile) {
      const url = URL.createObjectURL(data.paymentReceiptFile);
      setReceiptPreview(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setReceiptPreview(null);
    }
  }, [data.paymentReceiptFile]);

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const err = validateFile(file);
    if (err) { setFileError(err); return; }

    setFileError(null);
    onChange({ ...data, paymentReceiptFile: file });
  };

  const handleRemoveReceipt = () => {
    onChange({ ...data, paymentReceiptFile: null });
    setReceiptPreview(null);
    setFileError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!data.paymentReceiptFile) {
      setValidationError('Please upload your payment receipt before submitting.');
      return;
    }
    setValidationError(null);
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Step 4: Payment Confirmation</h2>
        <p className="text-sm text-gray-500 mt-1">
          Send the total amount via GCash or Maya, then upload your transaction receipt.
        </p>
      </div>

      {/* Amount Due Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 text-center shadow-lg shadow-blue-500/20">
        <p className="text-xs uppercase tracking-wider font-semibold opacity-90">Total Amount Due</p>
        <p className="text-3xl sm:text-4xl font-extrabold mt-1 text-amber-300">{formatPeso(totalAmount)}</p>
        <p className="text-xs opacity-80 mt-1">Includes Full Rental Duration + Refundable Security Deposit</p>
      </div>

      {/* Payment QR Codes */}
      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <QrCode className="h-4 w-4 text-blue-600" />
          Pay via GCash or Maya
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PAYMENT_METHODS.map((method) => (
            <div
              key={method.name}
              className="border-2 border-gray-200/90 rounded-2xl p-4 text-center bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 mb-3">
                {method.name}
              </span>
              <div className="w-24 h-24 mx-auto bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center shadow-inner">
                <QrCode className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-3 font-medium">{method.accountName}</p>
              <p className="text-sm font-bold text-gray-900 font-mono mt-0.5">{method.accountNumber}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3 text-center bg-amber-50 border border-amber-200/80 rounded-xl py-2.5 px-3 flex items-center justify-center gap-1.5">
          <Info className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Use your <strong>Full Name</strong> as the transfer message / reference note.</span>
        </p>
      </div>

      {/* Payment Receipt Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          Upload Payment Screenshot / Receipt
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Take a screenshot of your GCash / Maya completed payment and upload it here.
        </p>

        {receiptPreview ? (
          <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300 bg-gray-50 shadow-inner group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={receiptPreview} alt="Payment receipt" className="w-full h-52 object-cover" />
            <button
              type="button"
              onClick={handleRemoveReceipt}
              className="absolute top-2.5 right-2.5 bg-white/95 text-rose-600 rounded-full p-1.5 shadow-md hover:bg-rose-50 hover:scale-110 active:scale-95 transition-all duration-150"
              title="Remove receipt"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs px-3.5 py-2 truncate">
              {data.paymentReceiptFile?.name}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-2xl py-8 flex flex-col items-center gap-2.5 transition-all duration-200 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-emerald-100 text-gray-500 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
              <Upload className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-emerald-700">
              Upload payment receipt screenshot
            </span>
            <span className="text-xs text-gray-400">JPEG, PNG, WebP · Max 5 MB</span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          onChange={handleReceiptChange}
          className="hidden"
        />

        {fileError && <p className="text-xs text-rose-600 mt-1 font-medium">{fileError}</p>}
      </div>

      {/* Errors */}
      {(validationError || submitError) && (
        <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{validationError || submitError}</span>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 btn-modern btn-outline-interactive py-3 rounded-xl text-sm"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 btn-modern btn-success-interactive py-3 rounded-xl text-sm shadow-md flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting Booking…
            </>
          ) : (
            <>
              <Check className="h-4 w-4 stroke-[3]" />
              Submit Booking
            </>
          )}
        </button>
      </div>
    </div>
  );
}
