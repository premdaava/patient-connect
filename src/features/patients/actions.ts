'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getTenantContext } from '@/lib/tenant';
import { normalizePhone } from '@/lib/phone';
import { patientFormSchema, consentUpdateSchema, type PatientFormValues } from './schemas';

export async function createPatient(values: PatientFormValues) {
  const tenant = await getTenantContext();
  const siteId = tenant.site.id;
  const parsed = patientFormSchema.parse(values);
  const normalizedPhone = normalizePhone(parsed.phone);

  const [newPatient] = await db
    .insert(schema.patients)
    .values({
      site_id: siteId,
      first_name: parsed.first_name,
      last_name: parsed.last_name,
      email: parsed.email || null,
      phone: normalizedPhone,
      date_of_birth: parsed.date_of_birth || null,
      address: parsed.address || null,
      tags: parsed.tags || [],
      notes: parsed.notes || null,
    })
    .returning();

  await db.insert(schema.consents).values({
    site_id: siteId,
    patient_id: newPatient.id,
    sms_consent: 'opted_in',
    email_consent: 'opted_in',
  });

  revalidatePath('/patients');
  return { success: true, patient: newPatient };
}

export async function updatePatient(patientId: string, values: PatientFormValues) {
  const tenant = await getTenantContext();
  const siteId = tenant.site.id;
  const parsed = patientFormSchema.parse(values);
  const normalizedPhone = normalizePhone(parsed.phone);

  await db
    .update(schema.patients)
    .set({
      first_name: parsed.first_name,
      last_name: parsed.last_name,
      email: parsed.email || null,
      phone: normalizedPhone,
      date_of_birth: parsed.date_of_birth || null,
      address: parsed.address || null,
      tags: parsed.tags || [],
      notes: parsed.notes || null,
      updated_at: new Date().toISOString(),
    })
    .where(and(eq(schema.patients.id, patientId), eq(schema.patients.site_id, siteId)));

  revalidatePath('/patients');
  revalidatePath(`/patients/${patientId}`);
  return { success: true };
}

export async function deletePatient(patientId: string) {
  const tenant = await getTenantContext();
  const siteId = tenant.site.id;
  await db
    .delete(schema.patients)
    .where(and(eq(schema.patients.id, patientId), eq(schema.patients.site_id, siteId)));

  revalidatePath('/patients');
  return { success: true };
}

export async function updateConsent(values: { patient_id: string; channel: 'sms' | 'email'; status: 'opted_in' | 'opted_out' }) {
  const tenant = await getTenantContext();
  const siteId = tenant.site.id;
  const parsed = consentUpdateSchema.parse(values);

  const [existing] = await db
    .select()
    .from(schema.consents)
    .where(and(eq(schema.consents.patient_id, parsed.patient_id), eq(schema.consents.site_id, siteId)))
    .limit(1);

  const now = new Date().toISOString();

  if (existing) {
    const updateData: any = { updated_at: now };
    if (parsed.channel === 'sms') {
      updateData.sms_consent = parsed.status;
      updateData.sms_opted_at = now;
    } else {
      updateData.email_consent = parsed.status;
      updateData.email_opted_at = now;
    }

    await db
      .update(schema.consents)
      .set(updateData)
      .where(and(eq(schema.consents.patient_id, parsed.patient_id), eq(schema.consents.site_id, siteId)));
  } else {
    await db.insert(schema.consents).values({
      site_id: siteId,
      patient_id: parsed.patient_id,
      sms_consent: parsed.channel === 'sms' ? parsed.status : 'opted_in',
      email_consent: parsed.channel === 'email' ? parsed.status : 'opted_in',
      sms_opted_at: parsed.channel === 'sms' ? now : null,
      email_opted_at: parsed.channel === 'email' ? now : null,
    });
  }

  revalidatePath('/patients');
  revalidatePath(`/patients/${parsed.patient_id}`);
  return { success: true };
}

