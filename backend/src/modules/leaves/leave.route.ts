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

const router = Router();

router.use(authenticate);

router.get('/summary', getLeaveSummary);
router.get('/calendar', getLeaveCalendar);
router.get('/analytics', getLeaveAnalytics);

router.get('/my', getMyLeaves);
router.post('/my', createLeaveRequest);

router.get('/', getLeaveRequests);
router.post('/', createLeaveRequest); // Can also be used by HR to create on behalf
router.put('/:id/status', updateLeaveStatus);

export default router;
