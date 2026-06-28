# 05 - Project Directory Structure

## Complete Folder Structure

This project uses a feature-based architecture for scalability and maintainability.

```text
hrms/
├── docs/                     # Project documentation
├── prisma/                   # Prisma schema and migrations
│   └── schema.prisma         # Database schema
├── src/
│   ├── app/                  # Next.js App Router root
│   │   ├── (auth)/           # Authentication routes (login, forgot password)
│   │   ├── (employee)/       # Employee dashboard and routes
│   │   ├── (hr)/             # HR Admin dashboard and routes
│   │   ├── (admin)/          # Super Admin dashboard and routes
│   │   ├── api/              # API Route Handlers
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   ├── ui/               # Shadcn UI reusable components (buttons, inputs)
│   │   ├── shared/           # Shared components across roles (Navbar, Sidebar)
│   │   ├── employee/         # Employee-specific UI components
│   │   ├── hr/               # HR-specific UI components
│   │   └── admin/            # Admin-specific UI components
│   ├── features/             # Feature-based domains (logic, queries, stores)
│   │   ├── auth/             # Authentication logic
│   │   ├── employee/         # Employee profile management
│   │   ├── attendance/       # Attendance tracking logic
│   │   ├── leave/            # Leave management
│   │   ├── notifications/    # Real-time and email notifications
│   │   └── analytics/        # Dashboard charts and metrics
│   ├── actions/              # Next.js Server Actions (data mutations)
│   ├── lib/                  # Utility functions and configurations
│   │   ├── prisma.ts         # Prisma client instantiation
│   │   └── utils.ts          # Tailwind merge and utility helpers
│   ├── hooks/                # Custom React hooks
│   ├── services/             # External service integrations (e.g., email, storage)
│   ├── repositories/         # Database access abstraction layer
│   ├── validators/           # Zod schemas for request validation
│   ├── types/                # TypeScript interfaces and types
│   └── store/                # Zustand global state stores
└── middleware.ts             # Next.js Middleware for route protection & RBAC
```

## Important Files Explained

- **`middleware.ts`**: Runs before every request. Crucial for verifying the JWT token and checking RBAC roles. E.g., preventing an `employee` from accessing `(hr)` routes.
- **`lib/prisma.ts`**: Ensures that in development, we don't exhaust connection pools by creating multiple Prisma Client instances during hot reloads.
- **`actions/` vs `api/`**: We use `actions/` for form submissions and mutations (React Server Actions) directly from Client Components. We use `api/` for webhooks, external integrations, or GET requests consumed by TanStack Query.
- **`validators/`**: Contains Zod schemas (e.g., `LeaveRequestSchema`). Used both on the client for form validation and on the server for payload validation.
