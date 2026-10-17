'use client';

import { StatusBadge } from '@/components/shared/status-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PatientAppointmentsTabProps {
  appointments: any[];
}

export function PatientAppointmentsTab({ appointments }: PatientAppointmentsTabProps) {
  if (appointments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
        No appointment history found for this patient.
      </div>
    );
  }

  const getStatusType = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'completed': return 'success';
      case 'scheduled': return 'info';
      case 'cancelled': return 'warning';
      case 'no_show': return 'error';
      default: return 'default';
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map(apt => (
            <TableRow key={apt.id}>
              <TableCell className="font-medium">{apt.appointment_type}</TableCell>
              <TableCell>{new Date(apt.start_time).toLocaleString()}</TableCell>
              <TableCell>
                <StatusBadge status={getStatusType(apt.status)} label={apt.status.replace('_', ' ')} />
              </TableCell>
              <TableCell className="text-muted-foreground">{apt.notes || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
