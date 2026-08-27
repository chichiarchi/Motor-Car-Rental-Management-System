import Link from 'next/link';
import { ClipboardList, Car, TrendingUp, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatPeso, formatDate } from '@/lib/utils';
import type { BookingRow } from '@/types/database.types';

async function getDashboardMetrics() {
  const supabase = await createClient();
  const todayIso = new Date().toISOString().split('T')[0];

  const [pending, active, todayPickups, todayReturns, revenueResult] = await Promise.all([
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('booking_status', 'pending'),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('booking_status', 'ongoing'),
    supabase.from('bookings').select('id', { count: 'exact', head: true })
      .gte('start_date', `${todayIso}T00:00:00`)
      .lte('start_date', `${todayIso}T23:59:59`)
      .eq('booking_status', 'confirmed'),
    supabase.from('bookings').select('id', { count: 'exact', head: true })
      .gte('end_date', `${todayIso}T00:00:00`)
      .lte('end_date', `${todayIso}T23:59:59`)
      .eq('booking_status', 'ongoing'),
    supabase.from('bookings')
      .select('total_amount')
      .in('booking_status', ['confirmed', 'ongoing', 'completed']),
  ]);

  const revenue = (revenueResult.data ?? []) as Pick<BookingRow, 'total_amount'>[];
  const totalRevenue = revenue.reduce((sum, b) => sum + (b.total_amount ?? 0), 0);

  return {
    pendingBookings: pending.count ?? 0,
    activeRentals: active.count ?? 0,
    todayPickups: todayPickups.count ?? 0,
    todayReturns: todayReturns.count ?? 0,
    totalRevenue,
  };
}

async function getRecentPendingBookings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('bookings')
    .select('*, vehicle:vehicles(model_name)')
    .eq('booking_status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5);

  return (data ?? []) as (BookingRow & { vehicle: { model_name: string } | null })[];
}

export default async function AdminDashboard() {
  const [metrics, pending] = await Promise.all([
    getDashboardMetrics(),
    getRecentPendingBookings(),
  ]);

  const metricCards = [
    {
      label: 'Pending Bookings',
      value: metrics.pendingBookings,
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      href: '/admin/bookings',
    },
    {
      label: 'Active Rentals',
      value: metrics.activeRentals,
      icon: Car,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      href: '/admin/calendar',
    },
    {
      label: "Today's Pickups",
      value: metrics.todayPickups,
      icon: Calendar,
      color: 'text-green-600',
      bg: 'bg-green-50',
      href: '/admin/bookings',
    },
    {
      label: "Today's Returns",
      value: metrics.todayReturns,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      href: '/admin/bookings',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of today&apos;s rental operations.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Revenue */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl p-6">
        <p className="text-sm opacity-80">Total Revenue (Confirmed + Active + Completed)</p>
        <p className="text-4xl font-extrabold mt-1">{formatPeso(metrics.totalRevenue)}</p>
      </div>

      {/* Recent Pending Bookings */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-gray-900">Pending Verification</h2>
          </div>
          <Link href="/admin/bookings" className="text-sm text-primary flex items-center gap-1 hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {pending.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No pending bookings at this moment.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pending.map((booking) => (
              <Link
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-sm text-gray-800">{booking.booking_code}</p>
                  <p className="text-xs text-gray-400">
                    {booking.customer_name} &nbsp;·&nbsp;
                    {booking.vehicle?.model_name ?? 'Unknown Vehicle'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{formatPeso(booking.total_amount)}</p>
                  <p className="text-xs text-gray-400">{formatDate(booking.created_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
