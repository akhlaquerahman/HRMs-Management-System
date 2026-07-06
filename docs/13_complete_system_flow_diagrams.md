# Complete System Flow Diagrams (Text Version)

This document illustrates the end-to-end data flows and operations across the HRMS platform using simple text diagrams so you can read it anywhere without needing special extensions.

---

## 1. High-Level Architecture & Technology Stack

```text
[ Client Browser ]
        |
        | (HTTP Requests / React Query)
        v
+-----------------------------------------------------+
| FRONTEND (Next.js & Tailwind CSS)                   |
|                                                     |
|  [ UI Components ] <--> [ Zustand State Store ]     |
|                              |                      |
|                              v                      |
|                      [ Axios API Client ]           |
+-----------------------------------------------------+
        |
        | (REST API Calls)
        v
+-----------------------------------------------------+
| BACKEND (Node.js & Express)                         |
|                                                     |
|  [ Express Router ]                                 |
|          |                                          |
|          v                                          |
|  [ Auth/Role Middleware ]                           |
|          |                                          |
|          v                                          |
|  [ Controllers ]                                    |
|          |                                          |
|          v                                          |
|  [ Prisma ORM ]                                     |
+-----------------------------------------------------+
        |
        | (SQL Queries)
        v
[ PostgreSQL Database ]
```

---

## 2. Authentication Flow (Login & Session)

```text
User visits /login
        |
        v
Enters Email + Password
        |
        v
Clicks "Login" Button
        |
        v
Frontend validates inputs (Zod)
        |
        v
Frontend sends POST /api/auth/login
        |
        v
Backend checks if email exists in DB
        |
      Yes/No
      /    \
    No      Yes
   /          \
  v            v
Return      Compare password hash 
401         with bcrypt
Error          |
            Match?
            /    \
          No      Yes
         /          \
        v            v
      Return      Generate JWT Token
      401         (contains userId, role)
      Error          |
                     v
                  Send token & user to frontend
                     |
                     v
                  Frontend stores token in Zustand & LocalStorage
                     |
                     v
                  Frontend updates Axios headers with Bearer Token
                     |
                     v
                  Redirect based on role:
                  Employee -> /dashboard/my-attendance
                  HR Admin -> /dashboard
                  Super Admin -> /dashboard
```

---

## 3. Employee Management Flow (Create Employee)

```text
Admin clicks "Add Employee"
        |
        v
Fills Employee Form (Name, Email, Dept, Role)
        |
        v
Frontend validates inputs (Zod)
        |
        v
Frontend sends POST /api/employees (with Bearer Token)
        |
        v
Backend Auth Middleware: Verifies Token
        |
        v
Backend Role Middleware: Checks if user is Super Admin or HR
        |
        v
Backend queries DB: Does Email exist?
        |
      Yes/No
      /    \
    Yes     No
    /        \
   v          v
Return      DB: Create new Employee Record
400 Error      |
               v
            DB: Create associated Login/User credentials
               |
               v
            Return Success { message: "Employee Created" }
               |
               v
            Frontend React Query invalidates 'employeesList' cache
               |
               v
            Frontend fetches updated list (GET /api/employees)
               |
               v
            Updates UI Table with new Employee
```

---

## 4. Attendance Management Flow (Punch-In / Punch-Out)

```text
Employee logs in and visits Dashboard
        |
        v
Clicks "Punch In" Button
        |
        v
Frontend sends POST /api/attendance/punch-in
        |
        v
Backend extracts User ID from JWT Token
        |
        v
Backend queries DB for Employee's assigned Shift
        |
        v
Backend calculates if Employee is Late (based on Shift Start Time & Grace Period)
        |
        v
DB: Insert Attendance Record (status: PRESENT, isLate: true/false)
        |
        v
DB: Insert Attendance Log (type: IN, timestamp: NOW)
        |
        v
Return Success to Frontend
        |
        v
Frontend invalidates 'attendance_status' query
        |
        v
Frontend fetches new status (GET /api/attendance/status)
        |
        v
UI updates: "Punch In" button changes to "Punch Out"
```

---

## 5. Payroll Management Flow (Generate Salary)

```text
HR Admin navigates to Payroll Tab
        |
        v
Selects Month/Year & Clicks "Generate Payroll"
        |
        v
Frontend sends POST /api/payroll/generate (Month, Year)
        |
        v
Backend verifies HR Role
        |
        v
Backend fetches all Active Employees & their Base Salaries from DB
        |
        v
Backend fetches Attendance & Leave Records for the selected Month
        |
        v
[ FOR EACH EMPLOYEE LOOP START ]
        |
        v
   Calculate Total Days Present
        |
        v
   Calculate Approved Leaves
        |
        v
   Calculate Unpaid Absences -> Deductions
        |
        v
   Compute Net Salary = (Base / Days in Month) * (Present + Paid Leaves) - Deductions
        |
        v
   DB: Save Payslip Record
        |
[ LOOP END ]
        |
        v
Backend returns Success response
        |
        v
Frontend refreshes Payroll Table
        |
        v
HR Admin sees generated Payslips in the UI
```

---

## 6. Document Upload & Verification Flow (KYC)

```text
[ UPLOAD PHASE ]
Employee goes to "My Documents"
        |
        v
Selects File (PDF/Image) & Document Type
        |
        v
Frontend sends POST /api/documents/upload (FormData)
        |
        v
Backend saves file to /uploads directory (or S3)
        |
        v
Backend gets file URL
        |
        v
DB: Insert Document Record (employeeId, url, status: PENDING)
        |
        v
Return Success -> Frontend updates UI

          |
          |
          v

[ VERIFICATION PHASE ]
HR Admin goes to "Documents" Tab
        |
        v
Frontend sends GET /api/documents/pending
        |
        v
Backend fetches PENDING documents from DB
        |
        v
Admin reviews document & clicks "Approve"
        |
        v
Frontend sends PUT /api/documents/:id/status (APPROVED)
        |
        v
DB: Updates Document status to APPROVED
        |
        v
Return Success -> Frontend Table Updates
```
