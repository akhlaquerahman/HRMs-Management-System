"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { UserPlus, UploadCloud, Download, FileBarChart, FileText, Plus } from 'lucide-react';

import { WorkforceKPICards } from './WorkforceKPICards';
import { AdvancedFilterToolbar } from './AdvancedFilterToolbar';
import { EmployeeTable } from './EmployeeTable';
import { EmployeeProfileDrawer } from './EmployeeProfileDrawer';
import { AddEmployeeModal } from './AddEmployeeModal';
import { EditEmployeeModal } from "./EditEmployeeModal";
import { BulkImportEmployeeModal } from "./BulkImportEmployeeModal";

export function WorkforceManagementClient() {
  const { t } = useTranslation();
  const user = useAuthStore(state => state.user);

  const [filters, setFilters] = useState({ search: '', department: 'ALL', designation: 'ALL', status: 'ALL', employmentType: 'ALL' });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['workforceDashboard'],
    queryFn: async () => (await api.get('/employees/dashboard')).data.data
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
        description={t("Manage your workforce, employee lifecycle, onboarding, departments and employment records.")}
        showCreate={false}
        showSearch={false}
        actionButton={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-2 bg-white p-1 rounded-lg border">
              <Button variant="outline" onClick={() => setIsBulkImportModalOpen(true)}><UploadCloud className="w-4 h-4 mr-2" />{t("Bulk Import")}</Button>
              <Button variant="outline"><Download className="w-4 h-4 mr-2" />{t("Export")}</Button>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              {t("Add Employee")}
            </Button>
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
            onEditEmployee={(emp: any) => {
              setEmployeeToEdit(emp);
              setIsEditModalOpen(true);
            }}
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
      {employeeToEdit && (
        <EditEmployeeModal 
          isOpen={isEditModalOpen} 
          onClose={() => {
            setIsEditModalOpen(false);
            setTimeout(() => setEmployeeToEdit(null), 300);
          }} 
          employee={employeeToEdit} 
        />
      )}
      <BulkImportEmployeeModal isOpen={isBulkImportModalOpen} onClose={() => setIsBulkImportModalOpen(false)} />
    </div>
  );
}
