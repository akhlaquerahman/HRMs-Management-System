import { Router } from 'express';
import { 
  getLeaveSummary, 
  getLeaveRequests, 
  getMyLeaves, 
  createLeaveRequest, 
  updateLeaveStatus, 
  getLeaveAnalytics, 
  getLeaveCalendar 
} from './leave.controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validateRequest';
import { createLeaveRequestSchema, updateLeaveStatusSchema } from './leave.schema';

const router = Router();

router.use(authenticate);

router.get('/summary', getLeaveSummary);
router.get('/calendar', getLeaveCalendar);
router.get('/analytics', getLeaveAnalytics);

router.get('/my', getMyLeaves);
router.post('/my', validateRequest({ body: createLeaveRequestSchema }), createLeaveRequest);

router.get('/', getLeaveRequests);
router.post('/', validateRequest({ body: createLeaveRequestSchema }), createLeaveRequest); // Can also be used by HR to create on behalf
router.put('/:id/status', validateRequest({ body: updateLeaveStatusSchema }), updateLeaveStatus);

export default router;
