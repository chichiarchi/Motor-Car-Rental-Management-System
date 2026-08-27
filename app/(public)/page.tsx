import Link from 'next/link';
import { ArrowRight, Shield, Smartphone, Car, Zap, CheckCircle2 } from 'lucide-react';
import { getVehicles } from '@/app/actions/fleet';
import { FleetGrid } from '@/components/public/FleetGrid';

export default async function LandingPage() {
  const vehicles = await getVehicles('available');

  return (
    <>
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-900 text-white py-24 px-4 sm:px-6">
        {/* Background glow circle */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-amber-300 border border-white/15 mb-6 shadow-sm">
            <Zap className="h-3.5 w-3.5 fill-current text-amber-300" />
            Fast & Verified Philippine Vehicle Rentals
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
            Rent a Car or Motorcycle
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
              Anywhere in the Philippines
            </span>
          </h1>

          <p className="text-base sm:text-xl text-blue-100/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Transparent daily rates, flexible branch pickup or door delivery, and instant
            online booking with GCash or Maya payment.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/book"
              className="w-full sm:w-auto btn-modern btn-amber-interactive text-base px-8 py-4 rounded-2xl shadow-xl shadow-amber-400/20 flex items-center justify-center gap-2 font-bold"
            >
              Book Your Ride Now
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/#fleet"
              className="w-full sm:w-auto btn-modern px-7 py-4 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-semibold text-base backdrop-blur-sm transition-all"
            >
              Explore Available Fleet
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              How DriveEasy Works
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Rent in 3 hassle-free steps with verified online check-in.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: Car,
                step: '1',
                title: 'Choose Vehicle & Schedule',
                desc: 'Select a car or motorcycle, specify your pickup and return dates with exact pickup/return times.',
              },
              {
                icon: Shield,
                step: '2',
                title: 'Upload KYC & Payment Proof',
                desc: "Provide photos of your Driver's License, 1 secondary ID, a verification selfie, and GCash/Maya receipt.",
              },
              {
                icon: Smartphone,
                step: '3',
                title: 'Instant Confirmation & Handover',
                desc: 'Staff verifies your booking within minutes. Pick up your ride or receive door delivery with mobile inspection.',
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div
                key={step}
                className="flex flex-col items-center gap-4 p-6 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-blue-50/40 hover:border-blue-200 transition-all duration-300 group"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center shadow-md">
                    {step}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fleet Grid ── */}
      <section id="fleet" className="py-20 px-4 bg-gray-50/80 border-t border-gray-200/60">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Available Fleet</h2>
              <p className="text-gray-500 text-sm mt-1">
                {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} currently ready for immediate reservation
              </p>
            </div>
            <Link
              href="/book"
              className="hidden sm:inline-flex items-center gap-1.5 text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors group"
            >
              Book Now <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <FleetGrid vehicles={vehicles} />
        </div>
      </section>
    </>
  );
}
