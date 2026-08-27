'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookingWizard } from '@/components/public/BookingWizard';
import type { BookingFormData } from '@/types';

function BookPageContent() {
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get('vehicleId') ?? '';

  const [formData, setFormData] = useState<BookingFormData>({
    step1: {
      vehicleId,
      startDate: null,
      endDate: null,
      pickupTime: '09:00',
      returnTime: '17:00',
      rentalDays: 0,
      dailyRate: 0,
      subtotal: 0,
      securityDeposit: 0,
      totalAmount: 0,
    },
    step2: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      deliveryOption: 'pickup',
      deliveryAddress: '',
    },
    step3: {
      driverLicenseFile: null,
      secondaryIdFile: null,
      selfieFile: null,
    },
    step4: {
      paymentReceiptFile: null,
    },
  });

  return (
    <BookingWizard
      formData={formData}
      setFormData={setFormData}
      initialVehicleId={vehicleId}
    />
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-3" />
          <p>Loading booking form…</p>
        </div>
      </div>
    }>
      <BookPageContent />
    </Suspense>
  );
}
