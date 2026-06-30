import { Metadata } from 'next';
import { PayrollManagementClient } from '../payslips/components/PayrollManagementClient';

export const metadata: Metadata = {
  title: 'Payroll Administration - HRMS',
  description: 'Manage employee payroll, process salaries, and review payroll history.',
};

export default function PayrollAdminPage() {
  return <PayrollManagementClient />;
}
