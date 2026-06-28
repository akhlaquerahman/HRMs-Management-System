import { prisma } from '../../lib/prisma';
import { Payroll, PayrollQuery } from '@prisma/client';

export const getPayrollSummary = async (userId: string, role: string) => {
  if (role === 'EMPLOYEE') {
    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) throw new Error("Employee not found");
    
    // YTD Logic (Year To Date)
    const currentYear = new Date().getFullYear();
    const currentYearPayslips = await prisma.payroll.findMany({
      where: { employeeId: employee.id, year: currentYear }
    });

    const ytdEarnings = currentYearPayslips.reduce((acc: number, curr: any) => acc + curr.grossSalary, 0);
    const ytdDeductions = currentYearPayslips.reduce((acc: number, curr: any) => acc + curr.deductions, 0);
    const ytdTax = currentYearPayslips.reduce((acc: number, curr: any) => acc + curr.incomeTax, 0);
    const ytdNet = currentYearPayslips.reduce((acc: number, curr: any) => acc + curr.netSalary, 0);
    const ytdBonus = currentYearPayslips.reduce((acc: number, curr: any) => acc + curr.bonus, 0);
    const ytdPF = currentYearPayslips.reduce((acc: number, curr: any) => acc + curr.providentFund, 0);
    const averageSalary = currentYearPayslips.length > 0 ? (ytdNet / currentYearPayslips.length) : 0;

    // Latest month
    const latestPayslip = currentYearPayslips.sort((a: any, b: any) => 
      new Date(b.year, b.month - 1).getTime() - new Date(a.year, a.month - 1).getTime()
    )[0];

    const currentMonthSalary = latestPayslip ? latestPayslip.netSalary : 0;
    
    return {
      metrics: [
        { title: "Current Month Salary", value: `₹${currentMonthSalary.toLocaleString()}`, subtitle: "Net Pay", trend: "Latest", icon: "Wallet" },
        { title: "YTD Earnings", value: `₹${ytdEarnings.toLocaleString()}`, subtitle: "Gross Salary", trend: "This Year", icon: "Banknote" },
        { title: "Net Salary YTD", value: `₹${ytdNet.toLocaleString()}`, subtitle: "Take Home", trend: "This Year", icon: "CheckCircle" },
        { title: "Total Bonus", value: `₹${ytdBonus.toLocaleString()}`, subtitle: "YTD", trend: "Rewards", icon: "Award" },
        { title: "Total Deductions", value: `₹${ytdDeductions.toLocaleString()}`, subtitle: "YTD", trend: "Deductions", icon: "TrendingDown" },
        { title: "Income Tax Paid", value: `₹${ytdTax.toLocaleString()}`, subtitle: "YTD", trend: "Tax", icon: "Receipt" },
      ],
      ytdSummary: {
        ytdEarnings, ytdTax, ytdBonus, ytdPF, ytdDeductions, averageSalary
      },
      insights: [
        { id: '1', type: 'INFO', message: `Average monthly earnings this year are ₹${averageSalary.toLocaleString(undefined, {maximumFractionDigits: 0})}.` },
        { id: '2', type: 'POSITIVE', message: `Your latest payslip for ${latestPayslip ? latestPayslip.month + '/' + latestPayslip.year : 'N/A'} is available.` }
      ]
    };
  } else {
    // HR / SUPER ADMIN Global Summary
    const currentYear = new Date().getFullYear();
    const currentYearPayslips = await prisma.payroll.findMany({
      where: { year: currentYear }
    });

    const totalPaid = currentYearPayslips.reduce((acc: number, curr: any) => acc + curr.netSalary, 0);
    const totalTax = currentYearPayslips.reduce((acc: number, curr: any) => acc + curr.incomeTax, 0);
    const totalBonus = currentYearPayslips.reduce((acc: number, curr: any) => acc + curr.bonus, 0);
    const totalDeductions = currentYearPayslips.reduce((acc: number, curr: any) => acc + curr.deductions, 0);

    return {
      metrics: [
        { title: "Total Salary Paid (YTD)", value: `₹${totalPaid.toLocaleString()}`, subtitle: "Net Pay", trend: "Global", icon: "Wallet" },
        { title: "Total Tax Collected", value: `₹${totalTax.toLocaleString()}`, subtitle: "YTD", trend: "Tax", icon: "Receipt" },
        { title: "Total Bonus Paid", value: `₹${totalBonus.toLocaleString()}`, subtitle: "YTD", trend: "Rewards", icon: "Award" },
        { title: "Total Deductions", value: `₹${totalDeductions.toLocaleString()}`, subtitle: "YTD", trend: "Global", icon: "TrendingDown" }
      ],
      insights: [
        { id: '1', type: 'INFO', message: `Global payroll processed successfully this month.` },
      ]
    };
  }
};

export const getPayrollRecords = async (userId: string, role: string, filters: any) => {
  let whereClause: any = {};
  
  if (role === 'EMPLOYEE') {
    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) throw new Error("Employee not found");
    whereClause.employeeId = employee.id;
  }

  if (filters.status && filters.status !== 'ALL') {
    whereClause.status = filters.status;
  }
  if (filters.year && filters.year !== 'ALL') {
    whereClause.year = parseInt(filters.year);
  }
  if (filters.month && filters.month !== 'ALL') {
    whereClause.month = parseInt(filters.month);
  }

  const records = await prisma.payroll.findMany({
    where: whereClause,
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    include: {
      employee: {
        select: { id: true, firstName: true, lastName: true, department: true }
      }
    }
  });

  return records;
};

export const getPayrollAnalytics = async (userId: string, role: string) => {
  let whereClause: any = {};
  if (role === 'EMPLOYEE') {
    const employee = await prisma.employee.findUnique({ where: { userId } });
    if (!employee) throw new Error("Employee not found");
    whereClause.employeeId = employee.id;
  }
  
  whereClause.year = new Date().getFullYear();

  const records = await prisma.payroll.findMany({
    where: whereClause,
    orderBy: { month: 'asc' }
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Aggregate data if HR, else just map it for Employee
  const salaryTrend = months.map((m, i) => {
    const monthRecords = records.filter((r: any) => r.month === i + 1);
    return {
      month: m,
      netSalary: monthRecords.reduce((acc: number, curr: any) => acc + curr.netSalary, 0),
      grossSalary: monthRecords.reduce((acc: number, curr: any) => acc + curr.grossSalary, 0)
    };
  });

  const deductionTrend = months.map((m, i) => {
    const monthRecords = records.filter((r: any) => r.month === i + 1);
    return {
      month: m,
      tax: monthRecords.reduce((acc: number, curr: any) => acc + curr.incomeTax, 0),
      pf: monthRecords.reduce((acc: number, curr: any) => acc + curr.providentFund, 0),
      other: monthRecords.reduce((acc: number, curr: any) => acc + (curr.deductions - curr.incomeTax - curr.providentFund), 0)
    };
  });

  return { salaryTrend, deductionTrend };
};

export const createPayrollQuery = async (userId: string, data: any) => {
  const employee = await prisma.employee.findUnique({ where: { userId } });
  if (!employee) throw new Error("Employee not found");

  const query = await prisma.payrollQuery.create({
    data: {
      employeeId: employee.id,
      payrollId: data.payrollId || null,
      issueType: data.issueType,
      description: data.description,
      status: 'PENDING'
    }
  });

  return query;
};

export const getTimelineActivities = async (userId: string, role: string) => {
  // Mocking timeline activities based on database limits
  return [
    { id: 1, title: 'Salary Credited', description: 'Your salary for May 2026 was credited.', date: new Date().toISOString(), type: 'SUCCESS' },
    { id: 2, title: 'Payslip Generated', description: 'May 2026 payslip is available for download.', date: new Date(Date.now() - 86400000).toISOString(), type: 'INFO' },
    { id: 3, title: 'Bonus Processed', description: 'Annual performance bonus added to gross pay.', date: new Date(Date.now() - 172800000).toISOString(), type: 'WARNING' },
    { id: 4, title: 'Tax Config Updated', description: 'New tax regime selected for FY 26-27.', date: new Date(Date.now() - 259200000).toISOString(), type: 'INFO' },
  ];
};
