// ============================================================
// lib/constants.ts
// Application-wide constants for the Philippine Car & Motor
// Rental Management System.
// ============================================================

import type {
  BookingStatus,
  PaymentStatus,
  DepositStatus,
  VehicleStatus,
  VehicleType,
} from '@/types/database.types';

// ─── VEHICLE ──────────────────────────────────────────────────

export const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: 'car', label: 'Car' },
  { value: 'motorcycle', label: 'Motorcycle' },
];

export const VEHICLE_STATUS_MAP: Record<
  VehicleStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  available: { label: 'Available', variant: 'default' },
  rented: { label: 'Rented', variant: 'secondary' },
  maintenance: { label: 'Maintenance', variant: 'destructive' },
};

// ─── BOOKING STATUS ───────────────────────────────────────────

export const BOOKING_STATUS_MAP: Record<
  BookingStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: { label: 'Pending', variant: 'outline' },
  confirmed: { label: 'Confirmed', variant: 'default' },
  ongoing: { label: 'Ongoing', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

// ─── PAYMENT STATUS ───────────────────────────────────────────

export const PAYMENT_STATUS_MAP: Record<
  PaymentStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending_verification: { label: 'Pending Verification', variant: 'outline' },
  downpayment_paid: { label: 'Downpayment Paid', variant: 'secondary' },
  fully_paid: { label: 'Fully Paid', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

// ─── DEPOSIT STATUS ───────────────────────────────────────────

export const DEPOSIT_STATUS_MAP: Record<
  DepositStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  unpaid: { label: 'Unpaid', variant: 'destructive' },
  held: { label: 'Held', variant: 'secondary' },
  refunded: { label: 'Refunded', variant: 'default' },
};

// ─── GAS LEVELS ───────────────────────────────────────────────

export const GAS_LEVELS = [
  { value: 'Full', label: 'Full' },
  { value: '3/4', label: '3/4' },
  { value: '1/2', label: '1/2' },
  { value: '1/4', label: '1/4' },
  { value: 'Empty', label: 'Empty' },
] as const;

export type GasLevel = (typeof GAS_LEVELS)[number]['value'];

// ─── VALID ID TYPES (Secondary ID for KYC) ───────────────────

export const SECONDARY_ID_TYPES = [
  "Passport",
  "UMID (SSS/GSIS)",
  "PhilSys National ID",
  "Voter's ID",
  "PRC License",
  "TIN ID",
  "Postal ID",
  "Senior Citizen ID",
  "PWD ID",
] as const;

// ─── PAYMENT METHODS ──────────────────────────────────────────

export const PAYMENT_METHODS = [
  {
    name: 'GCash',
    accountName: 'Juan dela Cruz',
    accountNumber: '0917 123 4567',
    qrPath: '/qr/gcash-qr.png',
  },
  {
    name: 'Maya',
    accountName: 'Juan dela Cruz',
    accountNumber: '0915 987 6543',
    qrPath: '/qr/maya-qr.png',
  },
] as const;

// ─── DELIVERY OPTIONS ─────────────────────────────────────────

export const DELIVERY_OPTIONS = [
  { value: 'pickup', label: 'Branch Pickup (Free)' },
  { value: 'delivery', label: 'Door Delivery (Fee may apply)' },
] as const;

// ─── STORAGE BUCKETS ──────────────────────────────────────────

export const STORAGE_BUCKETS = {
  VERIFICATION_DOCS: 'verification-docs',
  INSPECTIONS: 'inspections',
  VEHICLES: 'vehicles',
} as const;


// ─── BUSINESS INFO ────────────────────────────────────────────

export const BUSINESS_INFO = {
  name: 'DriveEasy Rentals',
  tagline: 'Affordable Car & Motorcycle Rentals in the Philippines',
  address: '123 Rizal Avenue, Manila, Philippines',
  phone: '+63 917 123 4567',
  email: 'support@driveeasy.ph',
  branchHours: 'Mon–Sun, 7:00 AM – 7:00 PM',
} as const;

// ─── BOOKING FORM ─────────────────────────────────────────────

/** Minimum rental period in days. */
export const MIN_RENTAL_DAYS = 1;

/** Maximum rental period in days. */
export const MAX_RENTAL_DAYS = 90;

/** Philippine mobile number regex: must start with 09, 10 digits total. */
export const PH_MOBILE_REGEX = /^09\d{9}$/;
