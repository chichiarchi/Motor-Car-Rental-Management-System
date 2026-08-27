---

### `SCHEMA.md`

```markdown
# Database Schema & Storage Setup

Run this script in the **Supabase SQL Editor** to initialize the database tables and enums.

```sql
-- ENUMS
CREATE TYPE vehicle_type AS ENUM ('motorcycle', 'car');
CREATE TYPE vehicle_status AS ENUM ('available', 'rented', 'maintenance');
CREATE TYPE payment_status AS ENUM ('pending_verification', 'downpayment_paid', 'fully_paid', 'rejected');
CREATE TYPE deposit_status AS ENUM ('unpaid', 'held', 'refunded');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'ongoing', 'completed', 'cancelled');
CREATE TYPE inspection_type AS ENUM ('check_in', 'check_out');

-- 1. VEHICLES
CREATE TABLE vehicles (
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

-- 2. BOOKINGS
CREATE TABLE bookings (
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

-- 3. VERIFICATION DOCS (KYC & Payments)
CREATE TABLE verification_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    driver_license_url TEXT NOT NULL,
    secondary_id_url TEXT NOT NULL,
    selfie_url TEXT NOT NULL,
    payment_receipt_url TEXT NOT NULL,
    verified_by UUID,
    verified_at TIMESTAMPTZ
);

-- 4. INSPECTION LOGS (Handover & Return)
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    type inspection_type NOT NULL,
    gas_level TEXT NOT NULL, -- e.g., 'Full', '3/4', '1/2', 'Empty'
    odometer_reading NUMERIC(10, 1),
    helmets_provided INT DEFAULT 0,
    photo_urls TEXT[] DEFAULT '{}',
    damage_notes TEXT,
    performed_by UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);