-- ============================================================
-- Philippine Car & Motor Rental System
-- Idempotent Supabase SQL Migration
-- Safe to re-run multiple times in Supabase SQL Editor
-- ============================================================

-- ── 1. ENUMS (Safe creation) ──────────────────────────────────

DO $$ BEGIN
    CREATE TYPE vehicle_type AS ENUM ('motorcycle', 'car');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_status AS ENUM ('available', 'rented', 'maintenance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending_verification', 'downpayment_paid', 'fully_paid', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE deposit_status AS ENUM ('unpaid', 'held', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'ongoing', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE inspection_type AS ENUM ('check_in', 'check_out');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ── 2. TABLES (CREATE IF NOT EXISTS) ──────────────────────────

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL,
    plate_number TEXT UNIQUE NOT NULL,
    vehicle_type vehicle_type NOT NULL,
    daily_rate NUMERIC(10, 2) NOT NULL,
    security_deposit NUMERIC(10, 2) NOT NULL DEFAULT 1000.00,
    current_status vehicle_status DEFAULT 'available',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE RESTRICT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    delivery_location TEXT DEFAULT 'Branch Pickup',
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_status payment_status DEFAULT 'pending_verification',
    deposit_status deposit_status DEFAULT 'unpaid',
    booking_status booking_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verification_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    driver_license_url TEXT NOT NULL,
    secondary_id_url TEXT NOT NULL,
    selfie_url TEXT NOT NULL,
    payment_receipt_url TEXT NOT NULL,
    verified_by UUID,
    verified_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    type inspection_type NOT NULL,
    gas_level TEXT NOT NULL,
    odometer_reading NUMERIC(10, 1),
    helmets_provided INT DEFAULT 0,
    photo_urls TEXT[] DEFAULT '{}',
    damage_notes TEXT,
    performed_by UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 3. ENABLE ROW LEVEL SECURITY ─────────────────────────────

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- ── 4. POLICIES (Safe drop & create) ──────────────────────────

-- Vehicles Policies
DROP POLICY IF EXISTS "Public can view available vehicles" ON vehicles;
CREATE POLICY "Public can view available vehicles"
    ON vehicles FOR SELECT
    USING (current_status = 'available');

DROP POLICY IF EXISTS "Authenticated users can manage vehicles" ON vehicles;
CREATE POLICY "Authenticated users can manage vehicles"
    ON vehicles FOR ALL
    USING (auth.role() = 'authenticated');

-- Bookings Policies
DROP POLICY IF EXISTS "Anyone can insert bookings" ON bookings;
CREATE POLICY "Anyone can insert bookings"
    ON bookings FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read all bookings" ON bookings;
CREATE POLICY "Authenticated users can read all bookings"
    ON bookings FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update bookings" ON bookings;
CREATE POLICY "Authenticated users can update bookings"
    ON bookings FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Verification Docs Policies
DROP POLICY IF EXISTS "Anyone can insert verification docs" ON verification_docs;
CREATE POLICY "Anyone can insert verification docs"
    ON verification_docs FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read and update verification docs" ON verification_docs;
CREATE POLICY "Authenticated users can read and update verification docs"
    ON verification_docs FOR ALL
    USING (auth.role() = 'authenticated');

-- Inspections Policies
DROP POLICY IF EXISTS "Authenticated users can manage inspections" ON inspections;
CREATE POLICY "Authenticated users can manage inspections"
    ON inspections FOR ALL
    USING (auth.role() = 'authenticated');

-- ── 5. SEED INITIAL SAMPLE VEHICLES (Optional) ───────────────

INSERT INTO vehicles (model_name, plate_number, vehicle_type, daily_rate, security_deposit, current_status)
VALUES
  ('Honda Click 125i', 'NA-12345', 'motorcycle', 450.00, 1000.00, 'available'),
  ('Yamaha Mio Aerox 155', 'NB-67890', 'motorcycle', 600.00, 1000.00, 'available'),
  ('Toyota Vios 1.3 XLE', 'NCR-1020', 'car', 1800.00, 3000.00, 'available'),
  ('Mitsubishi Mirage G4', 'NCR-3040', 'car', 1600.00, 3000.00, 'available'),
  ('Honda City 1.5 RS', 'NCR-5060', 'car', 2200.00, 3000.00, 'available')
ON CONFLICT (plate_number) DO NOTHING;

-- ── 6. STORAGE BUCKETS & POLICIES ──────────────────────────────

-- Ensure buckets exist and are public
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('verification-docs', 'verification-docs', true),
  ('inspections', 'inspections', true),
  ('vehicles', 'vehicles', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policy: Allow public read access to uploaded images in these buckets
DROP POLICY IF EXISTS "Public Access to Storage Buckets" ON storage.objects;
CREATE POLICY "Public Access to Storage Buckets" ON storage.objects
  FOR SELECT USING (bucket_id IN ('verification-docs', 'inspections', 'vehicles'));

-- Storage Policy: Allow insert/upload to verification-docs, inspections, and vehicles
DROP POLICY IF EXISTS "Allow Uploads to Storage Buckets" ON storage.objects;
CREATE POLICY "Allow Uploads to Storage Buckets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('verification-docs', 'inspections', 'vehicles'));

-- Storage Policy: Allow authenticated users and service role full management
DROP POLICY IF EXISTS "Allow Full Storage Access for Authenticated and Service Role" ON storage.objects;
CREATE POLICY "Allow Full Storage Access for Authenticated and Service Role" ON storage.objects
  FOR ALL USING (
    bucket_id IN ('verification-docs', 'inspections', 'vehicles') 
    AND (auth.role() = 'authenticated' OR auth.role() = 'service_role' OR auth.role() = 'anon')
  );


