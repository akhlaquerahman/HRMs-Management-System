# 02 Folder Structure

## 1. Introduction
This document explains the organization of files and directories across the frontend and backend repositories.

## 2. Purpose
To help developers quickly locate logic, components, and configuration files, ensuring a standardized approach to file placement.

## 3. Problem it Solves
In large codebases, developers waste hours looking for files. Without a standard folder structure, logic bleeds across layers (e.g., database queries written inside API controllers).

## 4. Why This Structure?
We use a **Domain-Driven Module Structure** for the backend (grouping by feature, e.g., `/modules/auth`, `/modules/attendance`) rather than a technical structure (grouping all controllers together, all services together). This keeps feature boundaries distinct.
For the frontend, we use the **Next.js App Router** structure, paired with a `src/` directory for components and utilities.

## 5. Folder Location
`docs/02_Folder_Structure.md`

## 6. Root Directory
```text
/HRMs Project
├── backend/            # Express Node.js Server
├── frontend/           # Next.js React Client
└── docs/               # Enterprise Developer Documentation
```

## 7. Backend Structure (`/backend`)
```text
backend/
├── prisma/               # Prisma ORM Schema & Seed Data
│   ├── schema.prisma     # Database models & relationships
│   └── seed.ts           # Initial DB seeding (Roles, Super Admin)
├── src/
│   ├── config/           # App-wide configs (Cloudinary, Multer, Environment)
│   ├── docs/             # Swagger OpenAPI configurations
│   ├── lib/              # Core libraries (Prisma client instance)
│   ├── middlewares/      # Express middlewares (Auth, Error Handler)
│   ├── modules/          # Domain-Driven Modules (Core Logic)
│   │   ├── auth/         # Auth routes, controller, service, schema
│   │   ├── attendance/   # Attendance logic
│   │   ├── documents/    # Secure document vault logic
│   │   └── ...           # Other modules (Leave, Payroll, etc.)
│   ├── utils/            # Helper functions (Mailer, ApiResponse formatter)
│   └── server.ts         # Express App Entry Point
├── .env                  # Environment Variables
└── package.json          # Dependencies
```

## 8. Frontend Structure (`/frontend`)
```text
frontend/
├── public/               # Static assets (images, icons)
├── src/
│   ├── app/              # Next.js App Router (Pages & Layouts)
│   │   ├── (auth)/       # Auth pages (Login, Register, Forgot Password)
│   │   ├── dashboard/    # Protected Dashboard routes
│   │   ├── layout.tsx    # Root layout & providers
│   │   └── page.tsx      # Landing page
│   ├── components/       # Reusable React Components
│   │   ├── layout/       # Navbar, Sidebar
│   │   ├── shared/       # PageHeaders, DataTables
│   │   └── ui/           # Base UI components (Buttons, Inputs, Dialogs)
│   ├── lib/              # Client utilities
│   │   ├── axios.ts      # Axios instance with Interceptors
│   │   └── i18n.ts       # i18next configuration & translations
│   ├── store/            # Global State Management (Zustand)
│   │   └── authStore.ts  # Session & User state
│   └── middleware.ts     # Next.js Edge Middleware for route protection
├── .env.local            # Environment Variables
├── tailwind.config.ts    # Tailwind CSS Configuration
└── package.json          # Dependencies
```

## 9. Real Company Example
Enterprise teams at Google or Microsoft strict enforce "Module isolation". By grouping `route.ts`, `controller.ts`, and `service.ts` into a single `auth` folder, a new developer assigned to "Authentication" only needs to understand that one folder, not the entire `/src` tree.

## 10. Interview Questions
**Q: Why use a 'modules' folder instead of grouping all controllers together and all services together?**
*Answer:* This is called Domain-Driven Design (DDD). It makes scaling easier. If the Auth module gets too big, it is much easier to extract it into its own microservice if all its routes, schemas, and services are already collocated.

## 11. Manager Questions
**Q: How do we ensure developers don't violate this structure?**
*Answer:* We use ESLint rules (like `eslint-plugin-import`) and strict code review processes to ensure imports don't cross boundaries improperly.

## 12. Summary
A predictable folder structure is the map to the codebase. By utilizing Domain-Driven structures on the backend and standard App Router conventions on the frontend, the HRMS codebase remains scalable and easy to navigate.
