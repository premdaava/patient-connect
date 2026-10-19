'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getTenantContext } from '@/lib/tenant';
import { sendMockSms } from '@/lib/providers/sms.mock';
import { sendEmail } from '@/lib/providers/email.resend';
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

  const [patient] = await db
    .select()
    .from(schema.patients)
    .where(eq(schema.patients.id, data.patient_id))
    .limit(1);

  const [site] = await db
    .select()
    .from(schema.sites)
    .where(eq(schema.sites.id, siteId))
    .limit(1);

  const siteName = site?.name || 'our practice';
  const trackingUrl = `http://localhost:3000/r/${token}`;

  if (patient) {
    let msgBody = data.body;
    if (!msgBody) {
      msgBody = data.channel === 'sms'
        ? `Hi {{first_name}}, thank you for visiting ${siteName}! Please take a moment to leave us a review: {{review_link}}`
        : `Hi {{first_name}},\n\nThank you for visiting ${siteName}! We would love to hear your feedback.\n\nPlease take a moment to leave us a review by clicking the link below:\n\n{{review_link}}`;
    }

    // Replace merge tags / template variables
    msgBody = msgBody
      .replace(/\{\{first_name\}\}/g, patient.first_name || '')
      .replace(/\{\{last_name\}\}/g, patient.last_name || '')
      .replace(/\{\{site_name\}\}/g, siteName)
      .replace(/\{\{review_link\}\}/g, trackingUrl);

    // If trackingUrl wasn't explicitly referenced via {{review_link}}, append it so it's never missing
    if (!msgBody.includes(trackingUrl)) {
      msgBody = `${msgBody.trim()}\n\n${trackingUrl}`;
    }

    if (data.channel === 'sms' && patient.phone) {
      await sendMockSms({
        siteId,
        patientId: patient.id,
        to: patient.phone,
        body: msgBody,
      });
    } else if (data.channel === 'email' && patient.email) {
      await sendEmail({
        siteId,
        patientId: patient.id,
        to: patient.email,
        subject: `We value your feedback - ${siteName}`,
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
