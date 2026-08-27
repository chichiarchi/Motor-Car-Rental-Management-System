'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatPeso, formatDate } from '@/lib/utils';
import { BOOKING_STATUS_MAP, PAYMENT_STATUS_MAP } from '@/lib/constants';
import type { BookingWithVehicleAndDocs } from '@/types';

interface BookingQueueProps {
  pending: BookingWithVehicleAndDocs[];
  confirmed: BookingWithVehicleAndDocs[];
  all: BookingWithVehicleAndDocs[];
}

type Tab = 'pending' | 'confirmed' | 'all';

const TABS: { key: Tab; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'all', label: 'All Bookings' },
];

export function BookingQueue({ pending, confirmed, all }: BookingQueueProps) {
  const [activeTab, setActiveTab] = useState<Tab>('pending');

  const data: Record<Tab, BookingWithVehicleAndDocs[]> = { pending, confirmed, all };
  const rows = data[activeTab];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200 pb-0">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
            <span className="ml-1.5 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
              {data[key].length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            No {activeTab === 'all' ? '' : activeTab + ' '}bookings found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Code</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Vehicle</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Dates</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((booking) => {
                  const status = BOOKING_STATUS_MAP[booking.booking_status];
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-gray-800 whitespace-nowrap">
                        {booking.booking_code}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{booking.customer_name}</div>
                        <div className="text-xs text-gray-400">{booking.customer_phone}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                        {booking.vehicle?.model_name ?? '—'}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-500 whitespace-nowrap text-xs">
                        {formatDate(booking.start_date)} → {formatDate(booking.end_date)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-primary whitespace-nowrap">
                        {formatPeso(booking.total_amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            booking.booking_status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : booking.booking_status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : booking.booking_status === 'ongoing'
                              ? 'bg-blue-100 text-blue-700'
                              : booking.booking_status === 'completed'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="text-primary text-xs font-medium hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
