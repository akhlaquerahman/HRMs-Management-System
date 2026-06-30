import { Router } from 'express';
import { 
  getPayrollSummary, 
  getPayrollRecords, 
  getPayrollAnalytics, 
  getTimelineActivities, 
  createPayrollQuery,
  createPayrollRecord,
  bulkCreatePayroll
} from './payroll.controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validateRequest';
import { createPayrollQuerySchema, createPayrollSchema } from './payroll.schema';

const router = Router();

router.use(authenticate);

router.get('/summary', getPayrollSummary);
router.get('/analytics', getPayrollAnalytics);
router.get('/timeline', getTimelineActivities);

// Get payrolls (HR sees all, Employee sees own)
router.route('/')
  .get(getPayrollRecords)
  .post(validateRequest({ body: createPayrollSchema }), createPayrollRecord);

router.post('/bulk', bulkCreatePayroll);

// Submit queries
router.post('/query', validateRequest({ body: createPayrollQuerySchema }), createPayrollQuery);

export default router;
