

--- Original File: 10_AI_VIBE_CODING_RULES.md ---

# 10 - AI / Cursor / Claude Coding Rules

When generating code for this HRMS project, adhere strictly to the following rules:

## 1. Folder Conventions
- Always place UI components in `src/components/ui`.
- Always place reusable business logic in `src/features/`.
- Next.js specific pages, layouts, and API routes go in `src/app/`.

## 2. Component Conventions
- Use React Server Components (RSC) by default.
- Only add `"use client"` at the top of a file when hooks (e.g., `useState`, `useEffect`, `useForm`) or event listeners (`onClick`) are required.
- Keep Client Components as small as possible; pass data down from Server Components as props.

## 3. API & Server Actions Conventions
- Use Next.js Server Actions for form submissions and simple mutations.
- Place Server Actions in `src/actions/` and mark the file with `"use server"`.
- Use Route Handlers (`src/app/api/...`) only for external webhooks or complex REST integrations.

## 4. Database Conventions
- Always use Prisma Client for database interactions.
- Do NOT write raw SQL unless explicitly required for performance optimizations.
- Ensure all Prisma queries are typed properly and handle relationships efficiently (use `include` or `select`).

## 5. Naming Conventions
- React Components: PascalCase (e.g., `LeaveRequestForm.tsx`)
- Hooks: camelCase starting with "use" (e.g., `useAttendance.ts`)
- Server Actions: camelCase (e.g., `approveLeave.ts`)
- Database Models: PascalCase in `schema.prisma` (e.g., `Leave`), mapped to camelCase relations.
- Files and Directories: kebab-case (e.g., `employee-dashboard`) except for standard Next.js files (`page.tsx`, `layout.tsx`).

## 6. Error Handling Conventions
- Throw standardized API errors.
- Always catch Prisma errors (e.g., unique constraint violations) and return user-friendly messages.
- On the client, use Shadcn Toasts to display error messages.

## 7. TypeScript Conventions
- Use strict typing. Do not use `any`.
- Define interfaces/types in `src/types/` if they are shared globally.
- Prefer Zod for inferring types from schemas (e.g., `type FormData = z.infer<typeof formSchema>`).


--- Original File: 11_DEVELOPMENT_ROADMAP.md ---

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


--- Original File: 12_CODE_EXPLANATION_GUIDE.md ---

# 12 - Code Explanation Guide & Interview Prep

This guide explains core concepts in beginner-friendly language and provides manager interview preparation.

## Core Concepts Explained

- **What is Next.js?**
  It is a React framework that allows you to build fast web applications by rendering pages on the server instead of the browser. It handles routing and API creation out of the box.

- **What is PostgreSQL?**
  It is an advanced, open-source relational database. Think of it as a highly structured Excel spreadsheet where tables are linked together using "keys" to ensure data is accurate and consistent.

- **What is Prisma?**
  Prisma is an ORM (Object-Relational Mapper). Instead of writing complex SQL queries (like `SELECT * FROM users`), Prisma lets you write simple JavaScript/TypeScript code to interact with your database.

- **What is Authentication?**
  The process of verifying who a user is (e.g., logging in with email and password).

- **What is JWT?**
  JSON Web Token. It is a secure, encrypted "digital ID card" given to a user after they log in. The server checks this token on future requests to ensure the user is allowed to perform actions.

- **What is RBAC?**
  Role-Based Access Control. It means restricting access based on a user's role (e.g., an Employee cannot see HR settings).

- **What is Middleware?**
  Code that runs *before* a request reaches its final destination. In Next.js, it is often used to check if a user is logged in before letting them see a protected page.

- **What is a Server Action?**
  A Next.js feature that lets you write backend functions directly in your React components. It securely handles things like form submissions without needing to manually build an API.

- **What is an API Route?**
  A backend endpoint (like a URL) that other applications or your frontend can call to send or receive data.

- **What is an ORM?**
  A tool that translates database tables into JavaScript objects, making it easier for developers to interact with the database using familiar code.

---

## Manager Interview Preparation: Top Questions & Answers

*(Note: These are 10 example questions. A complete 100-question set would follow this format).*

1. **Why did we choose Next.js over traditional React?**
   *Answer*: Next.js provides Server-Side Rendering (SSR) which improves performance and SEO, and it unifies our frontend and backend into one repository.

2. **Why PostgreSQL instead of MongoDB?**
   *Answer*: HR data requires strict relationships (e.g., Attendance belongs to Employee). PostgreSQL ensures relational integrity and prevents orphaned data.

3. **How do we handle user authentication?**
   *Answer*: We use Auth.js with JWTs for stateless, secure authentication.

4. **What happens if a database query fails?**
   *Answer*: Prisma throws an error which we catch in our try/catch blocks, logging it securely and returning a friendly message to the user.

5. **How is the app styled?**
   *Answer*: Using Tailwind CSS for fast utility styling and Shadcn UI for accessible, pre-built components.

6. **How do we manage state?**
   *Answer*: We rely mostly on Next.js Server Components for data fetching, but use Zustand for complex client-side global state if needed.

7. **How does an employee log attendance?**
   *Answer*: They click "Punch In", which triggers a Next.js Server Action that inserts a timestamped record into the PostgreSQL database.

8. **How do we protect HR-only routes?**
   *Answer*: Next.js Middleware checks the user's role in their JWT before allowing the request to proceed.

9. **What is our deployment strategy?**
   *Answer*: We deploy automatically via Vercel on every code push, linking to a Neon serverless Postgres database.

10. **How do we ensure code quality?**
    *Answer*: By enforcing strict TypeScript rules, using Zod for validation, and following our AI coding standards.
