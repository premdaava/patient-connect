'use server';

if (typeof window === 'undefined' && process.env.NEXT_RUNTIME) {
  require('server-only');
}

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function getSiteSettings(siteId: string) {
  try {
    await db.execute(sql`
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS quiet_hours jsonb;
      ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS notifications jsonb;
    `);
  } catch {}

  let [settings] = await db
    .select()
    .from(schema.siteSettings)
    .where(eq(schema.siteSettings.site_id, siteId))
    .limit(1);

  if (!settings) {
    [settings] = await db
      .insert(schema.siteSettings)
      .values({
        site_id: siteId,
        booking_enabled: 'true',
        appointment_duration_minutes: '30',
        buffer_minutes: '0',
        advance_booking_days: '30',
        reminder_default_enabled: 'true',
        reminder_hours_before: '24',
        auto_request_reviews: 'false',
        quiet_hours: { start: '21:00', end: '08:00', enabled: true },
        notifications: { email_alerts: true, sms_alerts: true, review_notifications: true, daily_digest: false },
      })
      .returning();
  }

  return settings;
}

export async function getTeamMembers(siteId: string) {
  const members = await db
    .select({
      membershipId: schema.memberships.id,
      role: schema.memberships.role,
      userId: schema.users.id,
      email: schema.users.email,
      firstName: schema.users.first_name,
      lastName: schema.users.last_name,
      phone: schema.users.phone,
      avatarUrl: schema.users.avatar_url,
      createdAt: schema.memberships.created_at,
    })
    .from(schema.memberships)
    .innerJoin(schema.users, eq(schema.memberships.user_id, schema.users.id))
    .where(eq(schema.memberships.site_id, siteId));

  return members;
}
