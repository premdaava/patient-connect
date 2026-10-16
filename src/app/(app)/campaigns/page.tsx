'use client';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Megaphone, Plus } from 'lucide-react';

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Megaphone}
        title="Campaigns"
        description="Send targeted messages to patients"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        }
      />

      <EmptyState
        icon={Megaphone}
        title="No campaigns yet"
        description="Create your first campaign to send targeted messages to patients"
        action={{
          label: 'New Campaign',
          onClick: () => console.log('New campaign'),
        }}
      />
    </div>
  );
}
