"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { UserPlus, UploadCloud, Download, FileBarChart } from 'lucide-react';

import { WorkforceKPICards } from './WorkforceKPICards';
import { WorkforceInsightsStrip } from './WorkforceInsightsStrip';
import { AdvancedFilterToolbar } from './AdvancedFilterToolbar';
import { EmployeeTable } from './EmployeeTable';
import { EmployeeProfileDrawer } from './EmployeeProfileDrawer';
import { WorkforceAnalytics } from './WorkforceAnalytics';
import { QuickActionsPanel } from './QuickActionsPanel';
import { AddEmployeeModal } from './AddEmployeeModal';

export function WorkforceManagementClient() {
  const { t } = useTranslation();
  const user = useAuthStore(state => state.user);

  const [filters, setFilters] = useState({ search: '', department: 'ALL', designation: 'ALL', status: 'ALL', employmentType: 'ALL' });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['workforceDashboard'],
    queryFn: async () => (await api.get('/employees/dashboard')).data.data
  });

  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['workforceAnalytics'],
    queryFn: async () => (await api.get('/employees/analytics')).data.data
  });

  const { data: employeesData, isLoading: isTableLoading } = useQuery({
    queryKey: ['workforceEmployees', filters],
    queryFn: async () => {
      const res = await api.get('/employees', { params: filters });
      return res.data.data;
    }
  });

  const handleFilterChange = (key: string, val: string) => setFilters(p => ({ ...p, [key]: val }));
  const handleResetFilters = () => setFilters({ search: '', department: 'ALL', designation: 'ALL', status: 'ALL', employmentType: 'ALL' });

  const handleOpenProfile = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t("Employee Management")} 
        subtitle={t("Manage your workforce, employee lifecycle, onboarding, departments and employment records.")}
        showCreate={false}
        showSearch={false}
        actionButton={
          <div className="flex gap-2">
            <Button variant="outline"><UploadCloud className="w-4 h-4 mr-2" />Bulk Import</Button>
            <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button>
            <Button variant="outline"><FileBarChart className="w-4 h-4 mr-2" />Report</Button>
            <Button onClick={() => setIsAddModalOpen(true)}><UserPlus className="w-4 h-4 mr-2" />Add Employee</Button>
          </div>
        }
      />

      <WorkforceKPICards data={dashboardData} loading={isDashboardLoading} />

      <AdvancedFilterToolbar filters={filters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />

      <div className="grid grid-cols-1 gap-6">
        <div className="lg:col-span-9 space-y-6">
          <EmployeeTable 
            data={employeesData} 
            loading={isTableLoading} 
            onOpenProfile={handleOpenProfile} 
          />
        </div>
      </div>

      {selectedEmployeeId && (
        <EmployeeProfileDrawer
          employeeId={selectedEmployeeId}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setTimeout(() => setSelectedEmployeeId(null), 300);
          }}
        />
      )}

      <AddEmployeeModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
