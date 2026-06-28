# 00 Project Overview

## 1. Introduction
Welcome to the Enterprise HRMS Project Documentation. This document serves as the entry point for all new developers, architects, and product managers joining the team. This suite of documents provides a deep dive into the architecture, technical decisions, code implementations, and enterprise best practices embedded within our HRMS platform.

## 2. Purpose
The purpose of this documentation is to democratize knowledge. In a fast-scaling enterprise environment, relying on tribal knowledge is a bottleneck. This documentation ensures that any fresher or senior developer can onboard efficiently and understand both the macro-architecture and the micro-implementations without ambiguity.

## 3. Problem it Solves
- **Onboarding Friction:** Reduces developer onboarding from weeks to days.
- **Architectural Ambiguity:** Clearly explains *why* a particular technology or pattern was chosen (e.g., Prisma over TypeORM).
- **Security Gaps:** Enforces secure coding practices by making encryption and JWT flow transparent.
- **Maintenance Bottlenecks:** Provides a clear map of modules, preventing spaghetti code and tightly coupled implementations.

## 4. Why This Module Exists
An overview module exists to establish the 30,000-foot view of the product before diving into specific APIs, files, or frontend components. It sets the business context.

## 5. Folder Location
`docs/00_Project_Overview.md`

## 6. Business Modules Included
The HRMS is a multi-tenant, Role-Based Access Control (RBAC) driven platform containing the following primary modules:
- Authentication & Authorization
- Employee Management
- Department & Designation Management
- Attendance & Shift Management
- Leave & Holiday Management
- Payroll Management
- Recruitment (Applicant Tracking)
- Secure KYC/Document Vault

## 7. High-Level Technology Stack
- **Frontend:** Next.js (React), TailwindCSS, React Query, Zustand, i18next
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Security:** AES-256 for documents, bcrypt for passwords, JWT for sessions

## 8. Real Company Example
At companies like Workday or BambooHR, the overarching architecture is strictly documented to pass compliance audits (like SOC2 or ISO 27001). Knowing the system bounds and capabilities at a high level is step one for any architectural review board (ARB) presentation.

## 9. Interview Questions
**Q: How do you structure documentation for a new enterprise project?**
*Answer:* I divide it into functional and technical pillars. An overview sets the business context, followed by architecture, database schemas, API contracts, security protocols, and module-specific workflows. Good documentation focuses not just on *what* the code does, but *why* the architectural decisions were made.

## 10. Manager Questions
**Q: Does our current tech stack support scaling to 10,000 employees?**
*Answer:* Yes. By separating the Node/Express backend from the Next.js frontend, and using a scalable RDBMS like PostgreSQL optimized with Prisma connection pooling, we can scale horizontally.

## 11. Summary
The Enterprise HRMS is a robust, modular, and highly secure platform designed for modern workforce management. By following this documentation, you will gain the expertise needed to extend, refactor, and maintain this system with confidence.
