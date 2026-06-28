# 43 Security Audit

## 1. Introduction
This document outlines the security postures, encryption standards, and threat mitigation strategies embedded in the HRMS.

## 2. Purpose
To prepare the application for penetration testing, SOC2 compliance, and general enterprise security reviews.

## 3. Threat Mitigation Strategies

### 3.1 SQL Injection
- **Threat:** Malicious input destroying the database.
- **Mitigation:** Prisma ORM automatically uses parameterized queries. Raw SQL strings are never concatenated.

### 3.2 Cross-Site Scripting (XSS)
- **Threat:** Hackers injecting malicious JavaScript into the DOM.
- **Mitigation:** React/Next.js automatically escapes all dynamic content before rendering. 

### 3.3 Cross-Site Request Forgery (CSRF)
- **Threat:** Tricking a user's browser into executing an unwanted action.
- **Mitigation:** We use `Authorization: Bearer <token>` headers rather than relying solely on ambient browser cookies. Because the token must be explicitly read by JavaScript and attached via Axios, CSRF attacks (which rely on automatic cookie submission) fail.

### 3.4 Data at Rest (Encryption)
- Passwords: One-way Bcrypt hashing (Salt Rounds: 10).
- PII/Documents: Two-way AES-256-GCM symmetric encryption.
- Database: Assuming PostgreSQL is deployed on AWS RDS, EBS volume encryption (KMS) should be enabled at the infrastructure level.

### 3.5 Data in Transit
- The API and Frontend must always be served over HTTPS (TLS 1.2+).

## 4. Folder Location
`docs/43_Security_Audit.md`

## 5. Manager Questions
**Q: Is our application SOC2 compliant?**
*Answer:* From an application code perspective, we follow SOC2 principles: strict RBAC, data encryption, and audit logs. However, SOC2 also requires organizational controls (like background checks for developers and strict AWS IAM access policies) which fall outside the scope of the codebase itself.
