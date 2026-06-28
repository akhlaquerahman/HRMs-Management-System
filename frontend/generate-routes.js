const fs = require('fs');
const path = require('path');

const routes = [
  'employees',
  'departments',
  'designations',
  'organization-chart',
  'attendance/daily',
  'attendance/history',
  'attendance/shifts',
  'attendance/holidays',
  'leave/requests',
  'leave/types',
  'leave/calendar',
  'payroll/salary',
  'payroll/payslips',
  'payroll/bonuses',
  'payroll/deductions',
  'recruitment/candidates',
  'recruitment/interviews',
  'recruitment/jobs',
  'performance/goals',
  'performance/reviews',
  'performance/kpi',
  'documents/employee',
  'documents/company',
  'reports/attendance',
  'reports/leave',
  'reports/payroll',
  'administration/users',
  'administration/roles',
  'administration/permissions',
  'administration/settings',
];

const basePath = path.join(__dirname, 'src', 'app', 'dashboard');

routes.forEach(route => {
  const routePath = path.join(basePath, route);
  fs.mkdirSync(routePath, { recursive: true });

  const pageName = route.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const title = route.split('/').map(r => r.charAt(0).toUpperCase() + r.slice(1).replace(/-/g, ' ')).join(' ');

  const content = `"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslation } from "react-i18next";

export default function ${pageName.replace(/\s+/g, '')}Page() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="${title}" 
        description="Manage and view ${title.toLowerCase()}."
      />
      
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

      <EmptyState 
        title="No records found" 
        description="There are no ${title.toLowerCase()} available at the moment."
        action={{ label: "Add New", onClick: () => {} }}
      />
    </div>
  );
}
`;

  fs.writeFileSync(path.join(routePath, 'page.tsx'), content);
  console.log(`Created route: ${route}`);
});
