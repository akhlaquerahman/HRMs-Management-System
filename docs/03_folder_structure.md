# 03. Folder Structure

## Complete Workspace Structure

The workspace is organized into a monorepo-style structure separating the frontend and backend applications.

```text
HRMs-Management-System/
│
├── frontend/                 # Next.js Frontend Application
│   ├── public/               # Static assets (images, icons, fonts)
│   ├── src/
│   │   ├── app/              # Next.js App Router (Pages & Layouts)
│   │   │   ├── (auth)/       # Authentication flow (Login, Register, Forgot Password)
│   │   │   ├── dashboard/    # Protected HRMS modules
│   │   │   │   ├── attendance/
│   │   │   │   ├── documents/
│   │   │   │   ├── employee-management/
│   │   │   │   ├── leave-management/
│   │   │   │   ├── my-attendance/
│   │   │   │   ├── org-setup/
│   │   │   │   ├── payslips/
│   │   │   │   ├── profile/
│   │   │   │   ├── roles/
│   │   │   │   └── users/
│   │   │   ├── globals.css   # Global Tailwind styles
│   │   │   └── layout.tsx    # Root layout
│   │   ├── components/       # Reusable React components
│   │   │   ├── dashboard/    # Components specific to dashboard features
│   │   │   ├── layout/       # Sidebar, Topbar, Main Layout wrappers
│   │   │   ├── shared/       # PageHeaders, Loaders, generic UI
│   │   │   └── ui/           # shadcn/ui generic primitive components
│   │   ├── lib/              # Utilities and Helpers
│   │   │   ├── axios.ts      # Axios instance with interceptors
│   │   │   └── utils.ts      # Tailwind class merging (cn)
│   │   └── store/            # Zustand global state stores
│   ├── package.json          # Frontend dependencies
│   ├── tailwind.config.js    # Tailwind configuration
│   └── tsconfig.json         # TypeScript configuration
│
├── backend/                  # Express.js Backend Application
│   ├── prisma/               # Prisma ORM
│   │   ├── schema.prisma     # Database schema and models
│   │   └── migrations/       # SQL migration history
│   ├── src/
│   │   ├── config/           # Configuration files (DB, Cloudinary, Env)
│   │   ├── controllers/      # Route controllers (Req/Res handling)
│   │   ├── middlewares/      # Express middlewares (Auth, Validation)
│   │   ├── modules/          # Domain-driven modules (Optional structure)
│   │   ├── routes/           # API Route definitions
│   │   ├── services/         # Core business logic layer
│   │   ├── utils/            # Helper functions (Email, PDF Gen)
│   │   ├── validations/      # Zod validation schemas
│   │   └── server.ts         # Application entry point
│   ├── .env                  # Environment variables (Ignored in Git)
│   ├── package.json          # Backend dependencies
│   └── tsconfig.json         # TypeScript configuration
│
└── docs/                     # Technical Documentation Package
```

## Developer Notes
- **App Router (`app/`)**: Next.js 13+ utilizes the App Router. Folders inside `app/` define routes. For example, `app/dashboard/attendance/page.tsx` maps to the `/dashboard/attendance` URL.
- **Grouped Routes (`(auth)`)**: Folders wrapped in parentheses do not affect the URL path. `app/(auth)/login/page.tsx` maps to `/login`.
- **shadcn/ui (`components/ui`)**: These components are not installed as NPM packages. They are copied directly into the source code, allowing complete customization of primitives like Buttons, Modals, and Inputs.
