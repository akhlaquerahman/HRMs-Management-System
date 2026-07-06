import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Loader2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { nameValidation, employeeNameValidation, emailValidation, passwordValidation, empIdValidation, dateValidation } from '@/lib/validations/common.schema';

const employeeSchema = z.object({
  firstName: employeeNameValidation,
  lastName: employeeNameValidation,
  email: emailValidation,
  password: passwordValidation,
  employeeId: empIdValidation,
  departmentId: z.string().optional(),
  designationId: z.string().optional(),
  joiningDate: dateValidation,
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT']),
  baseSalary: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export function AddEmployeeModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    mode: "onTouched",
    defaultValues: {
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
    },
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
      reset({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        employeeId: randomId,
        departmentId: '',
        designationId: '',
        joiningDate: new Date().toISOString().split('T')[0],
        employmentType: 'FULL_TIME',
        baseSalary: '',
      });
    }
  }, [isOpen, reset]);

  const createEmployee = useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/employees', data);
    },
    onSuccess: () => {
      toast.success(t('Employee added successfully'));
      queryClient.invalidateQueries({ queryKey: ['workforceEmployees'] });
      queryClient.invalidateQueries({ queryKey: ['workforceDashboard'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    }
  });

  const onSubmitForm = (data: EmployeeFormData) => {
    const payload = {
      ...data,
      joiningDate: new Date(data.joiningDate).toISOString(),
      baseSalary: data.baseSalary ? parseFloat(data.baseSalary) : 0,
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
        
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className={errors.firstName ? "text-destructive" : ""}>{t("First Name")} <span className="text-destructive">*</span></Label>
              <Input 
                id="firstName" 
                {...register("firstName")}
                placeholder="John" 
              />
              {errors.firstName && <p className="text-[10px] text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className={errors.lastName ? "text-destructive" : ""}>{t("Last Name")} <span className="text-destructive">*</span></Label>
              <Input 
                id="lastName" 
                {...register("lastName")}
                placeholder="Doe" 
              />
              {errors.lastName && <p className="text-[10px] text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>{t("Email Address")} <span className="text-destructive">*</span></Label>
              <Input 
                id="email" 
                type="email" 
                {...register("email")}
                placeholder="john.doe@company.com" 
              />
              {errors.email && <p className="text-[10px] text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>{t("Temporary Password")} <span className="text-destructive">*</span></Label>
              <Input 
                id="password" 
                type="password" 
                {...register("password")}
                placeholder="••••••••" 
              />
              {errors.password && <p className="text-[10px] text-destructive">{errors.password.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId" className={errors.employeeId ? "text-destructive" : ""}>{t("Employee ID")} <span className="text-destructive">*</span></Label>
              <Input 
                id="employeeId" 
                {...register("employeeId")}
                placeholder="EMP-001" 
              />
              {errors.employeeId && <p className="text-[10px] text-destructive">{errors.employeeId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="joiningDate" className={errors.joiningDate ? "text-destructive" : ""}>{t("Joining Date")} <span className="text-destructive">*</span></Label>
              <Input 
                id="joiningDate" 
                type="date" 
                min="1950-01-01"
                max={new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0]}
                {...register("joiningDate")}
              />
              {errors.joiningDate && <p className="text-[10px] text-destructive">{errors.joiningDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseSalary">{t("Base Salary (Annual CTC)")}</Label>
              <Input 
                id="baseSalary" 
                {...(() => {
                  const { onChange, ...rest } = register("baseSalary");
                  return {
                    ...rest,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      e.target.value = e.target.value.replace(/[^\d.]/g, '');
                      onChange(e);
                    }
                  }
                })()}
                placeholder="e.g. 500000" 
              />
              {errors.baseSalary && <p className="text-[10px] text-destructive">{errors.baseSalary.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departmentId">{t("Department")}</Label>
              <select 
                id="departmentId" 
                {...register("departmentId")}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">{t("Select Department")}</option>
                {departments?.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="designationId">{t("Role / Designation")}</Label>
              <select 
                id="designationId" 
                {...register("designationId")}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">{t("Select Role")}</option>
                {designations?.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="employmentType" className={errors.employmentType ? "text-destructive" : ""}>{t("Employment Type")} <span className="text-destructive">*</span></Label>
              <select 
                id="employmentType" 
                {...register("employmentType")}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>
          </div>

          <DialogFooter className="mt-6 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={createEmployee.isPending}>{t("Cancel")}</Button>
            <Button type="submit" disabled={createEmployee.isPending || !isValid}>
              {createEmployee.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("Saving...")}
                </>
              ) : (
                t("Add Employee")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
