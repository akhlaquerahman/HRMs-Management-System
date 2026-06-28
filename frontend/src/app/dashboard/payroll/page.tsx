"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Receipt, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/axios";

export default function PayrollPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [viewPayslip, setViewPayslip] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: "",
    bonus: "",
    deductions: "",
    workingDays: "",
    paymentDate: new Date().toISOString().split('T')[0],
    transactionId: "",
    status: "PAID",
    bankName: "",
    accountNumber: ""
  });

  const { data: payrollRes, isLoading } = useQuery({
    queryKey: ["payroll"],
    queryFn: async () => (await api.get("/payroll")).data,
  });

  const { data: employeesRes } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await api.get("/employees")).data,
  });

  const { data: companyRes } = useQuery({
    queryKey: ['company'],
    queryFn: async () => (await api.get('/company')).data
  });

  const payrolls = payrollRes?.data || [];
  const employees = employeesRes?.data || [];
  const companyData = companyRes?.data;

  const filteredPayrolls = payrolls.filter((p: any) => {
    const matchesSearch = p.employee?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.employee?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.employee?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesPeriod = true;
    if (periodFilter) {
      const [year, month] = periodFilter.split('-');
      matchesPeriod = p.year === parseInt(year) && p.month === parseInt(month);
    }
    
    return matchesSearch && matchesPeriod;
  });

  const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage) || 1;
  const paginatedPayrolls = filteredPayrolls.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/payroll", formData);
      queryClient.invalidateQueries({ queryKey: ["payroll"] });
      setIsCreating(false);
      setFormData({
        employeeId: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basicSalary: "",
        bonus: "",
        deductions: "",
        workingDays: "",
        paymentDate: new Date().toISOString().split('T')[0],
        transactionId: "",
        status: "PAID",
        bankName: "",
        accountNumber: ""
      });
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to create payroll record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this payroll record?")) {
      try {
        await api.delete(`/payroll/${id}`);
        queryClient.invalidateQueries({ queryKey: ["payroll"] });
      } catch (error: any) {
        alert(error?.response?.data?.message || "Failed to delete");
      }
    }
  };

  const printPayslip = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Payroll & Payslips" 
        description="Manage employee payroll and generate printable payslips."
        onSearch={setSearchTerm}
        actionButton={
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("Create Payroll")}
          </Button>
        }
      />
      
      {isCreating ? (
        <form onSubmit={handleSubmit} className="border p-6 rounded-md bg-card flex flex-col gap-4 shadow-sm mb-6">
          <h3 className="text-xl font-semibold text-primary mb-2">{t("Create Payroll Record")}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">{t("Employee")}</label>
              <select 
                required
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.employeeId} 
                onChange={e => {
                  const empId = e.target.value;
                  const selectedEmp = employees.find((emp: any) => emp.id === empId);
                  setFormData({
                    ...formData, 
                    employeeId: empId,
                    bankName: selectedEmp?.bankName || "",
                    accountNumber: selectedEmp?.accountNumber || ""
                  });
                }}
              >
                <option value="" disabled>{t("Select Employee")}</option>
                {employees.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Month (1-12)")}</label>
              <Input required type="number" min="1" max="12" value={formData.month} onChange={e => setFormData({...formData, month: parseInt(e.target.value)})} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Year")}</label>
              <Input required type="number" min="2000" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Basic Salary (₹)")}</label>
              <Input required type="number" step="0.01" value={formData.basicSalary} onChange={e => setFormData({...formData, basicSalary: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Bonus (₹)")}</label>
              <Input type="number" step="0.01" value={formData.bonus} onChange={e => setFormData({...formData, bonus: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Deductions (₹)")}</label>
              <Input type="number" step="0.01" value={formData.deductions} onChange={e => setFormData({...formData, deductions: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Working Days")}</label>
              <Input required type="number" value={formData.workingDays} onChange={e => setFormData({...formData, workingDays: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Payment Date")}</label>
              <Input required type="date" value={formData.paymentDate} onChange={e => setFormData({...formData, paymentDate: e.target.value})} />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">{t("Transaction ID")}</label>
              <Input placeholder="Bank Ref or TXN ID" value={formData.transactionId} onChange={e => setFormData({...formData, transactionId: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Bank Name")}</label>
              <Input placeholder="E.g. HDFC Bank" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Account Number")}</label>
              <Input placeholder="Account No" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} />
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-4 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>{t("Cancel")}</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t("Submitting...") : t("Save Payroll")}</Button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-xs font-semibold text-muted-foreground">{t("Period")}</label>
              <Input 
                type="month" 
                className="h-10 w-full sm:w-auto bg-card"
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border bg-card">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Employee")}</TableHead>
                <TableHead>{t("Period")}</TableHead>
                <TableHead>{t("Net Salary")}</TableHead>
                <TableHead>{t("Bonus")}</TableHead>
                <TableHead>{t("Deductions")}</TableHead>
                <TableHead>{t("Working Days")}</TableHead>
                <TableHead>{t("Payment Date")}</TableHead>
                <TableHead>{t("Bank Details")}</TableHead>
                <TableHead className="text-right">{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">{t("Loading...")}</TableCell>
                </TableRow>
              ) : paginatedPayrolls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    <EmptyState 
                      title="No payroll records found" 
                      description="There are no payroll records matching your criteria."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPayrolls.map((payroll: any) => (
                  <TableRow key={payroll.id}>
                    <TableCell className="font-medium">
                      <div>{payroll.employee?.firstName} {payroll.employee?.lastName}</div>
                      <div className="text-xs text-muted-foreground">{payroll.employee?.email}</div>
                    </TableCell>
                    <TableCell>{payroll.month}/{payroll.year}</TableCell>
                    <TableCell className="font-bold text-green-600">₹{payroll.netSalary.toFixed(2)}</TableCell>
                    <TableCell>₹{payroll.bonus.toFixed(2)}</TableCell>
                    <TableCell className="text-red-500">₹{payroll.deductions.toFixed(2)}</TableCell>
                    <TableCell>{payroll.workingDays}</TableCell>
                    <TableCell>{new Date(payroll.paymentDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {payroll.employee?.bankName ? (
                        <div className="text-xs">
                          <div>{payroll.employee.bankName}</div>
                          <div className="text-muted-foreground">{payroll.employee.accountNumber}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setViewPayslip(payroll)} title="View Payslip">
                          <Receipt className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(payroll.id)} title="Delete Record">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t("Rows per page")}:</span>
              <Select 
                value={itemsPerPage.toString()} 
                onValueChange={(val) => {
                  setItemsPerPage(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredPayrolls.length)} {t("of")} {filteredPayrolls.length}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Printable Payslip Modal */}
      <Dialog open={!!viewPayslip} onOpenChange={(open) => !open && setViewPayslip(null)}>
        <DialogContent className="max-w-3xl print:max-w-full print:shadow-none print:border-none print:m-0 print:p-0">
          <DialogHeader className="print:hidden">
            <DialogTitle>{t("Payslip Details")}</DialogTitle>
          </DialogHeader>
          
          {viewPayslip && (
            <div className="bg-white text-black p-8 border rounded-md shadow-sm print:border-none print:shadow-none">
              <div className="flex justify-between items-center border-b pb-6 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-primary">{companyData?.companyName || "COMPANY NAME"}</h1>
                  <p className="text-sm text-gray-500 mt-1">{companyData?.companyAddress || "123 Business Avenue, Tech City"}</p>
                  <p className="text-sm text-gray-500">{companyData?.companyWebsite ? companyData.companyWebsite : "contact@company.com"} | {companyData?.companyPhone || "+1 234 567 8900"}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold tracking-tight text-gray-800 uppercase">PAYSLIP</h2>
                  <p className="text-sm font-medium mt-1">For the Month of: {viewPayslip.month}/{viewPayslip.year}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold border-b pb-2 mb-3">Employee Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Employee Name:</span> <span className="font-medium">{viewPayslip.employee?.firstName} {viewPayslip.employee?.lastName}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Employee ID:</span> <span className="font-medium">{viewPayslip.employee?.employeeId}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Email:</span> <span className="font-medium">{viewPayslip.employee?.email}</span></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold border-b pb-2 mb-3">Payment Details</h3>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Payment Date</p>
                      <p className="font-semibold">{new Date(viewPayslip.paymentDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Status</p>
                      <p className="font-semibold text-green-600">{viewPayslip.status}</p>
                    </div>
                    {viewPayslip.employee?.bankName && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Bank Name</p>
                          <p className="font-semibold">{viewPayslip.employee.bankName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Account Number</p>
                          <p className="font-semibold">{viewPayslip.employee.accountNumber}</p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Transaction ID</p>
                      <p className="font-semibold">{viewPayslip.transactionId || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-md overflow-hidden mb-8">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Earnings</th>
                      <th className="px-4 py-3 font-semibold text-right">Amount</th>
                      <th className="px-4 py-3 font-semibold border-l">Deductions</th>
                      <th className="px-4 py-3 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-3">Basic Salary</td>
                      <td className="px-4 py-3 text-right">₹{viewPayslip.basicSalary.toFixed(2)}</td>
                      <td className="px-4 py-3 border-l">Tax / Deductions</td>
                      <td className="px-4 py-3 text-right text-red-500">-₹{viewPayslip.deductions.toFixed(2)}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-4 py-3">Bonus / Allowance</td>
                      <td className="px-4 py-3 text-right">₹{viewPayslip.bonus.toFixed(2)}</td>
                      <td className="px-4 py-3 border-l"></td>
                      <td className="px-4 py-3 text-right"></td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold">
                    <tr>
                      <td className="px-4 py-3">Total Earnings</td>
                      <td className="px-4 py-3 text-right">₹{(viewPayslip.basicSalary + viewPayslip.bonus).toFixed(2)}</td>
                      <td className="px-4 py-3 border-l">Total Deductions</td>
                      <td className="px-4 py-3 text-right text-red-500">-₹{viewPayslip.deductions.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex justify-end items-center bg-green-50 p-4 rounded-md border border-green-200">
                <span className="text-lg font-semibold text-gray-700 mr-4">Net Payable Salary:</span>
                <span className="text-2xl font-bold text-green-700">₹{viewPayslip.netSalary.toFixed(2)}</span>
              </div>

              <div className="mt-12 text-sm text-gray-500 text-center border-t pt-4">
                This is a computer-generated document. No signature is required.
              </div>
            </div>
          )}
          
          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={() => setViewPayslip(null)}>{t("Close")}</Button>
            <Button onClick={printPayslip}>
              <Receipt className="mr-2 h-4 w-4" />
              {t("Print / Save as PDF")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
