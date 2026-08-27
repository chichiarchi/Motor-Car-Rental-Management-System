import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';

// ─── TAILWIND ──────────────────────────────────────────────────

/**
 * Merges Tailwind CSS class strings safely, resolving conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── CURRENCY ─────────────────────────────────────────────────

/**
 * Format a number as Philippine Peso with comma separators.
 * @example formatPeso(1500) → "₱1,500.00"
 */
export function formatPeso(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── DATE / RENTAL CALCULATIONS ───────────────────────────────

/**
 * Combine a date string (YYYY-MM-DD) and a time string (HH:mm) into a single Date object.
 */
export function combineDateAndTime(dateStr: string, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(dateStr);
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
}

/**
 * Calculate the number of rental days between two timestamps.
 * Uses 24-hour cycles with ceiling to ensure any extra hours count
 * as an additional rental day (minimum 1 day).
 */
export function calculateRentalDays(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) return 1;
  const hours = diffMs / (1000 * 60 * 60);
  const days = Math.ceil(hours / 24);
  return Math.max(1, days);
}

/**
 * Calculate the rental subtotal (daily rate × number of days).
 */
export function calculateSubtotal(dailyRate: number, days: number): number {
  return dailyRate * days;
}

/**
 * Calculate the total amount due at booking (subtotal + security deposit).
 */
export function calculateTotalAmount(subtotal: number, deposit: number): number {
  return subtotal + deposit;
}

// ─── BOOKING CODE GENERATION ──────────────────────────────────

/**
 * Generate a human-readable booking code in the format BK-YYYY-XXXX.
 * Uses the current year and 4 random alphanumeric characters (uppercase).
 * @example "BK-2026-A3F7"
 */
export function generateBookingCode(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omit ambiguous chars (0, O, 1, I)
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BK-${year}-${suffix}`;
}

// ─── DATE FORMATTING ──────────────────────────────────────────

/**
 * Format an ISO date string or Date to "MMM d, yyyy" for display.
 * @example formatDate("2026-12-25") → "Dec 25, 2026"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

/**
 * Format an ISO date string or Date to "h:mm a" for display.
 * @example formatTime("2026-12-25T09:00:00") → "9:00 AM"
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'h:mm a');
}

/**
 * Format an ISO date string or Date to "MMM d, yyyy h:mm a" for display.
 * @example formatDateTime("2026-12-25T09:00:00") → "Dec 25, 2026 9:00 AM"
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

// ─── FILE HELPERS ─────────────────────────────────────────────

/** Maximum allowed file size for KYC and payment uploads (5 MB). */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/** Accepted image MIME types for uploads. */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

/**
 * Validate a file for KYC/payment upload.
 * Returns an error string or null if valid.
 */
export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File "${file.name}" exceeds the 5 MB limit.`;
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return `File "${file.name}" must be a JPEG, PNG, WebP, or HEIC image.`;
  }
  return null;
}

/**
 * Build a Supabase Storage public URL from a storage path.
 */
export function buildStorageUrl(
  supabaseUrl: string,
  bucket: string,
  path: string
): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
