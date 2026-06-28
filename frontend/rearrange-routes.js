const fs = require('fs');
const path = require('path');

const dashboardDir = path.join(__dirname, 'src', 'app', 'dashboard');

// Folders to delete
const oldFolders = [
  'employees', 'departments', 'designations', 'organization-chart',
  'attendance/daily', 'attendance/history', 'attendance/shifts', 'attendance/holidays',
  'leave/requests', 'leave/types', 'leave/calendar',
  'payroll/salary', 'payroll/payslips', 'payroll/bonuses', 'payroll/deductions',
  'recruitment/candidates', 'recruitment/interviews', 'recruitment/jobs',
  'performance/goals', 'performance/reviews', 'performance/kpi',
  'documents/employee', 'documents/company',
  'reports/attendance', 'reports/leave', 'reports/payroll',
  'administration/users', 'administration/roles', 'administration/permissions', 'administration/settings',
  'attendance', 'leave', 'payroll', 'recruitment', 'performance', 'documents', 'reports', 'administration'
];

oldFolders.forEach(folder => {
  const fullPath = path.join(dashboardDir, folder);
  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { recursive: true, force: true });
    console.log(`Deleted: ${folder}`);
  }
});

// New pages to create
const newPages = {
  'employee-management': ['Employees', 'Departments', 'Designations', 'Organization Chart'],
  'attendance': ['Daily Attendance', 'Attendance History', 'Shift Management', 'Holidays'],
  'leave-management': ['Leave Requests', 'Leave Types', 'Leave Calendar'],
  'payroll': ['Salary', 'Payslips', 'Bonuses', 'Deductions'],
  'recruitment': ['Candidates', 'Interviews', 'Jobs'],
  'performance': ['Goals', 'Reviews', 'KPI'],
  'documents': ['Employee Documents', 'Company Documents'],
  'reports': ['Attendance Reports', 'Leave Reports', 'Payroll Reports'],
  'administration': ['Users', 'Roles', 'Permissions', 'Settings'],
};

Object.entries(newPages).forEach(([route, tabs]) => {
  const routePath = path.join(dashboardDir, route);
  fs.mkdirSync(routePath, { recursive: true });

  const title = route.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const content = `"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";

export default function ${title.replace(/\s+/g, '')}Page() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="${title}" 
        description="Manage and view ${title.toLowerCase()} data."
      />
      
      <Tabs defaultValue="${tabs[0].toLowerCase().replace(/\s+/g, '-')}" className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto w-fit max-w-full justify-start">
          {${JSON.stringify(tabs)}.map(tab => (
            <TabsTrigger key={tab} value={tab.toLowerCase().replace(/\\s+/g, '-')} className="whitespace-nowrap px-4 py-2">
              {t(tab)}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {${JSON.stringify(tabs)}.map(tab => (
          <TabsContent key={tab} value={tab.toLowerCase().replace(/\\s+/g, '-')}>
            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">{t("ID")}</TableHead>
                    <TableHead>{t("Name")}</TableHead>
                    <TableHead>{t("Status")}</TableHead>
                    <TableHead className="text-right">{t("Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* We will populate data here */}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4">
              <EmptyState 
                title="No records found" 
                description={\`There are no \${t(tab).toLowerCase()} available at the moment.\`}
                action={{ label: "Add New", onClick: () => {} }}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
`;

  fs.writeFileSync(path.join(routePath, 'page.tsx'), content);
  console.log(`Created route: ${route}`);
});
