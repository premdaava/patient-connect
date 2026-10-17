import { getTenantContext } from '@/lib/tenant';
import { getCampaigns } from '@/features/campaigns/queries';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Megaphone, Plus } from 'lucide-react';
import Link from 'next/link';
import { CampaignsList } from '@/components/campaigns/campaigns-list';

export default async function CampaignsPage() {
  const tenant = await getTenantContext();
  const campaigns = await getCampaigns(tenant.site.id);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Megaphone}
        title="Campaigns"
        description="Send targeted automated messages and track patient conversions"
        actions={
          <Button asChild>
            <Link href="/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Link>
          </Button>
        }
      />

      <CampaignsList campaigns={campaigns} siteId={tenant.site.id} />
    </div>
  );
}

