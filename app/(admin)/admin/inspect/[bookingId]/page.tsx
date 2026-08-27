import { notFound } from 'next/navigation';
import { getBookingWithInspections } from '@/app/actions/inspections';
import { InspectionForm } from '@/components/admin/InspectionForm';
import { formatDate, formatDateTime, formatPeso } from '@/lib/utils';

interface InspectPageProps {
  params: Promise<{ bookingId: string }>;
}

export const metadata = { title: 'Inspection — Admin' };

export default async function InspectPage({ params }: InspectPageProps) {
  const { bookingId } = await params;
  const bookingData = await getBookingWithInspections(bookingId);

  if (!bookingData) notFound();

  const checkIn = bookingData.inspections.find((i) => i.type === 'check_in');
  const checkOut = bookingData.inspections.find((i) => i.type === 'check_out');

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Vehicle Inspection</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Booking {bookingData.booking_code} — {bookingData.vehicle?.model_name ?? '—'}
        </p>
      </div>

      {/* Booking Summary */}
      <div className="bg-gray-50 rounded-xl p-4 text-sm grid grid-cols-2 gap-2">
        <div>
          <span className="text-gray-400">Customer</span>
          <p className="font-medium">{bookingData.customer_name}</p>
        </div>
        <div>
          <span className="text-gray-400">Vehicle</span>
          <p className="font-medium">{bookingData.vehicle?.model_name ?? '—'}</p>
        </div>
        <div>
          <span className="text-gray-400">Pickup Schedule</span>
          <p className="font-semibold text-gray-900">{formatDateTime(bookingData.start_date)}</p>
        </div>
        <div>
          <span className="text-gray-400">Return Schedule</span>
          <p className="font-semibold text-gray-900">{formatDateTime(bookingData.end_date)}</p>
        </div>
      </div>

      {/* Inspection Form */}
      <InspectionForm
        bookingId={bookingId}
        bookingStatus={bookingData.booking_status}
        hasCheckIn={!!checkIn}
        hasCheckOut={!!checkOut}
        existingCheckIn={checkIn ?? null}
        existingCheckOut={checkOut ?? null}
      />
    </div>
  );
}
