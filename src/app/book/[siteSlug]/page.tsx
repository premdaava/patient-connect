import { getSiteBySlug } from '@/features/booking/queries';
import { notFound } from 'next/navigation';
import { BookingClientView } from './booking-client-view';

export default async function PublicBookingPage({
  params,
}: {
  params: Promise<{ siteSlug: string }>;
}) {
  const { siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);

  if (!site) {
    notFound();
  }

  return <BookingClientView site={site} siteSlug={siteSlug} />;
}
