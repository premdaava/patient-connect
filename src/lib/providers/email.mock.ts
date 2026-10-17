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

export async function sendMockEmail({ siteId, patientId, to, subject, body }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  // Check consent
  const [consent] = await db
    .select()
    .from(schema.consents)
    .where(and(eq(schema.consents.site_id, siteId), eq(schema.consents.patient_id, patientId)))
    .limit(1);

  if (consent && consent.email_consent === 'opted_out') {
    return { success: false, error: 'Patient has opted out of Email messages.' };
  }

  // Simulate success
  console.log(`[Mock Email] Sending to ${to} [Subject: ${subject}]: "${body}"`);
  return { success: true };
}
