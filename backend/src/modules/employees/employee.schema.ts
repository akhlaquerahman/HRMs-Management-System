import { z } from 'zod';
import { emailValidation, nameValidation, phoneValidation, empIdValidation } from '../../validations/common.schema';

export const createEmployeeSchema = z.object({
  employeeId: empIdValidation,
  firstName: nameValidation,
  lastName: nameValidation,
  email: emailValidation,
  phone: phoneValidation.optional(),
  gender: z.string().optional(),
  dob: z.string().optional(),
  departmentId: z.string().uuid('Invalid Department ID').optional(),
  designationId: z.string().uuid('Invalid Designation ID').optional(),
  joiningDate: z.string(),
  employmentType: z.string().optional(),
  managerId: z.string().uuid('Invalid Manager ID').optional(),
  status: z.string().optional(),
  password: z.string().min(8).optional(),
});

export const bulkCreateEmployeeSchema = z.object({
  employees: z.array(createEmployeeSchema),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();
