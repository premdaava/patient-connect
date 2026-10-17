import { getTenantContext } from '@/lib/tenant';
import { getReviewRequests, getReviewStats } from '@/features/reviews/queries';
import { getPatients } from '@/features/patients/queries';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ReviewSummaryCard } from '@/components/reviews/review-summary-card';
import { ReviewRequestsTable } from '@/components/reviews/review-requests-table';
import { SendReviewDialog } from '@/components/reviews/send-review-dialog';
import { Star } from 'lucide-react';

export default async function ReviewsPage() {
  const { site } = await getTenantContext();
  const requests = await getReviewRequests(site.id);
  const stats = await getReviewStats(site.id);
  const { patients } = await getPatients(site.id, { limit: 100 });

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
        <EmptyState
          icon={Star}
          title="No review requests sent"
          description="Start collecting reviews by sending requests to your patients after completed appointments"
          action={{
            label: 'Send Review Request',
            onClick: () => {},
          }}
        />
      ) : (
        <ReviewRequestsTable requests={requests} />
      )}
    </div>
  );
}

