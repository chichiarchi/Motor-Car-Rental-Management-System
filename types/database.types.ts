// ============================================================
// database.types.ts
// TypeScript types derived from SCHEMA.md PostgreSQL schema.
// Structured to match Supabase's GenericSchema format so that
// createServerClient<Database> / createBrowserClient<Database>
// produces correctly typed query results.
// ============================================================

export type VehicleType = 'motorcycle' | 'car';
export type VehicleStatus = 'available' | 'rented' | 'maintenance';
export type PaymentStatus =
  | 'pending_verification'
  | 'downpayment_paid'
  | 'fully_paid'
  | 'rejected';
export type DepositStatus = 'unpaid' | 'held' | 'refunded';
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'ongoing'
  | 'completed'
  | 'cancelled';
export type InspectionType = 'check_in' | 'check_out';

// ─── ROW TYPES (convenience re-exports) ──────────────────────

export type VehicleRow = Database['public']['Tables']['vehicles']['Row'];
export type BookingRow = Database['public']['Tables']['bookings']['Row'];
export type VerificationDocRow = Database['public']['Tables']['verification_docs']['Row'];
export type InspectionRow = Database['public']['Tables']['inspections']['Row'];

export type VehicleInsert = Database['public']['Tables']['vehicles']['Insert'];
export type VehicleUpdate = Database['public']['Tables']['vehicles']['Update'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type BookingUpdate = Database['public']['Tables']['bookings']['Update'];
export type VerificationDocInsert = Database['public']['Tables']['verification_docs']['Insert'];
export type InspectionInsert = Database['public']['Tables']['inspections']['Insert'];

// ─── SUPABASE DATABASE SHAPE (GenericSchema-compatible) ───────

export interface Database {
  public: {
    Tables: {
      vehicles: {
        Row: {
          id: string;
          model_name: string;
          plate_number: string;
          vehicle_type: VehicleType;
          daily_rate: number;
          security_deposit: number;
          current_status: VehicleStatus;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          model_name: string;
          plate_number: string;
          vehicle_type: VehicleType;
          daily_rate: number;
          security_deposit?: number;
          current_status?: VehicleStatus;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          model_name?: string;
          plate_number?: string;
          vehicle_type?: VehicleType;
          daily_rate?: number;
          security_deposit?: number;
          current_status?: VehicleStatus;
          image_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          booking_code: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          vehicle_id: string;
          start_date: string;
          end_date: string;
          delivery_location: string;
          total_amount: number;
          payment_status: PaymentStatus;
          deposit_status: DepositStatus;
          booking_status: BookingStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_code: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          vehicle_id: string;
          start_date: string;
          end_date: string;
          delivery_location?: string;
          total_amount: number;
          payment_status?: PaymentStatus;
          deposit_status?: DepositStatus;
          booking_status?: BookingStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_code?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string;
          vehicle_id?: string;
          start_date?: string;
          end_date?: string;
          delivery_location?: string;
          total_amount?: number;
          payment_status?: PaymentStatus;
          deposit_status?: DepositStatus;
          booking_status?: BookingStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookings_vehicle_id_fkey';
            columns: ['vehicle_id'];
            isOneToOne: false;
            referencedRelation: 'vehicles';
            referencedColumns: ['id'];
          }
        ];
      };
      verification_docs: {
        Row: {
          id: string;
          booking_id: string;
          driver_license_url: string;
          secondary_id_url: string;
          selfie_url: string;
          payment_receipt_url: string;
          verified_by: string | null;
          verified_at: string | null;
        };
        Insert: {
          id?: string;
          booking_id: string;
          driver_license_url: string;
          secondary_id_url: string;
          selfie_url: string;
          payment_receipt_url: string;
          verified_by?: string | null;
          verified_at?: string | null;
        };
        Update: {
          id?: string;
          booking_id?: string;
          driver_license_url?: string;
          secondary_id_url?: string;
          selfie_url?: string;
          payment_receipt_url?: string;
          verified_by?: string | null;
          verified_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'verification_docs_booking_id_fkey';
            columns: ['booking_id'];
            isOneToOne: false;
            referencedRelation: 'bookings';
            referencedColumns: ['id'];
          }
        ];
      };
      inspections: {
        Row: {
          id: string;
          booking_id: string;
          type: InspectionType;
          gas_level: string;
          odometer_reading: number | null;
          helmets_provided: number;
          photo_urls: string[];
          damage_notes: string | null;
          performed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          type: InspectionType;
          gas_level: string;
          odometer_reading?: number | null;
          helmets_provided?: number;
          photo_urls?: string[];
          damage_notes?: string | null;
          performed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          type?: InspectionType;
          gas_level?: string;
          odometer_reading?: number | null;
          helmets_provided?: number;
          photo_urls?: string[];
          damage_notes?: string | null;
          performed_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'inspections_booking_id_fkey';
            columns: ['booking_id'];
            isOneToOne: false;
            referencedRelation: 'bookings';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      vehicle_type: VehicleType;
      vehicle_status: VehicleStatus;
      payment_status: PaymentStatus;
      deposit_status: DepositStatus;
      booking_status: BookingStatus;
      inspection_type: InspectionType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
