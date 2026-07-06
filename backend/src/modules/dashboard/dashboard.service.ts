import { prisma } from '../../lib/prisma';
import { withCache } from '../../lib/redis';

export const getSuperAdminStats = async () => {
  return await withCache('dashboard:superadmin', 300, async () => {
  const totalUsers = await prisma.user.count();
  const totalHRs = await prisma.user.count({ where: { role: { name: { contains: 'HR', mode: 'insensitive' } } } });
  const totalRoles = await prisma.role.count();
  
  // Organization count logic (hardcoded or from settings if applicable)
  const totalOrganizations = 1;
  
  // Storage Usage mock (since we don't have actual file system size access easily here)
  const storageUsageGB = 4.2; 
  const storageLimitGB = 10.0;
  
  // Security Alerts
  const securityAlerts = 0;
  
  // Today's Logins
  const today = new Date();
  today.setHours(0,0,0,0);
  const todaysLogins = await prisma.auditLog.count({
    where: { action: 'USER_LOGIN', timestamp: { gte: today } }
  });

  const rolesDistribution = await prisma.user.groupBy({
    by: ['roleId'],
    _count: { _all: true }
  });
  
  const roles = await prisma.role.findMany();
  const roleMap = roles.reduce((acc: any, role) => {
    acc[role.id] = role.name;
    return acc;
  }, {});

  const pieChartData = rolesDistribution.map((item) => ({
    name: item.roleId ? roleMap[item.roleId] : "No Role",
    value: item._count._all
  }));

  // Mocked API Response Trend
  const barChartData = [
    { name: 'Mon', value: 120 },
    { name: 'Tue', value: 110 },
    { name: 'Wed', value: 135 },
    { name: 'Thu', value: 95 },
    { name: 'Fri', value: 140 },
  ];

  // Recent Users table
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, firstName: true, lastName: true, email: true, role: { select: { name: true } }, createdAt: true }
  });

  // Recent Audit Logs
  const recentLogsRaw = await prisma.auditLog.findMany({
    take: 5,
    orderBy: { timestamp: 'desc' }
  }).catch(() => []);

  const userIds = recentLogsRaw.map(l => l.userId).filter(Boolean) as string[];
  const usersForLogs = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, firstName: true, lastName: true }
  }).catch(() => []);
  const userMap = usersForLogs.reduce((acc: any, u) => { acc[u.id] = u; return acc; }, {});

  const recentLogs = recentLogsRaw.map(l => ({
    ...l,
    user: l.userId ? userMap[l.userId] : null
  }));

  // System Statistics
  const latestMetric = await prisma.systemMetric.findFirst({ orderBy: { timestamp: 'desc' } }).catch(() => null);

  const insights = [
    { id: '1', type: 'INFO', message: `System health is ${latestMetric?.status || 'OPTIMAL'}.` },
    { id: '2', type: 'POSITIVE', message: `Active users increased by 12% this week.` }
  ];

  return {
    metrics: [
      { title: "Total Users", value: totalUsers, trend: "Active Accounts" },
      { title: "Total HRs", value: totalHRs, trend: "HR Admins & Managers" },
      { title: "Organizations", value: totalOrganizations, trend: "Tenants" },
      { title: "Storage Usage", value: `${storageUsageGB}GB`, trend: `of ${storageLimitGB}GB` },
      { title: "Security Alerts", value: securityAlerts, trend: "Requires Action" },
      { title: "Today's Logins", value: todaysLogins, trend: "Active Sessions" }
    ],
    pieChartData,
    barChartData,
    recentUsers,
    recentLogs,
    insights,
    systemStatus: {
      api: '99.9%',
      database: 'HEALTHY',
      server: latestMetric?.status || 'HEALTHY',
      cpu: latestMetric?.cpuUsage || 12,
      memory: latestMetric?.memoryUsage || 45
    },
    recentActivities: [
      { id: '1', title: 'System Backup Completed', timestamp: new Date(), statusColor: 'bg-green-500' },
      { id: '2', title: 'New Role Created', description: 'HR Manager role updated', timestamp: new Date(Date.now() - 3600000), statusColor: 'bg-blue-500' }
    ]
  };
  });
};

export const getHRManagerStats = async (trend: string = '30d') => {
  return await withCache(`dashboard:hrmanager:${trend}`, 300, async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalEmployees = await prisma.employee.count();
  
  const presentToday = await prisma.attendanceRecord.count({ 
    where: { date: today, status: 'PRESENT' } 
  });
  
  const onLeaveToday = await prisma.leaveRequest.count({ 
    where: { 
      status: 'APPROVED',
      startDate: { lte: new Date() },
      endDate: { gte: today }
    } 
  }); 

  const pendingLeaves = await prisma.leaveRequest.count({ where: { status: 'PENDING' } });
  const pendingAttendance = await prisma.attendanceCorrection.count({ where: { status: 'PENDING' } }).catch(() => 0);
  
  // Pending Tasks Array
  const rawPendingLeaves = await prisma.leaveRequest.findMany({ where: { status: 'PENDING' }, take: 5, include: { employee: true }});
  const rawPendingCorrections = await prisma.attendanceCorrection.findMany({ where: { status: 'PENDING' }, take: 5, include: { employee: true }}).catch(() => []);
  
  const pendingTasks = [
    ...rawPendingLeaves.map(l => ({
      id: `L-${l.id}`, title: `Leave Request: ${l.employee.firstName}`, description: l.leaveType, type: 'LEAVE', status: 'NORMAL', createdAt: l.createdAt
    })),
    ...rawPendingCorrections.map(c => ({
      id: `C-${c.id}`, title: `Attendance Correction: ${c.employee.firstName}`, description: c.correctionType, type: 'CORRECTION', status: 'URGENT', createdAt: c.createdAt
    }))
  ].sort((a: any, b: any) => b.createdAt - a.createdAt).slice(0, 8);

  const deptDistribution = await prisma.employee.groupBy({
    by: ['departmentId'],
    _count: { _all: true }
  });

  const departments = await prisma.department.findMany();
  const deptMap = departments.reduce((acc: any, dept) => {
    acc[dept.id] = dept.name;
    return acc;
  }, {});

  const pieChartData = deptDistribution.map((item) => ({
    name: item.departmentId ? deptMap[item.departmentId] : "Unassigned",
    value: item._count._all
  }));

  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

  // Only fetch candidates created in the relevant time window, selecting minimal fields
  const candidates = await prisma.candidate.findMany({
    where: { createdAt: { gte: trend === '1y' ? oneYearAgo : new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000) } },
    select: { createdAt: true, interviewStatus: true, status: true }
  });

  
  let barChartData: any[] = [];
  
  if (trend === '7d') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      d.setHours(0,0,0,0);
      const nextD = new Date(d.getTime() + 24 * 60 * 60 * 1000);
      barChartData.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        value: candidates.filter(c => c.createdAt >= d && c.createdAt < nextD).length
      });
    }
  } else if (trend === '1y') {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      barChartData.push({
        name: d.toLocaleDateString('en-US', { month: 'short' }),
        value: candidates.filter(c => c.createdAt >= d && c.createdAt < nextD).length
      });
    }
  } else {
    // 30d
    const week1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const week2 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const week3 = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
    const week4 = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    barChartData = [
      { name: 'Week 4', value: candidates.filter(c => c.createdAt >= week4 && c.createdAt < week3).length },
      { name: 'Week 3', value: candidates.filter(c => c.createdAt >= week3 && c.createdAt < week2).length },
      { name: 'Week 2', value: candidates.filter(c => c.createdAt >= week2 && c.createdAt < week1).length },
      { name: 'This Week', value: candidates.filter(c => c.createdAt >= week1).length },
    ];
  }

  const announcements = await prisma.announcement.findMany({
    where: { isActive: true, OR: [{ target: 'ALL' }, { target: 'HR_MANAGER' }] },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { author: { select: { firstName: true, lastName: true } } }
  }).catch(() => []);

  const insights = [
    { id: '1', type: 'INFO', message: `Attendance increased by 6% this week.` },
    { id: '2', type: 'WARNING', message: `${pendingLeaves} leave requests require approval.` },
    { id: '3', type: 'WARNING', message: `${pendingAttendance} attendance corrections are pending review.` }
  ];

  const pipeline = [
    { stage: 'Applied', count: candidates.filter(c => c.interviewStatus === 'PENDING').length },
    { stage: 'Screening', count: candidates.filter(c => c.interviewStatus === 'DONE' && c.status === 'IN_PROGRESS').length },
    { stage: 'Offered', count: candidates.filter(c => c.status === 'SELECTED').length },
    { stage: 'Rejected', count: candidates.filter(c => c.status === 'NOT_SELECTED').length }
  ];

  const upcomingBirthdays = await prisma.employee.findMany({
    where: { dob: { not: null } },
    take: 5
  }).catch(() => []); // Could filter by month in real impl, keeping simple for demo

  const workAnniversaries = await prisma.employee.findMany({
    orderBy: { joiningDate: 'asc' },
    take: 5
  });

  // Optimized deptAttendanceRaw to only fetch required nested IDs and statuses
  const deptAttendanceRaw = await prisma.employee.findMany({
    select: {
      departmentId: true,
      attendanceRecords: { where: { date: today }, select: { status: true } },
      leaveRequests: { where: { status: 'APPROVED', startDate: { lte: today }, endDate: { gte: today } }, select: { id: true } }
    }
  });

  const deptAttendance = departments.map(d => {
    const empsInDept = deptAttendanceRaw.filter(e => e.departmentId === d.id);
    const present = empsInDept.filter(e => e.attendanceRecords.some(r => r.status === 'PRESENT')).length;
    const onLeave = empsInDept.filter(e => e.leaveRequests.length > 0).length;
    const absent = Math.max(0, empsInDept.length - present - onLeave);
    
    return {
      department: d.name,
      present,
      absent,
      onLeave
    };
  });

  return {
    metrics: [
      { title: "Total Employees", value: totalEmployees, trend: "Active Workforce" },
      { title: "Present Today", value: presentToday, trend: "Checked In" },
      { title: "Attendance Rate", value: totalEmployees > 0 ? `${Math.round((presentToday / totalEmployees) * 100)}%` : '0%', trend: "Today" },
      { title: "On Leave Today", value: onLeaveToday, trend: "Approved Leaves" },
      { title: "Pending Approvals", value: pendingLeaves + pendingAttendance, trend: "Requires Action" },
      { title: "Open Recruitment", value: 4, trend: "Active Jobs" }
    ],
    pieChartData,
    barChartData,
    pendingTasks,
    announcements,
    insights,
    pipeline,
    upcomingBirthdays,
    workAnniversaries,
    deptAttendance,
    recentActivities: [
      { id: '1', title: 'New Employee Onboarded', description: 'John Doe joined IT Dept', timestamp: new Date(), statusColor: 'bg-green-500' },
      { id: '2', title: 'Payroll Generated', description: 'June 2026 Payroll', timestamp: new Date(Date.now() - 3600000), statusColor: 'bg-purple-500' }
    ]
  };
  });
};

export const getEmployeeStats = async (userId: string) => {
  return await withCache(`dashboard:employee:${userId}`, 120, async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const employee = await prisma.employee.findUnique({ 
    where: { userId },
    include: {
      attendanceRecords: {
        where: { date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        orderBy: { date: 'desc' },
        take: 7
      },
      payrollRecords: {
        orderBy: { createdAt: 'desc' },
        take: 3
      },
      documents: true
    }
  });

  if (!employee) {
    return {
      metrics: [
        { title: "Attendance", value: "0%", trend: "No Profile" },
        { title: "Today's Status", value: "N/A", trend: "Setup Required" },
        { title: "Leave Balance", value: "0", trend: "Days Remaining" },
        { title: "Pending Actions", value: 0, trend: "Requires Attention" },
        { title: "Upcoming Payroll", value: "N/A", trend: "Next Cycle" },
        { title: "Recent Documents", value: 0, trend: "Uploaded" }
      ],
      pieChartData: [{ name: "No Data", value: 1 }],
      barChartData: [
        { name: 'Mon', value: 0 }, { name: 'Tue', value: 0 }, { name: 'Wed', value: 0 },
        { name: 'Thu', value: 0 }, { name: 'Fri', value: 0 }
      ],
      pendingTasks: [{ id: "setup", title: "Complete Profile", description: "Contact HR to link your employee profile.", status: "PENDING", date: new Date() }],
      announcements: [],
      recentActivities: [],
      upcomingLeaves: []
    };
  }
  const empId = employee.id;

  const todayRecord = await prisma.attendanceRecord.findUnique({
    where: { employeeId_date: { employeeId: empId, date: today } },
    include: { logs: true }
  });

  const isPunchedIn = todayRecord?.logs.some(l => !l.punchOut);
  const todaysAttendanceStatus = isPunchedIn ? "PUNCHED IN" : (todayRecord?.status || "NOT PUNCHED IN");

  const presentDays = await prisma.attendanceRecord.count({ where: { employeeId: empId, status: 'PRESENT' } });
  const totalDays = 30; // Assuming monthly calc
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
  
  const leaveBalance = (employee as any)?.leaveBalance || 12;

  const pieChartData = [
    { name: "Present Days", value: presentDays > 0 ? presentDays : 1 },
    { name: "Leaves Taken", value: 12 - leaveBalance }
  ];

  const chartRecords = [...(employee.attendanceRecords || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let barChartData = chartRecords.map((record: any) => {
    const dayName = new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' });
    const value = typeof record.effectiveHours === 'number' ? Number(record.effectiveHours.toFixed(2)) : 0;
    return { name: dayName, value };
  });

  if (barChartData.length === 0) {
    barChartData = [
      { name: 'Mon', value: 0 },
      { name: 'Tue', value: 0 },
      { name: 'Wed', value: 0 },
      { name: 'Thu', value: 0 },
      { name: 'Fri', value: 0 },
    ];
  }

  const announcements = await prisma.announcement.findMany({
    where: { isActive: true, OR: [{ target: 'ALL' }, { target: 'EMPLOYEE' }] },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { author: { select: { firstName: true, lastName: true } } }
  }).catch(() => []);

  const holidays = await prisma.holiday.findMany({
    orderBy: { date: 'asc' }
  }).catch(() => []);

  // Calculate profile completion
  let completedFields = 0;
  const totalFields = 10;
  if (employee.firstName) completedFields++;
  if (employee.lastName) completedFields++;
  if (employee.email) completedFields++;
  if (employee.phone) completedFields++;
  if (employee.dob) completedFields++;
  if (employee.gender) completedFields++;
  if (employee.address) completedFields++;
  if (employee.emergencyContact) completedFields++;
  if (employee.bankName) completedFields++;
  if (employee.accountNumber) completedFields++;
  const profileCompletion = Math.round((completedFields / totalFields) * 100);

  const insights = [
    { id: '1', type: 'POSITIVE', message: `Your attendance is ${attendancePercentage}% this month. Great job!` },
    { id: '2', type: 'INFO', message: `You have ${leaveBalance} annual leaves remaining.` }
  ];

  return {
    metrics: [
      { title: "Today's Status", value: todaysAttendanceStatus, trend: "Attendance" },
      { title: "Present Days", value: presentDays, trend: "This Month" },
      { title: "Attendance %", value: `${attendancePercentage}%`, trend: "This Month" },
      { title: "Working Hours", value: "38h", trend: "This Week" },
      { title: "Leave Balance", value: leaveBalance, trend: "Annual Leaves" },
      { title: "Holidays", value: holidays.length, trend: "This Year" }
    ],
    pieChartData,
    barChartData,
    attendanceHistory: employee.attendanceRecords,
    recentPayslips: employee.payrollRecords,
    assignedDocuments: employee.documents,
    profileCompletion,
    announcements,
    holidays,
    insights,
    recentActivities: [
      { id: '1', title: 'Punched In', timestamp: new Date(), statusColor: 'bg-green-500' },
      { id: '2', title: 'Leave Approved', description: 'Sick Leave for tomorrow', timestamp: new Date(Date.now() - 86400000), statusColor: 'bg-blue-500' }
    ]
  };
  });
};
