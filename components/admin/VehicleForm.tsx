'use client';

import { useState, useRef, useTransition } from 'react';
import { X, Loader2, Upload, ImageIcon, Link2 } from 'lucide-react';
import { createVehicle, updateVehicle } from '@/app/actions/fleet';
import { validateFile } from '@/lib/utils';
import type { VehicleRow, VehicleInsert, VehicleType } from '@/types/database.types';

interface VehicleFormProps {
  vehicle?: VehicleRow;
  onClose: () => void;
}

export function VehicleForm({ vehicle, onClose }: VehicleFormProps) {
  const [form, setForm] = useState({
    model_name: vehicle?.model_name ?? '',
    plate_number: vehicle?.plate_number ?? '',
    vehicle_type: (vehicle?.vehicle_type ?? 'car') as VehicleType,
    daily_rate: vehicle?.daily_rate.toString() ?? '',
    security_deposit: vehicle?.security_deposit.toString() ?? '1000',
    image_url: vehicle?.image_url ?? '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(vehicle?.image_url ?? null);
  const [useCustomUrl, setUseCustomUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    update('image_url', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = (): string | null => {
    if (!form.model_name.trim()) return 'Model name is required.';
    if (!form.plate_number.trim()) return 'Plate number is required.';
    if (!form.daily_rate || isNaN(Number(form.daily_rate)) || Number(form.daily_rate) <= 0) {
      return 'Daily rate must be a positive number.';
    }
    if (!form.security_deposit || isNaN(Number(form.security_deposit)) || Number(form.security_deposit) < 0) {
      return 'Security deposit must be 0 or greater.';
    }
    return null;
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    startTransition(async () => {
      const payload: VehicleInsert = {
        model_name: form.model_name.trim(),
        plate_number: form.plate_number.trim().toUpperCase(),
        vehicle_type: form.vehicle_type,
        daily_rate: parseFloat(form.daily_rate),
        security_deposit: parseFloat(form.security_deposit),
        image_url: form.image_url.trim() || null,
      };

      const result = vehicle
        ? await updateVehicle(vehicle.id, payload, imageFile ?? undefined)
        : await createVehicle(payload, imageFile ?? undefined);

      if (result.success) {
        onClose();
      } else {
        setError(result.error ?? 'Something went wrong while saving vehicle.');
      }
    });
  };

  const isEditing = !!vehicle;

  return (
    <div className="p-6 space-y-5 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="font-bold text-gray-900 text-lg">
          {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 hover:text-gray-800 rounded-xl transition-all duration-200 text-gray-400 active:scale-95"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Model Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
        <input
          type="text"
          value={form.model_name}
          onChange={(e) => update('model_name', e.target.value)}
          placeholder="e.g. Honda Click 125i or Toyota Vios"
          className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-150"
        />
      </div>

      {/* Plate Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number</label>
        <input
          type="text"
          value={form.plate_number}
          onChange={(e) => update('plate_number', e.target.value.toUpperCase())}
          placeholder="e.g. ABC 1234"
          className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 uppercase font-mono transition-all duration-150"
        />
      </div>

      {/* Vehicle Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
        <div className="grid grid-cols-2 gap-3">
          {(['car', 'motorcycle'] as VehicleType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => update('vehicle_type', t)}
              className={`py-2.5 rounded-xl text-sm font-semibold border-2 capitalize transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                form.vehicle_type === t
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t === 'car' ? 'Car' : 'Motorcycle'}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Rate & Deposit */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate (₱)</label>
          <input
            type="number"
            value={form.daily_rate}
            onChange={(e) => update('daily_rate', e.target.value)}
            placeholder="500"
            min="0"
            step="50"
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-150"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (₱)</label>
          <input
            type="number"
            value={form.security_deposit}
            onChange={(e) => update('security_deposit', e.target.value)}
            placeholder="1000"
            min="0"
            step="100"
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-150"
          />
        </div>
      </div>

      {/* Vehicle Photo Upload (Local file dropzone + preview) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Vehicle Photo</label>
          <button
            type="button"
            onClick={() => setUseCustomUrl(!useCustomUrl)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {useCustomUrl ? '← Upload local image' : 'Use image URL instead →'}
          </button>
        </div>

        {useCustomUrl ? (
          <div>
            <div className="relative">
              <input
                type="url"
                value={form.image_url}
                onChange={(e) => {
                  update('image_url', e.target.value);
                  setImagePreview(e.target.value || null);
                }}
                placeholder="https://images.unsplash.com/..."
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all duration-150 pl-9"
              />
              <Link2 className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Direct public URL of the vehicle photo</p>
          </div>
        ) : (
          <div>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-blue-200 bg-gray-50 aspect-video group shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Vehicle preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white text-gray-800 text-xs font-semibold hover:bg-gray-100 transition-all active:scale-95 shadow"
                  >
                    Replace Image
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-all active:scale-95 shadow"
                  >
                    Remove
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2.5 py-0.5 rounded-md backdrop-blur-sm truncate max-w-[80%]">
                  {imageFile?.name ?? 'Vehicle Image'}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-2xl py-7 flex flex-col items-center gap-2.5 transition-all duration-200 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-blue-100 text-gray-500 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 block">
                    Upload vehicle image from device
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5 block">
                    PNG, JPG, WebP or HEIC (Up to 5MB)
                  </span>
                </div>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              onChange={handleImageFileChange}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-xl animate-shake">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 btn-modern btn-outline-interactive py-3 rounded-xl text-sm"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="flex-1 btn-modern btn-primary-interactive py-3 rounded-xl text-sm gap-2"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isEditing ? 'Save Changes' : 'Add Vehicle'}
        </button>
      </div>
    </div>
  );
}
