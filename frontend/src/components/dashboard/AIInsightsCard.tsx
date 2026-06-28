"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Insight {
  id: string;
  type: 'POSITIVE' | 'WARNING' | 'INFO';
  message: string;
}

interface AIInsightsCardProps {
  insights: Insight[];
  loading?: boolean;
}

export function AIInsightsCard({ insights, loading }: AIInsightsCardProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border bg-gradient-to-br from-card to-card/50 shadow-sm p-6 flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
        <Sparkles className="w-24 h-24 text-primary" />
      </div>
      
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          {t('AI Insights')}
        </h3>
      </div>

      <div className="flex flex-col gap-3 relative z-10">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 animate-pulse">
              <div className="w-5 h-5 rounded-full bg-muted shrink-0" />
              <div className="h-4 bg-muted rounded w-full mt-0.5" />
            </div>
          ))
        ) : insights.length === 0 ? (
          <div className="text-sm text-muted-foreground italic p-4 text-center">
            {t('No new insights generated yet.')}
          </div>
        ) : (
          insights.map(insight => {
            let Icon = Info;
            let color = "text-blue-500";
            let bg = "bg-blue-500/10";
            let border = "border-blue-500/20";
            
            if (insight.type === 'POSITIVE') {
              Icon = TrendingUp;
              color = "text-green-500";
              bg = "bg-green-500/10";
              border = "border-green-500/20";
            } else if (insight.type === 'WARNING') {
              Icon = AlertCircle;
              color = "text-amber-500";
              bg = "bg-amber-500/10";
              border = "border-amber-500/20";
            }

            return (
              <div key={insight.id} className={cn("flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/30", bg, border)}>
                <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", color)} />
                <p className="text-sm font-medium leading-tight">
                  {t(insight.message)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
