# 07 - Role-Based Access Control (RBAC) Design

## Role System

The system operates on three primary roles:
1. **`employee`**: Standard user with access to their own data.
2. **`hr_admin`**: Human Resources staff. Can manage employees, approve leaves, and view global attendance.
3. **`super_admin`**: IT / System Administrator. Has all `hr_admin` rights plus access to system settings, audit logs, and role management.

## Permission Matrix

### Page Access

| Page Route | `employee` | `hr_admin` | `super_admin` |
|------------|------------|------------|---------------|
| `/dashboard` | ✅ Yes | ✅ Yes | ✅ Yes |
| `/my-leaves` | ✅ Yes | ✅ Yes | ✅ Yes |
| `/attendance` | ✅ Own Only | ✅ All | ✅ All |
| `/hr/employees` | ❌ No | ✅ Yes | ✅ Yes |
| `/hr/leaves` | ❌ No | ✅ Yes | ✅ Yes |
| `/admin/settings`| ❌ No | ❌ No | ✅ Yes |
| `/admin/logs` | ❌ No | ❌ No | ✅ Yes |

### API Access & Actions Allowed

| Action | `employee` | `hr_admin` | `super_admin` |
|--------|------------|------------|---------------|
| Punch In/Out | ✅ Yes | ✅ Yes | ✅ Yes |
| Apply for Leave | ✅ Yes | ✅ Yes | ✅ Yes |
| View Own Profile | ✅ Yes | ✅ Yes | ✅ Yes |
| Add New Employee | ❌ No | ✅ Yes | ✅ Yes |
| Edit Employee Data | ❌ No | ✅ Yes | ✅ Yes |
| Approve/Reject Leaves | ❌ No | ✅ Yes | ✅ Yes |
| View System Analytics | ❌ No | ✅ Yes | ✅ Yes |
| Change User Roles | ❌ No | ❌ No | ✅ Yes |
| View Audit Logs | ❌ No | ❌ No | ✅ Yes |
| Edit Global Settings | ❌ No | ❌ No | ✅ Yes |

## Implementation via Middleware
Next.js `middleware.ts` will inspect the JWT payload. If an `employee` attempts to navigate to `/hr/*` or calls a protected server action, the system will immediately return a 403 Forbidden or redirect to a Not Authorized page.
