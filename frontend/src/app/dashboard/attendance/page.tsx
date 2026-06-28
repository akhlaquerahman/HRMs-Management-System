"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Eye, Edit } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

export default function AttendancePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingHoliday, setIsCreatingHoliday] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [viewRecord, setViewRecord] = useState<any>(null);
  const [editRecord, setEditRecord] = useState<any>(null);

  const [attendanceDateFilter, setAttendanceDateFilter] = useState("");
  const [attendanceEmpFilter, setAttendanceEmpFilter] = useState("ALL");
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState("ALL");

  const [formData, setFormData] = useState({
    employeeId: "",
    date: new Date().toISOString().split('T')[0],
    punchIn: "",
    punchOut: "",
    status: "PRESENT",
    shiftId: ""
  });

  const [holidayData, setHolidayData] = useState({
    name: "",
    date: new Date().toISOString().split('T')[0],
    type: "NATIONAL",
    description: ""
  });

  const { data: recordsRes, isLoading } = useQuery({
    queryKey: ["attendanceRecords"],
    queryFn: async () => (await api.get("/attendance")).data,
  });

  const { data: holidaysRes } = useQuery({
    queryKey: ["holidays"],
    queryFn: async () => (await api.get("/holidays")).data,
  });

  const { data: employeesRes } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await api.get("/employees")).data,
  });

  const { data: shiftsRes } = useQuery({
    queryKey: ["shifts"],
    queryFn: async () => (await api.get("/shifts")).data,
  });

  const records = recordsRes?.data || [];
  const holidays = holidaysRes?.data || [];
  const employees = employeesRes?.data || [];
  const shifts = shiftsRes?.data || [];

  const filteredRecords = records.filter((r: any) => {
    const isPunchedIn = r.logs && r.logs.length > 0 && !r.logs[r.logs.length - 1]?.punchOut;
    const computedStatus = isPunchedIn ? "YET TO CHECK OUT" : r.status;

    const matchesDate = !attendanceDateFilter || r.date.startsWith(attendanceDateFilter);
    const matchesEmp = attendanceEmpFilter === "ALL" || r.employeeId === attendanceEmpFilter;
    const matchesStatus = attendanceStatusFilter === "ALL" || computedStatus === attendanceStatusFilter;

    return matchesDate && matchesEmp && matchesStatus;
  });

  // Auto-select shift when employee changes
  useEffect(() => {
    if (formData.employeeId) {
      const selectedEmp = employees.find((emp: any) => emp.id === formData.employeeId);
      if (selectedEmp && selectedEmp.shiftId) {
        setFormData(prev => ({ ...prev, shiftId: selectedEmp.shiftId }));
      }
    }
  }, [formData.employeeId, employees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const punchInDate = formData.punchIn ? new Date(`${formData.date}T${formData.punchIn}`).toISOString() : null;
      const punchOutDate = formData.punchOut ? new Date(`${formData.date}T${formData.punchOut}`).toISOString() : null;

      await api.post("/attendance/manual", {
        employeeId: formData.employeeId,
        date: new Date(formData.date).toISOString(),
        punchIn: punchInDate,
        punchOut: punchOutDate,
        status: formData.status,
        shiftId: formData.shiftId
      });

      queryClient.invalidateQueries({ queryKey: ["attendanceRecords"] });
      setIsCreating(false);
      setFormData({
        employeeId: "",
        date: new Date().toISOString().split('T')[0],
        punchIn: "",
        punchOut: "",
        status: "PRESENT",
        shiftId: ""
      });
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to create attendance record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHolidaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/holidays", {
        ...holidayData,
        date: new Date(holidayData.date).toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
      setIsCreatingHoliday(false);
      setHolidayData({
        name: "",
        date: new Date().toISOString().split('T')[0],
        type: "NATIONAL",
        description: ""
      });
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to create holiday");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRecord) return;
    setIsSubmitting(true);
    try {
      const punchInDate = editRecord.punchIn ? new Date(`${editRecord.date}T${editRecord.punchIn}`).toISOString() : null;
      const punchOutDate = editRecord.punchOut ? new Date(`${editRecord.date}T${editRecord.punchOut}`).toISOString() : null;

      await api.put(`/attendance/${editRecord.id}`, {
        date: new Date(editRecord.date).toISOString(),
        punchIn: punchInDate,
        punchOut: punchOutDate,
        status: editRecord.status,
        shiftId: editRecord.shiftId
      });

      queryClient.invalidateQueries({ queryKey: ["attendanceRecords"] });
      setEditRecord(null);
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to update record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Attendance & Holidays" 
        description="Manage attendance data and organization holidays."
        actionButton={
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("Add Record")}
          </Button>
        }
      />
      
      {isCreating ? (
        <form onSubmit={handleSubmit} className="border p-6 rounded-md bg-card flex flex-col gap-4 shadow-sm mb-6">
          <h3 className="text-xl font-semibold text-primary mb-2">{t("Add Attendance Record")}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium mb-1 block">{t("Employee")}</label>
              <select 
                required
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.employeeId} 
                onChange={e => setFormData({...formData, employeeId: e.target.value})}
              >
                <option value="" disabled>{t("Select Employee")}</option>
                {employees.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Date")}</label>
              <Input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Punch In Time")}</label>
              <Input type="time" value={formData.punchIn} onChange={e => setFormData({...formData, punchIn: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Punch Out Time")}</label>
              <Input type="time" value={formData.punchOut} onChange={e => setFormData({...formData, punchOut: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Status")}</label>
              <select 
                required
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LEAVE">Leave</option>
                <option value="HALF_DAY">Half Day</option>
                <option value="HOLIDAY">Holiday</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">{t("Shift")}</label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.shiftId} 
                onChange={e => setFormData({...formData, shiftId: e.target.value})}
              >
                <option value="">{t("Select Shift (Optional)")}</option>
                {shifts.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} {s.startTime && s.endTime ? `(${s.startTime} - ${s.endTime})` : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-4 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>{t("Cancel")}</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t("Saving...") : t("Save Record")}</Button>
          </div>
        </form>
      ) : (
        <Tabs defaultValue="daily-attendance" className="w-full">
          <TabsList className="mb-4 flex flex-wrap h-auto w-fit max-w-full justify-start">
            {["Daily Attendance","Holidays"].map(tab => (
              <TabsTrigger key={tab} value={tab.toLowerCase().replace(/\s+/g, '-')} className="whitespace-nowrap px-4 py-2">
                {t(tab)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="daily-attendance">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <label className="text-xs font-semibold text-muted-foreground">{t("Date")}</label>
                <Input 
                  type="date" 
                  className="h-10 w-full sm:w-auto"
                  value={attendanceDateFilter}
                  onChange={(e) => setAttendanceDateFilter(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <label className="text-xs font-semibold text-muted-foreground">{t("Employee")}</label>
                <select 
                  className="h-10 rounded-md border bg-card px-3 py-2 text-sm shadow-sm w-full sm:w-auto"
                  value={attendanceEmpFilter}
                  onChange={(e) => setAttendanceEmpFilter(e.target.value)}
                >
                  <option value="ALL">All Employees</option>
                  {employees.map((emp: any) => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <label className="text-xs font-semibold text-muted-foreground">{t("Status")}</label>
                <select 
                  className="h-10 rounded-md border bg-card px-3 py-2 text-sm shadow-sm w-full sm:w-auto"
                  value={attendanceStatusFilter}
                  onChange={(e) => setAttendanceStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PRESENT">Present</option>
                  <option value="YET TO CHECK OUT">Yet to check out</option>
                  <option value="ABSENT">Absent</option>
                  <option value="HALF_DAY">Half Day</option>
                  <option value="LEAVE">Leave</option>
                  <option value="HOLIDAY">Holiday</option>
                </select>
              </div>
            </div>

            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("ID")}</TableHead>
                    <TableHead>{t("Name")}</TableHead>
                    <TableHead>{t("Date")}</TableHead>
                    <TableHead>{t("Punch In")}</TableHead>
                    <TableHead>{t("Punch Out")}</TableHead>
                    <TableHead>{t("Work Hr")}</TableHead>
                    <TableHead>{t("Status")}</TableHead>
                    <TableHead>{t("Shift")}</TableHead>
                    <TableHead className="text-right">{t("Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">{t("Loading...")}</TableCell>
                    </TableRow>
                  ) : filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        <EmptyState 
                          title="No records found" 
                          description="There are no daily attendance records matching your criteria."
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record: any) => {
                      const punchInDate = record.logs?.[0]?.punchIn ? new Date(record.logs[0].punchIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A';
                      const lastLog = record.logs?.[record.logs?.length - 1];
                      const punchOutDate = lastLog?.punchOut ? new Date(lastLog.punchOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A';

                      const isPunchedIn = record.logs && record.logs.length > 0 && !lastLog?.punchOut;
                      const displayStatus = isPunchedIn ? "YET TO CHECK OUT" : record.status;

                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.employee?.employeeId}</TableCell>
                          <TableCell>{record.employee?.firstName} {record.employee?.lastName}</TableCell>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                          <TableCell>{punchInDate}</TableCell>
                          <TableCell>{punchOutDate}</TableCell>
                          <TableCell>{record.effectiveHours ? record.effectiveHours.toFixed(2) + " hrs" : "0 hrs"}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              displayStatus === 'PRESENT' ? 'bg-green-100 text-green-800' :
                              displayStatus === 'YET TO CHECK OUT' ? 'bg-blue-100 text-blue-800' :
                              displayStatus === 'ABSENT' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {displayStatus}
                            </span>
                          </TableCell>
                          <TableCell>{record.shift?.name || 'Standard'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => setViewRecord({
                                ...record,
                                punchInDate,
                                punchOutDate
                              })}>
                                <Eye className="h-4 w-4 text-primary" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => {
                                const localDate = new Date(record.date).toISOString().split('T')[0];
                                const pIn = record.logs?.[0]?.punchIn ? new Date(record.logs[0].punchIn).toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}) : "";
                                const pOut = record.logs?.[0]?.punchOut ? new Date(record.logs[0].punchOut).toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}) : "";
                                setEditRecord({
                                  id: record.id,
                                  date: localDate,
                                  punchIn: pIn,
                                  punchOut: pOut,
                                  status: record.status,
                                  shiftId: record.shiftId || ""
                                });
                              }}>
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={async () => {
                                if(confirm("Are you sure you want to delete this record?")) {
                                  await api.delete(`/attendance/${record.id}`);
                                  queryClient.invalidateQueries({ queryKey: ["attendanceRecords"] });
                                }
                              }}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="holidays">
             {isCreatingHoliday ? (
               <form onSubmit={handleHolidaySubmit} className="border p-6 rounded-md bg-card flex flex-col gap-4 shadow-sm mb-6">
                 <h3 className="text-xl font-semibold text-primary mb-2">{t("Add New Holiday")}</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="text-sm font-medium mb-1 block">{t("Holiday Name")}</label>
                     <Input required value={holidayData.name} onChange={e => setHolidayData({...holidayData, name: e.target.value})} placeholder="e.g. Independence Day" />
                   </div>
                   <div>
                     <label className="text-sm font-medium mb-1 block">{t("Date")}</label>
                     <Input required type="date" value={holidayData.date} onChange={e => setHolidayData({...holidayData, date: e.target.value})} />
                   </div>
                   <div>
                     <label className="text-sm font-medium mb-1 block">{t("Type")}</label>
                     <select 
                       required
                       className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                       value={holidayData.type} 
                       onChange={e => setHolidayData({...holidayData, type: e.target.value})}
                     >
                       <option value="NATIONAL">National</option>
                       <option value="REGIONAL">Regional</option>
                       <option value="RESTRICTED">Restricted</option>
                     </select>
                   </div>
                   <div>
                     <label className="text-sm font-medium mb-1 block">{t("Description")}</label>
                     <Input value={holidayData.description} onChange={e => setHolidayData({...holidayData, description: e.target.value})} placeholder="Optional details..." />
                   </div>
                 </div>

                 <div className="flex gap-3 justify-end mt-4 border-t pt-4">
                   <Button type="button" variant="outline" onClick={() => setIsCreatingHoliday(false)}>{t("Cancel")}</Button>
                   <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t("Saving...") : t("Save Holiday")}</Button>
                 </div>
               </form>
             ) : (
               <div className="flex flex-col gap-4">
                 <div className="flex justify-end">
                   <Button onClick={() => setIsCreatingHoliday(true)}>
                     <Plus className="mr-2 h-4 w-4" />
                     {t("Add Holiday")}
                   </Button>
                 </div>
                 <div className="rounded-md border bg-card">
                   <Table>
                     <TableHeader>
                       <TableRow>
                         <TableHead>{t("Name")}</TableHead>
                         <TableHead>{t("Date")}</TableHead>
                         <TableHead>{t("Type")}</TableHead>
                         <TableHead>{t("Description")}</TableHead>
                         <TableHead className="text-right">{t("Actions")}</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {holidays.length === 0 ? (
                         <TableRow>
                           <TableCell colSpan={5} className="h-24 text-center">
                             <EmptyState 
                               title="No holidays found" 
                               description="There are no holidays added to the system yet."
                             />
                           </TableCell>
                         </TableRow>
                       ) : (
                         holidays.map((h: any) => (
                           <TableRow key={h.id}>
                             <TableCell className="font-medium">{h.name}</TableCell>
                             <TableCell>{new Date(h.date).toLocaleDateString()}</TableCell>
                             <TableCell>
                               <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                                 {h.type}
                               </span>
                             </TableCell>
                             <TableCell>{h.description || 'N/A'}</TableCell>
                             <TableCell className="text-right">
                               <div className="flex items-center justify-end gap-2">
                                 <Button variant="ghost" size="icon" onClick={async () => {
                                   if(confirm("Delete this holiday?")) {
                                     await api.delete(`/holidays/${h.id}`);
                                     queryClient.invalidateQueries({ queryKey: ["holidays"] });
                                   }
                                 }}>
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
               </div>
             )}
          </TabsContent>
        </Tabs>
      )}

      {/* View Record Modal */}
      <Dialog open={!!viewRecord} onOpenChange={(open) => !open && setViewRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Attendance Details")}</DialogTitle>
          </DialogHeader>
          {viewRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("Employee")}</p>
                  <p>{viewRecord.employee?.firstName} {viewRecord.employee?.lastName} ({viewRecord.employee?.employeeId})</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("Date")}</p>
                  <p>{new Date(viewRecord.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("Punch In Time")}</p>
                  <p>{viewRecord.punchInDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("Punch Out Time")}</p>
                  <p>{viewRecord.punchOutDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("Status")}</p>
                  <p>{viewRecord.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("Shift")}</p>
                  <p>{viewRecord.shift?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("Total Work Hours")}</p>
                  <p>{viewRecord.effectiveHours ? viewRecord.effectiveHours.toFixed(2) + " hrs" : "0 hrs"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Record Modal */}
      <Dialog open={!!editRecord} onOpenChange={(open) => !open && setEditRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Edit Attendance Record")}</DialogTitle>
          </DialogHeader>
          {editRecord && (
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t("Date")}</label>
                <Input required type="date" value={editRecord.date} onChange={e => setEditRecord({...editRecord, date: e.target.value})} />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">{t("Punch In Time")}</label>
                <Input type="time" value={editRecord.punchIn} onChange={e => setEditRecord({...editRecord, punchIn: e.target.value})} />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">{t("Punch Out Time")}</label>
                <Input type="time" value={editRecord.punchOut} onChange={e => setEditRecord({...editRecord, punchOut: e.target.value})} />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">{t("Status")}</label>
                <select 
                  required
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={editRecord.status} 
                  onChange={e => setEditRecord({...editRecord, status: e.target.value})}
                >
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LEAVE">Leave</option>
                  <option value="HALF_DAY">Half Day</option>
                  <option value="HOLIDAY">Holiday</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">{t("Shift")}</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={editRecord.shiftId} 
                  onChange={e => setEditRecord({...editRecord, shiftId: e.target.value})}
                >
                  <option value="">{t("Select Shift (Optional)")}</option>
                  {shifts.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name} {s.startTime && s.endTime ? `(${s.startTime} - ${s.endTime})` : ''}</option>
                  ))}
                </select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditRecord(null)}>{t("Cancel")}</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t("Saving...") : t("Save Changes")}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
