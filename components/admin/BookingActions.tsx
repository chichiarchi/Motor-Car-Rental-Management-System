'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { approveBooking, rejectBooking } from '@/app/actions/bookings';
import { useRouter } from 'next/navigation';

interface BookingActionsProps {
  bookingId: string;
}

export function BookingActions({ bookingId }: BookingActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const router = useRouter();

  const handle = (type: 'approve' | 'reject') => {
    setActionType(type);
    setResult(null);

    startTransition(async () => {
      const res = type === 'approve'
        ? await approveBooking(bookingId)
        : await rejectBooking(bookingId);

      if (res.success) {
        setResult({
          success: true,
          message: type === 'approve' ? 'Booking approved successfully.' : 'Booking rejected.',
        });
        router.refresh();
      } else {
        setResult({ success: false, message: res.error ?? 'Something went wrong.' });
      }
      setActionType(null);
    });
  };

  if (result?.success) {
    return (
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold shadow-sm animate-fadeIn ${
        result.message.includes('approved')
          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          : 'bg-rose-50 text-rose-800 border border-rose-200'
      }`}>
        <CheckCircle2 className="h-5 w-5" />
        {result.message}
      </div>
    );
  }

  return (
    <div className="space-y-3 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <h3 className="font-bold text-gray-900 text-sm">Review & Approval Actions</h3>

      {result && !result.success && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-xl font-medium">
          {result.message}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Approve */}
        <button
          onClick={() => handle('approve')}
          disabled={isPending}
          className="flex-1 btn-modern btn-success-interactive py-3 rounded-xl text-sm font-bold gap-2 shadow-sm"
        >
          {isPending && actionType === 'approve' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
          )}
          Approve & Confirm Booking
        </button>

        {/* Reject */}
        <button
          onClick={() => handle('reject')}
          disabled={isPending}
          className="flex-1 btn-modern btn-danger-interactive py-3 rounded-xl text-sm font-bold gap-2 shadow-sm"
        >
          {isPending && actionType === 'reject' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4 stroke-[2.5]" />
          )}
          Reject Booking
        </button>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        Approving verifies the customer KYC docs & payment receipt, transitions the booking to &ldquo;Confirmed&rdquo;, and locks the vehicle schedule.
      </p>
    </div>
  );
}
