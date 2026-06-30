import { Router } from 'express';
import { punchIn, punchOut, startBreak, endBreak, getStatus, getAllRecords, createManual, updateManual, deleteManual, getMyAttendance, getMySummary, getMyCharts, bulkUpload } from './attendance.controller';
import { createCorrection, getMyCorrections, getPendingCorrections, approveCorrection, rejectCorrection } from './attendanceCorrection.controller';
import { getSummary, getOperationsList, getAnalytics, getRecentActivities } from './attendanceOperations.controller';
import { authenticate } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validateRequest';
import { createCorrectionSchema, updateCorrectionStatusSchema, manualAttendanceSchema } from './attendance.schema';

const router = Router();

// Ensure all attendance routes require the user to be logged in
router.use(authenticate);

// ==========================================
// Operations Center (For HR/Admins viewing company-wide data)
// ==========================================
router.get('/operations/summary', getSummary); // High level stats (total present, absent, etc)
router.get('/operations/list', getOperationsList); // Detailed list of all daily attendance
router.get('/operations/analytics', getAnalytics); // Data for dashboard charts
router.get('/operations/activities', getRecentActivities); // Live feed of recent punches

// ==========================================
// Attendance Corrections (Employee workflow to fix mistakes)
// ==========================================
router.post('/corrections', validateRequest({ body: createCorrectionSchema }), createCorrection); // Request a fix
router.get('/corrections/my', getMyCorrections); // See my own fix requests
router.get('/corrections/pending', getPendingCorrections); // HR view: see all pending fix requests
router.put('/corrections/:id/approve', validateRequest({ body: updateCorrectionStatusSchema }), approveCorrection); // HR action
router.put('/corrections/:id/reject', validateRequest({ body: updateCorrectionStatusSchema }), rejectCorrection); // HR action

// ==========================================
// Daily Clock-In/Clock-Out Logic
// ==========================================
router.get('/status', getStatus); // Check if I am currently clocked in or out
router.post('/punch-in', punchIn); // Start working
router.post('/punch-out', punchOut); // Stop working
router.post('/break-start', startBreak); // Start lunch/break
router.post('/break-end', endBreak); // End break

// ==========================================
// Employee Personal Views
// ==========================================
router.get('/my/summary', getMySummary); // Total hours worked this month
router.get('/my/charts', getMyCharts); // Data for employee's personal charts
router.get('/my', getMyAttendance); // Employee's full history

// ==========================================
// Manual Admin Overrides
// ==========================================
router.post('/manual', validateRequest({ body: manualAttendanceSchema }), createManual); // Admin inserts a record
router.post('/bulk', bulkUpload); // Upload CSV of records
router.put('/:id', validateRequest({ body: manualAttendanceSchema }), updateManual); // Admin modifies a record
router.delete('/:id', deleteManual); // Admin deletes a record

// Fetch all records raw (usually for table views)
router.get('/', getAllRecords);

export default router;
