"use client";

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Download, FilterX, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import api from '@/lib/axios';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, LogOut, MapPin, Loader2 } from 'lucide-react';

import { KPICards } from './components/KPICards';
import { AttendanceTable } from './components/AttendanceTable';
import { AttendanceCharts } from './components/AttendanceCharts';

export default function MyAttendancePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isPunchingIn, setIsPunchingIn] = useState(false);
  const [isPunchingOut, setIsPunchingOut] = useState(false);

  // Status API (Live Timer)
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['attendance_status'],
    queryFn: async () => (await api.get('/attendance/status')).data.data,
    refetchInterval: 60000 // Refetch every minute
  });

  // Summary API (KPIs)
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['attendance_summary'],
    queryFn: async () => (await api.get('/attendance/my/summary')).data.data
  });

  // Charts API (Analytics)
  const { data: chartsData, isLoading: chartsLoading } = useQuery({
    queryKey: ['attendance_charts'],
    queryFn: async () => (await api.get('/attendance/my/charts')).data.data
  });

  // List API (Table)
  const { data: records, isLoading: recordsLoading, isFetching: recordsFetching } = useQuery({
    queryKey: ['my_attendance'],
    queryFn: async () => (await api.get('/attendance/my')).data.data
  });

  const handlePunchIn = async () => {
    setIsPunchingIn(true);
    try {
      await api.post('/attendance/punch-in', {});
      toast.success("Checked in successfully!");
      queryClient.invalidateQueries({ queryKey: ['attendance_status'] });
      queryClient.invalidateQueries({ queryKey: ['my_attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance_summary'] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error punching in");
    } finally {
      setIsPunchingIn(false);
    }
  };

  const handlePunchOut = async () => {
    setIsPunchingOut(true);
    try {
      await api.post('/attendance/punch-out');
      toast.success("Checked out successfully!");
      queryClient.invalidateQueries({ queryKey: ['attendance_status'] });
      queryClient.invalidateQueries({ queryKey: ['my_attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance_summary'] });
      queryClient.invalidateQueries({ queryKey: ['attendance_charts'] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error punching out");
    } finally {
      setIsPunchingOut(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPeriodFilter("");
    setStatusFilter("ALL");
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['my_attendance'] });
  };

  const filteredRecords = (records || []).filter((item: any) => {
    let matchesPeriod = true;
    if (periodFilter) {
      const selectedDate = new Date(periodFilter);
      const itemDate = new Date(item.date);
      matchesPeriod = itemDate.getFullYear() === selectedDate.getFullYear() && 
                      itemDate.getMonth() === selectedDate.getMonth() &&
                      itemDate.getDate() === selectedDate.getDate();
    }

    const isPunchedIn = item.logs && item.logs.length > 0 && !item.logs[item.logs.length - 1].punchOut;
    const computedStatus = isPunchedIn ? "YET TO CHECK OUT" : item.status;
    const matchesStatus = statusFilter === "ALL" || computedStatus === statusFilter;

    return matchesPeriod && matchesStatus;
  });

  const handleExportCSV = () => {
    if (!filteredRecords || filteredRecords.length === 0) {
      toast.error("No records to export");
      return;
    }

    const headers = ["Date", "Status", "Check In", "Check Out", "Working Hours", "Shift"];
    const csvRows = [headers.join(",")];

    filteredRecords.forEach((item: any) => {
      const date = format(new Date(item.date), 'dd MMM yyyy');
      const isPunchedIn = item.logs && item.logs.length > 0 && !item.logs[item.logs.length - 1].punchOut;
      const displayStatus = isPunchedIn ? "YET TO CHECK OUT" : item.status;
      
      const checkIn = item.logs?.[0]?.punchIn ? format(new Date(item.logs[0].punchIn), 'HH:mm') : '-';
      const checkOut = item.logs?.[item.logs.length - 1]?.punchOut ? format(new Date(item.logs[item.logs.length - 1].punchOut), 'HH:mm') : '-';
      const hours = `${item.effectiveHours?.toFixed(1) || '0.0'}h`;
      const shift = item.shift?.name || 'Standard';

      csvRows.push([date, displayStatus, checkIn, checkOut, hours, shift].join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_export_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentState = statusData?.currentState || "NOT_PUNCHED_IN";
  const currentRecord = statusData?.record;
  const punchInLog = currentRecord?.logs?.find((l: any) => !l.punchOut);
  const activeShift = statusData?.shift;

  let isCheckInAllowed = true;
  if (currentState === "NOT_PUNCHED_IN" && activeShift) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMin] = activeShift.startTime.split(':').map(Number);
    const [endHour, endMin] = activeShift.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;
    
    let isNightShift = endMinutes < startMinutes;
    
    isCheckInAllowed = false;
    
    if (isNightShift) {
      if (currentMinutes >= startMinutes || currentMinutes <= endMinutes) {
         isCheckInAllowed = true;
      }
    } else {
      if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
         isCheckInAllowed = true;
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader 
          title={t("My Attendance")} 
          description={t("Track your working hours, daily timeline, and attendance metrics.")}
          showCreate={false}
          showSearch={false}
        />
        <div className="flex items-center gap-4">
          {statusLoading ? (
            <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
          ) : currentState === "NOT_PUNCHED_IN" ? (
            !isCheckInAllowed ? (
              <span className="text-sm font-semibold text-destructive px-4 py-2 border border-destructive/20 bg-destructive/10 rounded-lg">
                Shift Time: {activeShift?.startTime} - {activeShift?.endTime}
              </span>
            ) : (
              <Button size="lg" className="font-semibold shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handlePunchIn} disabled={isPunchingIn}>
                {isPunchingIn ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogIn className="w-4 h-4 mr-2" />} Check In
              </Button>
            )
          ) : currentState === "PUNCHED_IN" ? (
            <div className="flex items-center gap-4 bg-muted/30 border rounded-xl p-1.5 pr-2 shadow-sm">
              <div className="flex flex-col pl-3 hidden md:flex">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <MapPin className="w-3 h-3 text-primary" />
                  <span>HQ Office</span>
                  {activeShift && (
                    <span className="ml-2 px-1.5 py-0.5 bg-muted border rounded-md text-[10px]">
                      {activeShift.name} ({activeShift.startTime} - {activeShift.endTime})
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold mt-0.5">
                  Working since {currentRecord?.logs?.[0]?.punchIn ? format(new Date(currentRecord.logs[0].punchIn), 'hh:mm a') : ''}
                </div>
              </div>
              <div className="h-8 w-px bg-border hidden md:block mx-1"></div>
              <Button size="default" variant="destructive" className="font-semibold rounded-lg shadow-md" onClick={handlePunchOut} disabled={isPunchingOut}>
                {isPunchingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />} Check Out
              </Button>
            </div>
          ) : currentState === "ON_BREAK" ? (
             <Button size="lg" variant="outline" className="font-semibold shadow-lg">
                Resume Work
             </Button>
          ) : (
            <span className="text-sm font-semibold text-green-600">Shift Completed</span>
          )}
        </div>
      </div>

      <KPICards summaryData={summaryData} summaryLoading={summaryLoading} />

      {/* Filter Toolbar */}
      <div className="bg-card rounded-xl border shadow-sm p-4 sticky top-0 z-20">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by date or status..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <input 
            type="date" 
            max={new Date().toLocaleDateString('en-CA')}
            className="h-10 rounded-md border bg-card px-3 py-2 text-sm shadow-sm w-full md:w-[200px] focus:ring-2 focus:ring-primary focus:outline-none"
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
          />
          <select 
            className="h-10 rounded-md border bg-card px-3 py-2 text-sm shadow-sm w-full md:w-[200px] focus:ring-2 focus:ring-primary focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="YET TO CHECK OUT">Yet to check out</option>
            <option value="ABSENT">Absent</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="LEAVE">On Leave</option>
          </select>
          <Button variant="outline" size="icon" onClick={clearFilters} title="Clear Filters">
            <FilterX className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={refreshData} title="Refresh" isLoading={recordsFetching}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button variant="default" className="ml-auto" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2"/> Export CSV
          </Button>
        </div>
      </div>

      <AttendanceTable records={filteredRecords} isLoading={recordsLoading} />
    </div>
  );
}
