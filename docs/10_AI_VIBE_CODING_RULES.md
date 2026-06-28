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
