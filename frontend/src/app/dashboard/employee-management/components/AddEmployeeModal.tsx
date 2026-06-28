import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';

export function AddEmployeeModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    employeeId: '',
    departmentId: '',
    designationId: '',
    joiningDate: new Date().toISOString().split('T')[0],
    employmentType: 'FULL_TIME',
    baseSalary: '',
  });

  // Fetch meta data
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => (await api.get('/departments')).data.data
  });
  const { data: designations } = useQuery({
    queryKey: ['designations'],
    queryFn: async () => (await api.get('/designations')).data.data
  });

  // Auto fill employee ID on open
  useEffect(() => {
    if (isOpen) {
      const randomId = `EMP-${Math.floor(Math.random() * 9000) + 1000}`;
      setFormData(prev => ({ ...prev, employeeId: randomId }));
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createEmployee = useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/employees', data);
    },
    onSuccess: () => {
      toast.success(t('Employee added successfully'));
      queryClient.invalidateQueries({ queryKey: ['workforceEmployees'] });
      queryClient.invalidateQueries({ queryKey: ['workforceDashboard'] });
      onClose();
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        employeeId: '',
        departmentId: '',
        designationId: '',
        joiningDate: new Date().toISOString().split('T')[0],
        employmentType: 'FULL_TIME',
        baseSalary: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.employeeId || !formData.password) {
      return toast.error(t("Please fill all required fields."));
    }
    
    // Ensure date is properly formatted
    const payload = {
      ...formData,
      joiningDate: new Date(formData.joiningDate).toISOString(),
      baseSalary: formData.baseSalary ? parseFloat(formData.baseSalary) : 0,
    };
    
    createEmployee.mutate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("Add New Employee")}</DialogTitle>
          <DialogDescription>
            {t("Create a new employee profile and set up their login credentials.")}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t("First Name")} *</Label>
              <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t("Last Name")} *</Label>
              <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" required />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("Email Address")} *</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john.doe@company.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("Temporary Password")} *</Label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">{t("Employee ID")} *</Label>
              <Input id="employeeId" name="employeeId" value={formData.employeeId} onChange={handleChange} placeholder="EMP-001" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="joiningDate">{t("Joining Date")} *</Label>
              <Input id="joiningDate" name="joiningDate" type="date" value={formData.joiningDate} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseSalary">{t("Base Salary (Annual CTC)")}</Label>
              <Input id="baseSalary" name="baseSalary" type="number" min="0" step="0.01" value={formData.baseSalary} onChange={handleChange} placeholder="e.g. 500000" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departmentId">{t("Department")}</Label>
              <select 
                id="departmentId" name="departmentId" 
                value={formData.departmentId} onChange={handleChange}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="">{t("Select Department")}</option>
                {departments?.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="designationId">{t("Role / Designation")}</Label>
              <select 
                id="designationId" name="designationId" 
                value={formData.designationId} onChange={handleChange}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="">{t("Select Role")}</option>
                {designations?.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="employmentType">{t("Employment Type")} *</Label>
              <select 
                id="employmentType" name="employmentType" 
                value={formData.employmentType} onChange={handleChange}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={createEmployee.isPending}>{t("Cancel")}</Button>
            <Button type="submit" disabled={createEmployee.isPending}>
              {createEmployee.isPending ? t("Saving...") : t("Add Employee")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
