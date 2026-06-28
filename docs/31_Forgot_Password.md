# 31 Forgot Password Module

## 1. Introduction
This document explains the workflow for users who have forgotten their passwords and need to initiate a reset.

## 2. Purpose
To securely verify a user's identity via their registered email before allowing them to reset their password.

## 3. Problem it Solves
Manual password resets by HR administrators consume massive amounts of time and are a security risk (social engineering). An automated, self-service forgot password flow eliminates this bottleneck securely.

## 4. Why This Approach?
We decoupled the "Forgot Password" flow into three distinct steps:
1. `POST /forgot-password`: Generates OTP and emails the user.
2. `POST /verify-otp`: Validates the OTP.
3. `POST /reset-password`: Accepts the new password and applies it.
- **Why?** Decoupling ensures that a user cannot submit a new password until the OTP is explicitly verified in step 2.

## 5. Folder Location
`docs/31_Forgot_Password.md`

## 6. Real Company Example
If a user requests a password reset for an email that *does not exist* in our database, our API still returns `200 OK: If an account exists, a reset link has been sent`. Why? This prevents "Email Enumeration" attacks, where a hacker types random emails to see which ones are registered based on the error message.

## 7. Manager Questions
**Q: How do we prevent a user from being spammed with thousands of OTP emails?**
*Answer:* We currently invalidate previous OTPs before generating new ones. For robust enterprise security, we should implement a rate limit restricting a specific email to 3 "Forgot Password" requests per hour.
