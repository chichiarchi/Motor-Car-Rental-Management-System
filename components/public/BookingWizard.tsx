'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle } from 'lucide-react';
import { Step1Vehicle } from './steps/Step1Vehicle';
import { Step2Customer } from './steps/Step2Customer';
import { Step3KYC } from './steps/Step3KYC';
import { Step4Payment } from './steps/Step4Payment';
import { submitBooking } from '@/app/actions/bookings';
import { cn } from '@/lib/utils';
import type { BookingFormData } from '@/types';

interface BookingWizardProps {
  formData: BookingFormData;
  setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>;
  initialVehicleId: string;
}

const STEPS = [
  { number: 1, label: 'Vehicle & Dates' },
  { number: 2, label: 'Your Info' },
  { number: 3, label: 'Documents' },
  { number: 4, label: 'Payment' },
];

export function BookingWizard({
  formData,
  setFormData,
  initialVehicleId,
}: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, 4));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    const { step1, step2, step3, step4 } = formData;

    if (
      !step3.driverLicenseFile ||
      !step3.secondaryIdFile ||
      !step3.selfieFile ||
      !step4.paymentReceiptFile
    ) {
      setSubmitError('All documents and payment receipt are required.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const result = await submitBooking({
      vehicleId: step1.vehicleId,
      startDate: step1.startDate!.toISOString(),
      endDate: step1.endDate!.toISOString(),
      totalAmount: step1.totalAmount,
      customerName: step2.customerName,
      customerEmail: step2.customerEmail,
      customerPhone: step2.customerPhone,
      deliveryLocation:
        step2.deliveryOption === 'delivery'
          ? step2.deliveryAddress
          : 'Branch Pickup',
      driverLicenseFile: step3.driverLicenseFile,
      secondaryIdFile: step3.secondaryIdFile,
      selfieFile: step3.selfieFile,
      paymentReceiptFile: step4.paymentReceiptFile,
    });

    setIsSubmitting(false);

    if (result.success && result.data) {
      router.push(`/book/success?code=${result.data.bookingCode}`);
    } else {
      setSubmitError(result.error ?? 'Submission failed. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* ── Step Indicators ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 -z-10" />
          <div
            className="absolute left-0 top-4 h-0.5 bg-primary -z-10 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />

          {STEPS.map((step) => {
            const isDone = currentStep > step.number;
            const isActive = currentStep === step.number;
            return (
              <div key={step.number} className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                    isDone
                      ? 'bg-primary text-primary-foreground'
                      : isActive
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                  )}
                >
                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : step.number}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium hidden sm:block',
                    isActive ? 'text-primary' : 'text-gray-400'
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Step Content ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        {currentStep === 1 && (
          <Step1Vehicle
            data={formData.step1}
            onChange={(step1) => setFormData((d) => ({ ...d, step1 }))}
            initialVehicleId={initialVehicleId}
            onNext={goNext}
          />
        )}
        {currentStep === 2 && (
          <Step2Customer
            data={formData.step2}
            onChange={(step2) => setFormData((d) => ({ ...d, step2 }))}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {currentStep === 3 && (
          <Step3KYC
            data={formData.step3}
            onChange={(step3) => setFormData((d) => ({ ...d, step3 }))}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {currentStep === 4 && (
          <Step4Payment
            data={formData.step4}
            onChange={(step4) => setFormData((d) => ({ ...d, step4 }))}
            totalAmount={formData.step1.totalAmount}
            onBack={goBack}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}
      </div>
    </div>
  );
}
