const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src', 'modules');

const modules = [
  'shifts',
  'holidays',
  'attendance',
  'attendanceRequests'
];

modules.forEach(mod => {
  const modPath = path.join(baseDir, mod);
  if (!fs.existsSync(modPath)) {
    fs.mkdirSync(modPath, { recursive: true });
  }

  // Create Controller
  const controllerCode = `import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../../utils/ApiResponse';

const prisma = new PrismaClient();

export const getAll = async (req: Request, res: Response) => {
  try {
    const data = await prisma.${mod === 'attendanceRequests' ? 'attendanceRequest' : mod.replace(/s$/, '')}.findMany();
    return res.status(200).json(ApiResponse.success(data, "Fetched successfully"));
  } catch (error: any) {
    return res.status(500).json(ApiResponse.error(error.message));
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const data = await prisma.${mod === 'attendanceRequests' ? 'attendanceRequest' : mod.replace(/s$/, '')}.create({ data: req.body });
    return res.status(201).json(ApiResponse.success(data, "Created successfully"));
  } catch (error: any) {
    return res.status(500).json(ApiResponse.error(error.message));
  }
};
`;
  const singleName = mod.replace(/s$/, '').replace('attendanceRequest', 'attendance_request');
  fs.writeFileSync(path.join(modPath, `${singleName}.controller.ts`), controllerCode);

  // Create Route
  const routeCode = `import { Router } from 'express';
import { getAll, create } from './${singleName}.controller';
import { authenticate } from '../../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(getAll)
  .post(create);

export default router;
`;
  fs.writeFileSync(path.join(modPath, `${singleName}.route.ts`), routeCode);
});

console.log("Backend modules generated successfully.");
