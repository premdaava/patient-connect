'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface DashboardChartsProps {
  messagesByDay: { date: string; count: number }[];
  statusCounts: {
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    no_show: number;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ef4444'];

export function DashboardCharts({ messagesByDay, statusCounts }: DashboardChartsProps) {
  const pieData = [
    { name: 'Scheduled', value: statusCounts.scheduled },
    { name: 'Confirmed', value: statusCounts.confirmed },
    { name: 'Completed', value: statusCounts.completed },
    { name: 'Cancelled', value: statusCounts.cancelled },
    { name: 'No-Show', value: statusCounts.no_show },
  ].filter(item => item.value > 0);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Messages Trend Area Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Message Volume</CardTitle>
          <CardDescription>Outbound messages sent over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            {messagesByDay.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No messaging data available for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={messagesByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs text-muted-foreground" />
                  <YAxis className="text-xs text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="count" name="Messages" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Appointment Status Breakdown Donut Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Appointment Status</CardTitle>
          <CardDescription>Breakdown of appointments by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            {pieData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No appointment data available for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
