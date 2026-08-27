'use client';

import { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, X, CheckCircle2, Loader2, Gauge, ShieldAlert } from 'lucide-react';
import { createInspection } from '@/app/actions/inspections';
import { GAS_LEVELS } from '@/lib/constants';
import { validateFile } from '@/lib/utils';
import type { InspectionRow, InspectionType, BookingStatus } from '@/types/database.types';

interface InspectionFormProps {
  bookingId: string;
  bookingStatus: BookingStatus;
  hasCheckIn: boolean;
  hasCheckOut: boolean;
  existingCheckIn: InspectionRow | null;
  existingCheckOut: InspectionRow | null;
}

export function InspectionForm({
  bookingId,
  bookingStatus,
  hasCheckIn,
  hasCheckOut,
  existingCheckIn,
  existingCheckOut,
}: InspectionFormProps) {
  const [type, setType] = useState<InspectionType>(hasCheckIn ? 'check_out' : 'check_in');
  const [gasLevel, setGasLevel] = useState('Full');
  const [odometer, setOdometer] = useState('');
  const [helmets, setHelmets] = useState(0);
  const [damageNotes, setDamageNotes] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (const file of files) {
      const err = validateFile(file);
      if (err) { setError(err); continue; }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    setPhotos((p) => [...p, ...validFiles]);
    setPhotoPreviews((p) => [...p, ...validPreviews]);
    if (e.target) e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((p) => p.filter((_, i) => i !== index));
    setPhotoPreviews((p) => p.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    setError(null);
    if (!odometer) { setError('Odometer reading is required.'); return; }

    startTransition(async () => {
      const result = await createInspection({
        bookingId,
        type,
        gasLevel,
        odometerReading: parseFloat(odometer),
        helmetsProvided: helmets,
        damageNotes,
        photos,
      });

      if (result.success) {
        setSuccess(true);
        router.refresh();
      } else {
        setError(result.error ?? 'Submission failed.');
      }
    });
  };

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center animate-fadeIn shadow-sm">
        <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3 stroke-[2.5]" />
        <p className="font-bold text-emerald-950 text-lg">Inspection Logged Successfully</p>
        <p className="text-sm text-emerald-700 mt-1">
          {type === 'check_in'
            ? 'Vehicle handed over to customer. Status set to Ongoing.'
            : 'Vehicle returned. Booking completed and deposit marked for refund.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
      {/* Existing inspection badges */}
      <div className="flex gap-2 flex-wrap">
        {hasCheckIn && (
          <span className="flex items-center gap-1.5 text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" /> Check-In Complete
          </span>
        )}
        {hasCheckOut && (
          <span className="flex items-center gap-1.5 text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" /> Check-Out Complete
          </span>
        )}
      </div>

      {/* Inspection Type Toggle */}
      {!hasCheckIn || !hasCheckOut ? (
        <>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Inspection Workflow</label>
            <div className="grid grid-cols-2 gap-3">
              {(['check_in', 'check_out'] as InspectionType[]).map((t) => {
                const isDisabled = (t === 'check_in' && hasCheckIn) || (t === 'check_out' && hasCheckOut);
                const isSelected = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setType(t)}
                    className={`btn-modern py-3 rounded-2xl text-sm font-bold border-2 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {t === 'check_in' ? 'Handover (Check-In)' : 'Return (Check-Out)'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gas Level */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-blue-600" /> Fuel Gauge Level
            </label>
            <div className="flex gap-2 flex-wrap">
              {GAS_LEVELS.map((gl) => (
                <button
                  key={gl.value}
                  type="button"
                  onClick={() => setGasLevel(gl.value)}
                  className={`btn-modern px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                    gasLevel === gl.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-[1.03]'
                      : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  {gl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Odometer */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">
              Odometer Reading (km)
            </label>
            <input
              type="number"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              placeholder="e.g. 12500.5"
              step="0.1"
              min="0"
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-150"
            />
          </div>

          {/* Helmets */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">Helmets Handed Over</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setHelmets((h) => Math.max(0, h - 1))}
                className="w-10 h-10 rounded-xl border border-gray-300 text-xl font-bold text-gray-700 hover:bg-gray-100 active:scale-95 transition-all duration-150 flex items-center justify-center cursor-pointer shadow-sm"
              >
                −
              </button>
              <span className="text-xl font-extrabold w-10 text-center font-mono">{helmets}</span>
              <button
                type="button"
                onClick={() => setHelmets((h) => h + 1)}
                className="w-10 h-10 rounded-xl border border-gray-300 text-xl font-bold text-gray-700 hover:bg-gray-100 active:scale-95 transition-all duration-150 flex items-center justify-center cursor-pointer shadow-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* Damage Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">
              Damage & Condition Notes <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </label>
            <textarea
              value={damageNotes}
              onChange={(e) => setDamageNotes(e.target.value)}
              placeholder="Describe scratches, dents, missing accessories, or tire condition..."
              rows={3}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-150 resize-none"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">
              Inspection Photos (Handover / Return State)
            </label>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-2xl py-6 flex flex-col items-center gap-2 transition-all duration-200 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-blue-100 text-gray-500 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                <Camera className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600">
                Snap or upload photos from device
              </span>
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handlePhotoAdd}
              className="hidden"
            />

            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2.5 mt-3.5">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 shadow-sm group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1.5 right-1.5 bg-white/95 text-rose-600 rounded-full p-1 shadow hover:bg-rose-50 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full btn-modern btn-primary-interactive py-4 rounded-2xl text-base font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Saving Inspection...</>
            ) : (
              `Save ${type === 'check_in' ? 'Check-In' : 'Check-Out'} Inspection Log`
            )}
          </button>
        </>
      ) : (
        <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-500 text-sm">
          Both check-in and check-out inspections have been recorded for this booking.
        </div>
      )}
    </div>
  );
}
