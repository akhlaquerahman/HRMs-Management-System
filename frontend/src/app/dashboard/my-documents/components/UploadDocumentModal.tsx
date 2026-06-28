import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from 'react-i18next';
import { UploadCloud, CheckCircle } from 'lucide-react';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadDocumentModal({ isOpen, onClose }: UploadDocumentModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Upload Document")}</DialogTitle>
        </DialogHeader>
        
        {step === 1 && (
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-primary/50 transition-colors">
              <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-900">{t("Click to upload")} <span className="text-gray-500 font-normal">{t("or drag and drop")}</span></p>
              <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or PDF (max. 10MB)</p>
            </div>
            <Input placeholder={t("Document Type")} />
            <Input placeholder={t("Document ID (Optional)")} />
          </div>
        )}

        {step === 2 && (
          <div className="py-12 text-center flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
            <h3 className="text-lg font-medium">{t("Document Uploaded Successfully")}</h3>
            <p className="text-sm text-gray-500 mt-1">{t("It is now pending HR verification.")}</p>
          </div>
        )}

        <DialogFooter>
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={onClose}>{t("Cancel")}</Button>
              <Button onClick={() => setStep(2)}>{t("Upload & Submit")}</Button>
            </>
          ) : (
            <Button onClick={onClose} className="w-full">{t("Done")}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
