import { Request, Response } from 'express';
import { ApiResponse } from '../../utils/ApiResponse';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { EmployeeService } from './employee.service';

export const createEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const employee = await EmployeeService.createEmployee(req.body, req.user?.id);
    res.status(201).json(new ApiResponse(true, 'Employee created successfully', employee));
  } catch (error: any) {
    res.status(400).json(new ApiResponse(false, error.message));
  }
};

export const bulkCreateEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { employees } = req.body;
    if (!employees || !Array.isArray(employees)) {
      return res.status(400).json(new ApiResponse(false, "Invalid data format"));
    }

    const { successCount, errors } = await EmployeeService.bulkCreateEmployee(employees, req.user?.id);

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
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    let filter: any = {};
    if (role === 'HR_ADMIN' || role === 'HR ADMIN') {
      filter.createdById = req.user?.id;
    }
    filter.isDeleted = false; // ensure we skip soft-deleted

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

    const result = await EmployeeService.getEmployees(filter, page, limit);
    res.status(200).json(new ApiResponse(true, 'Employees fetched successfully', result));
  } catch (error: any) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await EmployeeService.updateEmployee(id, req.body);
    res.status(200).json(new ApiResponse(true, 'Employee updated successfully', employee));
  } catch (error: any) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await EmployeeService.deleteEmployee(id);
    res.status(200).json(new ApiResponse(true, 'Employee deleted successfully'));
  } catch (error: any) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const filter = (role === 'HR_ADMIN' || role === 'HR ADMIN') ? { createdById: req.user?.id } : {};
    
    const summary = await EmployeeService.getDashboardSummary(filter);
    res.status(200).json(new ApiResponse(true, 'Dashboard summary fetched', summary));
  } catch (error: any) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const filter = (role === 'HR_ADMIN' || role === 'HR ADMIN') ? { createdById: req.user?.id } : {};

    const analytics = await EmployeeService.getAnalytics(filter);
    res.status(200).json(new ApiResponse(true, 'Analytics fetched', analytics));
  } catch (error: any) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const getEmployeeDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await EmployeeService.getEmployeeDetails(id);
    res.status(200).json(new ApiResponse(true, 'Employee details fetched', employee));
  } catch (error: any) {
    res.status(404).json(new ApiResponse(false, error.message));
  }
};

export const bulkOperations = async (req: AuthRequest, res: Response) => {
  try {
    const { action, employeeIds, data } = req.body;
    
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json(new ApiResponse(false, 'No employees selected'));
    }

    await EmployeeService.bulkOperations(action, employeeIds, data);
    res.status(200).json(new ApiResponse(true, `Bulk ${action} completed successfully`));
  } catch (error: any) {
    res.status(400).json(new ApiResponse(false, error.message));
  }
};
