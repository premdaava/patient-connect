'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function AppointmentsCalendar({ appointments, onSelectAppointment, currentDate, onDateChange }: any) {
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const days = viewMode === 'week' ? 7 : 1;
  const weekDays = Array.from({ length: days }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: 11 }, (_, i) => i + 8);

  const handlePrev = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - (viewMode === 'week' ? 7 : 1));
    onDateChange(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + (viewMode === 'week' ? 7 : 1));
    onDateChange(d);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-300';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      case 'no_show': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrev}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => onDateChange(new Date())}>Today</Button>
          <Button variant="outline" size="sm" onClick={handleNext}><ChevronRight className="h-4 w-4" /></Button>
          <span className="font-semibold text-sm ml-2">
            {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {viewMode === 'week' && ` - ${weekDays[weekDays.length - 1].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          <Button size="sm" variant={viewMode === 'week' ? 'default' : 'ghost'} className="h-7 text-xs" onClick={() => setViewMode('week')}>Week</Button>
          <Button size="sm" variant={viewMode === 'day' ? 'default' : 'ghost'} className="h-7 text-xs" onClick={() => setViewMode('day')}>Day</Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 border-b bg-muted/50 text-xs font-semibold text-muted-foreground">
            <div className="p-3 text-center border-r">Time</div>
            {weekDays.map((d, i) => (
              <div key={i} className="p-3 text-center border-r last:border-r-0">
                <div>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className="text-foreground text-sm font-bold">{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              </div>
            ))}
          </div>

          <div className="divide-y">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 min-h-[70px]">
                <div className="p-2 text-right text-xs text-muted-foreground border-r bg-muted/20">
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
                {weekDays.map((d, dayIdx) => {
                  const dayAppointments = appointments.filter((a: any) => {
                    const aDate = new Date(a.start_time);
                    return aDate.getFullYear() === d.getFullYear() && aDate.getMonth() === d.getMonth() && aDate.getDate() === d.getDate() && aDate.getHours() === hour;
                  });

                  return (
                    <div key={dayIdx} className="p-1 border-r last:border-r-0 relative space-y-1">
                      {dayAppointments.map((apt: any) => (
                        <div key={apt.id} onClick={() => onSelectAppointment(apt)} className={`p-2 rounded border text-xs cursor-pointer transition hover:shadow-md ${getStatusColor(apt.status)}`}>
                          <div className="font-semibold truncate">{apt.patient.first_name} {apt.patient.last_name}</div>
                          <div className="text-[10px] opacity-85 truncate">{apt.appointment_type} • {apt.provider}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
