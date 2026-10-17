import 'server-only';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';


export interface ThreadFilters {
  search?: string;
  filter?: 'all' | 'unread';
}

export async function getThreads(siteId: string, filters?: ThreadFilters) {
  const threadsList = await db
    .select({
      id: schema.threads.id,
      site_id: schema.threads.site_id,
      patient_id: schema.threads.patient_id,
      channel: schema.threads.channel,
      status: schema.threads.status,
      last_message_at: schema.threads.last_message_at,
      last_message_preview: schema.threads.last_message_preview,
      unread_count: schema.threads.unread_count,
      created_at: schema.threads.created_at,
      patient: {
        id: schema.patients.id,
        first_name: schema.patients.first_name,
        last_name: schema.patients.last_name,
        phone: schema.patients.phone,
        email: schema.patients.email,
        date_of_birth: schema.patients.date_of_birth,
      },
      consent: {
        sms_consent: schema.consents.sms_consent,
        email_consent: schema.consents.email_consent,
      },
    })
    .from(schema.threads)
    .innerJoin(schema.patients, eq(schema.threads.patient_id, schema.patients.id))
    .leftJoin(schema.consents, and(eq(schema.consents.patient_id, schema.patients.id), eq(schema.consents.site_id, siteId)))
    .where(eq(schema.threads.site_id, siteId))
    .orderBy(desc(schema.threads.last_message_at));

  let filtered = threadsList;

  if (filters?.filter === 'unread') {
    filtered = filtered.filter((t) => parseInt(t.unread_count, 10) > 0);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.patient.first_name.toLowerCase().includes(q) ||
        t.patient.last_name.toLowerCase().includes(q) ||
        (t.patient.phone && t.patient.phone.toLowerCase().includes(q)) ||
        (t.last_message_preview && t.last_message_preview.toLowerCase().includes(q))
    );
  }

  return filtered;
}

export async function getUnreadThreadsCount(siteId: string) {
  const threads = await db
    .select({ unread_count: schema.threads.unread_count })
    .from(schema.threads)
    .where(eq(schema.threads.site_id, siteId));

  return threads.reduce((acc, t) => acc + (parseInt(t.unread_count, 10) > 0 ? 1 : 0), 0);
}

