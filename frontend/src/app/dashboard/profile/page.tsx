"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCircle, Building, Globe, Camera, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from "react-i18next";

export default function ProfilePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({ firstName: "", lastName: "", phone: "", email: "", roleName: "", profilePic: "" });
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  const roleName = user?.role?.toUpperCase() || '';
  const canEditCompany = roleName.includes('HR') || roleName.includes('SUPER') || roleName.includes('ADMIN');

  const { data: profileRes, isLoading: profileLoading } = useQuery({ 
    queryKey: ["auth_profile"], 
    queryFn: async () => (await api.get("/profile")).data 
  });

  const { data: companyRes, isLoading: companyLoading } = useQuery({
    queryKey: ["company"],
    queryFn: async () => (await api.get("/company")).data
  });

  useEffect(() => {
    if (profileRes?.data) {
      setFormData({
        firstName: profileRes.data.firstName || "",
        lastName: profileRes.data.lastName || "",
        phone: profileRes.data.phone || "",
        email: profileRes.data.email || "",
        roleName: profileRes.data.role?.name || "EMPLOYEE",
        profilePic: profileRes.data.profilePic || "",
      });
      if (profileRes.data.profilePic !== user?.profilePic || profileRes.data.firstName !== user?.firstName) {
        updateUser({ 
          profilePic: profileRes.data.profilePic,
          firstName: profileRes.data.firstName,
          lastName: profileRes.data.lastName
        });
      }
    }
    if (companyRes?.data) {
      setCompanyName(companyRes.data.companyName || "");
      setCompanyWebsite(companyRes.data.companyWebsite || "");
      setCompanyAddress(companyRes.data.companyAddress || "");
      setCompanyPhone(companyRes.data.companyPhone || "");
    }
  }, [profileRes, companyRes]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put("/profile", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      });
      updateUser({ firstName: formData.firstName, lastName: formData.lastName });
      queryClient.invalidateQueries({ queryKey: ["auth_profile"] });
      alert("Profile updated successfully!");
    } catch (err: any) { 
      alert(err?.response?.data?.message || "Error updating profile"); 
    }
  };

  const handleProfilePicUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    setIsUploadingPic(true);
    try {
      const res = await api.post('/profile/picture', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newPicUrl = res.data.data.profilePic;
      setFormData(prev => ({ ...prev, profilePic: newPicUrl }));
      updateUser({ profilePic: newPicUrl });
      queryClient.invalidateQueries({ queryKey: ["auth_profile"] });
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to upload profile picture");
    } finally {
      setIsUploadingPic(false);
    }
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCompany(true);
    try {
      await api.put("/company", { companyName, companyWebsite, companyAddress, companyPhone });
      queryClient.invalidateQueries({ queryKey: ["company"] });
      alert("Company details updated successfully!");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error updating company details");
    } finally {
      setIsSavingCompany(false);
    }
  };

  if (profileLoading || companyLoading) return <div className="p-8">Loading Profile...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <PageHeader 
        title={t("My Profile")} 
        description={t("Manage your personal account settings.")} 
        showCreate={false}
        showImport={false}
        showExport={false}
        showSearch={false}
        showFilters={false}
      />
      
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Left Column - Avatar & Role summary */}
        <div className="col-span-1 border rounded-xl bg-card p-6 flex flex-col items-center text-center shadow-sm">
          <div className="relative group cursor-pointer" onClick={() => document.getElementById('profilePicInput')?.click()}>
            {isUploadingPic ? (
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4 border-2 border-primary/20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : formData.profilePic ? (
              <img src={formData.profilePic} alt="Profile" className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-primary/20" />
            ) : (
              <UserCircle className="w-24 h-24 text-primary/80 mb-4" />
            )}
            {!isUploadingPic && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity w-24 h-24 mb-4">
                <Camera className="text-white w-6 h-6" />
              </div>
            )}
          </div>
          <input 
            type="file" 
            id="profilePicInput" 
            className="hidden" 
            accept="image/*"
            onChange={handleProfilePicUpdate}
          />
          <h2 className="text-xl font-bold">{formData.firstName} {formData.lastName}</h2>
          <p className="text-muted-foreground">{formData.email}</p>
          <div className="mt-4 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
            {formData.roleName}
          </div>
        </div>

        {/* Right Column - Edit Form */}
        <div className="col-span-2 border rounded-xl bg-card p-6 shadow-sm">
          <form onSubmit={handleUpdate} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">First Name</label>
                <Input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Last Name</label>
                <Input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Mobile Number</label>
              <Input placeholder="+1 234 567 8900" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center justify-between">
                Email Address
                <span className="text-xs text-muted-foreground font-normal">(Locked)</span>
              </label>
              <Input disabled value={formData.email} className="bg-muted cursor-not-allowed text-muted-foreground" />
              <p className="text-xs text-muted-foreground">To change your email address, please contact your system administrator.</p>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </div>
      </div>

      <div className="border rounded-xl bg-card p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-3">
          <Building className="w-5 h-5 text-primary" />
          Company Information
        </h3>
        
        {canEditCompany ? (
          <form onSubmit={handleUpdateCompany} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Company Name</label>
                <Input required placeholder="Enter company name" value={companyName} onChange={e => setCompanyName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Company Website (Optional)</label>
                <Input placeholder="Enter website URL" value={companyWebsite} onChange={e => setCompanyWebsite(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Company Address</label>
                <Input placeholder="Enter company address" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Company Contact No.</label>
                <Input placeholder="Enter company phone" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSavingCompany}>{isSavingCompany ? "Saving..." : "Save Company Details"}</Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4 text-sm max-w-md">
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="text-muted-foreground font-medium col-span-1">Company Name</span>
              <span className="col-span-2 font-semibold">{companyName || "N/A"}</span>
            </div>
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="text-muted-foreground font-medium col-span-1">Website</span>
              <span className="col-span-2">
                {companyWebsite ? (
                  <a href={companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                    <Globe className="h-3 w-3" /> {companyWebsite}
                  </a>
                ) : "N/A"}
              </span>
            </div>
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="text-muted-foreground font-medium col-span-1">Address</span>
              <span className="col-span-2">{companyAddress || "N/A"}</span>
            </div>
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="text-muted-foreground font-medium col-span-1">Contact No.</span>
              <span className="col-span-2">{companyPhone || "N/A"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
