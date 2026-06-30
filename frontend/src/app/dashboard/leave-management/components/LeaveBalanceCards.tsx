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
    { title: 'Casual Leave', icon: CalendarDays, remaining: balances?.casual, total: quotas.casual, color: 'text-blue-600', bg: 'bg-blue-100', cardBg: 'bg-blue-50/50' },
    { title: 'Medical Leave', icon: BriefcaseMedical, remaining: balances?.medical, total: quotas.medical, color: 'text-rose-600', bg: 'bg-rose-100', cardBg: 'bg-rose-50/50' },
    { title: 'Earned Leave', icon: Award, remaining: balances?.earned, total: quotas.earned, color: 'text-amber-600', bg: 'bg-amber-100', cardBg: 'bg-amber-50/50' },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3 h-full">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const percentage = Math.max(0, Math.min(100, (card.remaining / card.total) * 100));
        
        return (
          <div key={i} className={cn("rounded-xl border shadow-sm p-4 flex flex-col justify-between hover:border-primary/50 transition-colors cursor-default flex-1 overflow-hidden", card.cardBg)}>
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{t(card.title)}</span>
              <div className={cn("p-2 rounded-md shrink-0 ml-2", card.bg, card.color)}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-foreground">{card.remaining}</span>
                <span className="text-xs text-muted-foreground">/ {card.total} {t('Remaining')}</span>
              </div>
              
              <div className="w-full bg-white rounded-full h-1.5 overflow-hidden shadow-inner">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000", (card as any).progressBg || card.color.replace('text-', 'bg-').replace('600', '500'))}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
