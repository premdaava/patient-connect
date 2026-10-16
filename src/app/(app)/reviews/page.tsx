'use client';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Star, Plus } from 'lucide-react';

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Star}
        title="Reviews"
        description="Manage review requests and responses"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Send Review Request
          </Button>
        }
      />

      <EmptyState
        icon={Star}
        title="No review requests sent"
        description="Start collecting reviews by sending requests to your patients"
        action={{
          label: 'Send Review Request',
          onClick: () => console.log('Send review request'),
        }}
      />
    </div>
  );
}
