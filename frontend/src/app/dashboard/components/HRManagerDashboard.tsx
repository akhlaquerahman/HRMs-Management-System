"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, UserCheck, CalendarDays, AlertCircle, Briefcase, Gift, Award, UserPlus } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { AIInsightsCard } from '@/components/dashboard/AIInsightsCard';
import { CompanyAnnouncements } from '@/components/dashboard/CompanyAnnouncements';
import { PendingTasks } from '@/components/dashboard/PendingTasks';
import { DashboardDataTable } from '@/components/dashboard/DashboardDataTable';
import {
  PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function HRManagerDashboard({ stats }: { stats: any }) {
  const { t } = useTranslation();

  const deptColumns = [
    { header: "Department", accessor: "department" },
    { header: "Present", accessor: "present", className: "text-green-600 font-medium" },
    { header: "Absent", accessor: "absent", className: "text-red-600 font-medium" },
    { header: "On Leave", accessor: "onLeave", className: "text-orange-600 font-medium" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 4-Column KPI Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-6 xl:grid-cols-6">
        {stats?.metrics?.map((metric: any, i: number) => {
          let icon = Users;
          let color = "text-blue-600";
          let bg = "bg-blue-100";
          let cardBg = "bg-blue-50/50";
          
          if (metric.title.includes('Present')) { icon = UserCheck; color = "text-green-600"; bg = "bg-green-100"; cardBg = "bg-green-50/50"; }
          if (metric.title.includes('Leave')) { icon = CalendarDays; color = "text-orange-600"; bg = "bg-orange-100"; cardBg = "bg-orange-50/50"; }
          if (metric.title.includes('Pending')) { icon = AlertCircle; color = "text-red-600"; bg = "bg-red-100"; cardBg = "bg-red-50/50"; }
          if (metric.title.includes('Recruitment')) { icon = Briefcase; color = "text-purple-600"; bg = "bg-purple-100"; cardBg = "bg-purple-50/50"; }
          if (metric.title.includes('Rate')) { icon = UserCheck; color = "text-emerald-600"; bg = "bg-emerald-100"; cardBg = "bg-emerald-50/50"; }

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
            <PendingTasks tasks={stats?.pendingTasks || []} />
          </div>

          <div className="grid gap-6 md:grid-cols-2 h-[400px]">
            <DashboardDataTable 
              title="Department Attendance Summary" 
              data={stats?.deptAttendance || []} 
              columns={deptColumns}
            />
            
            <div className="rounded-xl border bg-card shadow-sm p-6 flex flex-col">
              <h3 className="text-lg font-semibold mb-4 text-primary">Recruitment Pipeline</h3>
              <div className="flex-1 flex flex-col gap-4 justify-center">
                {stats?.pipeline?.map((stage: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium">{stage.stage}</div>
                    <div className="flex-1 bg-muted rounded-full h-3">
                      <div 
                        className="bg-primary h-3 rounded-full" 
                        style={{ width: `${Math.max(10, (stage.count / (stats?.pipeline?.[0]?.count || 1)) * 100)}%` }}
                      />
                    </div>
                    <div className="w-8 text-right font-bold text-sm">{stage.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 h-[350px]">
            <div className="rounded-xl border bg-card shadow-sm p-6 flex flex-col">
              <h3 className="text-lg font-semibold mb-4 text-primary">Department Distribution</h3>
              <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart style={{ outline: 'none' }}>
                    <Pie
                      data={stats?.pieChartData}
                      cx="50%" cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {stats?.pieChartData?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm p-6 flex flex-col">
              <h3 className="text-lg font-semibold mb-4 text-primary">Hiring Funnel (Trend)</h3>
              <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.barChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" fill="#00C49F" radius={[4, 4, 0, 0]}>
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

          {/* Celebrations Widget */}
          <div className="rounded-xl border bg-card shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-pink-500" />
              {t("Celebrations")}
            </h3>
            
            <div className="flex flex-col gap-4">
              {stats?.upcomingBirthdays?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Birthdays</span>
                  {stats.upcomingBirthdays.map((emp: any) => (
                    <div key={emp.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xs">
                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(emp.dob), 'MMM dd')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {stats?.workAnniversaries?.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Work Anniversaries</span>
                  {stats.workAnniversaries.map((emp: any) => (
                    <div key={emp.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-muted-foreground">Joined {format(new Date(emp.joiningDate), 'MMM yyyy')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!stats?.upcomingBirthdays?.length && !stats?.workAnniversaries?.length && (
                <p className="text-sm text-muted-foreground italic">No upcoming celebrations.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <QuickActionCard 
                title="Add Employee" 
                icon={UserPlus} 
                onClick={() => window.location.href = '/dashboard/employee-management'} 
              />
              <QuickActionCard 
                title="Approvals" 
                icon={AlertCircle} 
                onClick={() => window.location.href = '/dashboard/leave-management'} 
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
