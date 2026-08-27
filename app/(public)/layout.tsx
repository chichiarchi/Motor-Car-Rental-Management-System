import type { Metadata } from 'next';
import Link from 'next/link';
import { Car, Phone, Mail, MapPin, Sparkles } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: {
    template: `%s | ${BUSINESS_INFO.name}`,
    default: BUSINESS_INFO.name,
  },
  description: BUSINESS_INFO.tagline,
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-blue-600 font-extrabold text-xl tracking-tight group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 group-hover:bg-blue-700 transition-all shadow-sm">
              <Car className="h-5 w-5" />
            </div>
            <span className="text-gray-900 group-hover:text-blue-600 transition-colors">{BUSINESS_INFO.name}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-gray-600">
            <Link href="/#fleet" className="hover:text-blue-600 transition-colors">
              Fleet
            </Link>
            <Link href="/#how-it-works" className="hover:text-blue-600 transition-colors">
              How It Works
            </Link>
            <Link href="/#contact" className="hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors px-2 py-1"
            >
              Admin Portal
            </Link>
            <Link
              href="/book"
              className="btn-modern btn-primary-interactive text-sm font-bold px-4 py-2 rounded-xl shadow-sm hover:shadow-blue-500/25"
            >
              Book Now
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ── */}
      <footer id="contact" className="bg-gray-950 text-gray-300 mt-16 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2.5 text-white font-extrabold text-xl mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Car className="h-4 w-4" />
              </div>
              <span>{BUSINESS_INFO.name}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">{BUSINESS_INFO.tagline}</p>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-4 tracking-wide">Customer Support</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
                <span>{BUSINESS_INFO.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-blue-500" />
                <span>{BUSINESS_INFO.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-blue-500" />
                <span>{BUSINESS_INFO.email}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-base mb-4 tracking-wide">Operating Hours & Payments</h3>
            <p className="text-sm text-gray-400">{BUSINESS_INFO.branchHours}</p>
            <div className="mt-3 p-3.5 bg-gray-900 rounded-2xl border border-gray-800 text-xs text-gray-400 space-y-1">
              <span className="font-semibold text-gray-200 block">Accepted Payment Modes:</span>
              <p>GCash, Maya, and QR Ph / InstaPay bank transfers with manual receipt verification.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-900 py-6 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} {BUSINESS_INFO.name}. All rights reserved. Philippine Car & Motor Rental Platform.
        </div>
      </footer>
    </div>
  );
}
