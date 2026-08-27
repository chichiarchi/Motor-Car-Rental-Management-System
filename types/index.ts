// ============================================================
// types/index.ts
// Extended frontend types built on top of database row types.
// ============================================================

import type {
  BookingRow,
  VehicleRow,
  VerificationDocRow,
  InspectionRow,
  InspectionType,
} from './database.types';

// ─── JOINED TYPES ─────────────────────────────────────────────

/** Vehicle row with optional active booking count for display. */
export type VehicleWithBookings = VehicleRow & {
  active_booking_count?: number;
};

/** Full booking record with vehicle and verification documents joined. */
export type BookingWithVehicleAndDocs = BookingRow & {
  vehicle: VehicleRow | null;
  verification_docs: VerificationDocRow | null;
};

/** Booking with inspection logs for the admin inspect view. */
export type BookingWithInspections = BookingRow & {
  vehicle: VehicleRow | null;
  inspections: InspectionRow[];
};

// ─── MULTI-STEP BOOKING FORM ──────────────────────────────────

export interface Step1Data {
  vehicleId: string;
  startDate: Date | null;
  endDate: Date | null;
  pickupTime: string;
  returnTime: string;
  rentalDays: number;
  dailyRate: number;
  subtotal: number;
  securityDeposit: number;
  totalAmount: number;
}

export interface Step2Data {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryOption: 'pickup' | 'delivery';
  deliveryAddress: string;
}

export interface Step3Data {
  driverLicenseFile: File | null;
  secondaryIdFile: File | null;
  selfieFile: File | null;
}

export interface Step4Data {
  paymentReceiptFile: File | null;
}

export interface BookingFormData {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
}

// ─── INSPECTION FORM ──────────────────────────────────────────

export interface InspectionFormData {
  bookingId: string;
  type: InspectionType;
  gasLevel: string;
  odometerReading: number | null;
  helmetsProvided: number;
  damageNotes: string;
  photos: File[];
}

// ─── SERVER ACTION RESULTS ────────────────────────────────────

export interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SubmitBookingResult {
  bookingCode: string;
}

// ─── DASHBOARD METRICS ────────────────────────────────────────

export interface DashboardMetrics {
  pendingBookings: number;
  activeRentals: number;
  todayPickups: number;
  todayReturns: number;
  totalRevenue: number;
}
