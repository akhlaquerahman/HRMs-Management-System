import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { ApiResponse } from '../../utils/ApiResponse';
import * as payrollService from './payroll.service';

export const bulkCreatePayroll = async (req: AuthRequest, res: Response) => {
  try {
    const rawRole = req.user?.role || '';
    const userRole = typeof rawRole === 'string' ? rawRole.toUpperCase().trim().replace(/\s+/g, '_') : '';
    
    if (userRole !== 'HR_MANAGER' && userRole !== 'SUPER_ADMIN' && userRole !== 'HR_ADMIN') {
      return res.status(403).json(new ApiResponse(false, "Unauthorized to process payroll"));
    }

    const records = req.body.records;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json(new ApiResponse(false, "No records provided"));
    }
    
    const result = await payrollService.bulkCreatePayrollRecords(records);
    return res.status(201).json(new ApiResponse(true, "Bulk payroll processed", result));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message || "Failed to process bulk payroll"));
  }
};

export const getPayrollSummary = async (req: AuthRequest, res: Response) => {
  try {
    const rawRole = req.user?.role || '';
    const userRole = typeof rawRole === 'string' ? rawRole.toUpperCase().trim().replace(/\s+/g, '_') : '';
    
    const summary = await payrollService.getPayrollSummary(req.user?.id || '', userRole);
    return res.status(200).json(new ApiResponse(true, "Payroll summary fetched", summary));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message || "Failed to fetch summary"));
  }
};

export const getPayrollRecords = async (req: AuthRequest, res: Response) => {
  try {
    const rawRole = req.user?.role || '';
    const userRole = typeof rawRole === 'string' ? rawRole.toUpperCase().trim().replace(/\s+/g, '_') : '';
    
    const filters = req.query;
    const records = await payrollService.getPayrollRecords(req.user?.id || '', userRole, filters);
    
    return res.status(200).json(new ApiResponse(true, "Payroll records fetched", records));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message || "Failed to fetch records"));
  }
};

export const getPayrollAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const rawRole = req.user?.role || '';
    const userRole = typeof rawRole === 'string' ? rawRole.toUpperCase().trim().replace(/\s+/g, '_') : '';
    
    const analytics = await payrollService.getPayrollAnalytics(req.user?.id || '', userRole);
    return res.status(200).json(new ApiResponse(true, "Analytics fetched", analytics));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message || "Failed to fetch analytics"));
  }
};

export const getTimelineActivities = async (req: AuthRequest, res: Response) => {
  try {
    const rawRole = req.user?.role || '';
    const userRole = typeof rawRole === 'string' ? rawRole.toUpperCase().trim().replace(/\s+/g, '_') : '';

    const timeline = await payrollService.getTimelineActivities(req.user?.id || '', userRole);
    return res.status(200).json(new ApiResponse(true, "Timeline fetched", timeline));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message || "Failed to fetch timeline"));
  }
};

export const createPayrollQuery = async (req: AuthRequest, res: Response) => {
  try {
    const query = await payrollService.createPayrollQuery(req.user?.id || '', req.body);
    return res.status(201).json(new ApiResponse(true, "Query submitted successfully", query));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message || "Failed to create query"));
  }
};

export const createPayrollRecord = async (req: AuthRequest, res: Response) => {
  try {
    const rawRole = req.user?.role || '';
    const userRole = typeof rawRole === 'string' ? rawRole.toUpperCase().trim().replace(/\s+/g, '_') : '';
    
    if (userRole !== 'HR_MANAGER' && userRole !== 'SUPER_ADMIN' && userRole !== 'HR_ADMIN') {
      return res.status(403).json(new ApiResponse(false, "Unauthorized to process payroll"));
    }

    const payrollRecord = await payrollService.createPayrollRecord(req.body);
    return res.status(201).json(new ApiResponse(true, "Salary processed and payslip sent successfully", payrollRecord));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message || "Failed to process salary"));
  }
};
