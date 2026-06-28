# 07 Authentication System

## 1. Introduction
This document explains the overarching authentication system of the HRMS, including the components that verify user identities.

## 2. Purpose
To detail the login methodologies (Password, Google OAuth, OTP) and how sessions are securely established.

## 3. Problem it Solves
An HRMS contains highly sensitive PII (Personally Identifiable Information) and Payroll data. A robust authentication system ensures that only verified individuals can access the platform, preventing data breaches.

## 4. Why This Approach?
We use a **Multi-Strategy Authentication** system.
- **Email/Password:** Traditional login using Bcrypt hashing.
- **Google OAuth:** For seamless single sign-on (SSO) using Google Workspace credentials (common in enterprises).
- **OTP Login:** A passwordless login approach that sends a secure code via email.
All strategies ultimately resolve to issuing a single standard **JWT (JSON Web Token)**.

## 5. Folder Location
- Docs: `docs/07_Authentication_System.md`
- Code: `backend/src/modules/auth/`

## 6. Authentication Flow Diagram

```mermaid
graph TD
    Client[Next.js Client] -->|Submit Credentials| AuthController[Auth Controller]
    AuthController -->|Zod Validation| AuthService[Auth Service]
    
    AuthService -->|Find User| DB[(PostgreSQL)]
    
    alt Strategy: Password
        AuthService -->|Bcrypt Compare| PasswordMatch{Match?}
    else Strategy: Google
        AuthService -->|Verify ID Token| GoogleAuth[Google Servers]
    else Strategy: OTP
        AuthService -->|Compare DB OTP| OTPMatch{Match?}
    end
    
    PasswordMatch -->|Yes| TokenGen[Generate JWT]
    GoogleAuth -->|Valid| TokenGen
    OTPMatch -->|Yes| TokenGen
    
    TokenGen -->|Return Token| Client
```

## 7. How Frontend Calls Backend
The frontend `login/page.tsx` uses `@tanstack/react-query` to send a POST request to `/api/auth/login`. On success, the frontend uses `Zustand` to store the JWT in localStorage, and the Axios interceptor (`lib/axios.ts`) attaches it to all subsequent requests.

## 8. Real Company Example
Enterprise systems like Okta or Azure AD use multi-strategy authentication. By supporting Google OAuth natively, our HRMS integrates smoothly into companies that already use Google Workspace for employee emails, removing the need for employees to remember another password.

## 9. Interview Questions
**Q: How does OAuth login work in this system?**
*Answer:* The frontend uses `@react-oauth/google` to let the user sign in with Google. Google gives the frontend an `id_token`. The frontend sends this token to our backend `/api/auth/google-login`. Our backend uses the `google-auth-library` to mathematically verify the token's signature directly against Google's public keys. If valid, we extract the email, find the user in our database, and issue our own JWT.

## 10. Manager Questions
**Q: Is it safe to store the JWT in local storage?**
*Answer:* Local storage is vulnerable to XSS (Cross-Site Scripting) attacks. However, because we strictly use React (which escapes HTML by default) and have no external untrusted scripts, the risk is mitigated. For strict enterprise security, we could migrate the JWT to an `httpOnly` cookie.

## 11. Summary
Our authentication system is flexible, supporting traditional, SSO, and passwordless strategies, all of which culminate in a secure, stateless JWT session.
