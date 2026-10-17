'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Plus, Calendar, Send, CheckCircle2, AlertCircle, Clock, ArrowRight, Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { deleteCampaign } from '@/features/campaigns/actions';
import { toast } from 'sonner';

interface CampaignsListProps {
  campaigns: any[];
  siteId: string;
}

export function CampaignsList({ campaigns, siteId }: CampaignsListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    setLoadingId(id);
    const res = await deleteCampaign(siteId, id);
    setLoadingId(null);
    if (res.success) {
      toast.success('Campaign deleted successfully');
    } else {
      toast.error('Failed to delete campaign');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Sent</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">Scheduled</Badge>;
      case 'sending':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Sending</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (campaigns.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title="No campaigns yet"
        description="Create your first patient engagement or promotional campaign to reach targeted audiences."
        action={{
          label: 'Create Campaign',
          onClick: () => {
            window.location.href = '/campaigns/new';
          },
        }}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((camp) => {
        const total = parseInt(camp.total_recipients || '0', 10);
        const delivered = parseInt(camp.delivered_count || '0', 10);
        const replied = parseInt(camp.replied_count || '0', 10);
        const booked = parseInt(camp.booked_count || '0', 10);

        return (
          <Card key={camp.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold line-clamp-1">{camp.name}</CardTitle>
                  <CardDescription className="uppercase text-xs font-medium tracking-wider mt-0.5">
                    {camp.channel} campaign
                  </CardDescription>
                </div>
                {getStatusBadge(camp.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2 bg-muted/50 p-2.5 rounded-lg border">
                {camp.body}
              </p>

              <div className="grid grid-cols-3 gap-2 text-center bg-accent/30 p-2.5 rounded-lg text-xs">
                <div>
                  <div className="text-muted-foreground">Recipients</div>
                  <div className="font-semibold text-foreground text-sm mt-0.5">{total}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Delivered</div>
                  <div className="font-semibold text-emerald-600 text-sm mt-0.5">{delivered}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Booked</div>
                  <div className="font-semibold text-primary text-sm mt-0.5">{booked}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                <span>{camp.sent_at ? `Sent ${new Date(camp.sent_at).toLocaleDateString()}` : camp.scheduled_for ? `Scheduled ${new Date(camp.scheduled_for).toLocaleDateString()}` : `Created ${new Date(camp.created_at).toLocaleDateString()}`}</span>
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(camp.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" asChild className="h-8">
                    <Link href={`/campaigns/${camp.id}`}>
                      View <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
