import { prisma } from '../../lib/prisma';
import { Request, Response } from 'express';

import { ApiResponse } from '../../utils/ApiResponse';



// Utility to get today's normalized date
const getTodayDate = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// Get current attendance status for the logged-in user
export const getStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) {
      return res.status(200).json(new ApiResponse(true, "Not an employee", { 
        status: "NOT_PUNCHED_IN",
        currentState: "NOT_PUNCHED_IN",
        isEmployee: false,
        shift: null
      }));
    }

    const today = getTodayDate();
    const record = await prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: today } },
      include: { logs: true, breaks: true, shift: true }
    });

    let shift = null;

    if (!record) {
      const empWithShift = await prisma.employee.findUnique({ where: { id: employee.id }, include: { shift: true } });
      shift = empWithShift?.shift;
      return res.status(200).json(new ApiResponse(true, "Success", { 
        status: "NOT_PUNCHED_IN",
        currentState: "NOT_PUNCHED_IN",
        shift
      }));
    }

    shift = record.shift;

    // Determine current live state
    const hasLogs = record.logs && record.logs.length > 0;
    const openLog = record.logs.find(l => !l.punchOut);
    const openBreak = record.breaks.find(b => !b.breakEnd);

    let currentState = "NOT_PUNCHED_IN";
    if (hasLogs) {
      currentState = openBreak ? "ON_BREAK" : (openLog ? "PUNCHED_IN" : "PUNCHED_OUT");
    }

    return res.status(200).json(new ApiResponse(true, "Success", {
      record,
      shift,
      currentState
    }));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const punchIn = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { ipAddress, gpsLocation, deviceName, browser, os } = req.body;
    
    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) return res.status(404).json(new ApiResponse(false, "Employee profile not found"));

    const today = getTodayDate();
    let record = await prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: today } }
    });

    if (!record) {
      // Find the most appropriate shift based on current time
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      const activeShifts = await prisma.shift.findMany({ where: { status: true } });
      let matchedShift = null;
      let minDiff = Infinity;

      for (const shift of activeShifts) {
        const [startHour, startMin] = shift.startTime.split(':').map(Number);
        const shiftStartMinutes = startHour * 60 + startMin;
        
        const diff = Math.abs(currentMinutes - shiftStartMinutes);
        if (diff < minDiff && diff <= 180) { // Within 3 hours of shift start time
          minDiff = diff;
          matchedShift = shift;
        }
      }

      const shiftIdToUse = matchedShift ? matchedShift.id : employee.shiftId;

      record = await prisma.attendanceRecord.create({
        data: {
          employeeId: employee.id,
          date: today,
          status: "PRESENT", // Can be re-evaluated later
          shiftId: shiftIdToUse
        }
      });
    }

    const newLog = await prisma.attendanceLog.create({
      data: {
        attendanceId: record.id,
        punchIn: new Date(),
        ipAddress,
        gpsLocation,
        deviceName,
        browser,
        os
      }
    });

    return res.status(201).json(new ApiResponse(true, "Punched In Successfully", newLog));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const punchOut = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) return res.status(404).json(new ApiResponse(false, "Employee profile not found"));

    const today = getTodayDate();
    const record = await prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: today } },
      include: { logs: true }
    });

    if (!record) return res.status(400).json(new ApiResponse(false, "No punch in record found for today"));

    const openLog = record.logs.find(l => !l.punchOut);
    if (!openLog) return res.status(400).json(new ApiResponse(false, "You are already punched out"));

    const updatedLog = await prisma.attendanceLog.update({
      where: { id: openLog.id },
      data: { punchOut: new Date() }
    });

    // Re-calculate effective and gross hours
    const allLogs = await prisma.attendanceLog.findMany({ where: { attendanceId: record.id } });
    const allBreaks = await prisma.breakSession.findMany({ where: { attendanceId: record.id } });

    let grossMs = 0;
    allLogs.forEach(l => {
      if (l.punchOut) grossMs += (l.punchOut.getTime() - l.punchIn.getTime());
    });

    let breakMs = 0;
    allBreaks.forEach(b => {
      if (b.breakEnd) breakMs += (b.breakEnd.getTime() - b.breakStart.getTime());
    });
    
    let effectiveMs = grossMs - breakMs;
    if (effectiveMs < 0) effectiveMs = 0;

    const grossHours = grossMs / (1000 * 60 * 60);
    const effectiveHours = effectiveMs / (1000 * 60 * 60);

    const newStatus = effectiveHours < 4 ? "HALF_DAY" : "PRESENT";

    await prisma.attendanceRecord.update({
      where: { id: record.id },
      data: { grossHours, effectiveHours, status: newStatus }
    });

    return res.status(200).json(new ApiResponse(true, "Punched Out Successfully", updatedLog));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const startBreak = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) return res.status(404).json(new ApiResponse(false, "Employee profile not found"));

    const today = getTodayDate();
    const record = await prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: today } }
    });

    if (!record) return res.status(400).json(new ApiResponse(false, "No active attendance record found"));

    const newBreak = await prisma.breakSession.create({
      data: { attendanceId: record.id, breakStart: new Date() }
    });

    return res.status(201).json(new ApiResponse(true, "Break started", newBreak));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const endBreak = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) return res.status(404).json(new ApiResponse(false, "Employee profile not found"));

    const today = getTodayDate();
    const record = await prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: today } },
      include: { breaks: true }
    });

    if (!record) return res.status(400).json(new ApiResponse(false, "No active attendance record found"));

    const openBreak = record.breaks.find(b => !b.breakEnd);
    if (!openBreak) return res.status(400).json(new ApiResponse(false, "No open break session found"));

    const end = new Date();
    const durationMinutes = Math.floor((end.getTime() - openBreak.breakStart.getTime()) / 60000);

    const updatedBreak = await prisma.breakSession.update({
      where: { id: openBreak.id },
      data: { breakEnd: end, durationMinutes }
    });

    return res.status(200).json(new ApiResponse(true, "Break ended", updatedBreak));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const getAllRecords = async (req: Request, res: Response) => {
  try {
    const records = await prisma.attendanceRecord.findMany({
      include: { employee: { include: { shift: true } }, logs: true, breaks: true, shift: true },
      orderBy: { date: 'desc' }
    });
    return res.status(200).json(new ApiResponse(true, "Success", records));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const getMyAttendance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) return res.status(404).json(new ApiResponse(false, "Employee profile not found"));

    const records = await prisma.attendanceRecord.findMany({
      where: { employeeId: employee.id },
      include: { logs: true, breaks: true, shift: true },
      orderBy: { date: 'desc' }
    });
    return res.status(200).json(new ApiResponse(true, "Success", records));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const createManual = async (req: Request, res: Response) => {
  try {
    const { employeeId, date, punchIn, punchOut, status, shiftId } = req.body;
    
    const record = await prisma.attendanceRecord.create({
      data: {
        employeeId,
        date: new Date(date),
        status,
        shiftId: shiftId || undefined,
        grossHours: punchOut ? (new Date(punchOut).getTime() - new Date(punchIn).getTime()) / 3600000 : 0,
        effectiveHours: punchOut ? (new Date(punchOut).getTime() - new Date(punchIn).getTime()) / 3600000 : 0,
      }
    });

    if (punchIn) {
      await prisma.attendanceLog.create({
        data: {
          attendanceId: record.id,
          punchIn: new Date(punchIn),
          punchOut: punchOut ? new Date(punchOut) : null,
        }
      });
    }

    return res.status(201).json(new ApiResponse(true, "Manual record created", record));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const updateManual = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, punchIn, punchOut, status, shiftId } = req.body;
    
    // Simplistic update for now
    const record = await prisma.attendanceRecord.update({
      where: { id },
      data: {
        status,
        shiftId: shiftId || undefined,
        grossHours: punchIn && punchOut ? (new Date(punchOut).getTime() - new Date(punchIn).getTime()) / 3600000 : 0,
        effectiveHours: punchIn && punchOut ? (new Date(punchOut).getTime() - new Date(punchIn).getTime()) / 3600000 : 0,
      }
    });

    if (punchIn) {
      // First try to find existing log
      const existingLog = await prisma.attendanceLog.findFirst({ where: { attendanceId: id } });
      if (existingLog) {
        await prisma.attendanceLog.update({
          where: { id: existingLog.id },
          data: {
            punchIn: new Date(punchIn),
            punchOut: punchOut ? new Date(punchOut) : null,
          }
        });
      } else {
        await prisma.attendanceLog.create({
          data: {
            attendanceId: id,
            punchIn: new Date(punchIn),
            punchOut: punchOut ? new Date(punchOut) : null,
          }
        });
      }
    }

    return res.status(200).json(new ApiResponse(true, "Manual record updated", record));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const deleteManual = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.attendanceRecord.delete({ where: { id } });
    return res.status(200).json(new ApiResponse(true, "Record deleted successfully"));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const getMySummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) return res.status(404).json(new ApiResponse(false, "Employee profile not found"));

    const now = new Date();
    
    const records = await prisma.attendanceRecord.findMany({
      where: { employeeId: employee.id }
    });

    let presentDays = 0;
    let absentDays = 0;
    let lateArrivals = 0;
    let totalWorkingHours = 0;
    let totalOvertimeHours = 0;
    
    records.forEach(r => {
      if (r.status === 'PRESENT') presentDays++;
      if (r.status === 'ABSENT') absentDays++;
      if (r.isLate) lateArrivals++;
      totalWorkingHours += r.effectiveHours;
      if (r.effectiveHours > 8) { // standard 8 hours
        totalOvertimeHours += (r.effectiveHours - 8);
      }
    });

    const summary = {
      presentDays,
      absentDays,
      lateArrivals,
      totalWorkingHours: Math.round(totalWorkingHours),
      totalOvertimeHours: Math.round(totalOvertimeHours),
      remainingLeaves: 12 // Assuming 12 annual leaves standard
    };

    return res.status(200).json(new ApiResponse(true, "Summary fetched", summary));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const getMyCharts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) return res.status(404).json(new ApiResponse(false, "Employee profile not found"));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyRecords = await prisma.attendanceRecord.findMany({
      where: { employeeId: employee.id, date: { gte: last7Days } },
      orderBy: { date: 'asc' }
    });

    const weeklyHours = weeklyRecords.map(r => ({
      day: r.date.toLocaleDateString('en-US', { weekday: 'short' }),
      hours: Math.round(r.effectiveHours * 10) / 10
    }));

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyRecords = await prisma.attendanceRecord.findMany({
      where: { employeeId: employee.id, date: { gte: startOfMonth } }
    });

    let present = 0, absent = 0, leave = 0, halfday = 0;
    monthlyRecords.forEach(r => {
      if (r.status === 'PRESENT') present++;
      else if (r.status === 'ABSENT') absent++;
      else if (r.status === 'LEAVE') leave++;
      else if (r.status === 'HALF_DAY') halfday++;
    });

    const monthlyAttendance = [
      { name: 'Present', value: present, color: '#22c55e' },
      { name: 'Absent', value: absent, color: '#ef4444' },
      { name: 'Leave', value: leave, color: '#64748b' },
      { name: 'Half Day', value: halfday, color: '#eab308' }
    ];

    return res.status(200).json(new ApiResponse(true, "Charts fetched", { weeklyHours, monthlyAttendance }));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message));
  }
};

export const bulkUpload = async (req: Request, res: Response) => {
  try {
    const { records } = req.body; // Array of { employeeId, date, punchIn, punchOut, status }
    if (!records || !Array.isArray(records)) {
      return res.status(400).json(new ApiResponse(false, "Invalid data format"));
    }

    let successCount = 0;
    const errors: any[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      try {
        const employee = await prisma.employee.findUnique({
          where: { employeeId: record.employeeId }
        });
        
        if (!employee) {
          errors.push({ row: i + 1, employeeId: record.employeeId, error: "Employee not found" });
          continue;
        }

        const dateObj = new Date(record.date);
        if (isNaN(dateObj.getTime())) {
          errors.push({ row: i + 1, employeeId: record.employeeId, error: "Invalid date format" });
          continue;
        }
        
        // Check if record exists
        let attendanceRecord = await prisma.attendanceRecord.findFirst({
          where: { employeeId: employee.id, date: dateObj }
        });

        if (!attendanceRecord) {
          attendanceRecord = await prisma.attendanceRecord.create({
            data: {
              employeeId: employee.id,
              date: dateObj,
              status: record.status || "PRESENT"
            }
          });
        } else {
          await prisma.attendanceRecord.update({
            where: { id: attendanceRecord.id },
            data: { status: record.status || attendanceRecord.status }
          });
        }

        if (record.punchIn) {
          const punchInDate = new Date(record.punchIn);
          if (!isNaN(punchInDate.getTime())) {
            await prisma.attendanceLog.create({
              data: {
                attendanceId: attendanceRecord.id,
                punchIn: punchInDate,
                punchOut: record.punchOut ? new Date(record.punchOut) : null,
              }
            });
          }
        }
        successCount++;
      } catch (err: any) {
        errors.push({ row: i + 1, employeeId: record.employeeId, error: err.message || "Database error" });
      }
    }

    if (errors.length > 0) {
      return res.status(207).json(new ApiResponse(true, `Bulk upload finished with errors. Success: ${successCount}, Failed: ${errors.length}`, { successCount, errors }));
    }

    return res.status(200).json(new ApiResponse(true, `Bulk upload completed successfully. Success: ${successCount}`));
  } catch (error: any) {
    return res.status(500).json(new ApiResponse(false, error.message));
  }
};
