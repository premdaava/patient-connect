import { getTenantContext } from '@/lib/tenant';
import { getReviewRequests, getReviewStats } from '@/features/reviews/queries';
import { getPatients } from '@/features/patients/queries';
import { ReviewsView } from '@/components/reviews/reviews-view';

export default async function ReviewsPage() {
  const { site } = await getTenantContext();
  const requests = await getReviewRequests(site.id);
  const stats = await getReviewStats(site.id);
  const { patients } = await getPatients(site.id, { limit: 100 });

  return <ReviewsView requests={requests} stats={stats} patients={patients} />;
}


