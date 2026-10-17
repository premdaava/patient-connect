'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getTenantContext } from '@/lib/tenant';
import { sendMockSms } from '@/lib/providers/sms.mock';
import { revalidatePath } from 'next/cache';

export async function createReviewRequest(siteId: string, data: {
  patient_id: string;
  appointment_id?: string;
  channel: 'sms' | 'email';
  body?: string;
}) {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const nowIso = new Date().toISOString();

  const [newReq] = await db
    .insert(schema.reviewRequests)
    .values({
      site_id: siteId,
      patient_id: data.patient_id,
      appointment_id: data.appointment_id || null,
      token,
      channel: data.channel,
      status: 'sent',
      sent_at: nowIso,
    })
    .returning();

  // Fetch patient to send mock SMS if channel is sms
  if (data.channel === 'sms') {
    const [patient] = await db
      .select()
      .from(schema.patients)
      .where(eq(schema.patients.id, data.patient_id))
      .limit(1);

    if (patient && patient.phone) {
      const trackingUrl = `http://localhost:3000/r/${token}`;
      const msgBody = data.body || `Hi ${patient.first_name}, thank you for visiting Bright Smiles Dental! Please take a moment to leave us a review: ${trackingUrl}`;
      await sendMockSms({
        siteId,
        patientId: patient.id,
        to: patient.phone,
        body: msgBody,
      });
    }
  }

  revalidatePath('/reviews');
  return { success: true, reviewRequest: newReq };
}

export async function sendReviewRequestAction(formData: {
  patient_id: string;
  appointment_id?: string;
  channel: 'sms' | 'email';
  body?: string;
}) {
  const { site } = await getTenantContext();
  return await createReviewRequest(site.id, formData);
}
