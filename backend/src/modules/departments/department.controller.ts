import { prisma } from '../../lib/prisma';
import { Request, Response } from 'express';

import { ApiResponse } from '../../utils/ApiResponse';



export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, code, description, status } = req.body;
    
    // Check if exists
    const existing = await prisma.department.findFirst({
      where: { OR: [{ name }, { code }] }
    });
    
    if (existing) {
      return res.status(400).json(new ApiResponse(false, 'Department with this name or code already exists'));
    }

    const department = await prisma.department.create({
      data: { name, code, description, status }
    });

    res.status(201).json(new ApiResponse(true, 'Department created successfully', department));
  } catch (error: any) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(new ApiResponse(true, 'Departments fetched successfully', departments));
  } catch (error: any) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, description, status } = req.body;

    const department = await prisma.department.update({
      where: { id },
      data: { name, code, description, status }
    });

    res.status(200).json(new ApiResponse(true, 'Department updated successfully', department));
  } catch (error: any) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if department is used by designations
    const designations = await prisma.designation.count({ where: { departmentId: id } });
    if (designations > 0) {
      return res.status(400).json(new ApiResponse(false, 'Cannot delete department as it has designations linked to it.'));
    }

    await prisma.department.delete({ where: { id } });
    res.status(200).json(new ApiResponse(true, 'Department deleted successfully'));
  } catch (error: any) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};
