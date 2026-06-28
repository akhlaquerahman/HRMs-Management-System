"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { BriefcaseMedical, CalendarDays, Plane, Award, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaveBalanceCardsProps {
  balances: any;
  loading?: boolean;
}

export function LeaveBalanceCards({ balances, loading }: LeaveBalanceCardsProps) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4 animate-pulse flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-muted" />
              <div className="w-1/2 h-4 rounded bg-muted" />
            </div>
            <div className="w-full h-2 rounded bg-muted mt-2" />
            <div className="w-1/3 h-3 rounded bg-muted self-end" />
          </div>
        ))}
      </div>
    );
  }

  // Define total quotas (in real app these might come from policy)
  const quotas = {
    annual: 18,
    casual: 8,
    medical: 10,
    earned: 5,
    compOff: balances?.compOff || 0 // Comp off usually accrued dynamically
  };

  const cards = [
    { title: 'Annual Leave', icon: Plane, remaining: balances?.annual, total: quotas.annual, color: 'bg-emerald-500' },
    { title: 'Casual Leave', icon: CalendarDays, remaining: balances?.casual, total: quotas.casual, color: 'bg-blue-500' },
    { title: 'Medical Leave', icon: BriefcaseMedical, remaining: balances?.medical, total: quotas.medical, color: 'bg-rose-500' },
    { title: 'Earned Leave', icon: Award, remaining: balances?.earned, total: quotas.earned, color: 'bg-amber-500' },
    { title: 'Comp Off', icon: Building, remaining: balances?.compOff, total: quotas.compOff, color: 'bg-indigo-500', isDynamic: true }
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const percentage = card.isDynamic ? 100 : Math.max(0, Math.min(100, (card.remaining / card.total) * 100));
        
        return (
          <div key={i} className="rounded-xl border bg-card shadow-sm p-4 flex flex-col justify-between hover:border-primary/20 transition-colors group">
            <div className="flex items-center gap-2 mb-4">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-muted/50 group-hover:bg-card transition-colors")}>
                <Icon className={cn("w-4 h-4", card.color.replace('bg-', 'text-'))} />
              </div>
              <h4 className="text-sm font-semibold text-foreground truncate">{t(card.title)}</h4>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">{card.remaining}</span>
                {!card.isDynamic && <span className="text-xs text-muted-foreground">/ {card.total} {t('Remaining')}</span>}
                {card.isDynamic && <span className="text-xs text-muted-foreground">{t('Available')}</span>}
              </div>
              
              {!card.isDynamic && (
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", card.color)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
