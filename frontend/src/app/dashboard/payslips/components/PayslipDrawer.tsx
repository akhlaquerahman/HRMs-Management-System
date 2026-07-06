"use client";

import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

interface PayslipDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
}

export function PayslipDrawer({ isOpen, onClose, record }: PayslipDrawerProps) {
  const { t } = useTranslation();

  const { data: companyRes } = useQuery({
    queryKey: ["company"],
    queryFn: async () => (await api.get("/company")).data
  });

  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalEarnings = (record.basicSalary || 0) + (record.hra || 0) + (record.bonus || 0) + (record.incentives || 0) + (record.reimbursements || 0) + (record.specialAllowance || 0) + (record.medicalAllowance || 0) + (record.travelAllowance || 0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* 
        We use print:absolute print:inset-0 print:bg-white dark:bg-slate-900 print:z-[9999] 
        to ensure this modal covers everything else when printing 
      */}
      <DialogContent className="max-w-3xl p-0 overflow-y-auto max-h-[90vh] bg-white dark:bg-slate-900 print:border-none print:shadow-none print:m-0 print:p-0 print:max-h-none print:overflow-visible">
        <DialogTitle className="sr-only">Payslip Details</DialogTitle>
        
        {/* Modal Header (Hidden on Print) */}
        <div className="flex justify-between items-center p-4 border-b print:hidden">
          <h2 className="text-lg font-semibold">{t("Payslip Details")}</h2>
        </div>

        {/* Printable Area */}
        <div className="p-8 bg-white dark:bg-slate-900" id="printable-payslip">
          <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-4">
            
            {/* Header Section */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-200 dark:border-slate-700">
              <div>
                <h1 className="text-3xl font-bold text-blue-600 mb-1">
                  {companyRes?.data?.companyName || "HRMs Pro"}
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {companyRes?.data?.companyAddress || "456 Corporate Blvd, Business Hub"}
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {companyRes?.data?.companyWebsite || "admin@hrmspro.com"} | {companyRes?.data?.companyPhone || "+91 987 654 3210"}
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-200 mb-1 uppercase">PAYSLIP</h2>
                <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                  For the Month of: {record.month}/{record.year}
                </p>
              </div>
            </div>

            {/* Summary Sections */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Employee Summary */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-slate-200 mb-3 border-b border-gray-200 dark:border-slate-700 pb-1">Employee Summary</h3>
                <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
                  <span className="text-gray-500 dark:text-slate-400">Employee Name:</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200">{record.employee?.firstName} {record.employee?.lastName}</span>
                  
                  <span className="text-gray-500 dark:text-slate-400">Employee ID:</span>
                  <span className="text-gray-800 dark:text-slate-200">#{record.employee?.id?.slice(0, 6).toUpperCase()}</span>
                  
                  <span className="text-gray-500 dark:text-slate-400">Email:</span>
                  <span className="text-gray-800 dark:text-slate-200">{record.employee?.user?.email || record.employee?.email || 'N/A'}</span>
                  
                  <span className="text-gray-500 dark:text-slate-400">Bank Name:</span>
                  <span className="text-gray-800 dark:text-slate-200">{record.employee?.bankName || 'N/A'}</span>
                  
                  <span className="text-gray-500 dark:text-slate-400">Account No:</span>
                  <span className="text-gray-800 dark:text-slate-200 font-mono">{record.employee?.accountNumber || 'N/A'}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-slate-200 mb-3 border-b border-gray-200 dark:border-slate-700 pb-1">Payment Details</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-slate-400 mb-0.5">Payment Date</p>
                    <p className="font-semibold text-gray-800 dark:text-slate-200">{format(new Date(record.paymentDate), 'M/d/yyyy h:mm a')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-slate-400 mb-0.5">Status</p>
                    <p className="font-semibold text-green-600 uppercase">{record.status}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-slate-400 mb-0.5">Transaction ID</p>
                    <p className="font-semibold text-gray-800 dark:text-slate-200">{record.transactionId || 'Pending'}</p>
                  </div>
                  <div className="col-span-2">
                     <p className="text-gray-500 dark:text-slate-400 mb-0.5">Payment Mode</p>
                     <p className="font-semibold text-gray-800 dark:text-slate-200">{record.paymentMethod?.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Salary Breakdown Table */}
            <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden mb-6">
              <div className="grid grid-cols-2 divide-x divide-gray-200">
                {/* Earnings Column */}
                <div>
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-800 p-3 border-b border-gray-200 dark:border-slate-700 font-semibold text-sm text-gray-700">
                    <span>Earnings</span>
                    <span>Amount</span>
                  </div>
                  <div className="p-3 space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Basic Salary</span>
                      <span className="text-gray-900 dark:text-slate-100">₹{record.basicSalary?.toFixed(2)}</span>
                    </div>
                    {(record.hra > 0) && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">HRA</span>
                        <span className="text-gray-900 dark:text-slate-100">₹{record.hra?.toFixed(2)}</span>
                      </div>
                    )}
                    {(record.bonus > 0 || record.incentives > 0) && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Bonus / Allowance</span>
                        <span className="text-gray-900 dark:text-slate-100">₹{((record.bonus || 0) + (record.incentives || 0) + (record.specialAllowance || 0)).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center p-3 border-t border-gray-200 dark:border-slate-700 font-bold text-sm bg-gray-50 dark:bg-slate-800 mt-4">
                    <span>Total Earnings</span>
                    <span>₹{totalEarnings.toFixed(2)}</span>
                  </div>
                </div>

                {/* Deductions Column */}
                <div>
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-800 p-3 border-b border-gray-200 dark:border-slate-700 font-semibold text-sm text-gray-700">
                    <span>Deductions</span>
                    <span>Amount</span>
                  </div>
                  <div className="p-3 space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Tax / Deductions</span>
                      <span className="text-red-500">-₹{record.deductions?.toFixed(2)}</span>
                    </div>
                  </div>
                  {/* Push total to bottom to align with earnings total */}
                  <div className="flex justify-between items-center p-3 border-t border-gray-200 dark:border-slate-700 font-bold text-sm bg-gray-50 dark:bg-slate-800 mt-[52px]">
                    <span>Total Deductions</span>
                    <span className="text-red-500">-₹{record.deductions?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Box */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center mb-8">
              <span className="text-gray-700 font-semibold text-lg ml-auto mr-4">Net Payable Salary:</span>
              <span className="text-green-700 font-bold text-2xl">₹{record.netSalary?.toFixed(2)}</span>
            </div>

            {/* Footer Notice */}
            <div className="text-center border-t border-gray-200 dark:border-slate-700 pt-6">
              <p className="text-xs text-gray-500 dark:text-slate-400">
                This is a computer-generated document. No signature is required.
              </p>
            </div>
            
          </div>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-slate-800 border-t print:hidden">
          <Button variant="outline" onClick={onClose} className="px-6 border-blue-600 text-gray-700 font-medium">
            Close
          </Button>
          <Button onClick={handlePrint} className="px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium">
            <Printer className="w-4 h-4 mr-2" />
            Print / Save as PDF
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
