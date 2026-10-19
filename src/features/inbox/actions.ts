'use server';

if (typeof window === 'undefined' && process.env.NEXT_RUNTIME) {
  require('server-only');
}

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, asc, sql } from 'drizzle-orm';
import { sendMockSms } from '@/lib/providers/sms.mock';
import { revalidatePath } from 'next/cache';
import { getThreads, ThreadFilters } from './queries';
export type { ThreadFilters };

export async function getThreadsAction(siteId: string, filters?: ThreadFilters) {
  return await getThreads(siteId, filters);
}

import { getTenantContext } from '@/lib/tenant';

export async function sendMessage(
  siteId: string,
  threadId: string,
  patientId: string,
  body: string,
  channel: string = 'sms',
  userId?: string
) {
  const [patient] = await db
    .select()
    .from(schema.patients)
    .where(and(eq(schema.patients.site_id, siteId), eq(schema.patients.id, patientId)))
    .limit(1);

  if (!patient || !patient.phone) {
    return { success: false, error: 'Patient or phone number not found' };
  }

  if (channel === 'sms') {
    const smsResult = await sendMockSms({
      siteId,
      patientId,
      to: patient.phone,
      body,
    });

    if (!smsResult.success) {
      return { success: false, error: smsResult.error };
    }
  }

  const nowIso = new Date().toISOString();

  const [message] = await db
    .insert(schema.messages)
    .values({
      site_id: siteId,
      thread_id: threadId,
      patient_id: patientId,
      direction: 'outbound',
      channel,
      sender_type: userId ? 'staff' : 'system',
      sender_id: userId || null,
      body,
      status: 'sent',
      is_read: 'true',
    })
    .returning();

  await db
    .update(schema.threads)
    .set({
      last_message_at: nowIso,
      last_message_preview: body,
      updated_at: nowIso,
    })
    .where(eq(schema.threads.id, threadId));

  revalidatePath('/inbox');
  return { success: true, message };
}

export async function getUnreadCountAction(siteId: string) {
  const threads = await db
    .select({ unread_count: schema.threads.unread_count })
    .from(schema.threads)
    .where(eq(schema.threads.site_id, siteId));

  return threads.reduce((acc, t) => acc + (parseInt(t.unread_count, 10) > 0 ? 1 : 0), 0);
}

export async function getSidebarUnreadCount() {
  const tenant = await getTenantContext();
  const threads = await db
    .select({ unread_count: schema.threads.unread_count })
    .from(schema.threads)
    .where(eq(schema.threads.site_id, tenant.site.id));

  return threads.reduce((acc, t) => acc + (parseInt(t.unread_count, 10) > 0 ? 1 : 0), 0);
}

export async function markThreadRead(siteId: string, threadId: string) {
  await db
    .update(schema.threads)
    .set({
      unread_count: '0',
      updated_at: new Date().toISOString(),
    })
    .where(and(eq(schema.threads.site_id, siteId), eq(schema.threads.id, threadId)));

  await db
    .update(schema.messages)
    .set({ is_read: 'true' })
    .where(and(eq(schema.messages.site_id, siteId), eq(schema.messages.thread_id, threadId), eq(schema.messages.direction, 'inbound')));

  revalidatePath('/inbox');
  return { success: true };
}

export async function updatePatientConsent(
  siteId: string,
  patientId: string,
  smsConsent: string,
  emailConsent: string
) {
  const [existing] = await db
    .select()
    .from(schema.consents)
    .where(and(eq(schema.consents.site_id, siteId), eq(schema.consents.patient_id, patientId)))
    .limit(1);

  if (existing) {
    await db
      .update(schema.consents)
      .set({
        sms_consent: smsConsent,
        email_consent: emailConsent,
        updated_at: new Date().toISOString(),
      })
      .where(eq(schema.consents.id, existing.id));
  } else {
    await db.insert(schema.consents).values({
      site_id: siteId,
      patient_id: patientId,
      sms_consent: smsConsent,
      email_consent: emailConsent,
    });
  }

  revalidatePath('/inbox');
  revalidatePath('/patients');
  return { success: true };
}

export async function getThreadMessages(siteId: string, threadId: string) {
  return await db
    .select({
      id: schema.messages.id,
      site_id: schema.messages.site_id,
      thread_id: schema.messages.thread_id,
      patient_id: schema.messages.patient_id,
      direction: schema.messages.direction,
      channel: schema.messages.channel,
      sender_type: schema.messages.sender_type,
      subject: schema.messages.subject,
      body: schema.messages.body,
      status: schema.messages.status,
      is_read: schema.messages.is_read,
      created_at: schema.messages.created_at,
    })
    .from(schema.messages)
    .where(and(eq(schema.messages.site_id, siteId), eq(schema.messages.thread_id, threadId)))
    .orderBy(asc(schema.messages.created_at));
}

export async function getPatientNextAppointment(siteId: string, patientId: string) {
  const nowIso = new Date().toISOString();
  const [apt] = await db
    .select()
    .from(schema.appointments)
    .where(
      and(
        eq(schema.appointments.site_id, siteId),
        eq(schema.appointments.patient_id, patientId),
        sql`${schema.appointments.start_time} >= ${nowIso}`
      )
    )
    .orderBy(asc(schema.appointments.start_time))
    .limit(1);
  return apt || null;
}


export async function getOrCreateThread(siteId: string, patientId: string, channel: string = 'sms') {
  let [thread] = await db
    .select()
    .from(schema.threads)
    .where(and(eq(schema.threads.site_id, siteId), eq(schema.threads.patient_id, patientId)))
    .limit(1);

  if (!thread) {
    const now = new Date().toISOString();
    [thread] = await db
      .insert(schema.threads)
      .values({
        site_id: siteId,
        patient_id: patientId,
        channel,
        status: 'open',
        last_message_at: now,
        last_message_preview: 'Review feedback follow-up',
        unread_count: '0',
      })
      .returning();
  }

  return thread;
}

export async function ensurePatientThread(patientId: string, channel: string = 'sms') {
  const { site } = await getTenantContext();
  return await getOrCreateThread(site.id, patientId, channel);
}

