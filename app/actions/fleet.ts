'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { STORAGE_BUCKETS } from '@/lib/constants';
import type { ActionResult } from '@/types';
import type { VehicleRow, VehicleInsert, VehicleUpdate, VehicleStatus } from '@/types/database.types';

// ─── GET VEHICLES ─────────────────────────────────────────────

export async function getVehicles(status?: VehicleStatus): Promise<VehicleRow[]> {
  const supabase = await createClient();

  let query = supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('current_status', status);

  const { data, error } = await query;
  if (error) { console.error('[getVehicles]', error.message); return []; }
  return (data ?? []) as VehicleRow[];
}

// ─── GET VEHICLE BY ID ────────────────────────────────────────

export async function getVehicleById(id: string): Promise<VehicleRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single();
  if (error) { console.error('[getVehicleById]', error.message); return null; }
  return data as VehicleRow;
}

// ─── HELPER: UPLOAD VEHICLE IMAGE ────────────────────────────

async function uploadVehicleImage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  file: File
): Promise<string> {
  const timestamp = Date.now();
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${timestamp}-${cleanName}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.VEHICLES)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(`Vehicle image upload failed: ${error.message}`);

  const { data } = supabase.storage.from(STORAGE_BUCKETS.VEHICLES).getPublicUrl(path);
  return data.publicUrl as string;
}

// ─── CREATE VEHICLE ───────────────────────────────────────────

export async function createVehicle(
  input: VehicleInsert,
  imageFile?: File
): Promise<ActionResult<VehicleRow>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const adminSupabase = await createAdminClient();

  try {
    let finalImageUrl = input.image_url ?? null;

    if (imageFile && imageFile.size > 0) {
      finalImageUrl = await uploadVehicleImage(adminSupabase, imageFile);
    }

    const { data, error } = await adminSupabase
      .from('vehicles')
      .insert({ ...input, image_url: finalImageUrl })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/fleet');
    revalidatePath('/');
    return { success: true, data: data as VehicleRow };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error during vehicle creation';
    return { success: false, error: message };
  }
}

// ─── UPDATE VEHICLE ───────────────────────────────────────────

export async function updateVehicle(
  id: string,
  input: VehicleUpdate,
  imageFile?: File
): Promise<ActionResult<VehicleRow>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const adminSupabase = await createAdminClient();

  try {
    let finalImageUrl = input.image_url;

    if (imageFile && imageFile.size > 0) {
      finalImageUrl = await uploadVehicleImage(adminSupabase, imageFile);
    }

    const updatePayload = { ...input };
    if (finalImageUrl !== undefined) {
      updatePayload.image_url = finalImageUrl;
    }

    const { data, error } = await adminSupabase
      .from('vehicles')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/fleet');
    revalidatePath('/');
    return { success: true, data: data as VehicleRow };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error during vehicle update';
    return { success: false, error: message };
  }
}

// ─── TOGGLE VEHICLE STATUS ────────────────────────────────────

export async function toggleVehicleStatus(id: string, status: VehicleStatus): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const adminSupabase = await createAdminClient();
  const { error } = await adminSupabase.from('vehicles').update({ current_status: status }).eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/fleet');
  revalidatePath('/');
  return { success: true };
}

// ─── DELETE VEHICLE ───────────────────────────────────────────

export async function deleteVehicle(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const adminSupabase = await createAdminClient();
  const { error } = await adminSupabase.from('vehicles').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/fleet');
  revalidatePath('/');
  return { success: true };
}
