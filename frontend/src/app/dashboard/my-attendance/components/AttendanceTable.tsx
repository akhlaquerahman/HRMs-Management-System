"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, Clock, AlertCircle, FileEdit, ArrowUp, ArrowDown, ArrowUpDown, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RequestCorrectionModal } from './RequestCorrectionModal';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AttendanceTable({ records, isLoading }: { records: any[], isLoading: boolean }) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'date', direction: 'desc' });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = null; // Reset to default on 3rd click (or just keep desc, but enterprise level often cycles)
    // Actually, let's just toggle between asc and desc for simplicity and consistency
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedRecords = [...records].sort((a, b) => {
    if (!sortConfig.direction) return 0;
    
    let aVal: any = '';
    let bVal: any = '';

    if (sortConfig.key === 'date') {
      aVal = new Date(a.date).getTime();
      bVal = new Date(b.date).getTime();
    } else if (sortConfig.key === 'checkIn') {
      aVal = a.logs && a.logs.length > 0 ? new Date(a.logs[0].punchIn).getTime() : 0;
      bVal = b.logs && b.logs.length > 0 ? new Date(b.logs[0].punchIn).getTime() : 0;
    } else if (sortConfig.key === 'checkOut') {
      aVal = a.logs && a.logs.length > 0 && a.logs[a.logs.length - 1].punchOut ? new Date(a.logs[a.logs.length - 1].punchOut).getTime() : 0;
      bVal = b.logs && b.logs.length > 0 && b.logs[b.logs.length - 1].punchOut ? new Date(b.logs[b.logs.length - 1].punchOut).getTime() : 0;
    } else if (sortConfig.key === 'workingHours') {
      aVal = Number(a.effectiveHours || 0);
      bVal = Number(b.effectiveHours || 0);
    } else if (sortConfig.key === 'status') {
      const isPunchedInA = a.logs && a.logs.length > 0 && !a.logs[a.logs.length - 1].punchOut;
      const isPunchedInB = b.logs && b.logs.length > 0 && !b.logs[b.logs.length - 1].punchOut;
      aVal = isPunchedInA ? "YET TO CHECK OUT" : a.status;
      bVal = isPunchedInB ? "YET TO CHECK OUT" : b.status;
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const SortableHeader = ({ label, sortKey }: { label: string, sortKey: string }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/80 select-none group transition-colors" 
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <div className="text-muted-foreground flex flex-col">
          {sortConfig.key === sortKey ? (
            sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />
          ) : (
            <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
    </TableHead>
  );

  const totalRecords = sortedRecords.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const paginatedRecords = sortedRecords.slice((page - 1) * pageSize, page * pageSize);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const statusVariants: any = {
    PRESENT: 'bg-green-100 text-green-700 hover:bg-green-100/80',
    ABSENT: 'bg-red-100 text-red-700 hover:bg-red-100/80',
    HALF_DAY: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80',
    LEAVE: 'bg-gray-100 dark:bg-slate-800 text-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 dark:bg-slate-800/80',
    'YET TO CHECK OUT': 'bg-blue-100 text-blue-700 hover:bg-blue-100/80',
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-12">
        <div className="w-full h-[300px] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0">
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <SortableHeader label="Date" sortKey="date" />
              <SortableHeader label="Check In" sortKey="checkIn" />
              <SortableHeader label="Check Out" sortKey="checkOut" />
              <SortableHeader label="Working Hours" sortKey="workingHours" />
              <TableHead>Break Time</TableHead>
              <TableHead>Shift</TableHead>
              <SortableHeader label="Status" sortKey="status" />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRecords.map((item: any) => {
              const isPunchedIn = item.logs && item.logs.length > 0 && !item.logs[item.logs.length - 1].punchOut;
              const displayStatus = isPunchedIn ? "YET TO CHECK OUT" : item.status;
              const isExpanded = !!expandedRows[item.id];

              let totalBreakMinutes = 0;
              (item.breaks || []).forEach((b: any) => {
                totalBreakMinutes += b.durationMinutes || 0;
              });

              return (
                <React.Fragment key={item.id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleRow(item.id)}
                  >
                    <TableCell>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </TableCell>
                    <TableCell className="font-medium">{format(new Date(item.date), 'dd MMM yyyy')}</TableCell>
                    <TableCell>
                      {item.logs && item.logs.length > 0 && item.logs[0].punchIn 
                        ? format(new Date(item.logs[0].punchIn), 'hh:mm a') 
                        : '--:--'}
                    </TableCell>
                    <TableCell>
                      {item.logs && item.logs.length > 0 && item.logs[item.logs.length - 1].punchOut 
                        ? format(new Date(item.logs[item.logs.length - 1].punchOut), 'hh:mm a') 
                        : '--:--'}
                    </TableCell>
                    <TableCell>{Number(item.effectiveHours || 0).toFixed(2)}h</TableCell>
                    <TableCell>{totalBreakMinutes > 0 ? `${totalBreakMinutes}m` : '0m'}</TableCell>
                    <TableCell className="text-muted-foreground">{item.shift?.name || 'Standard'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusVariants[displayStatus] || 'bg-primary/10 text-primary'}>
                        {displayStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(item);
                          setModalOpen(true);
                        }}
                      >
                        <FileEdit className="w-4 h-4 mr-2" /> Correct
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {isExpanded && (
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={9} className="p-0 border-b">
                        <div className="p-6">
                          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" /> Daily Timeline
                          </h4>
                          <div className="relative border-l-2 border-primary/20 ml-3 space-y-6">
                            {(item.logs || []).map((log: any, idx: number) => (
                              <div key={`log-${idx}`} className="relative pl-6">
                                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5 ring-4 ring-background" />
                                <div className="text-sm font-medium">Checked In</div>
                                <div className="text-xs text-muted-foreground">{format(new Date(log.punchIn), 'hh:mm a')}</div>
                                
                                {log.punchOut && (
                                  <div className="mt-4 relative">
                                    <div className="absolute w-3 h-3 bg-red-500 rounded-full -left-[31px] top-1.5 ring-4 ring-background" />
                                    <div className="text-sm font-medium">Checked Out</div>
                                    <div className="text-xs text-muted-foreground">{format(new Date(log.punchOut), 'hh:mm a')}</div>
                                  </div>
                                )}
                              </div>
                            ))}
                            {(item.breaks || []).map((b: any, idx: number) => (
                              <div key={`break-${idx}`} className="relative pl-6">
                                <div className="absolute w-3 h-3 bg-yellow-500 rounded-full -left-[7px] top-1.5 ring-4 ring-background" />
                                <div className="text-sm font-medium flex items-center gap-2">
                                  Break Started {b.durationMinutes > 0 && <span className="text-xs font-normal text-muted-foreground">({b.durationMinutes}m)</span>}
                                </div>
                                <div className="text-xs text-muted-foreground">{format(new Date(b.breakStart), 'hh:mm a')}</div>
                                
                                {b.breakEnd && (
                                  <div className="mt-4 relative">
                                    <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[31px] top-1.5 ring-4 ring-background" />
                                    <div className="text-sm font-medium">Break Ended (Resumed Work)</div>
                                    <div className="text-xs text-muted-foreground">{format(new Date(b.breakEnd), 'hh:mm a')}</div>
                                  </div>
                                )}
                              </div>
                            ))}
                            {(!item.logs || item.logs.length === 0) && (
                              <div className="text-sm text-muted-foreground ml-6 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> No logs available for this date.
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
            
            {paginatedRecords.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  No attendance records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="border-t p-4 flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page:</span>
          <Select 
            value={pageSize.toString()} 
            onValueChange={(val) => {
              setPageSize(Number(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="ml-4">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalRecords)} of {totalRecords} entries
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      <RequestCorrectionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        recordDate={selectedRecord ? new Date(selectedRecord.date) : undefined}
        currentIn={selectedRecord?.logs?.[0]?.punchIn ? new Date(selectedRecord.logs[0].punchIn) : undefined}
        currentOut={selectedRecord?.logs?.[selectedRecord.logs.length - 1]?.punchOut ? new Date(selectedRecord.logs[selectedRecord.logs.length - 1].punchOut) : undefined}
      />
    </div>
  );
}
