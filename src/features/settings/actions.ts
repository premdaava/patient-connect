'use server';

if (typeof window === 'undefined' && process.env.NEXT_RUNTIME) {
  require('server-only');
}

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { hashSync } from 'bcryptjs';
import { sendGeneralEmail } from '@/lib/providers/email.resend';

export async function updatePracticeSettings(siteId: string, data: {
  name: string;
  slug: string;
  timezone: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  review_link?: string;
  logo_url?: string;
}) {
  await db
    .update(schema.sites)
    .set({
      name: data.name,
      slug: data.slug,
      timezone: data.timezone,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      website: data.website || null,
      logo_url: data.logo_url || null,
      updated_at: new Date().toISOString(),
    })
    .where(eq(schema.sites.id, siteId));

  await db
    .update(schema.siteSettings)
    .set({
      review_link: data.review_link || null,
      updated_at: new Date().toISOString(),
    })
    .where(eq(schema.siteSettings.site_id, siteId));

  revalidatePath('/settings');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateRemindersSettings(siteId: string, data: {
  reminder_hours_before: string;
  reminder_default_enabled: string;
  auto_request_reviews: string;
  quiet_hours?: any;
}) {
  await db
    .update(schema.siteSettings)
    .set({
      reminder_hours_before: data.reminder_hours_before,
      reminder_default_enabled: data.reminder_default_enabled,
      auto_request_reviews: data.auto_request_reviews,
      quiet_hours: data.quiet_hours,
      updated_at: new Date().toISOString(),
    })
    .where(eq(schema.siteSettings.site_id, siteId));

  revalidatePath('/settings');
  return { success: true };
}

export async function updateBookingSettings(siteId: string, data: {
  booking_enabled: string;
  appointment_duration_minutes: string;
  buffer_minutes: string;
  advance_booking_days: string;
  booking_hours?: any;
}) {
  await db
    .update(schema.siteSettings)
    .set({
      booking_enabled: data.booking_enabled,
      appointment_duration_minutes: data.appointment_duration_minutes,
      buffer_minutes: data.buffer_minutes,
      advance_booking_days: data.advance_booking_days,
      booking_hours: data.booking_hours,
      updated_at: new Date().toISOString(),
    })
    .where(eq(schema.siteSettings.site_id, siteId));

  revalidatePath('/settings');
  revalidatePath('/book');
  return { success: true };
}

export async function updateNotificationSettings(siteId: string, data: {
  notifications?: any;
}) {
  await db
    .update(schema.siteSettings)
    .set({
      notifications: data.notifications,
      updated_at: new Date().toISOString(),
    })
    .where(eq(schema.siteSettings.site_id, siteId));

  revalidatePath('/settings');
  return { success: true };
}

export async function inviteTeamMember(siteId: string, data: {
  email: string;
  first_name: string;
  last_name: string;
  role: 'owner' | 'admin' | 'staff';
  phone?: string;
}) {
  let [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, data.email))
    .limit(1);

  if (!user) {
    const passwordHash = hashSync('Welcome@123', 10);
    [user] = await db
      .insert(schema.users)
      .values({
        email: data.email,
        password_hash: passwordHash,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || null,
      })
      .returning();
  }

  const [existingMembership] = await db
    .select()
    .from(schema.memberships)
    .where(and(eq(schema.memberships.user_id, user.id), eq(schema.memberships.site_id, siteId)))
    .limit(1);

  if (existingMembership) {
    await db
      .update(schema.memberships)
      .set({ role: data.role, updated_at: new Date().toISOString() })
      .where(eq(schema.memberships.id, existingMembership.id));
  } else {
    await db.insert(schema.memberships).values({
      user_id: user.id,
      site_id: siteId,
      role: data.role,
    });
  }

  // Send invitation email
  await sendGeneralEmail({
    to: data.email,
    subject: "You've been invited to Patient Connect",
    body: `Hi ${data.first_name},\n\nYou have been invited to join Patient Connect as a ${data.role}.\n\nYou can log in at ${process.env.APP_URL || 'http://localhost:3000'}/login using:\nEmail: ${data.email}\nTemporary Password: Welcome@123\n\nPlease log in and update your password.`,
  });

  revalidatePath('/settings');
  return { success: true };
}

export async function updateMemberRole(siteId: string, membershipId: string, role: 'owner' | 'admin' | 'staff') {
  await db
    .update(schema.memberships)
    .set({ role, updated_at: new Date().toISOString() })
    .where(and(eq(schema.memberships.id, membershipId), eq(schema.memberships.site_id, siteId)));

  revalidatePath('/settings');
  return { success: true };
}

export async function removeTeamMember(siteId: string, membershipId: string) {
  await db
    .delete(schema.memberships)
    .where(and(eq(schema.memberships.id, membershipId), eq(schema.memberships.site_id, siteId)));

  revalidatePath('/settings');
  return { success: true };
}
