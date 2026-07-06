# Engineering Guardrails (WHAT NOT TO DO)

This document enforces strict negative constraints. Violating these guardrails will result in immediate PR rejection.

## 1. Security Guardrails
- 🚫 **NEVER** commit secrets, passwords, API keys, or `.env` files to the repository.
- 🚫 **NEVER** bypass `rbacMiddleware` for routes that modify data.
- 🚫 **NEVER** use raw SQL queries unless absolutely necessary for performance, and ONLY IF using parameterized inputs. No string concatenation for SQL.
- 🚫 **NEVER** return raw database error messages to the client. Always map them to generic `ApiError` responses.

## 2. Architecture & Backend Guardrails
- 🚫 **NEVER** write business logic inside an Express Controller. Controllers only handle req/res and validation.
- 🚫 **NEVER** modify the Prisma schema without generating a corresponding migration file (`prisma migrate dev`).
- 🚫 **NEVER** use `any` type in TypeScript. If a type is unknown, use `unknown` and validate it using Zod.
- 🚫 **NEVER** perform blocking synchronous file I/O operations (`fs.readFileSync`) during API requests.

## 3. Frontend Guardrails
- 🚫 **NEVER** fetch data inside a `useEffect` if it can be handled by React Query or Server Components.
- 🚫 **NEVER** mutate state directly in React/Zustand. Always use immutable state updates.
- 🚫 **NEVER** import backend modules or Prisma client into the Next.js `src/app` client components.
- 🚫 **NEVER** use inline styles (e.g., `style={{ margin: 10 }}`). Use Tailwind utility classes.

## 4. General Best Practices
- 🚫 **NEVER** leave `console.log()` statements in production code. Use a proper logging library (e.g., Winston) for backend and strip console logs in frontend builds.
- 🚫 **NEVER** push code with failing lint or type-check errors.
- 🚫 **NEVER** write magic numbers (e.g., `if (status === 2)`). Use enums or constants (e.g., `if (status === EmployeeStatus.ACTIVE)`).
