'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MessageSquare, ExternalLink, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ensurePatientThread } from '@/features/inbox/actions';

export function ReviewRequestsTable({ requests }: { requests: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();

  const filtered = requests.filter((req) => {
    const name = `${req.patient_first || ''} ${req.patient_last || ''}`.toLowerCase();
    const matchSearch = name.includes(searchQuery.toLowerCase()) || (req.appointment_type || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || req.status === statusFilter || (statusFilter === 'submitted' && req.rating !== null);
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <Input placeholder="Search patient..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-sm" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="clicked">Clicked</SelectItem>
            <SelectItem value="submitted">Completed / Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Appointment</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating & Feedback</TableHead>
              <TableHead>Date</TableHead>

            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No review requests found.</TableCell></TableRow>
            ) : (
              filtered.map((req) => {
                const ratingNum = req.rating ? parseInt(req.rating, 10) : null;
                const isLow = ratingNum !== null && ratingNum <= 3;
                return (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.patient_first} {req.patient_last}<div className="text-xs text-muted-foreground">{req.patient_phone}</div></TableCell>
                    <TableCell>{req.appointment_type || 'General Visit'}</TableCell>
                    <TableCell className="uppercase text-xs font-semibold">{req.channel}</TableCell>
                    <TableCell>
                      {ratingNum !== null ? <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Completed ({ratingNum}★)</Badge> : req.status === 'sent' ? <Badge variant="secondary">Sent</Badge> : <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">Clicked</Badge>}
                    </TableCell>
                    <TableCell>
                      {ratingNum !== null ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (<Star key={s} className={`h-3.5 w-3.5 ${s <= ratingNum ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`} />))}
                          </div>
                          {req.feedback && <p className="text-xs text-muted-foreground italic">"{req.feedback}"</p>}
                          {isLow && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <Badge variant="destructive" className="text-[10px] gap-1 px-1.5 py-0.5"><AlertCircle className="h-3 w-3" /> Needs follow-up</Badge>
                              <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={async () => {
                                await ensurePatientThread(req.patient_id, req.channel);
                                router.push(`/inbox?patient_id=${req.patient_id}`);
                              }}><MessageSquare className="h-3 w-3 mr-1" /> Reply</Button>
                            </div>
                          )}
                        </div>
                      ) : (<span className="text-xs text-muted-foreground">Pending</span>)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{req.sent_at ? req.sent_at.split('T')[0] : '-'}</TableCell>

                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
