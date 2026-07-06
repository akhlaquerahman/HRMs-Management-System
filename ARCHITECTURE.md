# HRMS Architecture Document

This document outlines the high-level architecture of the Enterprise HRMS system.

## 1. System Context Diagram

```mermaid
C4Context
    title System Context diagram for Enterprise HRMS
    
    Person(admin, "HR Admin", "Manages employees, payroll, and settings")
    Person(employee, "Employee", "Views payslips, requests leaves, clocks in")
    
    System(hrms, "HRMS System", "Handles all core HR operations")
    
    System_Ext(googleAuth, "Google OAuth", "Provides SSO authentication")
    System_Ext(emailSmtp, "SMTP Server", "Sends email notifications")
    System_Ext(cloudinary, "Cloudinary / AWS S3", "Stores encrypted documents and profile pictures")

    Rel(admin, hrms, "Uses")
    Rel(employee, hrms, "Uses")
    
    Rel(hrms, googleAuth, "Authenticates via")
    Rel(hrms, emailSmtp, "Sends emails via")
    Rel(hrms, cloudinary, "Uploads/Reads media via")
```

## 2. Component Architecture

### Frontend (Next.js App Router)
- **Server Components:** Used for static content, initial data fetching, and SEO optimization.
- **Client Components:** Used for interactive UI (forms, dashboards, charts) driven by Zustand and React Query.
- **Routing:** Feature-based routing within `src/app`.

### Backend (Express + TypeScript)
- **API Gateway/Routing:** `server.ts` maps to feature modules.
- **Controllers:** Handle HTTP requests and responses. No business logic.
- **Services:** Contain 100% of the business logic.
- **Data Access:** Prisma ORM handles all PostgreSQL interactions.

## 3. Security Architecture
- **Authentication:** Dual-layer JWT (Access + Refresh tokens). Passwords hashed using bcrypt (cost 10+).
- **Authorization:** Module/Action based RBAC (`rbacMiddleware`).
- **Data Protection:** PII is isolated. Sensitive documents are encrypted at rest.

## 4. Database Strategy
- **Relational Model:** PostgreSQL for strict ACID compliance.
- **Transactions:** Complex operations (e.g., Payroll generation) are wrapped in `$transaction`.
- **Soft Deletes:** Enforced via `deletedAt` for critical tables (e.g., Employees, Invoices).
