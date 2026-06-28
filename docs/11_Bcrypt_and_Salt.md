# 11 Bcrypt and Salting

## 1. Introduction
This document explains how user passwords and OTPs are securely stored in the PostgreSQL database using the `bcryptjs` library.

## 2. Purpose
To ensure that even if the database is completely compromised, hackers cannot steal or reverse-engineer user passwords.

## 3. Problem it Solves
Storing passwords in plain text (`password123`) is a catastrophic security failure. Using simple hashing algorithms like MD5 or SHA-256 is also insecure because hackers use "Rainbow Tables" (pre-computed lists of hashes) to instantly reverse them.

## 4. Why Bcrypt?
Bcrypt is a cryptographic hash function specifically designed for passwords.
- **One-Way Function:** Hashing cannot be reversed. Unlike AES encryption, there is no "decryption key" for Bcrypt.
- **Salting:** Bcrypt automatically generates a random "Salt" for every password before hashing it. 
- **Key Stretching (Work Factor):** Bcrypt is intentionally slow. We use a salt rounds factor of `10`, which makes generating the hash take a fraction of a second. This makes Brute-Force and Dictionary attacks computationally impossible for hackers.

## 5. Folder Location
`docs/11_Bcrypt_and_Salt.md`

## 6. Difference Between Encryption, Hashing, and Encoding
- **Encoding (Base64):** Changes the format of data (like a JWT payload). Easily reversible by anyone. Not for security.
- **Encryption (AES):** Scrambles data using a secret key. Reversible *if* you have the key. Used for Document Vaults.
- **Hashing (Bcrypt):** Mathematical one-way scrambling. Completely irreversible. Used for Passwords.

## 7. How it Works Internally

**Registration (Hashing):**
1. User submits password: `Password@123`
2. Bcrypt generates a random 16-byte salt: `$2a$10$N9qo8uLOickgx2ZMRZoMye`
3. Bcrypt combines them and hashes them heavily.
4. Database stores: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxep68lNkXj...`

**Login (Comparing):**
1. User submits: `Password@123`
2. Service fetches the hash from the database.
3. Bcrypt extracts the salt from the stored string, hashes the input password with that exact salt, and compares the final strings. If they match, the password is correct.

## 8. Real Company Example
Every major tech company (Facebook, Google, Twitter) hashes passwords. In 2012, LinkedIn was hacked and millions of passwords were leaked because they were hashed with SHA-1 *without* a salt. Today, Bcrypt or Argon2 is the mandatory industry standard.

## 9. Interview Questions
**Q: Why do we hash OTPs in the database?**
*Answer:* Just like a password, an OTP is a secret credential. If an attacker gains read access to the database and sees a plain-text OTP of `123456`, they could immediately use it to log into an account or reset a password before it expires. Hashing the OTP mitigates this risk.

## 10. Manager Questions
**Q: Can we retrieve a user's password if they forget it?**
*Answer:* No. Because Bcrypt is a one-way mathematical function, it is impossible for us (or anyone) to know the plain-text password. This is why we have a "Forgot Password" flow that issues an OTP to verify identity and allows them to overwrite the old hash with a new one.

## 11. Summary
Bcrypt guarantees that our users' credentials are safe against modern brute-force and rainbow table attacks by utilizing heavy algorithmic complexity and unique cryptographic salts.
