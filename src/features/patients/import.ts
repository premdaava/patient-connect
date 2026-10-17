'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getTenantContext } from '@/lib/tenant';
import { normalizePhone } from '@/lib/phone';

export async function importCsvPatients(rows: Array<any>) {
  const tenant = await getTenantContext();
  const siteId = tenant.site.id;

  let importedCount = 0;
  let skippedCount = 0;
  const errors: Array<{ row: number; error: string }> = [];

  const existingPatients = await db
    .select({ phone: schema.patients.phone, email: schema.patients.email })
    .from(schema.patients)
    .where(eq(schema.patients.site_id, siteId));

  const existingPhones = new Set(existingPatients.map(p => p.phone).filter(Boolean));
  const existingEmails = new Set(existingPatients.map(p => p.email?.toLowerCase()).filter(Boolean));

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    if (!row.first_name || !row.last_name) {
      errors.push({ row: rowNum, error: 'Missing first_name or last_name' });
      skippedCount++;
      continue;
    }

    const normalizedPhone = normalizePhone(row.phone);
    const emailLower = row.email ? row.email.toLowerCase().trim() : null;

    if (normalizedPhone && existingPhones.has(normalizedPhone)) {
      errors.push({ row: rowNum, error: `Duplicate phone number: ${row.phone}` });
      skippedCount++;
      continue;
    }
    if (emailLower && existingEmails.has(emailLower)) {
      errors.push({ row: rowNum, error: `Duplicate email: ${row.email}` });
      skippedCount++;
      continue;
    }

    const tagsArray = row.tags
      ? typeof row.tags === 'string'
        ? row.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : Array.isArray(row.tags)
        ? row.tags
        : []
      : [];

    try {
      const [newPatient] = await db
        .insert(schema.patients)
        .values({
          site_id: siteId,
          first_name: row.first_name.trim(),
          last_name: row.last_name.trim(),
          email: emailLower,
          phone: normalizedPhone,
          date_of_birth: row.date_of_birth || null,
          address: row.address || null,
          tags: tagsArray,
          notes: row.notes || null,
        })
        .returning();

      await db.insert(schema.consents).values({
        site_id: siteId,
        patient_id: newPatient.id,
        sms_consent: 'opted_in',
        email_consent: 'opted_in',
      });

      if (normalizedPhone) existingPhones.add(normalizedPhone);
      if (emailLower) existingEmails.add(emailLower);

      importedCount++;
    } catch (err: any) {
      errors.push({ row: rowNum, error: err.message || 'Database insert failed' });
      skippedCount++;
    }
  }

  revalidatePath('/patients');
  return { success: true, importedCount, skippedCount, errors };
}

