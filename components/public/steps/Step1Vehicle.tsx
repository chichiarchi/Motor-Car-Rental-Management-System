'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Clock, Info, Car, Bike } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  calculateRentalDays,
  calculateSubtotal,
  calculateTotalAmount,
  combineDateAndTime,
  formatPeso,
} from '@/lib/utils';
import type { VehicleRow } from '@/types/database.types';
import type { Step1Data } from '@/types';

interface Step1VehicleProps {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
  initialVehicleId: string;
  onNext: () => void;
}

const TIME_OPTIONS = [
  { value: '07:00', label: '7:00 AM' },
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM (Noon)' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '19:00', label: '7:00 PM' },
];

export function Step1Vehicle({
  data,
  onChange,
  initialVehicleId,
  onNext,
}: Step1VehicleProps) {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRow | null>(null);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const [startDateStr, setStartDateStr] = useState(
    data.startDate ? data.startDate.toISOString().split('T')[0] : ''
  );
  const [endDateStr, setEndDateStr] = useState(
    data.endDate ? data.endDate.toISOString().split('T')[0] : ''
  );
  const [pickupTime, setPickupTime] = useState(data.pickupTime || '09:00');
  const [returnTime, setReturnTime] = useState(data.returnTime || '17:00');

  const [error, setError] = useState<string | null>(null);

  // Fetch available vehicles
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('vehicles')
      .select('*')
      .eq('current_status', 'available')
      .order('vehicle_type')
      .then(({ data: rows }) => {
        const list = (rows ?? []) as VehicleRow[];
        setVehicles(list);
        if (initialVehicleId) {
          const found = list.find((v) => v.id === initialVehicleId);
          if (found) setSelectedVehicle(found);
        }
        setLoadingVehicles(false);
      });
  }, [initialVehicleId]);

  // Recalculate totals when dates, times, or vehicle change
  useEffect(() => {
    if (!selectedVehicle || !startDateStr || !endDateStr) return;

    const start = combineDateAndTime(startDateStr, pickupTime);
    const end = combineDateAndTime(endDateStr, returnTime);

    if (end <= start) return;

    const days = calculateRentalDays(start, end);
    const subtotal = calculateSubtotal(selectedVehicle.daily_rate, days);
    const total = calculateTotalAmount(subtotal, selectedVehicle.security_deposit);

    onChange({
      vehicleId: selectedVehicle.id,
      startDate: start,
      endDate: end,
      pickupTime,
      returnTime,
      rentalDays: days,
      dailyRate: selectedVehicle.daily_rate,
      subtotal,
      securityDeposit: selectedVehicle.security_deposit,
      totalAmount: total,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVehicle, startDateStr, endDateStr, pickupTime, returnTime]);

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId) ?? null;
    setSelectedVehicle(vehicle);
    setError(null);
  };

  const validate = (): boolean => {
    if (!selectedVehicle) {
      setError('Please select a vehicle.');
      return false;
    }
    if (!startDateStr) {
      setError('Please select a pickup date.');
      return false;
    }
    if (!endDateStr) {
      setError('Please select a return date.');
      return false;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // If pickup date is before today
    if (startDateStr < todayStr) {
      setError('Pickup date cannot be in the past.');
      return false;
    }

    // If pickup is TODAY, check that pickup time is not in the past
    if (startDateStr === todayStr) {
      const start = combineDateAndTime(startDateStr, pickupTime);
      const now = new Date();
      if (start < now) {
        setError('For same-day bookings, pickup time must be after the current time.');
        return false;
      }
    }

    // If return date is before pickup date
    if (endDateStr < startDateStr) {
      setError('Return date cannot be earlier than the pickup date.');
      return false;
    }

    // If returning on the SAME date, check that return time is after pickup time
    if (endDateStr === startDateStr) {
      const [pKeyH, pKeyM] = pickupTime.split(':').map(Number);
      const [rKeyH, rKeyM] = returnTime.split(':').map(Number);
      const pMinutes = pKeyH * 60 + pKeyM;
      const rMinutes = rKeyH * 60 + rKeyM;

      if (rMinutes <= pMinutes) {
        setError('When returning on the same day, return time must be later than the pickup time.');
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Step 1: Choose Vehicle & Schedule</h2>
        <p className="text-sm text-gray-500 mt-1">
          Select your ride, pickup/return dates, and preferred schedule times.
        </p>
      </div>

      {/* Vehicle Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Vehicle</label>
        {loadingVehicles ? (
          <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
        ) : (
          <select
            value={selectedVehicle?.id ?? ''}
            onChange={(e) => handleVehicleSelect(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 bg-white transition-all duration-150 cursor-pointer"
          >
            <option value="">-- Select a vehicle from our fleet --</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.model_name} ({v.vehicle_type === 'car' ? 'Car' : 'Motorcycle'}) — {formatPeso(v.daily_rate)}/day
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Selected Vehicle Card Preview */}
      {selectedVehicle && (
        <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            {selectedVehicle.vehicle_type === 'car' ? (
              <Car className="h-5 w-5" />
            ) : (
              <Bike className="h-5 w-5" />
            )}
          </div>
          <div className="text-sm flex-1">
            <p className="font-bold text-gray-900 leading-tight">{selectedVehicle.model_name}</p>
            <p className="text-gray-600 text-xs mt-0.5">
              Plate: <span className="font-mono font-medium">{selectedVehicle.plate_number}</span> &nbsp;·&nbsp;
              Daily: <strong className="text-blue-700">{formatPeso(selectedVehicle.daily_rate)}</strong> &nbsp;·&nbsp;
              Deposit: <strong>{formatPeso(selectedVehicle.security_deposit)}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Date and Time Pickers */}
      <div className="space-y-4">
        {/* Pickup Date & Time */}
        <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
            Pickup Schedule
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pickup Date</label>
              <input
                type="date"
                min={today}
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-400" /> Pickup Time
              </label>
              <select
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all cursor-pointer"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Return Date & Time */}
        <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
            Return Schedule
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Return Date</label>
              <input
                type="date"
                min={startDateStr || today}
                value={endDateStr}
                onChange={(e) => setEndDateStr(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-400" /> Return Time
              </label>
              <select
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all cursor-pointer"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Price Breakdown Summary */}
      {data.rentalDays > 0 && selectedVehicle && (
        <div className="bg-gray-900 text-white rounded-2xl p-5 space-y-3 text-sm shadow-md">
          <h3 className="font-semibold text-gray-200 text-xs uppercase tracking-wider">
            Booking & Cost Breakdown
          </h3>
          <div className="space-y-1.5 text-xs text-gray-300">
            <div className="flex justify-between">
              <span>Rental Duration</span>
              <span className="font-semibold text-white">
                {data.rentalDays} Day{data.rentalDays !== 1 ? 's' : ''} (24-Hour Cycle)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Daily Rate ({formatPeso(data.dailyRate)} × {data.rentalDays})</span>
              <span className="font-medium text-white">{formatPeso(data.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Refundable Security Deposit</span>
              <span className="font-medium text-white">{formatPeso(data.securityDeposit)}</span>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-2.5 flex justify-between items-center">
            <div>
              <span className="font-bold text-white text-sm block">Total Due</span>
              <span className="text-[10px] text-gray-400">Rental Subtotal + Deposit</span>
            </div>
            <span className="font-extrabold text-amber-400 text-xl">{formatPeso(data.totalAmount)}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-xl">
          {error}
        </div>
      )}

      {/* Next Button with modern interactive hover */}
      <button
        type="button"
        onClick={handleNext}
        className="w-full btn-modern btn-primary-interactive py-3.5 rounded-xl font-bold text-sm shadow-md"
      >
        Continue to Customer Info →
      </button>
    </div>
  );
}
