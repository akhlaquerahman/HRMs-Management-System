import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from 'react-i18next';
import { UploadCloud, CheckCircle } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadDocumentModal({ isOpen, onClose }: UploadDocumentModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTypeId, setDocumentTypeId] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [isCreatingType, setIsCreatingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: documentTypesRes } = useQuery({
    queryKey: ["documentTypes"],
    queryFn: async () => (await api.get("/documents/types")).data,
  });
  const documentTypes = documentTypesRes?.data || [];

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedFile(null);
      setDocumentTypeId("");
      setDocumentNumber("");
      setIsCreatingType(false);
      setNewTypeName("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDivClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    if (!documentTypeId) {
      toast.error("Please select a document type");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalTypeId = documentTypeId;
      if (documentTypeId === "new_type") {
        if (!newTypeName) {
          toast.error("Please enter a new document type name");
          setIsSubmitting(false);
          return;
        }
        const newType = await api.post("/documents/types", { name: newTypeName });
        finalTypeId = newType.data.data.name;
      } else {
        const selectedType = documentTypes.find((t: any) => t.id === documentTypeId);
        finalTypeId = selectedType?.name || documentTypeId;
      }

      const uploadData = new FormData();
      uploadData.append("documentType", finalTypeId);
      if (documentNumber) uploadData.append("documentNumber", documentNumber);
      uploadData.append("file", selectedFile);

      await api.post("/documents/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      queryClient.invalidateQueries({ queryKey: ["documentRecords"] });
      queryClient.invalidateQueries({ queryKey: ["documentSummary"] });
      queryClient.invalidateQueries({ queryKey: ["documentTypes"] });
      
      setStep(2);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload document");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Upload Document")}</DialogTitle>
        </DialogHeader>
        
        {step === 1 && (
          <div className="space-y-4 py-4">
            <div 
              className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:border-primary/50 transition-colors"
              onClick={handleDivClick}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept=".svg,.png,.jpg,.jpeg,.pdf" 
              />
              <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
              {selectedFile ? (
                 <p className="text-sm font-medium text-primary">{selectedFile.name}</p>
              ) : (
                 <>
                   <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{t("Click to upload")} <span className="text-gray-500 dark:text-slate-400 font-normal">{t("or drag and drop")}</span></p>
                   <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">SVG, PNG, JPG or PDF (max. 10MB)</p>
                 </>
              )}
            </div>
            <select 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={documentTypeId} 
              onChange={e => {
                const val = e.target.value;
                setDocumentTypeId(val);
                setIsCreatingType(val === "new_type");
              }}
            >
              <option value="" disabled>{t("Select Document Type")}</option>
              {documentTypes.map((type: any) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
              <option value="new_type" className="font-bold text-primary">+ {t("Others / New Type")}</option>
            </select>
            {isCreatingType && (
              <Input 
                placeholder={t("Enter New Document Type")} 
                value={newTypeName} 
                onChange={e => setNewTypeName(e.target.value)} 
              />
            )}
            <Input 
              placeholder={t("Document ID (Optional)")} 
              value={documentNumber}
              onChange={e => setDocumentNumber(e.target.value)}
            />
          </div>
        )}

        {step === 2 && (
          <div className="py-12 text-center flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
            <h3 className="text-lg font-medium">{t("Document Uploaded Successfully")}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t("It is now pending HR verification.")}</p>
          </div>
        )}

        <DialogFooter>
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>{t("Cancel")}</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? t("Uploading...") : t("Upload & Submit")}
              </Button>
            </>
          ) : (
            <Button onClick={onClose} className="w-full">{t("Done")}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
