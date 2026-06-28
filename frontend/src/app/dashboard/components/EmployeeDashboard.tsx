"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { LogIn, CalendarCheck, Clock, FileText, CalendarDays, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { AIInsightsCard } from '@/components/dashboard/AIInsightsCard';
import { CompanyAnnouncements } from '@/components/dashboard/CompanyAnnouncements';
import { UpcomingHolidays } from '@/components/dashboard/UpcomingHolidays';
import { PendingTasks } from '@/components/dashboard/PendingTasks';
import { DashboardDataTable } from '@/components/dashboard/DashboardDataTable';
import {
  PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function EmployeeDashboard({ stats }: { stats: any }) {
  const { t } = useTranslation();

  const attendanceColumns = [
    { header: "Date", accessor: (row: any) => format(new Date(row.date), 'MMM dd, yyyy') },
    { header: "Status", accessor: (row: any) => (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${
        row.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
        row.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
        'bg-yellow-100 text-yellow-700'
      }`}>
        {row.status}
      </span>
    )},
    { header: "Hours", accessor: (row: any) => `${row.effectiveHours || 0}h` },
    { header: "Late", accessor: (row: any) => row.isLate ? 'Yes' : 'No' }
  ];

  const payslipColumns = [
    { header: "Month", accessor: (row: any) => `${row.month}/${row.year}` },
    { header: "Net Salary", accessor: (row: any) => `$${row.netSalary?.toLocaleString() || 0}` },
    { header: "Status", accessor: (row: any) => row.status }
  ];

  const documentColumns = [
    { header: "Document", accessor: "documentType" },
    { header: "Status", accessor: (row: any) => (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${
        row.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
        row.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
        'bg-yellow-100 text-yellow-700'
      }`}>
        {row.verificationStatus}
      </span>
    )}
  ];

  // Map pending corrections/leaves for the tasks widget if needed
  const pendingItems = [
    ...(stats?.pendingCorrections || []).map((c: any) => ({ ...c, type: 'CORRECTION', title: 'Correction Request' })),
    ...(stats?.pendingLeaves || []).map((l: any) => ({ ...l, type: 'LEAVE', title: 'Leave Request' }))
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 4-Column KPI Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6">
        {stats?.metrics?.map((metric: any, i: number) => {
          let icon = CalendarCheck;
          let color = "text-blue-600";
          let bg = "bg-blue-100";
          let cardBg = "bg-blue-50/50";
          
          if (metric.title.includes('Status')) { icon = LogIn; color = "text-green-600"; bg = "bg-green-100"; cardBg = "bg-green-50/50"; }
          if (metric.title.includes('Leave')) { icon = CalendarDays; color = "text-orange-600"; bg = "bg-orange-100"; cardBg = "bg-orange-50/50"; }
          if (metric.title.includes('Holiday')) { icon = Clock; color = "text-purple-600"; bg = "bg-purple-100"; cardBg = "bg-purple-50/50"; }
          if (metric.title.includes('%')) { icon = TrendingUp; color = "text-emerald-600"; bg = "bg-emerald-100"; cardBg = "bg-emerald-50/50"; }
          if (metric.title.includes('Hours')) { icon = Clock; color = "text-indigo-600"; bg = "bg-indigo-100"; cardBg = "bg-indigo-50/50"; }

          return (
            <KPICard 
              key={i} 
              title={t(metric.title)} 
              value={metric.value} 
              trend={metric.trend}
              icon={icon}
              colorClass={color}
              bgClass={bg}
              cardBgClass={cardBg}
            />
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Left Column (Takes up 8 columns out of 12) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="grid gap-6 md:grid-cols-2">
            <AIInsightsCard insights={stats?.insights || []} />
            
            <div className="rounded-xl border bg-card shadow-sm p-6 flex flex-col justify-center">
              <h3 className="text-lg font-semibold mb-2 text-primary flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Profile Completion
              </h3>
              <div className="w-full bg-muted rounded-full h-4 mt-4">
                <div 
                  className="bg-primary h-4 rounded-full transition-all duration-1000 relative" 
                  style={{ width: `${stats?.profileCompletion || 0}%` }}
                >
                  <span className="absolute right-2 top-0 text-[10px] text-white font-bold leading-4">
                    {stats?.profileCompletion || 0}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {stats?.profileCompletion < 100 
                  ? "Please complete your profile to unlock all features." 
                  : "Your profile is fully complete. Great job!"}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 h-[400px]">
            <DashboardDataTable 
              title="Attendance History (Last 7 Days)" 
              data={stats?.attendanceHistory || []} 
              columns={attendanceColumns}
            />
            <DashboardDataTable 
              title="Recent Payslips" 
              data={stats?.recentPayslips || []} 
              columns={payslipColumns}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 h-[350px]">
            <DashboardDataTable 
              title="Assigned Documents" 
              data={stats?.assignedDocuments || []} 
              columns={documentColumns}
            />
            <div className="rounded-xl border bg-card shadow-sm p-6 flex flex-col">
              <h3 className="text-lg font-semibold mb-4 text-primary">Working Hours Trend</h3>
              <div className="h-full w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.barChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                      {stats?.barChartData?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>

        {/* Right Sidebar Column (Takes up 4 columns out of 12) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <CompanyAnnouncements announcements={stats?.announcements || []} />
          
          <UpcomingHolidays holidays={stats?.holidays || []} />

          <div className="rounded-xl border bg-card shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <QuickActionCard 
                title="Apply Leave" 
                icon={CalendarCheck} 
                onClick={() => window.location.href = '/dashboard/leave-request'} 
              />
              <QuickActionCard 
                title="My Documents" 
                icon={FileText} 
                onClick={() => window.location.href = '/dashboard/my-documents'} 
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
            <ActivityTimeline activities={stats?.recentActivities || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
