import { getTenantContext } from '@/lib/tenant';
import { getCampaignById } from '@/features/campaigns/queries';
import { CampaignDetailView } from '@/components/campaigns/campaign-detail-view';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({ params }: Props) {
  const { id } = await params;
  const tenant = await getTenantContext();
  const campaign = await getCampaignById(tenant.site.id, id);

  if (!campaign) {
    notFound();
  }

  return <CampaignDetailView campaign={campaign} siteId={tenant.site.id} />;
}
