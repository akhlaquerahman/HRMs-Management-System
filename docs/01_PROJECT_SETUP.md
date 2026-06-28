# 01 - Project Setup & Architecture Choices

## Why this stack was chosen

This HRMS project uses a modern, enterprise-grade technology stack: Next.js 15 App Router, TypeScript, Tailwind CSS v4, Shadcn UI, PostgreSQL, and Prisma ORM.

### Advantages over MERN (MongoDB, Express, React, Node)
- **Type Safety End-to-End**: With Prisma and TypeScript, types are shared between the database and the frontend, catching errors at compile time rather than runtime.
- **Relational Integrity**: PostgreSQL provides strict ACID compliance and relational constraints (foreign keys), which is critical for financial and HR data, unlike MongoDB's schema-less nature.
- **Unified Codebase**: Next.js App Router allows writing backend logic (Server Actions, Route Handlers) in the same repository, eliminating the need for a separate Express server.
- **Performance**: Server Components in Next.js ship zero JavaScript to the client by default, drastically improving page load times compared to a standard SPA React app.

### Scalability Benefits
- **Edge Deployments**: Next.js integrates seamlessly with Vercel for global edge caching.
- **Database Scalability**: Neon PostgreSQL provides serverless database scaling, branching, and connection pooling out of the box.
- **Stateless Auth**: Using Auth.js (NextAuth) with a JWT strategy ensures stateless authentication, which scales infinitely across multiple serverless instances without session store bottlenecks.

### Learning Benefits for Fresher Developers
- **Modern Best Practices**: Freshers will learn the latest React paradigms (Server Components, Server Actions).
- **Strong Typing**: Learning TypeScript and strict schema design (Prisma, Zod) builds good engineering discipline.
- **Industry Standard**: This stack reflects what top-tier tech companies are currently adopting for new projects.
