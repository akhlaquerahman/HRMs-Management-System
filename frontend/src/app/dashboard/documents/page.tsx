"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Eye, Edit, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export default function DocumentsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [viewDocument, setViewDocument] = useState<any>(null);
  const [editDocument, setEditDocument] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    employeeId: "",
    documentTypeId: "",
    documentNumber: ""
  });

  const [isCreatingType, setIsCreatingType] = useState(false);
  const [typeData, setTypeData] = useState({ name: "" });

  const { data: documentsRes, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => (await api.get("/documents")).data,
  });

  const { data: employeesRes } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await api.get("/employees")).data,
  });

  const { data: documentTypesRes } = useQuery({
    queryKey: ["documentTypes"],
    queryFn: async () => (await api.get("/documents/types")).data,
  });

  const documents = documentsRes?.data || [];
  const employees = employeesRes?.data || [];
  const documentTypes = documentTypesRes?.data || [];

  const filteredDocuments = documents.filter((doc: any) => {
    const matchesSearch = doc.employee?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.employee?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.employee?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || doc.documentTypeId === typeFilter;
    const matchesStatus = statusFilter === "ALL" || doc.verificationStatus === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalTypeId = formData.documentTypeId;
      
      if (formData.documentTypeId === "new_type") {
        if (!typeData.name) {
          alert("Please enter a new document type name.");
          setIsSubmitting(false);
          return;
        }
        // Create new type first
        const newType = await api.post("/documents/types", typeData);
        finalTypeId = newType.data.data.name;
      } else {
        const selectedType = documentTypes.find((t: any) => t.id === formData.documentTypeId);
        finalTypeId = selectedType?.name || formData.documentTypeId;
      }

      if (!file) {
        alert("Please select a file to upload");
        setIsSubmitting(false);
        return;
      }

      const uploadData = new FormData();
      uploadData.append("employeeId", formData.employeeId);
      uploadData.append("documentType", finalTypeId); // Backend expects documentType
      if (formData.documentNumber) uploadData.append("documentNumber", formData.documentNumber);
      uploadData.append("file", file);

      await api.post("/documents/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["documentTypes"] });
      
      setIsCreating(false);
      setFormData({ employeeId: "", documentTypeId: "", documentNumber: "" });
      setFile(null);
      setTypeData({ name: "" });
      setIsCreatingType(false);
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to upload document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editDocument.verificationStatus === 'APPROVED') {
        await api.post(`/documents/${editDocument.id}/approve`);
      } else if (editDocument.verificationStatus === 'REJECTED') {
        await api.post(`/documents/${editDocument.id}/reject`, { remarks: "Rejected by HR Admin" });
      }
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setEditDocument(null);
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to update document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await api.delete(`/documents/${id}`);
        queryClient.invalidateQueries({ queryKey: ["documents"] });
      } catch (error: any) {
        alert(error?.response?.data?.message || "Failed to delete");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="KYC & Documents" 
        description="Manage employee KYC verification and important documents."
        onSearch={setSearchTerm}
        actionButton={
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("Upload Document")}
          </Button>
        }
      />
      
      {isCreating ? (
        <form onSubmit={handleCreateSubmit} className="border p-6 rounded-md bg-card flex flex-col gap-4 shadow-sm mb-6">
          <h3 className="text-xl font-semibold text-primary mb-2">{t("Upload New Document")}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">{t("Employee")}</label>
              <select 
                required
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.employeeId} 
                onChange={e => setFormData({...formData, employeeId: e.target.value})}
              >
                <option value="" disabled>{t("Select Employee")}</option>
                {employees.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Document Type")}</label>
              <select 
                required
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.documentTypeId} 
                onChange={e => {
                  const val = e.target.value;
                  setFormData({...formData, documentTypeId: val});
                  setIsCreatingType(val === "new_type");
                }}
              >
                <option value="" disabled>{t("Select Document Type")}</option>
                {documentTypes.map((type: any) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
                <option value="new_type" className="font-bold text-primary">+ {t("Others / New Type")}</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Document Number (Optional)")}</label>
              <Input placeholder="e.g. ABCDE1234F" value={formData.documentNumber} onChange={e => setFormData({...formData, documentNumber: e.target.value})} />
            </div>

            {isCreatingType && (
              <div className="md:col-span-2 p-4 border rounded-md bg-muted/30 flex flex-col gap-4">
                <h4 className="font-medium text-sm text-primary flex items-center"><FileText className="w-4 h-4 mr-2"/> Define New Document Type</h4>
                <div>
                  <label className="text-xs font-medium mb-1 block">{t("Type Name")}</label>
                  <Input required placeholder="e.g. Driving License" value={typeData.name} onChange={e => setTypeData({...typeData, name: e.target.value})} />
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">{t("Upload Document")}</label>
              <input 
                type="file" 
                required 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                accept="image/*,.pdf"
              />
              <p className="text-xs text-muted-foreground mt-1">Supported formats: Images and PDFs.</p>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-4 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>{t("Cancel")}</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t("Uploading...") : t("Upload Document")}</Button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-4">
            <select 
              className="h-10 rounded-md border bg-card px-3 py-2 text-sm shadow-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Document Types</option>
              {documentTypes.map((type: any) => <option key={type.id} value={type.id}>{type.name}</option>)}
            </select>

            <select 
              className="h-10 rounded-md border bg-card px-3 py-2 text-sm shadow-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="rounded-md border bg-card">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Employee")}</TableHead>
                <TableHead>{t("Email")}</TableHead>
                <TableHead>{t("Document Type")}</TableHead>
                <TableHead>{t("Document No.")}</TableHead>
                <TableHead>{t("KYC Status")}</TableHead>
                <TableHead className="text-right">{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">{t("Loading...")}</TableCell>
                </TableRow>
              ) : filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <EmptyState 
                      title="No documents found" 
                      description="There are no KYC documents matching your criteria."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc: any) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.employee?.firstName} {doc.employee?.lastName}</TableCell>
                    <TableCell>{doc.employee?.email}</TableCell>
                    <TableCell className="font-semibold text-primary">{doc.documentType}</TableCell>
                    <TableCell>{doc.encryptedDocumentNumber || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {doc.verificationStatus === 'APPROVED' ? <CheckCircle className="w-4 h-4 text-green-500" /> : 
                         doc.verificationStatus === 'REJECTED' ? <XCircle className="w-4 h-4 text-red-500" /> : 
                         <AlertCircle className="w-4 h-4 text-yellow-500" />}
                        <span className={`text-xs font-semibold ${
                          doc.verificationStatus === 'APPROVED' ? 'text-green-700' : 
                          doc.verificationStatus === 'REJECTED' ? 'text-red-700' : 
                          'text-yellow-700'
                        }`}>
                          {doc.verificationStatus}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setViewDocument(doc)} title="View Document">
                          <Eye className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditDocument(doc)} title="Edit Document">
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)} title="Delete Record">
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
      <Dialog open={!!viewDocument} onOpenChange={(open) => !open && setViewDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("Document Verification Viewer")}</DialogTitle>
          </DialogHeader>
          {viewDocument && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold">{viewDocument.employee?.firstName} {viewDocument.employee?.lastName}</h2>
                  <p className="text-muted-foreground">{viewDocument.employee?.email}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                    viewDocument.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' : 
                    viewDocument.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' : 
                    'bg-yellow-100 text-yellow-700 border-yellow-200'
                  }`}>
                    KYC: {viewDocument.verificationStatus}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-md">
                <div>
                  <label className="text-xs text-muted-foreground block">{t("Document Type")}</label>
                  <p className="font-semibold text-lg">{viewDocument.documentType}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block">{t("Document Number")}</label>
                  <p className="font-mono text-lg">{viewDocument.encryptedDocumentNumber || "Not Provided"}</p>
                </div>
              </div>
              
              <div className="border-2 border-dashed rounded-lg p-2 bg-black/5 flex items-center justify-center min-h-[400px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {viewDocument.encryptedDocumentPath?.match(/\.pdf$/i) ? (
                  <iframe 
                    src={viewDocument.encryptedDocumentPath?.startsWith('http') ? viewDocument.encryptedDocumentPath.replace('http://', 'https://') : process.env.NEXT_PUBLIC_API_URL + viewDocument.encryptedDocumentPath}
                    className="w-full h-[600px] rounded shadow-sm border-0"
                  />
                ) : (
                  <img 
                    src={viewDocument.encryptedDocumentPath?.startsWith('http') ? viewDocument.encryptedDocumentPath.replace('http://', 'https://') : process.env.NEXT_PUBLIC_API_URL + viewDocument.encryptedDocumentPath} 
                    alt="Document Preview" 
                    className="max-w-full max-h-[600px] object-contain rounded shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/800x600?text=Invalid+Image+URL+or+Format';
                    }}
                  />
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDocument(null)}>{t("Close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editDocument} onOpenChange={(open) => !open && setEditDocument(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Edit Document / KYC Status")}</DialogTitle>
          </DialogHeader>
          {editDocument && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t("KYC Status")}</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={editDocument.verificationStatus} 
                  onChange={e => setEditDocument({...editDocument, verificationStatus: e.target.value})}
                >
                  <option value="PENDING">Pending Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("Document Number")}</label>
                <Input value={editDocument.encryptedDocumentNumber || ""} onChange={e => setEditDocument({...editDocument, encryptedDocumentNumber: e.target.value})} />
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setEditDocument(null)}>{t("Cancel")}</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t("Saving...") : t("Save Changes")}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
