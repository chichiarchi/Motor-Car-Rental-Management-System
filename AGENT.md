# AI Agent & Contributor Guidelines

## Project Vision
A lightweight, mobile-first Car and Motorcycle Rental Management System tailored for local Philippine rental operators. The application handles public booking with local payments (GCash, Maya, QR Ph), document-based KYC fraud prevention, admin scheduling, and on-the-ground mobile inspection workflows.

## Technology Stack
- **Framework:** Next.js (App Router, React Server Components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn UI (Lucide Icons)
- **Database & Auth:** Supabase (PostgreSQL, Supabase Auth)
- **Object Storage:** Supabase Storage (`verification-docs`, `inspections`)
- **Deployment:** Vercel

## Core Rules & Conventions

### 1. Architecture & Code Style
- Use the **Next.js App Router** (`app/` directory).
- Prefer **React Server Components (RSC)** for data fetching. Use Client Components (`"use client"`) strictly when interaction, local state, or browser APIs are needed.
- Write type-safe database calls by generating TypeScript types from Supabase: `npx supabase gen types typescript --project-id <ID> > types/supabase.ts`.
- Encapsulate server-side operations using **Server Actions** (`app/actions/`).

### 2. Philippine Business Logic Nuances
- **Currency:** Philippine Peso (`₱` / `PHP`). Format monetary values with commas: `₱1,500.00`.
- **Payment Methods:** Support manual receipt upload workflows for GCash, Maya, and QR Ph/InstaPay bank transfers.
- **Security Deposits:** Track security deposit amounts separately from the rental subtotal. Deposits can be marked as `unpaid`, `held`, or `refunded`.
- **KYC Requirements:** Every customer booking must include links to 3 items: Primary Driver's License, 1 Secondary Valid ID (Passport, UMID, National ID), and 1 Verification Selfie.

### 3. Security & Storage
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to client components.
- Secure `/admin` routes using Next.js Middleware and Supabase Auth session checks.
- Keep RLS (Row Level Security) enabled on all tables.