import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export interface SendEmailParams {
  siteId: string;
  patientId: string;
  to: string;
  subject?: string;
  body: string;
}

export async function sendEmail({ siteId, patientId, to, subject, body }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  // Check consent
  const [consent] = await db
    .select()
    .from(schema.consents)
    .where(and(eq(schema.consents.site_id, siteId), eq(schema.consents.patient_id, patientId)))
    .limit(1);

  if (consent && consent.email_consent === 'opted_out') {
    return { success: false, error: 'Patient has opted out of Email messages.' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  if (!apiKey) {
    console.log(`[Mock Email / No Resend API Key] Sending to ${to} [Subject: ${subject}]: "${body}"`);
    return { success: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject || 'Message from Practice',
        html: `<div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333;">
          <p>${body.replace(/\n/g, '<br/>')}</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">Sent via DAG Patient Connect</p>
        </div>`,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error('Resend API error:', errData);
      return { success: false, error: errData.message || 'Failed to send email via Resend API' };
    }

    const data = await res.json();
    console.log(`[Resend Email Success] ID: ${data.id}, sent to ${to}`);
    return { success: true };
  } catch (err: any) {
    console.error('Resend network error:', err);
    return { success: false, error: err.message || 'Network error sending email via Resend' };
  }
}
