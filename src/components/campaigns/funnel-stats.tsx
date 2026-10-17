'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, CheckCircle2, MessageSquare, Calendar } from 'lucide-react';

interface Props {
  total: number;
  delivered: number;
  replied: number;
  booked: number;
  failed: number;
}

export function FunnelStats({ total, delivered, replied, booked, failed }: Props) {
  const deliveredPct = total > 0 ? Math.round((delivered / total) * 100) : 0;
  const repliedPct = delivered > 0 ? Math.round((replied / delivered) * 100) : 0;
  const bookedPct = replied > 0 ? Math.round((booked / replied) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Sent / Recipient</CardTitle>
          <Send className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground mt-1">100% dispatch target</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">{delivered}</div>
          <p className="text-xs text-muted-foreground mt-1">{deliveredPct}% delivery rate ({failed} failed)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Replied</CardTitle>
          <MessageSquare className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{replied}</div>
          <p className="text-xs text-muted-foreground mt-1">{repliedPct}% response rate</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Booked Appointments</CardTitle>
          <Calendar className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{booked}</div>
          <p className="text-xs text-muted-foreground mt-1">{bookedPct}% booking conversion</p>
        </CardContent>
      </Card>
    </div>
  );
}
