import Link from 'next/link';
import { getBookings } from '@/app/actions/bookings';
import { BookingQueue } from '@/components/admin/BookingQueue';

export const metadata = { title: 'Bookings — Admin' };

export default async function AdminBookingsPage() {
  const [pending, confirmed, all] = await Promise.all([
    getBookings('pending'),
    getBookings('confirmed'),
    getBookings(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Queue</h1>
          <p className="text-gray-500 text-sm mt-1">
            Review KYC documents and payment receipts to approve or reject bookings.
          </p>
        </div>
        <span className="bg-amber-100 text-amber-700 text-sm font-semibold px-3 py-1 rounded-full">
          {pending.length} pending
        </span>
      </div>

      <BookingQueue pending={pending} confirmed={confirmed} all={all} />
    </div>
  );
}
