"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Eye, Edit, Briefcase, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export default function RecruitmentPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [viewCandidate, setViewCandidate] = useState<any>(null);
  const [editCandidate, setEditCandidate] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    jobRoleId: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [roleData, setRoleData] = useState({ title: "", description: "" });

  const { data: candidatesRes, isLoading } = useQuery({
    queryKey: ["candidates"],
    queryFn: async () => (await api.get("/recruitment/candidates")).data,
  });

  const { data: rolesRes } = useQuery({
    queryKey: ["jobRoles"],
    queryFn: async () => (await api.get("/recruitment/job-roles")).data,
  });

  const candidates = candidatesRes?.data || [];
  const roles = rolesRes?.data || [];

  const filteredCandidates = candidates.filter((c: any) => {
    const matchesSearch = c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || c.jobRoleId === roleFilter;
    const matchesStatus = statusFilter === "ALL" || c.interviewStatus === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalJobRoleId = formData.jobRoleId;
      
      if (formData.jobRoleId === "new_role") {
        if (!roleData.title) {
          alert("Please enter a new job role title.");
          setIsSubmitting(false);
          return;
        }
        // Create new role first
        const newRole = await api.post("/recruitment/job-roles", roleData);
        finalJobRoleId = newRole.data.data.id;
      }

      const submitData = new FormData();
      submitData.append("firstName", formData.firstName);
      submitData.append("lastName", formData.lastName);
      submitData.append("email", formData.email);
      submitData.append("jobRoleId", finalJobRoleId);
      
      if (resumeFile) {
        submitData.append("resumeFile", resumeFile);
      }

      await api.post("/recruitment/candidates", submitData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["jobRoles"] });
      
      setIsCreating(false);
      setFormData({ firstName: "", lastName: "", email: "", jobRoleId: "" });
      setResumeFile(null);
      setRoleData({ title: "", description: "" });
      setIsCreatingRole(false);
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to create candidate");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/recruitment/candidates/${editCandidate.id}`, {
        interviewStatus: editCandidate.interviewStatus,
        status: editCandidate.status,
      });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      setEditCandidate(null);
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to update candidate");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this candidate?")) {
      try {
        await api.delete(`/recruitment/candidates/${id}`);
        queryClient.invalidateQueries({ queryKey: ["candidates"] });
      } catch (error: any) {
        alert(error?.response?.data?.message || "Failed to delete");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Recruitment & Candidates" 
        description="Manage candidate tracking, interviews, and job roles."
        onSearch={setSearchTerm}
        actionButton={
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("Create New Candidate")}
          </Button>
        }
      />
      
      {isCreating ? (
        <form onSubmit={handleCreateSubmit} className="border p-6 rounded-md bg-card flex flex-col gap-4 shadow-sm mb-6">
          <h3 className="text-xl font-semibold text-primary mb-2">{t("Candidate Details")}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-1 block">{t("First Name")}</label>
              <Input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Last Name")}</label>
              <Input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">{t("Email Address")}</label>
              <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">{t("Job Role")}</label>
              <select 
                required
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.jobRoleId} 
                onChange={e => {
                  const val = e.target.value;
                  setFormData({...formData, jobRoleId: val});
                  setIsCreatingRole(val === "new_role");
                }}
              >
                <option value="" disabled>{t("Select Job Role")}</option>
                {roles.map((role: any) => (
                  <option key={role.id} value={role.id}>{role.title}</option>
                ))}
                <option value="new_role" className="font-bold text-primary">+ {t("Others / New Role")}</option>
              </select>
            </div>

            {isCreatingRole && (
              <div className="md:col-span-2 p-4 border rounded-md bg-muted/30 flex flex-col gap-4">
                <h4 className="font-medium text-sm text-primary flex items-center"><Briefcase className="w-4 h-4 mr-2"/> Define New Job Role</h4>
                <div>
                  <label className="text-xs font-medium mb-1 block">{t("Role Title")}</label>
                  <Input required placeholder="e.g. Senior Frontend Engineer" value={roleData.title} onChange={e => setRoleData({...roleData, title: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">{t("Role Description (Optional)")}</label>
                  <Textarea placeholder="Brief requirements..." value={roleData.description} onChange={e => setRoleData({...roleData, description: e.target.value})} />
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">{t("Resume (Optional)")}</label>
              <Input 
                type="file" 
                accept=".pdf,.doc,.docx"
                onChange={e => setResumeFile(e.target.files?.[0] || null)} 
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-4 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>{t("Cancel")}</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t("Submitting...") : t("Save Candidate")}</Button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-4">
            <select 
              className="h-10 rounded-md border bg-card px-3 py-2 text-sm shadow-sm"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Job Roles</option>
              {roles.map((r: any) => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>

            <select 
              className="h-10 rounded-md border bg-card px-3 py-2 text-sm shadow-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div className="rounded-md border bg-card">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Candidate Name")}</TableHead>
                <TableHead>{t("Email")}</TableHead>
                <TableHead>{t("Job Role")}</TableHead>
                <TableHead>{t("Interview Status")}</TableHead>
                <TableHead>{t("Selection Status")}</TableHead>
                <TableHead>{t("Resume")}</TableHead>
                <TableHead className="text-right">{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">{t("Loading...")}</TableCell>
                </TableRow>
              ) : filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <EmptyState 
                      title="No candidates found" 
                      description="There are no candidates matching your criteria."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate: any) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">{candidate.firstName} {candidate.lastName}</TableCell>
                    <TableCell>{candidate.email}</TableCell>
                    <TableCell>{candidate.jobRole?.title}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${candidate.interviewStatus === 'DONE' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {candidate.interviewStatus}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        candidate.status === 'SELECTED' ? 'bg-green-100 text-green-700' : 
                        candidate.status === 'NOT_SELECTED' ? 'bg-red-100 text-red-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {candidate.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      {candidate.resumeLink ? (
                        <a href={candidate.resumeLink} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center">
                          <FileText className="w-4 h-4 mr-1" /> View
                        </a>
                      ) : <span className="text-muted-foreground text-sm">N/A</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setViewCandidate(candidate)} title="View Candidate">
                          <Eye className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditCandidate(candidate)} title="Edit Status">
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(candidate.id)} title="Delete Record">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        </>
      )}

      {/* View Modal */}
      <Dialog open={!!viewCandidate} onOpenChange={(open) => !open && setViewCandidate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("Candidate Profile")}</DialogTitle>
          </DialogHeader>
          {viewCandidate && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 border-b pb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                  {viewCandidate.firstName.charAt(0)}{viewCandidate.lastName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{viewCandidate.firstName} {viewCandidate.lastName}</h2>
                  <p className="text-muted-foreground">{viewCandidate.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block">{t("Applied For Role")}</label>
                  <p className="font-medium flex items-center"><Briefcase className="w-4 h-4 mr-2" /> {viewCandidate.jobRole?.title}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block">{t("Interview Status")}</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${viewCandidate.interviewStatus === 'DONE' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {viewCandidate.interviewStatus}
                  </span>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block">{t("Selection Status")}</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        viewCandidate.status === 'SELECTED' ? 'bg-green-100 text-green-700' : 
                        viewCandidate.status === 'NOT_SELECTED' ? 'bg-red-100 text-red-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                    {viewCandidate.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block">{t("Resume")}</label>
                  {viewCandidate.resumeLink ? (
                    <a href={viewCandidate.resumeLink} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center">
                      <FileText className="w-4 h-4 mr-1" /> Open Resume
                    </a>
                  ) : <span className="text-sm">Not provided</span>}
                </div>
              </div>
              {viewCandidate.jobRole?.description && (
                <div className="mt-4 pt-4 border-t">
                  <label className="text-xs text-muted-foreground block mb-2">{t("Role Description")}</label>
                  <p className="text-sm bg-muted/50 p-3 rounded-md">{viewCandidate.jobRole.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewCandidate(null)}>{t("Close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editCandidate} onOpenChange={(open) => !open && setEditCandidate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Update Candidate Status")}</DialogTitle>
          </DialogHeader>
          {editCandidate && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t("Interview Status")}</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={editCandidate.interviewStatus} 
                  onChange={e => setEditCandidate({...editCandidate, interviewStatus: e.target.value})}
                >
                  <option value="PENDING">Pending</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("Selection Status")}</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={editCandidate.status} 
                  onChange={e => setEditCandidate({...editCandidate, status: e.target.value})}
                >
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="SELECTED">Selected</option>
                  <option value="NOT_SELECTED">Not Selected</option>
                </select>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setEditCandidate(null)}>{t("Cancel")}</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t("Saving...") : t("Save Changes")}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
