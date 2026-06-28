import React from 'react';
import { cn } from "@/lib/utils";
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  cardBgClass?: string;
  trend?: string;
  subtitle?: string;
}

export function KPICard({ title, value, icon: Icon, colorClass, bgClass, cardBgClass = "bg-card", trend, subtitle }: KPICardProps) {
  return (
    <div className={cn("rounded-xl border shadow-sm p-4 flex flex-col justify-between hover:border-primary/50 transition-colors cursor-default flex-1 overflow-hidden", cardBgClass)}>
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{title}</span>
        <div className={cn("p-2 rounded-md shrink-0 ml-2", bgClass, colorClass)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
        {trend && <p className="text-xs text-muted-foreground mt-1 truncate">{trend}</p>}
        {subtitle && <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>}
      </div>
    </div>
  );
}
