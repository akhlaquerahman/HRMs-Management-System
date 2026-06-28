"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, Clock, AlertCircle, FileEdit } from 'lucide-react';
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

  const totalRecords = records.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const paginatedRecords = records.slice((page - 1) * pageSize, page * pageSize);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const statusVariants: any = {
    PRESENT: 'bg-green-100 text-green-700 hover:bg-green-100/80',
    ABSENT: 'bg-red-100 text-red-700 hover:bg-red-100/80',
    HALF_DAY: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80',
    LEAVE: 'bg-gray-100 text-gray-700 hover:bg-gray-100/80',
    'YET TO CHECK OUT': 'bg-blue-100 text-blue-700 hover:bg-blue-100/80',
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border shadow-sm p-4 animate-pulse">
        <div className="h-10 bg-muted rounded-md w-full mb-4" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-14 border-t w-full" />
        ))}
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
              <TableHead>Date</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Working Hours</TableHead>
              <TableHead>Break Time</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Status</TableHead>
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
