import { prisma } from '../../lib/prisma';
import { Request, Response } from 'express';

import { ApiResponse } from '../../utils/ApiResponse';



export const createDesignation = async (req: Request, res: Response) => {
  try {
    const { name, level, description, departmentId } = req.body;
    
    // Check if department exists
    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) {
      return res.status(404).json(new ApiResponse(false, 'Department not found'));
    }

    const designation = await prisma.designation.create({
      data: { name, level, description, departmentId }
    });

    res.status(201).json(new ApiResponse(true, 'Designation created successfully', designation));
  } catch (error: any) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const getDesignations = async (req: Request, res: Response) => {
  try {
    const designations = await prisma.designation.findMany({
      include: {
        department: {
          select: { name: true, code: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(new ApiResponse(true, 'Designations fetched successfully', designations));
  } catch (error: any) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const updateDesignation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, level, description, departmentId } = req.body;

    const designation = await prisma.designation.update({
      where: { id },
      data: { name, level, description, departmentId }
    });

    res.status(200).json(new ApiResponse(true, 'Designation updated successfully', designation));
  } catch (error: any) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const deleteDesignation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if designation is used by employees
    const employees = await prisma.employee.count({ where: { designationId: id } });
    if (employees > 0) {
      return res.status(400).json(new ApiResponse(false, 'Cannot delete designation as it is assigned to employees.'));
    }

    await prisma.designation.delete({ where: { id } });
    res.status(200).json(new ApiResponse(true, 'Designation deleted successfully'));
  } catch (error: any) {
    res.status(500).json(new ApiResponse(false, error.message));
  }
};
