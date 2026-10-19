'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ReviewSummaryCard } from '@/components/reviews/review-summary-card';
import { ReviewRequestsTable } from '@/components/reviews/review-requests-table';
import { SendReviewDialog } from '@/components/reviews/send-review-dialog';
import { Star } from 'lucide-react';

interface ReviewsViewProps {
  requests: any[];
  stats: any;
  patients: any[];
}

export function ReviewsView({ requests, stats, patients }: ReviewsViewProps) {
  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Star}
        title="Reviews"
        description="Manage review requests, feedback ratings, and reputation tracking"
        actions={<SendReviewDialog patients={patients} />}
      />

      <ReviewSummaryCard stats={stats} />

      {requests.length === 0 ? (
        <>
          <EmptyState
            icon={Star}
            title="No review requests sent"
            description="Start collecting reviews by sending requests to your patients after completed appointments"
            action={{
              label: 'Send Review Request',
              onClick: () => setSendDialogOpen(true),
            }}
          />
          <SendReviewDialog
            patients={patients}
            open={sendDialogOpen}
            onOpenChange={setSendDialogOpen}
          />
        </>
      ) : (
        <ReviewRequestsTable requests={requests} />
      )}
    </div>
  );
}
