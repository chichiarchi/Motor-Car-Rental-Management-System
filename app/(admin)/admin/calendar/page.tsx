import { createClient } from '@/lib/supabase/server';
import { CalendarView } from '@/components/admin/CalendarView';

export const metadata = { title: 'Calendar — Admin' };

export default async function AdminCalendarPage() {
  const supabase = await createClient();

  // Fetch confirmed and ongoing bookings with vehicle join for calendar display
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, vehicle:vehicles(model_name, vehicle_type, plate_number)')
    .in('booking_status', ['confirmed', 'ongoing'])
    .order('start_date', { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Availability Calendar</h1>
        <p className="text-gray-500 text-sm mt-1">
          Overview of confirmed and ongoing rentals by date.
        </p>
      </div>

      <CalendarView bookings={bookings ?? []} />
    </div>
  );
}
