if (typeof window === 'undefined' && process.env.NEXT_RUNTIME) {
  require('server-only');
}

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function getSiteBySlug(slug: string) {
  const [site] = await db
    .select()
    .from(schema.sites)
    .where(eq(schema.sites.slug, slug))
    .limit(1);

  if (!site) return null;

  const [settings] = await db
    .select()
    .from(schema.siteSettings)
    .where(eq(schema.siteSettings.site_id, site.id))
    .limit(1);

  return {
    ...site,
    settings: settings || {
      booking_enabled: 'true',
      booking_hours: {
        monday: { enabled: true, start: '09:00', end: '17:00' },
        tuesday: { enabled: true, start: '09:00', end: '17:00' },
        wednesday: { enabled: true, start: '09:00', end: '17:00' },
        thursday: { enabled: true, start: '09:00', end: '17:00' },
        friday: { enabled: true, start: '09:00', end: '17:00' },
        saturday: { enabled: false, start: '09:00', end: '17:00' },
        sunday: { enabled: false, start: '09:00', end: '17:00' },
      },
    },
  };
}

export async function getBookingRequests(siteId: string) {
  return await db
    .select()
    .from(schema.bookingRequests)
    .where(eq(schema.bookingRequests.site_id, siteId))
    .orderBy(desc(schema.bookingRequests.created_at));
}

export async function getBookingRequestById(id: string) {
  const [request] = await db
    .select()
    .from(schema.bookingRequests)
    .where(eq(schema.bookingRequests.id, id))
    .limit(1);
  return request || null;
}
