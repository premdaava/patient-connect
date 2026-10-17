'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, XCircle } from 'lucide-react';
import { FunnelStats } from './funnel-stats';
import { RecipientTable } from './recipient-table';
import { cancelCampaign } from '@/features/campaigns/actions';
import { toast } from 'sonner';

interface Props {
  campaign: any;
  siteId: string;
}

export function CampaignDetailView({ campaign, siteId }: Props) {
  const [cancelling, setCancelling] = useState(false);

  const total = parseInt(campaign.total_recipients || '0', 10);
  const delivered = parseInt(campaign.delivered_count || '0', 10);
  const replied = parseInt(campaign.replied_count || '0', 10);
  const booked = parseInt(campaign.booked_count || '0', 10);
  const failed = parseInt(campaign.failed_count || '0', 10);

  const handleCancel = async () => {
    if (!confirm('Cancel this scheduled campaign?')) return;
    setCancelling(true);
    const res = await cancelCampaign(siteId, campaign.id);
    setCancelling(false);
    if (res.success) toast.success('Campaign cancelled');
    else toast.error('Failed to cancel');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" asChild className="h-9 w-9">
              <Link href="/campaigns"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
            <Badge className="capitalize">{campaign.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground capitalize">
            {campaign.channel} campaign &bull; Created {new Date(campaign.created_at).toLocaleDateString()}
          </p>
        </div>
        {campaign.status === 'scheduled' && (
          <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
            <XCircle className="mr-2 h-4 w-4" /> Cancel Campaign
          </Button>
        )}
      </div>

      <FunnelStats total={total} delivered={delivered} replied={replied} booked={booked} failed={failed} />

      <Card>
        <CardHeader><CardTitle className="text-base">Campaign Message</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {campaign.subject && (
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase">Subject:</span>
              <div className="text-sm font-medium">{campaign.subject}</div>
            </div>
          )}
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Body:</span>
            <div className="bg-muted/40 p-3 rounded-lg border text-sm mt-1 whitespace-pre-wrap">{campaign.body}</div>
          </div>
        </CardContent>
      </Card>

      <RecipientTable recipients={campaign.recipients || []} />
    </div>
  );
}
