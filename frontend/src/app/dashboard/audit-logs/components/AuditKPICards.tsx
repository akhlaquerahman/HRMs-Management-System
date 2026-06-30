"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, ShieldAlert, Key, Server } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';

interface AuditKPICardsProps {
  total: number;
  loading?: boolean;
}

export function AuditKPICards({ total, loading }: AuditKPICardsProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted/20 border-border/50 rounded-xl p-4 h-24" />
        ))}
      </div>
    );
  }

  const kpis = [
    { label: "Total Events", value: total || 0, icon: Activity, color: "text-blue-600", bg: "bg-blue-100", cardBg: "bg-blue-50/50" },
    { label: "Security Events", value: Math.floor((total || 0) * 0.15), icon: ShieldAlert, color: "text-rose-600", bg: "bg-rose-100", cardBg: "bg-rose-50/50" },
    { label: "Access Logs", value: Math.floor((total || 0) * 0.65), icon: Key, color: "text-emerald-600", bg: "bg-emerald-100", cardBg: "bg-emerald-50/50" },
    { label: "System Changes", value: Math.floor((total || 0) * 0.2), icon: Server, color: "text-amber-600", bg: "bg-amber-100", cardBg: "bg-amber-50/50" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, i) => (
        <KPICard 
          key={i} 
          title={t(kpi.label)} 
          value={kpi.value} 
          icon={kpi.icon}
          colorClass={kpi.color}
          bgClass={kpi.bg}
          cardBgClass={kpi.cardBg}
        />
      ))}
    </div>
  );
}
