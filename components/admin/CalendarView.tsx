'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  addDays,
  startOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { BookingRow, VehicleRow } from '@/types/database.types';

type BookingWithVehicle = BookingRow & {
  vehicle: Pick<VehicleRow, 'model_name' | 'vehicle_type' | 'plate_number'> | null;
};

interface CalendarViewProps {
  bookings: BookingWithVehicle[];
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-500',
  ongoing: 'bg-blue-500',
};

export function CalendarView({ bookings }: CalendarViewProps) {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const days = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });

  const getBookingsForDay = (day: Date) =>
    bookings.filter((b) => {
      const start = parseISO(b.start_date);
      const end = parseISO(b.end_date);
      return isWithinInterval(day, { start, end });
    });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <button
          onClick={() => setWeekStart((w) => subWeeks(w, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>

        <h2 className="font-bold text-gray-800">
          {format(weekStart, 'MMMM d')} – {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
        </h2>

        <button
          onClick={() => setWeekStart((w) => addWeeks(w, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Day columns */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="text-center py-2 text-xs font-semibold text-gray-500 border-r last:border-r-0 border-gray-100"
          >
            <div>{format(day, 'EEE')}</div>
            <div
              className={`text-base font-bold mt-0.5 ${
                isSameDay(day, new Date()) ? 'text-primary' : 'text-gray-800'
              }`}
            >
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Booking cells */}
      <div className="grid grid-cols-7 min-h-[300px]">
        {days.map((day) => {
          const dayBookings = getBookingsForDay(day);
          return (
            <div
              key={day.toISOString()}
              className="border-r last:border-r-0 border-gray-100 p-1.5 space-y-1 min-h-[200px]"
            >
              {dayBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  className={`block w-full text-white text-xs px-2 py-1 rounded-lg truncate ${
                    STATUS_COLORS[booking.booking_status] ?? 'bg-gray-500'
                  } hover:opacity-90 transition-opacity`}
                  title={`${booking.booking_code} — ${booking.customer_name} — ${booking.vehicle?.model_name ?? 'Vehicle'}`}
                >
                  <div className="font-bold truncate">{booking.vehicle?.model_name ?? '—'}</div>
                  <div className="opacity-80 truncate">{booking.customer_name}</div>
                </Link>
              ))}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-500" /> Confirmed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500" /> Ongoing
        </span>
      </div>
    </div>
  );
}
