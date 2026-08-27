import Link from 'next/link';
import { CheckCircle2, Clock, Phone, MapPin, ArrowRight } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';

interface SuccessPageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function BookingSuccessPage({ searchParams }: SuccessPageProps) {
  const { code } = await searchParams;

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center animate-fadeIn">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="h-11 w-11 stroke-[2.5]" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Booking Submitted!</h1>
        <p className="text-gray-500 text-sm mb-6">
          Your booking reference and KYC files have been transmitted. Our verification team is reviewing them.
        </p>

        {/* Booking Code Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl p-6 mb-6 shadow-xl border border-gray-700">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">Your Booking Code</p>
          <p className="text-4xl font-extrabold tracking-widest text-amber-400 font-mono">
            {code ?? '—'}
          </p>
          <p className="text-[11px] text-gray-400 mt-2">
            Please screenshot or write down this reference code.
          </p>
        </div>

        {/* Status */}
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 mb-5 flex items-start gap-3 text-left shadow-sm">
          <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-amber-900 text-sm">Status: Pending Verification</p>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              Our staff will verify your submitted IDs and payment screenshot within 15–30 minutes during business hours.
            </p>
          </div>
        </div>

        {/* Pickup Instructions */}
        <div className="bg-blue-50/90 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3 text-left shadow-sm">
          <MapPin className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-blue-950 text-sm">Pickup & Handover Schedule</p>
            <p className="text-xs text-blue-800 mt-1 leading-relaxed">
              Once verified, please arrive at your chosen schedule at{' '}
              <strong>{BUSINESS_INFO.address}</strong>.
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Branch Hours: <strong>{BUSINESS_INFO.branchHours}</strong>
            </p>
          </div>
        </div>

        {/* Support */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-8">
          <Phone className="h-4 w-4 text-blue-600" />
          <span>
            Need assistance? Call{' '}
            <a href={`tel:${BUSINESS_INFO.phone}`} className="text-blue-600 font-bold hover:underline">
              {BUSINESS_INFO.phone}
            </a>
          </span>
        </div>

        <Link
          href="/"
          className="btn-modern btn-primary-interactive py-3.5 px-8 rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/25"
        >
          Return to Fleet Showcase
        </Link>
      </div>
    </div>
  );
}
