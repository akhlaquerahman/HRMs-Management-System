"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export function AttendanceCharts({ chartsData, chartsLoading }: { chartsData: any, chartsLoading: boolean }) {
  if (chartsLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="h-[300px] bg-card rounded-xl border shadow-sm animate-pulse" />
        <div className="h-[300px] bg-card rounded-xl border shadow-sm animate-pulse" />
      </div>
    );
  }

  const { weeklyHours, monthlyAttendance } = chartsData || {};

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      {/* Weekly Hours Bar Chart */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6">Weekly Hours Trend</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyHours || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
              <RechartsTooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }} />
              <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Attendance Pie Chart */}
      <div className="bg-card rounded-xl border shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-6">Monthly Attendance</h3>
        <div className="h-[250px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={monthlyAttendance || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {(monthlyAttendance || []).map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
