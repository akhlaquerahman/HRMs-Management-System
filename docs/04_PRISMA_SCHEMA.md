# 04 - Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  EMPLOYEE
  HR_ADMIN
  SUPER_ADMIN
}

enum LeaveType {
  SICK
  CASUAL
  EARNED
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
}

model User {
  id            String         @id @default(uuid())
  email         String         @unique
  passwordHash  String
  role          Role           @default(EMPLOYEE)
  employee      Employee?
  notifications Notification[]
  auditLogs     AuditLog[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([email])
}

model Employee {
  id          String       @id @default(uuid())
  userId      String       @unique
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  firstName   String
  lastName    String
  department  String
  designation String
  joiningDate DateTime
  attendance  Attendance[]
  leaves      Leave[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([department])
}

model Attendance {
  id         String    @id @default(uuid())
  employeeId String
  employee   Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  date       DateTime  @db.Date
  punchIn    DateTime
  punchOut   DateTime?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@unique([employeeId, date])
  @@index([employeeId])
}

model Leave {
  id         String      @id @default(uuid())
  employeeId String
  employee   Employee    @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  startDate  DateTime    @db.Date
  endDate    DateTime    @db.Date
  type       LeaveType
  status     LeaveStatus @default(PENDING)
  reason     String
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt

  @@index([employeeId, status])
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([userId, isRead])
}

model AuditLog {
  id          String   @id @default(uuid())
  action      String
  performedBy String
  user        User     @relation(fields: [performedBy], references: [id])
  entityType  String
  entityId    String
  timestamp   DateTime @default(now())

  @@index([performedBy])
  @@index([entityType, entityId])
}

model Settings {
  id        String   @id @default(uuid())
  key       String   @unique
  value     Json
  updatedAt DateTime @updatedAt
}
```
