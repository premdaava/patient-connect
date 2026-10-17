import { getTenantContext } from '@/lib/tenant';
import { getTemplates } from '@/features/templates/queries';
import { TemplatesView } from '@/components/templates/templates-view';

export default async function TemplatesPage() {
  const { site } = await getTenantContext();
  const templates = await getTemplates(site.id);

  return <TemplatesView initialTemplates={templates} siteId={site.id} siteName={site.name} />;
}

