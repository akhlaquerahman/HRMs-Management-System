"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Megaphone, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  author?: { firstName: string; lastName: string; }
}

interface CompanyAnnouncementsProps {
  announcements: Announcement[];
  loading?: boolean;
}

export function CompanyAnnouncements({ announcements, loading }: CompanyAnnouncementsProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          {t('Company Announcements')}
        </h3>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar flex-1">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="flex flex-col gap-2 p-3 rounded-lg bg-muted/20 animate-pulse border">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-full mt-2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          ))
        ) : announcements?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground h-full">
            <Megaphone className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">{t('No active announcements.')}</p>
          </div>
        ) : (
          announcements?.map(announcement => (
            <div key={announcement.id} className="flex flex-col gap-2 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <h4 className="font-medium text-sm leading-tight text-foreground">
                  {announcement.title}
                </h4>
                {announcement.type === 'URGENT' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 shrink-0">
                    URGENT
                  </span>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-2">
                {announcement.content}
              </p>
              
              <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(announcement.createdAt), 'MMM dd, yyyy')}</span>
                {announcement.author && (
                  <>
                    <span>•</span>
                    <span>{announcement.author.firstName} {announcement.author.lastName}</span>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
