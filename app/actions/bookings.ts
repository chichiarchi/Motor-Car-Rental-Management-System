'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { generateBookingCode } from '@/lib/utils';
import { STORAGE_BUCKETS } from '@/lib/constants';
import type {
  ActionResult,
  BookingWithVehicleAndDocs,
  SubmitBookingResult,
} from '@/types';
import type { BookingRow, BookingStatus, PaymentStatus } from '@/types/database.types';

// ─── TYPES ────────────────────────────────────────────────────

interface SubmitBookingInput {
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryLocation: string;
  driverLicenseFile: File;
  secondaryIdFile: File;
  secondaryIdType?: string;
  selfieFile: File;
  paymentReceiptFile: File;
}

// ─── HELPERS ──────────────────────────────────────────────────

function getFileExtension(file: File): string {
  const fromName = file.name.split('.').pop();
  if (fromName && fromName.length <= 4) return `.${fromName}`;
  if (file.type === 'image/png') return '.png';
  if (file.type === 'image/webp') return '.webp';
  if (file.type === 'image/heic') return '.heic';
  return '.jpg';
}

async function uploadFile(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
      contentType: file.type || 'image/jpeg',
    });

  if (error) throw new Error(`Upload failed for ${path}: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl as string;
}

// ─── SUBMIT BOOKING ───────────────────────────────────────────

export async function submitBooking(
  input: SubmitBookingInput
): Promise<ActionResult<SubmitBookingResult>> {
  const supabase = await createAdminClient();

  let bookingCode = generateBookingCode();
  for (let i = 0; i < 4; i++) {
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('booking_code', bookingCode)
      .maybeSingle();
    if (!existing) break;
    bookingCode = generateBookingCode();
  }

  const timestamp = Date.now();
  const prefix = `${bookingCode}/${timestamp}`;

  try {
    const [driverLicenseUrl, secondaryIdUrl, selfieUrl, paymentReceiptUrl] =
      await Promise.all([
        uploadFile(
          supabase,
          STORAGE_BUCKETS.VERIFICATION_DOCS,
          `${prefix}/driver-license${getFileExtension(input.driverLicenseFile)}`,
          input.driverLicenseFile
        ),
        uploadFile(
          supabase,
          STORAGE_BUCKETS.VERIFICATION_DOCS,
          `${prefix}/secondary-id${getFileExtension(input.secondaryIdFile)}`,
          input.secondaryIdFile
        ),
        uploadFile(
          supabase,
          STORAGE_BUCKETS.VERIFICATION_DOCS,
          `${prefix}/selfie${getFileExtension(input.selfieFile)}`,
          input.selfieFile
        ),
        uploadFile(
          supabase,
          STORAGE_BUCKETS.VERIFICATION_DOCS,
          `${prefix}/payment-receipt${getFileExtension(input.paymentReceiptFile)}`,
          input.paymentReceiptFile
        ),
      ]);

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_code: bookingCode,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
        vehicle_id: input.vehicleId,
        start_date: input.startDate,
        end_date: input.endDate,
        delivery_location: input.deliveryLocation,
        total_amount: input.totalAmount,
        payment_status: 'pending_verification',
        deposit_status: 'unpaid',
        booking_status: 'pending',
      })
      .select('id')
      .single();

    if (bookingError || !booking) {
      throw new Error(bookingError?.message ?? 'Failed to insert booking.');
    }

    const { error: docsError } = await supabase
      .from('verification_docs')
      .insert({
        booking_id: (booking as { id: string }).id,
        driver_license_url: driverLicenseUrl,
        secondary_id_url: secondaryIdUrl,
        selfie_url: selfieUrl,
        payment_receipt_url: paymentReceiptUrl,
      });

    if (docsError) throw new Error(docsError.message);

    revalidatePath('/admin/bookings');
    return { success: true, data: { bookingCode } };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

// ─── APPROVE BOOKING ──────────────────────────────────────────

export async function approveBooking(bookingId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const adminSupabase = await createAdminClient();

  const { error: bookingError } = await adminSupabase
    .from('bookings')
    .update({ payment_status: 'downpayment_paid', booking_status: 'confirmed', deposit_status: 'held' })
    .eq('id', bookingId);

  if (bookingError) return { success: false, error: bookingError.message };

  const { error: docsError } = await adminSupabase
    .from('verification_docs')
    .update({ verified_by: user.id, verified_at: new Date().toISOString() })
    .eq('booking_id', bookingId);

  if (docsError) return { success: false, error: docsError.message };

  revalidatePath('/admin/bookings');
  revalidatePath(`/admin/bookings/${bookingId}`);
  return { success: true };
}

// ─── REJECT BOOKING ───────────────────────────────────────────

export async function rejectBooking(bookingId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const adminSupabase = await createAdminClient();
  const { error } = await adminSupabase
    .from('bookings')
    .update({ payment_status: 'rejected', booking_status: 'cancelled' })
    .eq('id', bookingId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/bookings');
  revalidatePath(`/admin/bookings/${bookingId}`);
  return { success: true };
}

// ─── GET BOOKINGS ─────────────────────────────────────────────

export async function getBookings(status?: BookingStatus): Promise<BookingWithVehicleAndDocs[]> {
  const supabase = await createClient();

  let query = supabase
    .from('bookings')
    .select('*, vehicle:vehicles(*), verification_docs(*)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('booking_status', status);

  const { data, error } = await query;
  if (error) { console.error('[getBookings]', error.message); return []; }
  return (data ?? []) as BookingWithVehicleAndDocs[];
}

// ─── GET BOOKING BY ID ────────────────────────────────────────

export async function getBookingById(id: string): Promise<BookingWithVehicleAndDocs | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*, vehicle:vehicles(*), verification_docs(*)')
    .eq('id', id)
    .single();

  if (error) { console.error('[getBookingById]', error.message); return null; }

  const booking = data as BookingWithVehicleAndDocs;

  // Resolve signed URLs for verification docs so admin can always view them reliably
  if (booking && booking.verification_docs) {
    try {
      const adminSupabase = await createAdminClient();
      const docs = booking.verification_docs;

      const resolveUrl = async (rawUrl: string | null | undefined): Promise<string> => {
        if (!rawUrl) return '';
        const marker = `/${STORAGE_BUCKETS.VERIFICATION_DOCS}/`;
        if (rawUrl.includes(marker)) {
          const filePath = rawUrl.split(marker)[1]?.split('?')[0];
          if (filePath) {
            const { data: signedData } = await adminSupabase.storage
              .from(STORAGE_BUCKETS.VERIFICATION_DOCS)
              .createSignedUrl(decodeURIComponent(filePath), 60 * 60 * 24); // 24 hours valid
            if (signedData?.signedUrl) return signedData.signedUrl;
          }
        }
        return rawUrl;
      };

      const [dl, sec, selfie, rec] = await Promise.all([
        resolveUrl(docs.driver_license_url),
        resolveUrl(docs.secondary_id_url),
        resolveUrl(docs.selfie_url),
        resolveUrl(docs.payment_receipt_url),
      ]);

      booking.verification_docs = {
        ...docs,
        driver_license_url: dl,
        secondary_id_url: sec,
        selfie_url: selfie,
        payment_receipt_url: rec,
      };
    } catch (e) {
      console.error('[getBookingById] signed url resolution error', e);
    }
  }

  return booking;
}

// ─── UPDATE BOOKING STATUS ────────────────────────────────────

export async function updateBookingStatus(
  bookingId: string,
  bookingStatus: BookingStatus,
  paymentStatus?: PaymentStatus
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const adminSupabase = await createAdminClient();
  const updatePayload: Record<string, string> = { booking_status: bookingStatus };
  if (paymentStatus) updatePayload.payment_status = paymentStatus;

  const { error } = await adminSupabase.from('bookings').update(updatePayload).eq('id', bookingId);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/bookings');
  revalidatePath(`/admin/bookings/${bookingId}`);
  return { success: true };
}
