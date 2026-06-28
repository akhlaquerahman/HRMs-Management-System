"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Briefcase, Phone, CreditCard, Shield, Activity, Settings, BookOpen, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import PersonalInfoTab from "./tabs/PersonalInfoTab";
import EmploymentTab from "./tabs/EmploymentTab";
import ContactTab from "./tabs/ContactTab";
import BankDetailsTab from "./tabs/BankDetailsTab";
import EmergencyContactTab from "./tabs/EmergencyContactTab";
import SkillsTab from "./tabs/SkillsTab";
import SecurityTab from "./tabs/SecurityTab";
import PreferencesTab from "./tabs/PreferencesTab";

interface ProfileTabsProps {
  profileData: any;
  refetch: () => void;
}

export function ProfileTabs({ profileData, refetch }: ProfileTabsProps) {
  const { t } = useTranslation();

  return (
    <Tabs defaultValue="personal" className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-b h-auto p-0 space-x-6 rounded-none">
        <TabsTrigger value="personal" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 text-sm font-medium"><User className="w-4 h-4 mr-2" />{t("Personal Information")}</TabsTrigger>
        <TabsTrigger value="employment" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 text-sm font-medium"><Briefcase className="w-4 h-4 mr-2" />{t("Employment")}</TabsTrigger>
        <TabsTrigger value="contact" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 text-sm font-medium"><Phone className="w-4 h-4 mr-2" />{t("Contact")}</TabsTrigger>
        <TabsTrigger value="bank" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 text-sm font-medium"><CreditCard className="w-4 h-4 mr-2" />{t("Bank Details")}</TabsTrigger>
        <TabsTrigger value="emergency" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 text-sm font-medium"><AlertCircle className="w-4 h-4 mr-2" />{t("Emergency Contact")}</TabsTrigger>
        <TabsTrigger value="skills" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 text-sm font-medium"><BookOpen className="w-4 h-4 mr-2" />{t("Skills & Certifications")}</TabsTrigger>
        <TabsTrigger value="security" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 text-sm font-medium"><Shield className="w-4 h-4 mr-2" />{t("Security")}</TabsTrigger>
        <TabsTrigger value="preferences" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 text-sm font-medium"><Settings className="w-4 h-4 mr-2" />{t("Preferences")}</TabsTrigger>
      </TabsList>

      <div className="mt-6 border rounded-xl bg-card shadow-sm p-6">
        <TabsContent value="personal" className="mt-0 outline-none">
          <PersonalInfoTab data={profileData} refetch={refetch} />
        </TabsContent>
        <TabsContent value="employment" className="mt-0 outline-none">
          <EmploymentTab data={profileData} />
        </TabsContent>
        <TabsContent value="contact" className="mt-0 outline-none">
          <ContactTab data={profileData} refetch={refetch} />
        </TabsContent>
        <TabsContent value="bank" className="mt-0 outline-none">
          <BankDetailsTab data={profileData} refetch={refetch} />
        </TabsContent>
        <TabsContent value="emergency" className="mt-0 outline-none">
          <EmergencyContactTab data={profileData} refetch={refetch} />
        </TabsContent>
        <TabsContent value="skills" className="mt-0 outline-none">
          <SkillsTab data={profileData} refetch={refetch} />
        </TabsContent>
        <TabsContent value="security" className="mt-0 outline-none">
          <SecurityTab data={profileData} />
        </TabsContent>
        <TabsContent value="preferences" className="mt-0 outline-none">
          <PreferencesTab data={profileData} refetch={refetch} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
