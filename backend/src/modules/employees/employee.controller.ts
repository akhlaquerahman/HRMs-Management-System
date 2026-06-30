import { prisma } from '../../lib/prisma';
import { Request, Response } from 'express';

import { ApiResponse } from '../../utils/ApiResponse';
import { AuthRequest } from '../../middlewares/authMiddleware';
import bcrypt from 'bcryptjs';
import { decrypt } from '../../utils/encryption';



export const createEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    
    // Check if employeeId or email exists
    const existing = await prisma.employee.findFirst({
      where: { OR: [{ email: data.email }, { employeeId: data.employeeId }] }
    });
    
    if (existing) {
      return res.status(400).json(new ApiResponse(false, 'Employee with this email or ID already exists'));
    }

    // Hash password if provided
    let userId = null;
    if (data.password) {
      const passwordHash = await bcrypt.hash(data.password, 10);
      
      // Get the employee role
      let employeeRole = await prisma.role.findUnique({ where: { name: 'EMPLOYEE' } });
      if (!employeeRole) {
        employeeRole = await prisma.role.create({ data: { name: 'EMPLOYEE', description: 'Regular employee' } });
      }

      // Fetch HR Admin's company details to auto-fill
      const hrAdminId = req.user?.id;
      const hrAdmin = hrAdminId ? await prisma.user.findUnique({ where: { id: hrAdminId } }) : null;

      const newUser = await prisma.user.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          passwordHash,
          roleId: employeeRole.id,
          companyName: hrAdmin?.companyName || null,
          companyWebsite: hrAdmin?.companyWebsite || null,
          companyAddress: hrAdmin?.companyAddress || null,
          companyPhone: hrAdmin?.companyPhone || null,
        }
      });
      userId = newUser.id;
    }

    const employee = await prisma.employee.create({
      data: {
        userId,
        createdById: req.user?.id, // Track HR Admin
        employeeId: data.employeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        dob: data.dob ? new Date(data.dob) : null,
        departmentId: data.departmentId,
        designationId: data.designationId,
        joiningDate: new Date(data.joiningDate),
        employmentType: data.employmentType,
        managerId: data.managerId,
        status: data.status,
      }
    });

    res.status(201).json(new ApiResponse(true, 'Employee created successfully', employee));
  } catch (error: any) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const bulkCreateEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { employees } = req.body;
    if (!employees || !Array.isArray(employees)) {
      return res.status(400).json(new ApiResponse(false, "Invalid data format"));
    }

    let successCount = 0;
    const errors: any[] = [];

    // Setup for User Creation
    let employeeRole = await prisma.role.findUnique({ where: { name: 'EMPLOYEE' } });
    if (!employeeRole) {
      employeeRole = await prisma.role.create({ data: { name: 'EMPLOYEE', description: 'Regular employee' } });
    }

    const hrAdminId = req.user?.id;
    const hrAdmin = hrAdminId ? await prisma.user.findUnique({ where: { id: hrAdminId } }) : null;

    for (let i = 0; i < employees.length; i++) {
      const data = employees[i];
      try {
        if (!data.employeeId || !data.firstName || !data.lastName || !data.email || !data.joiningDate) {
          errors.push({ row: i + 1, identifier: data.employeeId || data.email || 'Unknown', error: "Missing required fields" });
          continue;
        }

        const existing = await prisma.employee.findFirst({
          where: { OR: [{ email: data.email }, { employeeId: data.employeeId }] }
        });
        
        if (existing) {
          errors.push({ row: i + 1, identifier: data.employeeId, error: "Employee with this email or ID already exists" });
          continue;
        }

        const joinDateObj = new Date(data.joiningDate);
        if (isNaN(joinDateObj.getTime())) {
          errors.push({ row: i + 1, identifier: data.employeeId, error: "Invalid joining date format" });
          continue;
        }

        // 1. Resolve Department
        let departmentId = null;
        if (data.departmentName) {
          let dept = await prisma.department.findFirst({ where: { name: { equals: data.departmentName, mode: 'insensitive' } } });
          if (!dept) {
            dept = await prisma.department.create({ data: { name: data.departmentName, code: `DEPT-${Math.floor(100+Math.random()*900)}` } });
          }
          departmentId = dept.id;
        }

        // 2. Resolve Designation
        let designationId = null;
        if (data.designationName && departmentId) {
          let desig = await prisma.designation.findFirst({ where: { name: { equals: data.designationName, mode: 'insensitive' }, departmentId } });
          if (!desig) {
            desig = await prisma.designation.create({ data: { name: data.designationName, departmentId } });
          }
          designationId = desig.id;
        }

        // 3. User Account Creation (if password provided)
        let userId = null;
        if (data.password) {
          const passwordHash = await bcrypt.hash(data.password, 10);
          const newUser = await prisma.user.create({
            data: {
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              phone: data.phone || null,
              passwordHash,
              roleId: employeeRole.id,
              companyName: hrAdmin?.companyName || null,
              companyWebsite: hrAdmin?.companyWebsite || null,
              companyAddress: hrAdmin?.companyAddress || null,
              companyPhone: hrAdmin?.companyPhone || null,
            }
          });
          userId = newUser.id;
        }

        // 4. Base Salary Parse
        let baseSalary = 0;
        if (data.baseSalary) {
          baseSalary = parseFloat(data.baseSalary.toString().replace(/[^0-9.]/g, '')) || 0;
        }

        await prisma.employee.create({
          data: {
            userId,
            createdById: hrAdminId,
            employeeId: data.employeeId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || null,
            joiningDate: joinDateObj,
            employmentType: data.employmentType || "FULL_TIME",
            status: data.status || "ACTIVE",
            baseSalary,
            departmentId,
            designationId
          }
        });
        successCount++;
      } catch (err: any) {
        errors.push({ row: i + 1, identifier: data.employeeId, error: err.message || "Database error" });
      }
    }

    if (errors.length > 0) {
      return res.status(207).json(new ApiResponse(true, `Bulk import finished with errors. Success: ${successCount}, Failed: ${errors.length}`, { successCount, errors }));
    }

    return res.status(200).json(new ApiResponse(true, `Bulk import completed successfully. Success: ${successCount}`));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const getEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const { search, department, designation, status, employmentType, manager, joiningDate, gender } = req.query;
    
    let filter: any = {};
    if (role === 'HR_ADMIN' || role === 'HR ADMIN') {
      filter.createdById = req.user?.id;
    }

    if (search) {
      filter.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { employeeId: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (department && department !== 'ALL') filter.departmentId = department as string;
    if (designation && designation !== 'ALL') filter.designationId = designation as string;
    if (status && status !== 'ALL') filter.status = status as string;
    if (employmentType && employmentType !== 'ALL') filter.employmentType = employmentType as string;
    if (manager && manager !== 'ALL') filter.managerId = manager as string;
    if (gender && gender !== 'ALL') filter.gender = gender as string;

    const employees = await prisma.employee.findMany({
      where: filter,
      include: {
        department: { select: { id: true, name: true } },
        designation: { select: { id: true, name: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        leaveBalance: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    const decryptedEmployees = employees.map(emp => {
      if (emp.accountNumber) {
        try { emp.accountNumber = decrypt(emp.accountNumber); } catch (e) {}
      }
      return emp;
    });

    res.status(200).json(new ApiResponse(true, 'Employees fetched successfully', decryptedEmployees));
  } catch (error: any) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        dob: data.dob ? new Date(data.dob) : null,
        departmentId: data.departmentId,
        designationId: data.designationId,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
        employmentType: data.employmentType,
        managerId: data.managerId,
        status: data.status,
      }
    });
    res.status(200).json(new ApiResponse(true, 'Employee updated successfully', employee));
  } catch (error: any) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      return res.status(404).json(new ApiResponse(false, 'Employee not found'));
    }

    // Delete all related records manually to avoid foreign key constraints
    await prisma.$transaction([
      prisma.attendanceLog.deleteMany({ where: { attendance: { employeeId: id } } }),
      prisma.breakSession.deleteMany({ where: { attendance: { employeeId: id } } }),
      prisma.attendanceRecord.deleteMany({ where: { employeeId: id } }),
      prisma.attendanceCorrection.deleteMany({ where: { employeeId: id } }),
      prisma.leaveRequest.deleteMany({ where: { employeeId: id } }),
      prisma.payroll.deleteMany({ where: { employeeId: id } }),
      prisma.employeeDocument.deleteMany({ where: { employeeId: id } }),
      // Finally delete employee
      prisma.employee.delete({ where: { id } })
    ]);

    // If a user account was linked, delete it as well
    if (employee.userId) {
      await prisma.user.delete({ where: { id: employee.userId } });
    }

    res.status(200).json(new ApiResponse(true, 'Employee deleted successfully'));
  } catch (error: any) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const filter = (role === 'HR_ADMIN' || role === 'HR ADMIN') ? { createdById: req.user?.id } : {};

    let total = 0, active = 0, inactive = 0, onLeave = 0, newJoiners = 0, onProbation = 0;

    try { total = await prisma.employee.count({ where: filter }); } catch (e) { console.error("total count failed", e); }
    try { active = await prisma.employee.count({ where: { ...filter, status: 'ACTIVE' } }); } catch (e) { console.error("active count failed", e); }
    try { inactive = await prisma.employee.count({ where: { ...filter, status: 'INACTIVE' } }); } catch (e) { console.error("inactive count failed", e); }
    
    try {
      onLeave = await prisma.leaveRequest.count({ 
        where: { 
          status: 'APPROVED',
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
          employee: filter
        } 
      });
    } catch (e) { console.error("onLeave count failed", e); }

    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      newJoiners = await prisma.employee.count({ 
        where: { ...filter, joiningDate: { gte: firstDayOfMonth } } 
      });
    } catch (e) { console.error("newJoiners count failed", e); }

    try {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      onProbation = await prisma.employee.count({
        where: { ...filter, joiningDate: { gte: sixMonthsAgo } }
      });
    } catch (e) { console.error("onProbation count failed", e); }

    res.status(200).json(new ApiResponse(true, 'Dashboard summary fetched', {
      total,
      active,
      inactive,
      onLeave,
      newJoiners,
      onProbation
    }));
  } catch (error: any) {
    console.error("Dashboard error:", error);
    res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const filter = (role === 'HR_ADMIN' || role === 'HR ADMIN') ? { createdById: req.user?.id } : {};

    const deptDist = await prisma.employee.groupBy({
      by: ['departmentId'],
      _count: { id: true },
      where: filter
    });

    // Populate department names
    const departments = await prisma.department.findMany({ select: { id: true, name: true } });
    const deptMap = departments.reduce((acc: any, d) => ({ ...acc, [d.id]: d.name }), {});

    const departmentDistribution = deptDist.map(d => ({
      name: d.departmentId ? deptMap[d.departmentId] : 'Unassigned',
      value: d._count.id
    }));

    const genderDist = await prisma.employee.groupBy({
      by: ['gender'],
      _count: { id: true },
      where: filter
    });

    const genderDistribution = genderDist.map(d => ({
      name: d.gender || 'Unknown',
      value: d._count.id
    }));

    const typeDist = await prisma.employee.groupBy({
      by: ['employmentType'],
      _count: { id: true },
      where: filter
    });

    const employmentTypeDistribution = typeDist.map(d => ({
      name: d.employmentType || 'Unknown',
      value: d._count.id
    }));

    res.status(200).json(new ApiResponse(true, 'Analytics fetched', {
      departmentDistribution,
      genderDistribution,
      employmentTypeDistribution
    }));
  } catch (error: any) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const getEmployeeDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        designation: true,
        manager: { select: { firstName: true, lastName: true } },
        leaveBalance: true,
        documents: true,
        attendanceRecords: { take: 10, orderBy: { date: 'desc' } }
      }
    });

    if (!employee) return res.status(404).json(new ApiResponse(false, 'Not found'));
    
    if (employee.accountNumber) {
      try { employee.accountNumber = decrypt(employee.accountNumber); } catch (e) {}
    }

    res.status(200).json(new ApiResponse(true, 'Employee details fetched', employee));
  } catch (error: any) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const bulkOperations = async (req: AuthRequest, res: Response) => {
  try {
    const { action, employeeIds, data } = req.body;
    
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json(new ApiResponse(false, 'No employees selected'));
    }

    switch (action) {
      case 'DELETE':
        // Caution: Real deletion needs cascade handle. We'll do simple status change instead or use a background job.
        await prisma.employee.updateMany({
          where: { id: { in: employeeIds } },
          data: { status: 'TERMINATED' } // Soft delete alternative
        });
        break;
      case 'ACTIVATE':
        await prisma.employee.updateMany({
          where: { id: { in: employeeIds } },
          data: { status: 'ACTIVE' }
        });
        break;
      case 'DEACTIVATE':
        await prisma.employee.updateMany({
          where: { id: { in: employeeIds } },
          data: { status: 'INACTIVE' }
        });
        break;
      case 'ASSIGN_DEPARTMENT':
        await prisma.employee.updateMany({
          where: { id: { in: employeeIds } },
          data: { departmentId: data.departmentId }
        });
        break;
      case 'ASSIGN_MANAGER':
        await prisma.employee.updateMany({
          where: { id: { in: employeeIds } },
          data: { managerId: data.managerId }
        });
        break;
      default:
        return res.status(400).json(new ApiResponse(false, 'Invalid action'));
    }

    res.status(200).json(new ApiResponse(true, `Bulk ${action} completed successfully`));
  } catch (error: any) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};
