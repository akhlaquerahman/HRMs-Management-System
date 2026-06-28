# 11 - 3-Day Development Roadmap

This roadmap is designed for a fresher engineer to build the MVP of the HRMS in 3 days.

## DAY 1: Foundation & Authentication
- **Morning**: Project Setup
  - Initialize Next.js, Tailwind, Shadcn, and Prisma.
  - Set up the Neon PostgreSQL database.
  - Commit the base project structure.
- **Afternoon**: Database & Prisma
  - Write the `schema.prisma` models for `User` and `Employee`.
  - Run database migrations (`npx prisma db push`).
- **Evening**: Authentication
  - Implement Auth.js with the Prisma Adapter.
  - Build the Login Page using Shadcn forms and Zod validation.
  - Implement Next.js Middleware to protect routes.

## DAY 2: Core HR Features
- **Morning**: Employee Module
  - Build the Employee Dashboard layout (Sidebar, Navbar).
  - Create the "My Profile" page fetching data via Server Components.
- **Afternoon**: Attendance System
  - Build the "Punch In / Punch Out" UI.
  - Implement the Server Action to log attendance in PostgreSQL.
  - Display attendance history in a Shadcn Data Table.
- **Evening**: Leave Module
  - Create the "Apply for Leave" form.
  - Build the backend logic to save leave requests.

## DAY 3: Admin Features & Polish
- **Morning**: Admin Module
  - Implement RBAC (Role-Based Access Control) to restrict Admin pages.
  - Build the "Pending Leaves" table for HR Admins.
  - Implement approve/reject Server Actions.
- **Afternoon**: Testing & UI Polish
  - Add Shadcn Toasts for all success/error states.
  - Verify responsive design on mobile and desktop.
  - Write basic unit tests for critical utility functions.
- **Evening**: Deployment
  - Push code to GitHub.
  - Connect repository to Vercel.
  - Set environment variables in Vercel and deploy to production.
