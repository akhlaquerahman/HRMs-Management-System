"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from '@/lib/dateUtils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AddAttendanceModal } from "./components/AddAttendanceModal";
import { EditAttendanceModal } from "./components/EditAttendanceModal";
import { BulkUploadModal } from "./components/BulkUploadModal";
import { CorrectionsTab } from "./components/CorrectionsTab";
import { HolidaysTab } from "./components/HolidaysTab";
import { ShiftsTab } from "./components/ShiftsTab";
import { AnalyticsTab } from "./components/AnalyticsTab";
import { 
  UserCheck, UserX, Clock, AlarmClock, Plus, 
  CalendarDays, Download, ChevronRight, ChevronDown, MoreHorizontal, 
  AlertCircle, FileText, CheckCircle2, TrendingUp, TrendingDown, ArrowUp, ArrowDown, ArrowUpDown, UploadCloud
} from "lucide-react";
import { toast } from "sonner";

export default function AttendanceOperationsCenter() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState("10");
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [sortKey, setSortKey] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dateFilterType, setDateFilterType] = useState("today");

  const { data: summaryRes, isLoading: loadingSummary } = useQuery({
    queryKey: ["attendanceOpsSummary"],
    queryFn: async () => (await api.get("/attendance/operations/summary")).data
  });

  const queryDate = dateFilterType === "all" ? "all" : dateFilterType === "today" ? new Date().toISOString().split("T")[0] : targetDate;

  const { data: listRes, isLoading: loadingList } = useQuery({
    queryKey: ["attendanceOpsList", page, limit, search, sortKey, sortOrder, departmentFilter, statusFilter, queryDate],
    queryFn: async () => (await api.get(`/attendance/operations/list?page=${page}&limit=${limit}&search=${search}&sortKey=${sortKey}&sort=${sortOrder}&departmentId=${departmentFilter}&status=${statusFilter}&date=${queryDate}`)).data
  });

  const { data: departmentsData } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => (await api.get("/departments")).data.data
  });

  const { data: activitiesRes } = useQuery({
    queryKey: ["attendanceOpsActivities"],
    queryFn: async () => (await api.get("/attendance/operations/activities")).data
  });

  const summary = summaryRes?.data || {};
  const list = listRes?.data?.data || [];
  const pagination = listRes?.data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };
  const activities = activitiesRes?.data || [];
  const departments = departmentsData || [];

  const renderKPI = (title: string, value: string | number, icon: any, colorClass: string, cardBgClass: string) => (
    <Card className={`shadow-sm border-gray-100 ${cardBgClass}`}>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          </div>
        </div>
        <div className={`p-3 rounded-xl ${colorClass}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );

  const handleExportCSV = async () => {
    try {
      // Fetch full dataset for the current filters
      const response = await api.get(`/attendance/operations/list?page=1&limit=10000&search=${search}&sortKey=${sortKey}&sort=${sortOrder}&departmentId=${departmentFilter}&status=${statusFilter}&date=${queryDate}`);
      const fullList = response.data.data?.data || [];
      
      if (fullList.length === 0) {
        toast.error("No data to export");
        return;
      }

      // Convert to CSV
      const headers = ["Employee ID", "Name", "Department", "Date", "Check In", "Check Out", "Work Hrs", "Shift", "Status"];
      const csvRows = [headers.join(",")];

      fullList.forEach((record: any) => {
        const checkIn = record.logs && record.logs.length > 0 ? new Date(record.logs[0].punchIn).toLocaleTimeString() : "--:--";
        const checkOut = record.logs && record.logs.length > 0 && record.logs[record.logs.length-1].punchOut ? new Date(record.logs[record.logs.length-1].punchOut).toLocaleTimeString() : "--:--";
        
        const row = [
          record.employee.employeeId,
          `"${record.employee.firstName} ${record.employee.lastName}"`,
          `"${record.employee.department?.name || 'N/A'}"`,
          formatDate(record.date),
          checkIn,
          checkOut,
          record.grossHours ? record.grossHours.toFixed(2) : "0.00",
          record.shift?.name || 'Standard',
          record.status
        ];
        csvRows.push(row.join(","));
      });

      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Attendance_Export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Export successful!");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  const handleMarkAbsent = async (id: string) => {
    try {
      await api.put(`/attendance/${id}`, { status: "ABSENT" });
      toast.success("Marked as Absent");
      queryClient.invalidateQueries({ queryKey: ["attendanceOpsList"] });
      queryClient.invalidateQueries({ queryKey: ["attendanceOpsSummary"] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to mark absent");
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const SortableHeader = ({ label, sortKeyParam }: { label: string, sortKeyParam: string }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-100 select-none group transition-colors" 
      onClick={() => handleSort(sortKeyParam)}
    >
      <div className="flex items-center gap-1">
        {label}
        <div className="text-gray-400 flex flex-col">
          {sortKey === sortKeyParam ? (
            sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
          ) : (
            <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
    </TableHead>
  );

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Attendance Management</h2>
          <p className="text-gray-500 mt-1">Monitor employee attendance, shifts, holidays, corrections, and workforce availability.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2"/> Add Attendance
          </Button>
        </div>
      </div>

      {loadingSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {renderKPI("Present Today", summary.kpis?.presentToday || 0, <UserCheck className="w-5 h-5 text-green-700"/>, "bg-green-100", "bg-green-50/50")}
          {renderKPI("Absent Today", summary.kpis?.absentToday || 0, <UserX className="w-5 h-5 text-red-700"/>, "bg-red-100", "bg-red-50/50")}
          {renderKPI("Late Arrivals", summary.kpis?.lateArrivals || 0, <AlarmClock className="w-5 h-5 text-amber-700"/>, "bg-amber-100", "bg-amber-50/50")}
          {renderKPI("Pending Corrections", summary.kpis?.pendingCorrections || 0, <FileText className="w-5 h-5 text-blue-700"/>, "bg-blue-100", "bg-blue-50/50")}
          {renderKPI("Avg Working Hrs", `${summary.kpis?.avgWorkingHours || 0}h`, <Clock className="w-5 h-5 text-purple-700"/>, "bg-purple-100", "bg-purple-50/50")}
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <Tabs defaultValue="daily">
            <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 space-x-6">
              <TabsTrigger value="daily" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1">Daily Attendance</TabsTrigger>
              <TabsTrigger value="corrections" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1">Attendance Corrections</TabsTrigger>
              <TabsTrigger value="holidays" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1">Holiday Calendar</TabsTrigger>
              <TabsTrigger value="shifts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1">Shift Management</TabsTrigger>
              <TabsTrigger value="reports" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1">Reports & Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="mt-6 space-y-4">
              <div className="flex flex-wrap gap-3 items-center justify-between bg-gray-50 p-3 rounded-xl border">
                <div className="flex items-center gap-3 flex-1 min-w-[300px]">
                  <Input 
                    placeholder="Search employee, ID..." 
                    value={search} onChange={(e) => setSearch(e.target.value)} 
                    className="w-full md:max-w-xs bg-white"
                  />
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-[140px] bg-white"><SelectValue placeholder="Department" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Depts</SelectItem>
                      {departments.map((dept: any) => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={dateFilterType} onValueChange={setDateFilterType}>
                    <SelectTrigger className="w-[140px] bg-white"><SelectValue placeholder="Date Filter" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="custom">Custom Date...</SelectItem>
                    </SelectContent>
                  </Select>
                  {dateFilterType === "custom" && (
                    <Input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-[140px] bg-white text-sm"
                    />
                  )}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="PRESENT">Present</SelectItem><SelectItem value="ABSENT">Absent</SelectItem><SelectItem value="HALF_DAY">Half Day</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setDepartmentFilter("all"); setStatusFilter("all"); setDateFilterType("today"); setTargetDate(new Date().toISOString().split("T")[0]); }}>Reset</Button>
                  <Button variant="outline" size="sm" onClick={() => setIsBulkModalOpen(true)}>
                    <UploadCloud className="w-4 h-4 mr-2"/> Bulk Upload
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportCSV}>
                    <Download className="w-4 h-4 mr-2"/> Export CSV
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>Profile</TableHead>
                      <SortableHeader label="Emp ID" sortKeyParam="empId" />
                      <SortableHeader label="Date" sortKeyParam="date" />
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Work Hrs</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingList ? (
                      <TableRow><TableCell colSpan={9} className="h-32 text-center text-gray-500">Loading operations data...</TableCell></TableRow>
                    ) : list.length === 0 ? (
                      <TableRow><TableCell colSpan={9} className="h-32 text-center text-gray-500">No records found matching criteria.</TableCell></TableRow>
                    ) : (
                      list.map((record: any) => (
                        <React.Fragment key={record.id}>
                          <TableRow className={`hover:bg-gray-50/50 cursor-pointer ${expandedRow === record.id ? 'bg-blue-50/30' : ''}`} onClick={() => setExpandedRow(expandedRow === record.id ? null : record.id)}>
                            <TableCell>
                              {expandedRow === record.id ? <ChevronDown className="w-4 h-4 text-gray-400"/> : <ChevronRight className="w-4 h-4 text-gray-400"/>}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9"><AvatarFallback>{record.employee.firstName[0]}{record.employee.lastName[0]}</AvatarFallback></Avatar>
                                <div>
                                  <p className="font-medium text-sm text-gray-900">{record.employee.firstName} {record.employee.lastName}</p>
                                  <p className="text-xs text-gray-500">{record.employee.designation?.title || "Employee"}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500 font-medium">{record.employee.employeeId}</TableCell>
                            <TableCell className="text-sm">{formatDate(record.date)}</TableCell>
                            <TableCell className="text-sm">{record.logs[0]?.punchIn ? new Date(record.logs[0].punchIn).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}</TableCell>
                            <TableCell className="text-sm">{record.logs[record.logs.length-1]?.punchOut ? new Date(record.logs[record.logs.length-1].punchOut).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}</TableCell>
                            <TableCell className="text-sm font-medium">{record.grossHours ? `${record.grossHours.toFixed(2)}h` : '0.00h'}</TableCell>
                            <TableCell className="text-sm text-gray-600">{record.shift?.name || 'Standard'}</TableCell>
                            <TableCell>
                              {(() => {
                                const isPunchedIn = record.logs && record.logs.length > 0 && !record.logs[record.logs.length - 1].punchOut;
                                const displayStatus = isPunchedIn ? "YET TO CHECK OUT" : record.status;
                                return (
                                  <Badge variant="outline" className={
                                    displayStatus === 'PRESENT' ? 'bg-green-50 text-green-700 border-green-200' : 
                                    displayStatus === 'YET TO CHECK OUT' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                    displayStatus === 'HALF_DAY' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                                    displayStatus === 'ABSENT' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-gray-50 text-gray-700 border-gray-200'
                                  }>
                                    {displayStatus.replace('_', ' ')}
                                  </Badge>
                                );
                              })()}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                                  <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setExpandedRow(expandedRow === record.id ? null : record.id); }}>View Full Record</DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditRecord(record); setIsEditModalOpen(true); }}>Edit Attendance</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); handleMarkAbsent(record.id); }}>Mark Absent</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                          
                          {expandedRow === record.id && (
                            <TableRow className="bg-gray-50/30">
                              <TableCell colSpan={9} className="p-0 border-b">
                                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Punch History</h4>
                                    <div className="space-y-3">
                                      {record.logs.map((log: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center text-sm border-l-2 border-blue-500 pl-3">
                                          <div>
                                            <p className="text-gray-900 font-medium">In: {new Date(log.punchIn).toLocaleTimeString()}</p>
                                            <p className="text-gray-500 text-xs">{log.ipAddress || 'Office Network'}</p>
                                          </div>
                                          {log.punchOut && (
                                            <div className="text-right">
                                              <p className="text-gray-900 font-medium">Out: {new Date(log.punchOut).toLocaleTimeString()}</p>
                                              <p className="text-gray-500 text-xs">Web Browser</p>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Break Timeline</h4>
                                    {record.breaks.length > 0 ? (
                                      <div className="space-y-2">
                                        {record.breaks.map((b: any, idx: number) => (
                                          <div key={idx} className="text-sm flex justify-between">
                                            <span className="text-gray-600">Break {idx + 1}</span>
                                            <span className="font-medium text-gray-900">{b.durationMinutes} mins</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-500">No breaks taken.</p>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Record Details</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between"><span className="text-gray-500">Effective Hrs:</span><span className="font-medium">{record.effectiveHours?.toFixed(2) || '0.00'}h</span></div>
                                      <div className="flex justify-between"><span className="text-gray-500">Overtime:</span><span className="font-medium text-amber-600">0.00h</span></div>
                                      <div className="flex justify-between"><span className="text-gray-500">Device:</span><span>{record.logs[0]?.deviceName || 'Unknown'}</span></div>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/50">
                  <div className="flex items-center text-sm text-gray-500">
                    Rows per page
                    <Select value={limit} onValueChange={setLimit}>
                      <SelectTrigger className="w-[70px] h-8 ml-2 bg-white"><SelectValue placeholder="10" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries</span>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                      <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages || pagination.total === 0}>Next</Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="corrections">
              <CorrectionsTab />
            </TabsContent>
            
            <TabsContent value="holidays">
              <HolidaysTab />
            </TabsContent>

            <TabsContent value="shifts">
              <ShiftsTab />
            </TabsContent>

            <TabsContent value="reports">
              <AnalyticsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <AddAttendanceModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <EditAttendanceModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} record={editRecord} />
      <BulkUploadModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} />
    </div>
  );
}
