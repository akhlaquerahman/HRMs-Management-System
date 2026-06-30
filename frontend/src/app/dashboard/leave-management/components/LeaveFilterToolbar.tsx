"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, RefreshCw, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LeaveFilterToolbarProps {
  onSearch: (val: string) => void;
  onFilterChange: (key: string, val: string) => void;
  onReset: () => void;
  onExport: () => void;
  showEmployeeFilter?: boolean;
}

export function LeaveFilterToolbar({ 
  onSearch, 
  onFilterChange, 
  onReset, 
  onExport,
  showEmployeeFilter = false
}: LeaveFilterToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 p-4 bg-card border rounded-xl shadow-sm md:flex-row md:items-center md:justify-between">
      
      <div className="flex flex-1 items-center gap-3 flex-wrap lg:flex-nowrap">
        <div className="relative w-full lg:w-56 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t("Search by ID or Reason...")} 
            className="pl-9 h-10"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <Select onValueChange={(val) => onFilterChange('status', val)} defaultValue="ALL">
          <SelectTrigger className="w-[140px] h-10">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder={t("Status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("All Statuses")}</SelectItem>
            <SelectItem value="PENDING">{t("Pending")}</SelectItem>
            <SelectItem value="APPROVED">{t("Approved")}</SelectItem>
            <SelectItem value="REJECTED">{t("Rejected")}</SelectItem>
            <SelectItem value="CANCELLED">{t("Cancelled")}</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(val) => onFilterChange('leaveType', val)} defaultValue="ALL">
          <SelectTrigger className="w-[160px] h-10">
            <SelectValue placeholder={t("Leave Type")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("All Types")}</SelectItem>
            <SelectItem value="SICK">{t("Sick Leave")}</SelectItem>
            <SelectItem value="CASUAL">{t("Casual Leave")}</SelectItem>
            <SelectItem value="ANNUAL">{t("Annual Leave")}</SelectItem>
            <SelectItem value="EARNED">{t("Earned Leave")}</SelectItem>
            <SelectItem value="MATERNITY">{t("Maternity Leave")}</SelectItem>
            <SelectItem value="UNPAID">{t("Unpaid Leave")}</SelectItem>
          </SelectContent>
        </Select>

        {showEmployeeFilter && (
          <Select onValueChange={(val) => onFilterChange('department', val)} defaultValue="ALL">
            <SelectTrigger className="w-[160px] h-10">
              <SelectValue placeholder={t("Department")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("All Departments")}</SelectItem>
              <SelectItem value="HR">{t("HR")}</SelectItem>
              <SelectItem value="Engineering">{t("Engineering")}</SelectItem>
              <SelectItem value="Sales">{t("Sales")}</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button variant="outline" size="sm" className="h-10 px-4" onClick={onReset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {t("Reset")}
        </Button>
        <Button variant="outline" size="sm" className="h-10 px-4" onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />
          {t("Export")}
        </Button>
      </div>

    </div>
  );
}
