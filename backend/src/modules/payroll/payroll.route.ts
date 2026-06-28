import { Router } from 'express';
import { 
  getPayrollSummary, 
  getPayrollRecords, 
  getPayrollAnalytics, 
  getTimelineActivities, 
  createPayrollQuery 
} from './payroll.controller';
import { authenticate } from '../../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/summary', getPayrollSummary);
router.get('/analytics', getPayrollAnalytics);
router.get('/timeline', getTimelineActivities);

// Get payrolls (HR sees all, Employee sees own)
router.get('/', getPayrollRecords);

// Submit queries
router.post('/query', createPayrollQuery);

export default router;
