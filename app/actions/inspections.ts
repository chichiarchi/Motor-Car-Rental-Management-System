'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { STORAGE_BUCKETS } from '@/lib/constants';
import type { ActionResult, BookingWithInspections } from '@/types';
import type { InspectionRow, InspectionType } from '@/types/database.types';

// ─── TYPES ────────────────────────────────────────────────────

interface CreateInspectionInput {
  bookingId: string;
  type: InspectionType;
  gasLevel: string;
  odometerReading: number | null;
  helmetsProvided: number;
  damageNotes: string;
  photos: File[];
}

// ─── CREATE INSPECTION ────────────────────────────────────────

export async function createInspection(
  input: CreateInspectionInput
): Promise<ActionResult<{ inspectionId: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const adminSupabase = await createAdminClient();
  const timestamp = Date.now();
  const prefix = `${input.bookingId}/${input.type}-${timestamp}`;

  try {
    const photoUrls: string[] = await Promise.all(
      input.photos.map(async (photo, index) => {
        const path = `${prefix}/photo-${index + 1}`;
        const { error } = await adminSupabase.storage
          .from(STORAGE_BUCKETS.INSPECTIONS)
          .upload(path, photo, { upsert: false, contentType: photo.type });
        if (error) throw new Error(`Photo upload failed: ${error.message}`);
        const { data } = adminSupabase.storage.from(STORAGE_BUCKETS.INSPECTIONS).getPublicUrl(path);
        return data.publicUrl as string;
      })
    );

    const { data: inspection, error: inspectionError } = await adminSupabase
      .from('inspections')
      .insert({
        booking_id: input.bookingId,
        type: input.type,
        gas_level: input.gasLevel,
        odometer_reading: input.odometerReading,
        helmets_provided: input.helmetsProvided,
        damage_notes: input.damageNotes || null,
        photo_urls: photoUrls,
        performed_by: user.id,
      })
      .select('id')
      .single();

    if (inspectionError || !inspection) {
      throw new Error(inspectionError?.message ?? 'Failed to insert inspection.');
    }

    const { id: inspectionId } = inspection as { id: string };

    if (input.type === 'check_out') {
      await adminSupabase.from('bookings')
        .update({ booking_status: 'completed', deposit_status: 'refunded' })
        .eq('id', input.bookingId);

      const { data: booking } = await adminSupabase
        .from('bookings').select('vehicle_id').eq('id', input.bookingId).single();
      const vehicleId = (booking as { vehicle_id: string } | null)?.vehicle_id;
      if (vehicleId) {
        await adminSupabase.from('vehicles').update({ current_status: 'available' }).eq('id', vehicleId);
      }
    }

    if (input.type === 'check_in') {
      await adminSupabase.from('bookings')
        .update({ booking_status: 'ongoing' })
        .eq('id', input.bookingId);

      const { data: booking } = await adminSupabase
        .from('bookings').select('vehicle_id').eq('id', input.bookingId).single();
      const vehicleId = (booking as { vehicle_id: string } | null)?.vehicle_id;
      if (vehicleId) {
        await adminSupabase.from('vehicles').update({ current_status: 'rented' }).eq('id', vehicleId);
      }
    }

    revalidatePath('/admin/bookings');
    revalidatePath(`/admin/bookings/${input.bookingId}`);
    revalidatePath(`/admin/inspect/${input.bookingId}`);
    revalidatePath('/admin/fleet');

    return { success: true, data: { inspectionId } };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

// ─── GET INSPECTIONS FOR BOOKING ──────────────────────────────

export async function getInspectionsForBooking(bookingId: string): Promise<InspectionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true });

  if (error) { console.error('[getInspectionsForBooking]', error.message); return []; }
  return (data ?? []) as InspectionRow[];
}

// ─── GET BOOKING WITH INSPECTIONS ─────────────────────────────

export async function getBookingWithInspections(bookingId: string): Promise<BookingWithInspections | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*, vehicle:vehicles(*), inspections(*)')
    .eq('id', bookingId)
    .single();

  if (error) { console.error('[getBookingWithInspections]', error.message); return null; }
  return data as BookingWithInspections;
}
