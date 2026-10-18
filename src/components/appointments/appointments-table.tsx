'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye } from 'lucide-react';

export function AppointmentsTable({ appointments, onSelectAppointment }: { appointments: any[]; onSelectAppointment: (apt: any) => void }) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'no_show': return 'outline';
      default: return 'secondary';
    }
  };

  if (appointments.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">
        No appointments found matching your filters.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((apt) => (
            <TableRow key={apt.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onSelectAppointment(apt)}>
              <TableCell className="font-medium">
                {apt.patient.first_name} {apt.patient.last_name}
                <div className="text-xs text-muted-foreground">{apt.patient.phone || apt.patient.email}</div>
              </TableCell>
              <TableCell>{apt.appointment_type}</TableCell>
              <TableCell>{apt.provider}</TableCell>
              <TableCell suppressHydrationWarning>
                <div>{new Date(apt.start_time).toLocaleDateString()}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(apt.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(apt.status)}>
                  {apt.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onSelectAppointment(apt); }}>
                  <Eye className="h-4 w-4 mr-1" /> View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
