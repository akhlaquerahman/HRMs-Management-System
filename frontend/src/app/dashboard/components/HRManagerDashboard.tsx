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
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Dynamically import the chart wrappers to drastically reduce initial bundle size,
// while preserving proper Recharts child-element typing so colors work correctly.
const DepartmentPieChart = dynamic(
  () => import('./DashboardCharts').then(mod => mod.DepartmentPieChart),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-100 w-full h-full rounded-md" /> }
);
const HiringBarChart = dynamic(
  () => import('./DashboardCharts').then(mod => mod.HiringBarChart),
  { ssr: false, loading: () => <div className="animate-pulse bg-gray-100 w-full h-full rounded-md" /> }
);

export function HRManagerDashboard({ stats, trendFilter, setTrendFilter }: { stats: any, trendFilter?: string, setTrendFilter?: (val: string) => void }) {
  const { t } = useTranslation();

  const totalEmployees = stats?.pieChartData?.reduce((acc: number, curr: any) => acc + curr.value, 0) || 0;

  const deptColumns = [
    { header: t("Department"), accessor: "department" },
    { header: t("Present"), accessor: "present", className: "text-green-600 font-medium" },
    { header: t("Absent"), accessor: "absent", className: "text-red-600 font-medium" },
    { header: t("On Leave"), accessor: "onLeave", className: "text-orange-600 font-medium" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 4-Column KPI Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
          
          <div className="grid gap-6 md:grid-cols-2 h-[350px]">
            <div className="rounded-xl border bg-card shadow-sm p-6 flex flex-col">
              <h3 className="text-lg font-semibold mb-4 text-primary">{t("Department Distribution")}</h3>
              <div className="flex-1 w-full min-h-[200px]">
                <DepartmentPieChart data={stats?.pieChartData || []} totalEmployees={totalEmployees} />
              </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary">{t("Hiring Funnel (Trend)")}</h3>
                {setTrendFilter && (
                  <select 
                    value={trendFilter} 
                    onChange={(e) => setTrendFilter(e.target.value)}
                    className="text-xs border rounded-md px-2 py-1 bg-background text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="7d">{t("This Week")}</option>
                    <option value="30d">{t("This Month")}</option>
                    <option value="1y">{t("This Year")}</option>
                  </select>
                )}
              </div>
              <div className="flex-1 w-full min-h-[200px]">
                <HiringBarChart data={stats?.barChartData || []} />
              </div>
            </div>
          </div>

          <div className="h-[400px]">
            <DashboardDataTable 
              title={t("Department Attendance Summary")} 
              data={stats?.deptAttendance || []} 
              columns={deptColumns}
            />
        
          </div>

        </div>

        {/* Right Sidebar Column (Takes up 4 columns out of 12) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Celebrations Widget */}
          <div className="rounded-xl border bg-card shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-pink-500" />
              {t("Celebrations")}
            </h3>
            
            <div className="flex flex-col gap-4">
              {stats?.upcomingBirthdays?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">{t("Birthdays")}</span>
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
                  <span className="text-xs font-semibold text-muted-foreground uppercase">{t("Work Anniversaries")}</span>
                  {stats.workAnniversaries.map((emp: any) => (
                    <div key={emp.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-muted-foreground">{t("Joined")} {format(new Date(emp.joiningDate), 'MMM yyyy')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!stats?.upcomingBirthdays?.length && !stats?.workAnniversaries?.length && (
                <p className="text-sm text-muted-foreground italic">{t("No upcoming celebrations.")}</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">{t("Quick Actions")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <QuickActionCard 
                title={t("Add Employee")} 
                icon={UserPlus} 
                onClick={() => window.location.href = '/dashboard/employee-management'} 
              />
              <QuickActionCard 
                title={t("Approvals")} 
                icon={AlertCircle} 
                onClick={() => window.location.href = '/dashboard/leave-management'} 
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">{t("Recent Activities")}</h3>
            <ActivityTimeline activities={stats?.recentActivities || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
