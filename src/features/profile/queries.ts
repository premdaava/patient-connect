'use server';

if (typeof window === 'undefined' && process.env.NEXT_RUNTIME) {
  require('server-only');
}

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/session';

export async function getUserProfile(userId: string, siteId: string) {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  const [membership] = await db
    .select()
    .from(schema.memberships)
    .where(and(eq(schema.memberships.user_id, userId), eq(schema.memberships.site_id, siteId)))
    .limit(1);

  const [site] = await db
    .select()
    .from(schema.sites)
    .where(eq(schema.sites.id, siteId))
    .limit(1);

  return {
    user: user || null,
    membership: membership || null,
    site: site || null,
  };
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

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

  return {
    user: user || null,
    site: site || null,
  };
}

