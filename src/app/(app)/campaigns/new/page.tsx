import { getTenantContext } from '@/lib/tenant';
import { getTemplates } from '@/features/templates/queries';
import { getPatientTags } from '@/features/patients/queries';
import { PageHeader } from '@/components/shared/page-header';
import { Megaphone } from 'lucide-react';
import { CampaignBuilderWizard } from '@/components/campaigns/campaign-builder-wizard';

export default async function NewCampaignPage() {
  const tenant = await getTenantContext();
  const templates = await getTemplates(tenant.site.id);
  const availableTags = await getPatientTags(tenant.site.id);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Megaphone}
        title="Create New Campaign"
        description="Build an audience segment, draft your message, and schedule dispatch"
      />

      <CampaignBuilderWizard
        siteId={tenant.site.id}
        templates={templates}
        availableTags={availableTags}
      />
    </div>
  );
}
