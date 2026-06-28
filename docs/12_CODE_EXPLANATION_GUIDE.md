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
