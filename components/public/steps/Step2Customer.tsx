'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, Building2, Truck } from 'lucide-react';
import { PH_MOBILE_REGEX } from '@/lib/constants';
import type { Step2Data } from '@/types';

interface Step2CustomerProps {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2Customer({ data, onChange, onNext, onBack }: Step2CustomerProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof Step2Data, string>>>({});

  const update = <K extends keyof Step2Data>(key: K, value: Step2Data[K]) => {
    onChange({ ...data, [key]: value });
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Step2Data, string>> = {};

    if (!data.customerName.trim()) {
      newErrors.customerName = 'Full name is required.';
    }
    if (!data.customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail)) {
      newErrors.customerEmail = 'A valid email address is required.';
    }
    if (!PH_MOBILE_REGEX.test(data.customerPhone)) {
      newErrors.customerPhone = 'Enter a valid Philippine mobile number (e.g., 09171234567).';
    }
    if (data.deliveryOption === 'delivery' && !data.deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'Delivery address is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Step 2: Customer Contact Info</h2>
        <p className="text-sm text-gray-500 mt-1">We need your contact details to verify and confirm the booking.</p>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <span className="flex items-center gap-1.5"><User className="h-4 w-4 text-blue-600" /> Full Name</span>
        </label>
        <input
          type="text"
          value={data.customerName}
          onChange={(e) => update('customerName', e.target.value)}
          placeholder="Juan dela Cruz"
          className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-150"
        />
        {errors.customerName && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.customerName}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-blue-600" /> Email Address</span>
        </label>
        <input
          type="email"
          value={data.customerEmail}
          onChange={(e) => update('customerEmail', e.target.value)}
          placeholder="juan@example.com"
          className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-150"
        />
        {errors.customerEmail && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.customerEmail}</p>}
      </div>

      {/* Mobile Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-blue-600" /> Philippine Mobile Number</span>
        </label>
        <input
          type="tel"
          value={data.customerPhone}
          onChange={(e) => update('customerPhone', e.target.value)}
          placeholder="09171234567"
          maxLength={11}
          className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-150"
        />
        <p className="text-xs text-gray-400 mt-1">Format: 09XXXXXXXXX (11 digits)</p>
        {errors.customerPhone && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.customerPhone}</p>}
      </div>

      {/* Delivery Option */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-blue-600" /> Pickup / Delivery Option</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { value: 'pickup', label: 'Branch Pickup', desc: 'Free — Pick up directly at our branch', icon: Building2 },
            { value: 'delivery', label: 'Door Delivery', desc: 'Convenient delivery to your hotel/address', icon: Truck },
          ].map((opt) => {
            const Icon = opt.icon;
            const isSelected = data.deliveryOption === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('deliveryOption', opt.value as 'pickup' | 'delivery')}
                className={`btn-modern text-left p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 shadow-sm text-blue-950'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="font-bold text-sm">{opt.label}</p>
                </div>
                <p className="text-xs text-gray-500">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Delivery Address */}
      {data.deliveryOption === 'delivery' && (
        <div className="animate-fadeIn">
          <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
          <textarea
            value={data.deliveryAddress}
            onChange={(e) => update('deliveryAddress', e.target.value)}
            placeholder="Unit/House No., Street, Barangay, City, Province"
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-150 resize-none"
          />
          {errors.deliveryAddress && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.deliveryAddress}</p>}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 btn-modern btn-outline-interactive py-3 rounded-xl text-sm"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => { if (validate()) onNext(); }}
          className="flex-1 btn-modern btn-primary-interactive py-3 rounded-xl text-sm shadow-md"
        >
          Continue to Documents →
        </button>
      </div>
    </div>
  );
}
