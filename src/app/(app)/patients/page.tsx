import { getTenantContext } from '@/lib/tenant';
import { getPatients, getPatientTags } from '@/features/patients/queries';
import { PatientsView } from '@/components/patients/patients-view';

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const tenant = await getTenantContext();
  const siteId = tenant.site.id;
  const params = await searchParams;

  const search = typeof params.search === 'string' ? params.search : undefined;
  const consent = typeof params.consent === 'string' ? params.consent : undefined;
  const tag = typeof params.tag === 'string' ? params.tag : undefined;
  const lastVisit = typeof params.lastVisit === 'string' ? params.lastVisit : undefined;
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;

  const data = await getPatients(siteId, {
    search,
    consent,
    tag,
    lastVisit,
    page,
    limit: 15,
  });

  const tags = await getPatientTags(siteId);

  return <PatientsView data={data} tags={tags} />;
}


