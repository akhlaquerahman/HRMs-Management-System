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
