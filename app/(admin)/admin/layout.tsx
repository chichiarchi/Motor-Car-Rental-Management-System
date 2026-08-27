import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Car,
  Wrench,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { BUSINESS_INFO } from '@/lib/constants';

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/bookings', label: 'Bookings', icon: ClipboardList },
  { href: '/admin/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/admin/fleet', label: 'Fleet', icon: Car },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If unauthenticated (e.g. on /admin/login), render children directly without sidebar
  if (!user) {
    return <>{children}</>;
  }


  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex flex-col w-60 bg-gray-900 text-gray-100 fixed top-0 left-0 h-full z-40">
        {/* Logo */}
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-yellow-400" />
            <span className="font-bold text-white">{BUSINESS_INFO.name}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Admin Portal</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User info + sign out */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <div className="text-xs text-gray-400 truncate">{user.email}</div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 flex md:hidden z-40">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-400 hover:text-white transition-colors"
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs">{label}</span>
          </Link>
        ))}
      </nav>

      {/* ── Main Content ── */}
      <div className="flex-1 md:ml-60 pb-16 md:pb-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900">Admin Portal</h1>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex md:hidden items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
