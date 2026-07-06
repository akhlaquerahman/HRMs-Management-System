# 15. Security Hardening

## Business Purpose
HRMS systems handle highly sensitive Personally Identifiable Information (PII) including banking details, national IDs, and salaries. This document outlines the multi-layered security protocols implemented across the stack to prevent data breaches, unauthorized access, and malicious attacks.

## Web Application Security (Express + Helmet)

The backend Express application utilizes **Helmet.js** to automatically configure secure HTTP headers:
- `Content-Security-Policy`: Mitigates Cross-Site Scripting (XSS) by whitelisting trusted sources for scripts and styles.
- `X-Frame-Options`: Set to `DENY` to prevent Clickjacking attacks (ensures the HRMS cannot be embedded in a malicious iframe).
- `Strict-Transport-Security` (HSTS): Forces browsers to only interact with the backend over HTTPS.
- `X-Content-Type-Options`: Set to `nosniff` to prevent MIME-sniffing vulnerabilities.

## Network & Request Security

### 1. Cross-Origin Resource Sharing (CORS)
The backend explicitly whitelists the frontend domain. Requests from unknown origins are blocked at the browser level and by the Express CORS middleware.
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL, // e.g., https://hrms.enterprise.com
  credentials: true
}));
```

### 2. Rate Limiting (express-rate-limit)
To prevent Brute Force password guessing and Denial of Service (DoS) attacks on critical endpoints like `/login` and `/request-otp`, the API limits request frequencies based on IP address.
- Example: Max 5 login attempts per 15 minutes.

## Data Security & Cryptography

### 1. Password Storage
Passwords are never stored or logged in plain text. They are hashed using **bcryptjs**.
- Bcrypt automatically generates a unique cryptographically secure salt for every password.
- This prevents Rainbow Table attacks and ensures identical passwords result in completely different hashes.

### 2. JWT (JSON Web Tokens)
Authentication is strictly stateless. 
- The `JWT_SECRET` is a 256-bit cryptographically random string stored in the `.env` file.
- Tokens are digitally signed (HMAC SHA-256). If an attacker tampers with the token payload (e.g., trying to change their role to SUPER_ADMIN), the signature verification will fail and the request will be dropped.

### 3. ORM Query Parameterization (Prisma)
Prisma acts as an abstraction layer between the code and PostgreSQL. 
- **SQL Injection Prevention**: Prisma completely eliminates SQL injection vulnerabilities because it does not concatenate raw SQL strings. All variables are treated as parameterized values natively by the Postgres driver.

## File & Document Security

Employee compliance documents (Aadhaar, Passports, Bank Details) are highly sensitive.
- **Validation**: Uploads are restricted by MIME type (`multer`) to prevent executing malicious scripts disguised as images (e.g., only allowing `.pdf`, `.jpeg`, `.png`).
- **File Hashing**: The backend computes a hash (`fileHash`) of the uploaded file to detect duplicates and prevent tampering.
- **Cloud Storage**: Files are uploaded directly to secure cloud storage (Cloudinary) rather than the local Express server disk, preventing disk exhaustion attacks and unauthorized direct file access.

## Developer Security Checklist
- [ ] Ensure `.env` is included in `.gitignore`.
- [ ] Run `npm audit` frequently to update dependencies with known CVEs.
- [ ] All API inputs MUST pass through Zod validation schemas to prevent Prototype Pollution or Mass Assignment vulnerabilities.
