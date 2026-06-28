"use client";

import { useState, useEffect } from 'react';
import { LogIn, LogOut, Coffee, MapPin, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

export function HeroActionCard({ 
  statusData, 
  statusLoading, 
  onPunchIn, 
  onPunchOut 
}: {
  statusData: any,
  statusLoading: boolean,
  onPunchIn: () => void,
  onPunchOut: () => void
}) {
  const [liveTime, setLiveTime] = useState(new Date());
  const [workingDuration, setWorkingDuration] = useState("");

  const currentState = statusData?.currentState || "NOT_PUNCHED_IN";
  const currentRecord = statusData?.record;
  const punchInLog = currentRecord?.logs?.find((l: any) => !l.punchOut);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLiveTime(now);

      if (currentState === "PUNCHED_IN" && punchInLog?.punchIn) {
        const start = new Date(punchInLog.punchIn);
        const diff = now.getTime() - start.getTime();
        
        const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        
        setWorkingDuration(`${hours}:${minutes}:${seconds}`);
      } else {
        setWorkingDuration("00:00:00");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentState, punchInLog]);

  if (statusLoading) {
    return <div className="h-[200px] bg-card rounded-xl border shadow-sm animate-pulse" />;
  }

  return (
    <div className="bg-gradient-to-br from-primary/5 via-card to-card rounded-xl border shadow-sm p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Clock className="w-48 h-48" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <div className="text-sm font-medium text-primary uppercase tracking-wider">
            {format(liveTime, 'EEEE, dd MMMM yyyy')}
          </div>
          <h2 className="text-4xl font-bold font-mono tracking-tight text-foreground">
            {format(liveTime, 'hh:mm:ss a')}
          </h2>
          
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>HQ Office</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Coffee className="w-4 h-4" />
              <span>Standard Shift (09:00 - 18:00)</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-background/50 backdrop-blur-md rounded-2xl p-6 border shadow-sm w-full md:w-[320px]">
          {currentState === "NOT_PUNCHED_IN" ? (
            <>
              <div className="text-sm text-muted-foreground mb-4">Ready to start your day?</div>
              <Button size="lg" className="w-full font-semibold h-12 text-base shadow-lg transition-transform active:scale-95" onClick={onPunchIn}>
                <LogIn className="w-5 h-5 mr-2" /> Check In Now
              </Button>
            </>
          ) : currentState === "PUNCHED_IN" ? (
            <>
              <div className="text-sm text-muted-foreground mb-2">Working Since {format(new Date(punchInLog.punchIn), 'hh:mm a')}</div>
              <div className="text-3xl font-mono font-bold text-primary mb-4 animate-pulse">{workingDuration}</div>
              <Button size="lg" variant="destructive" className="w-full font-semibold h-12 text-base shadow-lg transition-transform active:scale-95" onClick={onPunchOut}>
                <LogOut className="w-5 h-5 mr-2" /> Check Out
              </Button>
            </>
          ) : currentState === "ON_BREAK" ? (
             <>
              <div className="text-sm text-muted-foreground mb-4">You are currently on break.</div>
              <Button size="lg" variant="outline" className="w-full font-semibold h-12 text-base shadow-lg transition-transform active:scale-95">
                Resume Work
              </Button>
             </>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-4">Shift completed for today.</div>
              <div className="text-2xl font-bold text-green-600">Great Job!</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
