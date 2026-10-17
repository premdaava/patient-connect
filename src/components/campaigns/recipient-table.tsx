'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, AlertCircle } from 'lucide-react';

interface Props {
  recipients: any[];
}

export function RecipientTable({ recipients }: Props) {
  const [search, setSearch] = useState('');

  const filtered = recipients.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = `${r.patient.first_name} ${r.patient.last_name}`.toLowerCase();
    const contact = (r.patient.phone || r.patient.email || '').toLowerCase();
    return name.includes(q) || contact.includes(q);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Delivered</Badge>;
      case 'replied':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">Replied</Badge>;
      case 'booked':
        return <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold">Booked</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg">Recipients ({filtered.length})</CardTitle>
          <CardDescription>Individual delivery and conversion tracking.</CardDescription>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search recipients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">No recipients found.</div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground font-medium">
                <tr>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Sent At</th>
                  <th className="p-3">Details / Error</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((rec) => (
                  <tr key={rec.id} className="hover:bg-accent/50">
                    <td className="p-3 font-medium">
                      <Link href={`/patients/${rec.patient.id}`} className="hover:underline text-primary">
                        {rec.patient.first_name} {rec.patient.last_name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{rec.patient.phone || rec.patient.email}</div>
                    </td>
                    <td className="p-3 uppercase text-xs font-semibold text-muted-foreground">{rec.channel}</td>
                    <td className="p-3">{getStatusBadge(rec.status)}</td>
                    <td className="p-3 text-xs text-muted-foreground">{rec.sent_at ? new Date(rec.sent_at).toLocaleString() : '-'}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {rec.error_message ? <span className="text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {rec.error_message}</span> : rec.status === 'booked' ? 'Appointment booked' : rec.status === 'replied' ? 'Patient replied' : 'Delivered successfully'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
