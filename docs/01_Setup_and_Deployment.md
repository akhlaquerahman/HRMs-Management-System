

--- Original File: 01_PROJECT_SETUP.md ---

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


--- Original File: 09_SETUP_GUIDE.md ---

# 09 - Complete Setup & Installation Guide

Follow these steps to set up the project locally.

## 1. Initialize Next.js Project

Run the following command to bootstrap the Next.js 15 App Router project:

```bash
npx create-next-app@latest hrms --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd hrms
```

## 2. Install Shadcn UI

Initialize Shadcn and add basic components:

```bash
npx shadcn@latest init
npx shadcn@latest add button input form card table dialog toast
```

## 3. PostgreSQL & Prisma Setup

Install Prisma and initialize it:

```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```

## 4. Auth.js (NextAuth) Setup

Install NextAuth beta (v5) and necessary adapters:

```bash
npm install next-auth@beta @auth/prisma-adapter
```

## 5. Other Dependencies

Install Zustand, TanStack Query, and React Hook Form:

```bash
npm install zustand @tanstack/react-query react-hook-form @hookform/resolvers zod
```

## 6. Environment Variables

Create a `.env` file in the root directory:

```env
# Database (Neon / PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Auth.js
AUTH_SECRET="your_generated_secret_here" # Generate via `npx auth secret`
AUTH_URL="http://localhost:3000"

# (Optional) External APIs like Email Service
EMAIL_SERVER="smtp://..."
```

## 7. Database Migration

Push the Prisma schema to the PostgreSQL database and generate the client:

```bash
npx prisma db push
npx prisma generate
```

## 8. Run Development Server

Start the application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
