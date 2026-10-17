'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getTenantContext } from '@/lib/tenant';
import { bulkAddTagSchema, bulkSendMessageSchema } from './schemas';
import { sendMockSms } from '@/lib/providers/sms.mock';
import { sendMockEmail } from '@/lib/providers/email.mock';

export async function bulkAddTag(values: { patient_ids: string[]; tag: string }) {
  const tenant = await getTenantContext();
  const siteId = tenant.site.id;
  const parsed = bulkAddTagSchema.parse(values);

  for (const patientId of parsed.patient_ids) {
    const [patient] = await db
      .select()
      .from(schema.patients)
      .where(and(eq(schema.patients.id, patientId), eq(schema.patients.site_id, siteId)))
      .limit(1);

    if (patient) {
      const currentTags = patient.tags || [];
      if (!currentTags.includes(parsed.tag)) {
        const updatedTags = [...currentTags, parsed.tag];
        await db
          .update(schema.patients)
          .set({ tags: updatedTags, updated_at: new Date().toISOString() })
          .where(eq(schema.patients.id, patientId));
      }
    }
  }

  revalidatePath('/patients');
  return { success: true };
}

export async function bulkSendMessage(values: { patient_ids: string[]; channel: 'sms' | 'email'; template_id?: string; subject?: string; body: string }) {
  const tenant = await getTenantContext();
  const siteId = tenant.site.id;
  const user = tenant.user;
  const parsed = bulkSendMessageSchema.parse(values);

  let successCount = 0;
  let failCount = 0;
  let lastError = '';

  for (const patientId of parsed.patient_ids) {
    const [patient] = await db
      .select()
      .from(schema.patients)
      .where(and(eq(schema.patients.id, patientId), eq(schema.patients.site_id, siteId)))
      .limit(1);

    if (!patient) continue;

    const recipient = parsed.channel === 'sms' ? patient.phone : patient.email;
    if (!recipient) {
      failCount++;
      lastError = `Patient ${patient.first_name} ${patient.last_name} has no ${parsed.channel === 'sms' ? 'phone' : 'email'}`;
      continue;
    }

    let providerResult: { success: boolean; error?: string };
    if (parsed.channel === 'sms') {
      providerResult = await sendMockSms({ siteId, patientId, to: recipient, body: parsed.body });
    } else {
      providerResult = await sendMockEmail({ siteId, patientId, to: recipient, subject: parsed.subject || 'Message from Clinic', body: parsed.body });
    }

    if (!providerResult.success) {
      failCount++;
      lastError = providerResult.error || 'Consent check failed';
      continue;
    }

    let [thread] = await db
      .select()
      .from(schema.threads)
      .where(and(eq(schema.threads.patient_id, patientId), eq(schema.threads.channel, parsed.channel), eq(schema.threads.site_id, siteId)))
      .limit(1);

    const now = new Date().toISOString();

    if (!thread) {
      [thread] = await db
        .insert(schema.threads)
        .values({
          site_id: siteId,
          patient_id: patientId,
          channel: parsed.channel,
          status: 'open',
          last_message_at: now,
          last_message_preview: parsed.body.slice(0, 100),
          unread_count: '0',
        })
        .returning();
    } else {
      await db
        .update(schema.threads)
        .set({
          last_message_at: now,
          last_message_preview: parsed.body.slice(0, 100),
          updated_at: now,
        })
        .where(eq(schema.threads.id, thread.id));
    }

    await db.insert(schema.messages).values({
      site_id: siteId,
      thread_id: thread.id,
      patient_id: patientId,
      direction: 'outbound',
      channel: parsed.channel,
      sender_type: 'staff',
      sender_id: user.id,
      subject: parsed.channel === 'email' ? parsed.subject : null,
      body: parsed.body,
      status: 'sent',
      is_read: 'true',
    });

    successCount++;
  }

  revalidatePath('/patients');
  revalidatePath('/inbox');
  return { success: true, successCount, failCount, lastError };
}

