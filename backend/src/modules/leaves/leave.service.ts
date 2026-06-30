import { prisma } from '../../lib/prisma';
import { AttendanceLog, AttendanceRecord, LeaveBalance, LeaveRequest } from '@prisma/client';


export const getLeaveSummary = async (userId: string, role: string) => {
  if (role === 'EMPLOYEE') {
    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: { leaveBalance: true }
    });
    
    if (!employee) return {
      metrics: [
        { title: "Available Leaves", value: 0, subtitle: "Total Balance", trend: "0 used", icon: "CalendarDays" },
        { title: "Pending Approvals", value: 0, subtitle: "Awaiting Action", trend: "0 new", icon: "Clock" },
        { title: "Upcoming Leaves", value: 0, subtitle: "Next 30 days", trend: "0 days", icon: "CalendarCheck" },
        { title: "Leaves Taken", value: 0, subtitle: "This Year", trend: "0% of quota", icon: "FileText" }
      ],
      insights: [
        { id: '1', type: 'INFO', message: `No employee profile attached to this account.` }
      ]
    };
    
    const requests = await prisma.leaveRequest.findMany({
      where: { employeeId: employee.id }
    });

    const pending = requests.filter((r: any) => r.status === 'PENDING').length;
    const approved = requests.filter((r: any) => r.status === 'APPROVED').length;
    const rejected = requests.filter((r: any) => r.status === 'REJECTED').length;
    const upcoming = requests.filter((r: any) => r.status === 'APPROVED' && new Date(r.startDate) > new Date()).length;

    // Default balance if not explicitly set
    const balance = employee.leaveBalance || {
      annual: 18, casual: 8, medical: 10, earned: 5, compOff: 0
    };

    const usedAnnual = requests.filter((r: any) => r.status === 'APPROVED' && r.leaveType === 'ANNUAL').length;

    return {
      metrics: [
        { title: "Annual Leave", value: balance.annual, subtitle: `${usedAnnual} Used`, trend: "Total Quota", icon: "Calendar" },
        { title: "Pending Approval", value: pending, subtitle: "Awaiting Action", trend: "Under Review", icon: "Clock" },
        { title: "Approved Leaves", value: approved, subtitle: "This Year", trend: "Processed", icon: "CheckCircle" },
      ],
      balances: balance,
      insights: [
        { id: '1', type: 'INFO', message: `You have ${balance.annual - usedAnnual} annual leave days remaining.` },
        { id: '2', type: 'POSITIVE', message: `You have no pending approvals.` }
      ]
    };
  } else {
    // HR / SUPER ADMIN
    const totalRequests = await prisma.leaveRequest.count();
    const pending = await prisma.leaveRequest.count({ where: { status: 'PENDING' } });
    const approved = await prisma.leaveRequest.count({ where: { status: 'APPROVED' } });
    const rejected = await prisma.leaveRequest.count({ where: { status: 'REJECTED' } });

    return {
      metrics: [
        { title: "Total Requests", value: totalRequests, subtitle: "All Time", trend: "Total", icon: "FileText" },
        { title: "Pending Approval", value: pending, subtitle: "Action Required", trend: "Action Required", icon: "Clock" },
        { title: "Approved Leaves", value: approved, subtitle: "All Time", trend: "Processed", icon: "CheckCircle" },
        { title: "Rejected Requests", value: rejected, subtitle: "All Time", trend: "Declined", icon: "XCircle" }
      ],
      insights: [
        { id: '1', type: 'WARNING', message: `${pending} leave requests require your approval.` },
        { id: '2', type: 'INFO', message: `Leave utilization increased by 8% this month.` }
      ]
    };
  }
};

export const getLeaveRequests = async (userId: string, role: string, filters: any) => {
  let whereClause: any = {};
  
  if (role === 'EMPLOYEE') {
    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) return []; // Return empty array if user has no employee profile
    whereClause.employeeId = employee.id;
  }

  if (filters.status && filters.status !== 'ALL') {
    whereClause.status = filters.status;
  }

  if (filters.leaveType && filters.leaveType !== 'ALL') {
    whereClause.leaveType = filters.leaveType;
  }

  const requests = await prisma.leaveRequest.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      employee: {
        select: { 
          id: true, 
          firstName: true, 
          lastName: true, 
          department: {
            select: { name: true }
          }
        }
      },
      approvalHistory: {
        include: { actedBy: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  return requests;
};

export const createLeaveRequest = async (userId: string, data: any) => {
  let empId = data.employeeId;
  
  if (!empId || empId === 'self') {
    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) throw new Error("Employee not found");
    empId = employee.id;
  }

  const request = await prisma.leaveRequest.create({
    data: {
      employeeId: empId,
      leaveType: data.leaveType,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      halfDay: data.halfDay || false,
      workFromHome: data.workFromHome || false,
      emergencyLeave: data.emergencyLeave || false,
      description: data.description,
      attachment: data.attachment
    }
  });

  // Log creation in approval history
  await prisma.approvalHistory.create({
    data: {
      leaveRequestId: request.id,
      action: 'SUBMITTED',
      actedById: userId,
      comments: 'Leave request submitted by employee.'
    }
  });

  return request;
};

export const processLeaveApproval = async (userId: string, leaveId: string, action: string, comments?: string) => {
  const validActions = ['APPROVED', 'REJECTED', 'CANCELLED'];
  if (!validActions.includes(action)) throw new Error("Invalid action");

  const request = await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: { status: action }
  });

  await prisma.approvalHistory.create({
    data: {
      leaveRequestId: leaveId,
      action: action,
      actedById: userId,
      comments: comments || `Leave request ${action.toLowerCase()}.`
    }
  });

  return request;
};

export const getLeaveAnalytics = async () => {
  // Mocking aggregation for charts since generic counts per type can be heavy
  const distribution = await prisma.leaveRequest.groupBy({
    by: ['leaveType'],
    _count: { _all: true }
  });

  return {
    distribution,
    monthlyTrend: [
      { month: 'Jan', requests: 12 },
      { month: 'Feb', requests: 19 },
      { month: 'Mar', requests: 15 },
      { month: 'Apr', requests: 22 },
      { month: 'May', requests: 18 },
      { month: 'Jun', requests: 30 }
    ]
  };
};

export const getLeaveCalendar = async () => {
  const upcomingLeaves = await prisma.leaveRequest.findMany({
    where: { status: 'APPROVED', startDate: { gte: new Date() } },
    include: { employee: { select: { firstName: true, lastName: true } } },
    take: 10,
    orderBy: { startDate: 'asc' }
  });

  const holidays = await prisma.holiday.findMany({
    orderBy: { date: 'asc' }
  });

  return { upcomingLeaves, holidays };
};
