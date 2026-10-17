import { getSession } from './session';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export async function getTenantContext() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, session.userId))
    .limit(1);

  const [site] = await db
    .select()
    .from(schema.sites)
    .where(eq(schema.sites.id, session.siteId))
    .limit(1);

  if (!user || !site) {
    redirect('/login');
  }

  const [membership] = await db
    .select()
    .from(schema.memberships)
    .where(
      and(
        eq(schema.memberships.user_id, session.userId),
        eq(schema.memberships.site_id, session.siteId)
      )
    )
    .limit(1);

  return {
    user,
    site,
    role: membership?.role || session.role || 'staff',
    session,
  };
}
