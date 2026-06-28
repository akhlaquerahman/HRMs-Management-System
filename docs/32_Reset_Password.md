# 32 Reset Password Module

## 1. Introduction
This document explains the final step in the password recovery process.

## 2. Purpose
To safely overwrite the old hashed password with a new one, but *only* if the user has successfully completed OTP verification.

## 3. Problem it Solves
If an endpoint simply accepted `{ email, newPassword }`, any hacker could change anyone's password. The endpoint must enforce verification.

## 4. Why This Approach?
In the `auth.service.ts` `resetPassword` function, we first query the `OTP` table:
```typescript
const latestOtp = await prisma.oTP.findFirst({
  where: { userId: user.id },
  orderBy: { createdAt: 'desc' }
});
if (!latestOtp || !latestOtp.verified) throw new Error("Please verify OTP first");
```
By checking `latestOtp.verified`, we guarantee that the `verify-otp` endpoint was hit successfully just moments ago. We then hash the new password, update the User table, and instantly delete the OTP record so it can never be used again.

## 5. Folder Location
`docs/32_Reset_Password.md`

## 6. Interview Questions
**Q: Could a hacker bypass the verification step by directly calling the reset-password API?**
*Answer:* No. The API explicitly checks the database for an OTP record linked to that user where the boolean flag `verified` is strictly `true`. If the hacker skipped the `verify-otp` API call, that flag remains `false`, and the request is rejected.
