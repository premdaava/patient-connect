'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Phone, Mail, Calendar, User } from 'lucide-react';
import { approveBookingRequest, declineBookingRequest } from '@/features/booking/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function BookingRequestsPanel({ requests, siteId }: { requests: any[]; siteId: string }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [transition, startTransition] = useTransition();

  const pendingRequests = requests.filter(r => r.status === 'pending');

  if (pendingRequests.length === 0) {
    return null;
  }

  const handleApprove = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      try {
        const res = await approveBookingRequest(siteId, id);
        if (res.success) {
          toast.success('Booking request approved and appointment scheduled!');
          router.refresh();
        } else {
          toast.error(res.error || 'Failed to approve booking request.');
        }
      } catch {
        toast.error('An error occurred.');
      } finally {
        setPendingId(null);
      }
    });
  };

  const handleDecline = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      try {
        const res = await declineBookingRequest(siteId, id);
        if (res.success) {
          toast.success('Booking request declined.');
          router.refresh();
        } else {
          toast.error(res.error || 'Failed to decline booking request.');
        }
      } catch {
        toast.error('An error occurred.');
      } finally {
        setPendingId(null);
      }
    });
  };

  return (
    <Card className="border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <span>Online Booking Requests</span>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                {pendingRequests.length} Pending
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Review and approve patient appointment requests submitted from your public booking page or widget.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingRequests.map((req) => (
          <div key={req.id} className="bg-card p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{req.first_name} {req.last_name}</span>
                <Badge variant="outline" className="text-xs">{req.appointment_type}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-primary" /> {req.phone}</span>
                {req.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-primary" /> {req.email}</span>}
                <span className="flex items-center gap-1" suppressHydrationWarning><Calendar className="h-3 w-3 text-primary" /> {new Date(req.preferred_date).toLocaleString()}</span>
              </div>
              {req.notes && (
                <p className="text-xs text-muted-foreground italic bg-muted/50 p-2 rounded-lg mt-1">
                  &ldquo;{req.notes}&rdquo;
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive h-8 text-xs"
                onClick={() => handleDecline(req.id)}
                disabled={pendingId === req.id}
              >
                <XCircle className="h-3.5 w-3.5 mr-1" /> Decline
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleApprove(req.id)}
                disabled={pendingId === req.id}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
