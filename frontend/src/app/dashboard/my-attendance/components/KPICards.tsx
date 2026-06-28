"use client";

import { Clock, UserCheck, UserX, AlertCircle, CalendarRange, Timer } from 'lucide-react';
import { cn } from "@/lib/utils";

export function KPICards({ summaryData, summaryLoading }: { summaryData: any, summaryLoading: boolean }) {
  if (summaryLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-[120px] bg-card rounded-xl border shadow-sm animate-pulse" />
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Present Days",
      value: summaryData?.presentDays || 0,
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-100",
      cardBg: "bg-green-50/50 dark:bg-green-950/20",
      trend: "+2% vs last month"
    },
    {
      title: "Absent Days",
      value: summaryData?.absentDays || 0,
      icon: UserX,
      color: "text-red-600",
      bg: "bg-red-100",
      cardBg: "bg-red-50/50 dark:bg-red-950/20",
      trend: "-1% vs last month"
    },
    {
      title: "Late Arrivals",
      value: summaryData?.lateArrivals || 0,
      icon: AlertCircle,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      cardBg: "bg-yellow-50/50 dark:bg-yellow-950/20",
      trend: "Same as last month"
    },
    {
      title: "Working Hours",
      value: `${summaryData?.totalWorkingHours || 0}h`,
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-100",
      cardBg: "bg-blue-50/50 dark:bg-blue-950/20",
      trend: "+5h vs last month"
    },
    {
      title: "Overtime",
      value: `${summaryData?.totalOvertimeHours || 0}h`,
      icon: Timer,
      color: "text-purple-600",
      bg: "bg-purple-100",
      cardBg: "bg-purple-50/50 dark:bg-purple-950/20",
      trend: "-2h vs last month"
    },
    {
      title: "Remaining Leaves",
      value: summaryData?.remainingLeaves || 12,
      icon: CalendarRange,
      color: "text-orange-600",
      bg: "bg-orange-100",
      cardBg: "bg-orange-50/50 dark:bg-orange-950/20",
      trend: "Total 12 annual"
    }
  ];

  return (
    <div className="flex overflow-x-auto gap-4 pb-2 snap-x hide-scrollbar">
      {kpis.map((kpi, idx) => (
        <div key={idx} className={cn("rounded-xl border shadow-sm p-4 flex flex-col justify-between hover:border-primary/50 transition-colors cursor-default min-w-[200px] flex-1 snap-start shrink-0", kpi.cardBg)}>
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{kpi.title}</span>
            <div className={cn("p-2 rounded-md shrink-0 ml-2", kpi.bg, kpi.color)}>
              <kpi.icon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-foreground">{kpi.value}</h3>
            <p className="text-xs text-muted-foreground mt-1 truncate">{kpi.trend}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
