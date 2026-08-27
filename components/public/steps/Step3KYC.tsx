'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { validateFile } from '@/lib/utils';
import type { Step3Data } from '@/types';

interface Step3KYCProps {
  data: Step3Data;
  onChange: (data: Step3Data) => void;
  onNext: () => void;
  onBack: () => void;
}

interface FileUploadFieldProps {
  label: string;
  description: string;
  accept: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  error?: string;
}

function FileUploadField({ label, description, accept, file, onFileChange, error }: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Preserve and display preview when file prop exists (e.g. going back to this step)
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreview(null);
    }
  }, [file]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validationError = validateFile(selected);
    if (validationError) {
      setFieldError(validationError);
      return;
    }

    setFieldError(null);
    onFileChange(selected);
  };

  const handleRemove = () => {
    onFileChange(null);
    setPreview(null);
    setFieldError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-800">{label}</label>
      <p className="text-xs text-gray-500">{description}</p>

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-blue-200 bg-gray-50 shadow-inner group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={label} className="w-full h-40 object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2.5 right-2.5 bg-white/95 text-rose-600 rounded-full p-1.5 shadow-md hover:bg-rose-50 hover:scale-110 active:scale-95 transition-all duration-150"
            title="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs px-3.5 py-2 truncate">
            {file?.name}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-2xl py-6 flex flex-col items-center gap-2 transition-all duration-200 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-blue-100 text-gray-500 group-hover:text-blue-600 flex items-center justify-center transition-colors">
            <Upload className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600">
            Click to upload document photo
          </span>
          <span className="text-[11px] text-gray-400">JPEG, PNG, WebP or HEIC · Max 5 MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {(fieldError || error) && (
        <p className="text-xs text-rose-600 mt-1 font-medium">{fieldError || error}</p>
      )}
    </div>
  );
}

export function Step3KYC({ data, onChange, onNext, onBack }: Step3KYCProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof Step3Data, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Step3Data, string>> = {};
    if (!data.driverLicenseFile) newErrors.driverLicenseFile = "Driver's License is required.";
    if (!data.secondaryIdFile) newErrors.secondaryIdFile = 'Secondary ID is required.';
    if (!data.selfieFile) newErrors.selfieFile = 'Verification selfie is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Step 3: Verification & KYC Documents</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload clear photos of your required identification documents for fraud prevention.
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5 shadow-sm">
        <ShieldCheck className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
        <span>
          Ensure your name and photos are crisp and readable. All verification files are transmitted and stored securely.
        </span>
      </div>

      <FileUploadField
        label="1. Primary Driver's License"
        description="Valid Philippine Driver's License (Front photo)."
        accept={ACCEPT}
        file={data.driverLicenseFile}
        onFileChange={(file) => onChange({ ...data, driverLicenseFile: file })}
        error={errors.driverLicenseFile}
      />

      <FileUploadField
        label="2. Secondary Valid ID"
        description="Passport, UMID, PhilSys National ID, PRC, or Voter's ID."
        accept={ACCEPT}
        file={data.secondaryIdFile}
        onFileChange={(file) => onChange({ ...data, secondaryIdFile: file })}
        error={errors.secondaryIdFile}
      />

      <FileUploadField
        label="3. Verification Selfie"
        description="Take a selfie holding your Driver's License beside your face."
        accept={ACCEPT}
        file={data.selfieFile}
        onFileChange={(file) => onChange({ ...data, selfieFile: file })}
        error={errors.selfieFile}
      />

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
          Continue to Payment →
        </button>
      </div>
    </div>
  );
}
