'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatPhoneDisplay } from '@/lib/phone';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PatientsTableProps {
  data: {
    patients: Array<any>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
}

export function PatientsTable({ data, selectedIds, onSelectAll, onSelectOne }: PatientsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="w-12">
                <Checkbox
                  checked={selectedIds.length === data.patients.length && data.patients.length > 0}
                  onCheckedChange={onSelectAll}
                />
              </TableCell>
              <TableHead>Patient</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>SMS Consent</TableHead>
              <TableHead>Last Visit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.patients.map(patient => {
              const initials = `${patient.first_name[0] || ''}${patient.last_name[0] || ''}`.toUpperCase();
              const isSelected = selectedIds.includes(patient.id);

              return (
                <TableRow key={patient.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell onClick={e => e.stopPropagation()} className="w-12">
                    <Checkbox checked={isSelected} onCheckedChange={checked => onSelectOne(patient.id, Boolean(checked))} />
                  </TableCell>
                  <TableCell onClick={() => router.push(`/patients/${patient.id}`)}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                        <p className="text-xs text-muted-foreground">{patient.date_of_birth ? `DOB: ${patient.date_of_birth}` : ''}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => router.push(`/patients/${patient.id}`)}>
                    <p className="text-sm">{formatPhoneDisplay(patient.phone) || patient.email || '-'}</p>
                    <p className="text-xs text-muted-foreground">{patient.phone && patient.email ? patient.email : ''}</p>
                  </TableCell>
                  <TableCell onClick={() => router.push(`/patients/${patient.id}`)}>
                    <div className="flex flex-wrap gap-1">
                      {patient.tags?.map((t: string) => (
                        <span key={t} className="bg-secondary text-secondary-foreground text-[10px] px-2 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell onClick={() => router.push(`/patients/${patient.id}`)}>
                    <StatusBadge
                      status={patient.sms_consent === 'opted_in' ? 'success' : 'warning'}
                      label={patient.sms_consent === 'opted_in' ? 'Opted In' : 'Opted Out'}
                    />
                  </TableCell>
                  <TableCell onClick={() => router.push(`/patients/${patient.id}`)}>
                    <span className="text-sm">{patient.last_visit_date || 'Never'}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Page {data.page} of {data.totalPages} ({data.total} total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.page <= 1}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', String(data.page - 1));
                router.push(`/patients?${params.toString()}`);
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.page >= data.totalPages}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set('page', String(data.page + 1));
                router.push(`/patients?${params.toString()}`);
              }}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
