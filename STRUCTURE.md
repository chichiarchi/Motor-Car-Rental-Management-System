# Project Directory Structure

```text
├── app/
│   ├── (public)/                 # Customer-facing public layout
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Landing page / Fleet Showcase
│   │   └── book/
│   │       ├── page.tsx          # Multi-step booking form
│   │       └── success/
│   │           └── page.tsx      # Booking submitted / tracking reference
│   ├── (admin)/                  # Staff & Admin protected routes
│   │   ├── admin/
│   │   │   ├── layout.tsx        # Admin sidebar & header layout
│   │   │   ├── page.tsx          # Dashboard overview (metrics & daily summary)
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx      # Unit availability & schedule calendar
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx      # Booking queue (verification & approval)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Detailed booking breakdown
│   │   │   ├── inspect/
│   │   │   │   └── [bookingId]/
│   │   │   │       └── page.tsx  # Mobile check-in / check-out inspection form
│   │   │   └── fleet/
│   │   │       └── page.tsx      # Vehicle management (add/edit units)
│   ├── api/                      # Edge / API Route handlers
│   │   └── webhooks/             # Notification or payment hooks
│   ├── actions/                  # Next.js Server Actions
│   │   ├── bookings.ts
│   │   ├── inspections.ts
│   │   └── fleet.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                       # Reusable Shadcn UI components (Button, Dialog, etc.)
│   ├── public/                   # Public-facing components (VehicleCard, DatePicker)
│   └── admin/                    # Admin components (CalendarView, InspectionSheet)
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server-side Supabase client
│   │   └── middleware.ts         # Session refresh helper
│   ├── utils.ts                  # Tailwind merging, currency & date formatters
│   └── constants.ts              # Vehicle categories, ID types, initial statuses
├── types/
│   ├── database.types.ts         # Supabase auto-generated SQL types
│   └── index.ts                  # Extended frontend types
├── public/                       # Static assets, mock QR codes, logos
├── middleware.ts                 # Route protection for /admin
├── .env.example
├── README.md
├── AGENT.md
└── SCHEMA.md