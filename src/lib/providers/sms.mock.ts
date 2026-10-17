import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export interface SendSmsParams {
  siteId: string;
  patientId: string;
  to: string;
  body: string;
}

export async function sendMockSms({ siteId, patientId, to, body }: SendSmsParams): Promise<{ success: boolean; error?: string }> {
  // Check consent
  const [consent] = await db
    .select()
    .from(schema.consents)
    .where(and(eq(schema.consents.site_id, siteId), eq(schema.consents.patient_id, patientId)))
    .limit(1);

  if (consent && consent.sms_consent === 'opted_out') {
    return { success: false, error: 'Patient has opted out of SMS messages.' };
  }

  // Simulate success
  console.log(`[Mock SMS] Sending to ${to}: "${body}"`);
  return { success: true };
}
