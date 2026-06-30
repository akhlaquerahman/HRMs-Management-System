"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any | null; // null if creating
  roles: any[];
}

export function UserModal({ isOpen, onClose, user, roles }: UserModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    password: "", 
    roleId: "", 
    companyName: "", 
    companyWebsite: "", 
    companyAddress: "", 
    companyPhone: "" 
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        password: "", // Don't populate password on edit
        roleId: user.roleId || "",
        companyName: user.companyName || "",
        companyWebsite: user.companyWebsite || "",
        companyAddress: user.companyAddress || "",
        companyPhone: user.companyPhone || ""
      });
    } else {
      setFormData({ 
        firstName: "", lastName: "", email: "", password: "", roleId: "", companyName: "", companyWebsite: "", companyAddress: "", companyPhone: "" 
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (user) {
        // Edit mode (exclude password if empty)
        const payload = { ...formData };
        if (!payload.password) {
          delete (payload as any).password;
        }
        await api.put(`/admin/users/${user.id}`, payload);
        toast.success(t("User updated successfully"));
      } else {
        // Create mode
        await api.post("/admin/users", formData);
        toast.success(t("User created successfully"));
      }
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("Error saving user"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            {user ? t("Edit User") : t("Create New User")}
          </DialogTitle>
          <DialogDescription>
            {user 
              ? t("Update the details for this system user.")
              : t("Fill in the details below to create a new user account in the system.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 mb-4">Personal Details</h3>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("First Name")} *</label>
              <Input required placeholder="E.g. John" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Last Name")} *</label>
              <Input required placeholder="E.g. Doe" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Email Address")} *</label>
              <Input required type="email" placeholder="john.doe@company.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{user ? t("Password (Leave blank to keep current)") : t("Password *")}</label>
              <Input required={!user} type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Role")} *</label>
              <select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={formData.roleId} onChange={e => setFormData({...formData, roleId: e.target.value})}>
                <option value="" disabled>Select Role</option>
                {roles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2 mt-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b pb-2 mb-4">Company Details (Optional)</h3>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Company Name")}</label>
              <Input placeholder="E.g. Acme Corp" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Company Website")}</label>
              <Input placeholder="https://..." value={formData.companyWebsite} onChange={e => setFormData({...formData, companyWebsite: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Company Phone")}</label>
              <Input placeholder="+1 234 567 8900" value={formData.companyPhone} onChange={e => setFormData({...formData, companyPhone: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Company Address")}</label>
              <Input placeholder="123 Business Blvd" value={formData.companyAddress} onChange={e => setFormData({...formData, companyAddress: e.target.value})} />
            </div>

          </div>

          <DialogFooter className="mt-6 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>{t("Cancel")}</Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px] bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("Saving...")}
                </>
              ) : (
                t("Save User")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
