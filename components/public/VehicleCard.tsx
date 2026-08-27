'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Car, Bike, MapPin, Zap } from 'lucide-react';
import { formatPeso } from '@/lib/utils';
import { VEHICLE_STATUS_MAP } from '@/lib/constants';
import type { VehicleRow } from '@/types/database.types';

interface VehicleCardProps {
  vehicle: VehicleRow;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const statusInfo = VEHICLE_STATUS_MAP[vehicle.current_status];
  const VehicleIcon = vehicle.vehicle_type === 'car' ? Car : Bike;

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1">
      {/* Vehicle Image Container */}
      <div className="relative h-52 bg-gray-100 overflow-hidden">
        {vehicle.image_url ? (
          <Image
            src={vehicle.image_url}
            alt={vehicle.model_name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2 group-hover:scale-105 transition-transform duration-300">
            <VehicleIcon className="h-16 w-16" />
            <span className="text-xs font-medium text-gray-400">{vehicle.model_name}</span>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm ${
              vehicle.current_status === 'available'
                ? 'bg-emerald-500/90 text-white'
                : vehicle.current_status === 'rented'
                ? 'bg-blue-600/90 text-white'
                : 'bg-amber-500/90 text-white'
            }`}
          >
            {statusInfo.label}
          </span>
        </div>

        {/* Vehicle type badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1.5 bg-gray-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium capitalize shadow-sm">
            <VehicleIcon className="h-3.5 w-3.5 text-amber-400" />
            {vehicle.vehicle_type}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 gap-3.5">
        <div>
          <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
            {vehicle.model_name}
          </h3>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1 font-mono">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            Plate: {vehicle.plate_number}
          </p>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-2 text-sm pt-1">
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-2.5 transition-colors group-hover:bg-blue-50">
            <p className="text-blue-600 text-[11px] font-semibold uppercase tracking-wider">Daily Rate</p>
            <p className="font-extrabold text-blue-900 text-base">{formatPeso(vehicle.daily_rate)}</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 transition-colors group-hover:bg-gray-50/80">
            <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-wider">Security Deposit</p>
            <p className="font-bold text-gray-800 text-base">{formatPeso(vehicle.security_deposit)}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-2">
          {vehicle.current_status === 'available' ? (
            <Link
              href={`/book?vehicleId=${vehicle.id}`}
              className="w-full btn-modern btn-primary-interactive py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-blue-500/25"
            >
              <Zap className="h-4 w-4 fill-current text-amber-300" />
              Instant Book
            </Link>
          ) : (
            <button
              disabled
              className="w-full btn-modern py-3 rounded-xl bg-gray-100 text-gray-400 font-semibold text-sm cursor-not-allowed border border-gray-200"
            >
              Currently Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
