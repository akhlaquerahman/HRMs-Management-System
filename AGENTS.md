# Universal Agent Instructions

These instructions govern the behavior of all AI coding assistants (including Antigravity, GitHub Copilot, Cursor, etc.) when interacting with this HRMS repository.

## 1. Context and Environment
- **Project**: Enterprise Human Resource Management System (HRMS)
- **Stack**: Next.js 15 (App Router), React 18, Express.js (TypeScript), Prisma ORM, PostgreSQL, Tailwind CSS, Radix UI.
- **Goal**: Maintain enterprise-grade security, extreme performance, and 100% type safety.

## 2. Core Behaviors
- **Zero Hallucination Policy**: If you do not know a codebase specific, search the codebase first. Do not assume file paths.
- **Preserve Documentation**: Never delete existing comments, JSDocs, or docstrings unless the underlying code is being completely replaced or is demonstrably obsolete.
- **Type Safety**: Strictly adhere to TypeScript interfaces. Avoid `any` at all costs. Use `unknown` if truly dynamic, and validate with Zod.

## 3. Tool Usage Constraints
- **Shell Commands**: Never run destructive commands without extreme caution. Do not run `rm -rf` indiscriminately.
- **File Modifications**: Use targeted AST-based edits or specific line-replacements where possible. Do not rewrite entire 1000-line files for a 2-line change.

## 4. Architectural Boundaries
- Frontend (`/frontend`) code must NEVER import from Backend (`/backend`).
- All data fetching must use React Query.
- Backend business logic must reside in `src/modules/*/*.service.ts`, never in controllers.

## 5. Security Mandates
- Never hardcode secrets. Always use `process.env`.
- Ensure all new API endpoints are wrapped in `validateRequest` and `rbacMiddleware` unless explicitly public.
