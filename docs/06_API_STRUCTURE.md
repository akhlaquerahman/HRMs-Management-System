# 06 - API Structure

## Auth APIs

| Method | Route | Request Body | Response | Auth Required | Role Required |
|--------|-------|--------------|----------|---------------|---------------|
| POST | `/api/auth/login` | `{ email, password }` | `{ token, user }` | No | None |
| POST | `/api/auth/logout` | None | `{ success }` | Yes | Any |
| POST | `/api/auth/forgot-password` | `{ email }` | `{ success }` | No | None |

## Employee APIs

| Method | Route | Request Body | Response | Auth Required | Role Required |
|--------|-------|--------------|----------|---------------|---------------|
| GET | `/api/employees/me` | None | `EmployeeProfile` | Yes | Any |
| GET | `/api/employees` | None | `Employee[]` | Yes | hr_admin, super_admin |
| POST | `/api/employees` | `EmployeeData` | `Employee` | Yes | hr_admin, super_admin |
| PATCH| `/api/employees/:id` | `Partial<EmployeeData>` | `Employee` | Yes | hr_admin, super_admin |

## Attendance APIs

| Method | Route | Request Body | Response | Auth Required | Role Required |
|--------|-------|--------------|----------|---------------|---------------|
| POST | `/api/attendance/punch-in` | None | `AttendanceRecord` | Yes | Any |
| PATCH| `/api/attendance/punch-out`| None | `AttendanceRecord` | Yes | Any |
| GET | `/api/attendance/my-records` | `?month=YYYY-MM` | `Attendance[]` | Yes | Any |
| GET | `/api/attendance/all` | `?date=YYYY-MM-DD` | `Attendance[]` | Yes | hr_admin, super_admin |

## Leave APIs

| Method | Route | Request Body | Response | Auth Required | Role Required |
|--------|-------|--------------|----------|---------------|---------------|
| POST | `/api/leaves/apply` | `{ startDate, endDate, type, reason }` | `LeaveRequest` | Yes | Any |
| GET | `/api/leaves/my-leaves` | None | `LeaveRequest[]` | Yes | Any |
| GET | `/api/leaves/pending` | None | `LeaveRequest[]` | Yes | hr_admin, super_admin |
| PATCH| `/api/leaves/:id/approve` | None | `LeaveRequest` | Yes | hr_admin, super_admin |
| PATCH| `/api/leaves/:id/reject` | `{ reason }` | `LeaveRequest` | Yes | hr_admin, super_admin |

## Notification APIs

| Method | Route | Request Body | Response | Auth Required | Role Required |
|--------|-------|--------------|----------|---------------|---------------|
| GET | `/api/notifications` | None | `Notification[]` | Yes | Any |
| PATCH| `/api/notifications/:id/read`| None | `Notification` | Yes | Any |

## Analytics APIs

| Method | Route | Request Body | Response | Auth Required | Role Required |
|--------|-------|--------------|----------|---------------|---------------|
| GET | `/api/analytics/dashboard` | None | `DashboardMetrics` | Yes | hr_admin, super_admin |

## Settings APIs

| Method | Route | Request Body | Response | Auth Required | Role Required |
|--------|-------|--------------|----------|---------------|---------------|
| GET | `/api/settings` | None | `Settings` | Yes | super_admin |
| PATCH| `/api/settings` | `Partial<Settings>` | `Settings` | Yes | super_admin |
