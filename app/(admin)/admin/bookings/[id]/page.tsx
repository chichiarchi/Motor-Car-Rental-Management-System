import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Wrench } from 'lucide-react';
import { getBookingById } from '@/app/actions/bookings';
import { BookingActions } from '@/components/admin/BookingActions';
import { DocViewer } from '@/components/admin/DocViewer';
import { formatPeso, formatDate, formatDateTime } from '@/lib/utils';
import { BOOKING_STATUS_MAP, PAYMENT_STATUS_MAP, DEPOSIT_STATUS_MAP } from '@/lib/constants';

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = await params;
  const booking = await getBookingById(id);

  if (!booking) notFound();

  const bookingStatus = BOOKING_STATUS_MAP[booking.booking_status];
  const paymentStatus = PAYMENT_STATUS_MAP[booking.payment_status];
  const depositStatus = DEPOSIT_STATUS_MAP[booking.deposit_status];

  const docs = booking.verification_docs;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/bookings" className="text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{booking.booking_code}</h1>
          <p className="text-sm text-gray-400">Submitted {formatDateTime(booking.created_at)}</p>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: `Booking: ${bookingStatus.label}` },
          { label: `Payment: ${paymentStatus.label}` },
          { label: `Deposit: ${depositStatus.label}` },
        ].map(({ label }) => (
          <span key={label} className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
            {label}
          </span>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Customer Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-3">Customer</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Name</dt><dd className="font-medium">{booking.customer_name}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd className="font-medium">{booking.customer_email}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Mobile</dt><dd className="font-medium">{booking.customer_phone}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Delivery</dt><dd className="font-medium">{booking.delivery_location}</dd></div>
          </dl>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-3">Rental</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Vehicle</dt><dd className="font-medium">{booking.vehicle?.model_name ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Pickup Schedule</dt><dd className="font-semibold text-gray-900">{formatDateTime(booking.start_date)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Return Schedule</dt><dd className="font-semibold text-gray-900">{formatDateTime(booking.end_date)}</dd></div>
            <div className="flex justify-between border-t pt-2"><dt className="font-bold text-gray-700">Total Due</dt><dd className="font-bold text-blue-600">{formatPeso(booking.total_amount)}</dd></div>
          </dl>
        </div>
      </div>

      {/* KYC Documents */}
      {docs && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-4">KYC Documents & Payment Receipt</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <DocViewer label="Driver's License" url={docs.driver_license_url} />
            <DocViewer label="Secondary ID" url={docs.secondary_id_url} />
            <DocViewer label="Selfie" url={docs.selfie_url} />
            <DocViewer label="Payment Receipt" url={docs.payment_receipt_url} highlight />
          </div>
          {docs.verified_at && (
            <p className="text-xs text-emerald-600 font-semibold mt-3">
              Verified on {formatDateTime(docs.verified_at)}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      {booking.booking_status === 'pending' && (
        <BookingActions bookingId={booking.id} />
      )}

      {/* Inspection link */}
      <Link
        href={`/admin/inspect/${booking.id}`}
        className="flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <Wrench className="h-4 w-4" />
        Open Inspection / Handover Form
      </Link>
    </div>
  );
}
