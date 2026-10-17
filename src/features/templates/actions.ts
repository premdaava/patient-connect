'use server';

if (typeof window === 'undefined' && process.env.NEXT_RUNTIME) {
  require('server-only');
}

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createTemplate(
  siteId: string,
  data: {
    name: string;
    category: string;
    channel: string;
    subject?: string;
    body: string;
    is_active?: string;
  }
) {
  const [template] = await db
    .insert(schema.templates)
    .values({
      site_id: siteId,
      name: data.name,
      category: data.category,
      channel: data.channel,
      subject: data.subject || null,
      body: data.body,
      is_active: data.is_active || 'true',
    })
    .returning();

  revalidatePath('/templates');
  return { success: true, template };
}

export async function updateTemplate(
  siteId: string,
  id: string,
  data: {
    name: string;
    category: string;
    channel: string;
    subject?: string;
    body: string;
    is_active?: string;
  }
) {
  const [template] = await db
    .update(schema.templates)
    .set({
      name: data.name,
      category: data.category,
      channel: data.channel,
      subject: data.subject || null,
      body: data.body,
      is_active: data.is_active || 'true',
      updated_at: new Date().toISOString(),
    })
    .where(and(eq(schema.templates.site_id, siteId), eq(schema.templates.id, id)))
    .returning();

  revalidatePath('/templates');
  return { success: true, template };
}

export async function deleteTemplate(siteId: string, id: string) {
  await db
    .delete(schema.templates)
    .where(and(eq(schema.templates.site_id, siteId), eq(schema.templates.id, id)));

  revalidatePath('/templates');
  return { success: true };
}

export async function toggleTemplateActive(siteId: string, id: string, isActive: boolean) {
  const [template] = await db
    .update(schema.templates)
    .set({
      is_active: isActive ? 'true' : 'false',
      updated_at: new Date().toISOString(),
    })
    .where(and(eq(schema.templates.site_id, siteId), eq(schema.templates.id, id)))
    .returning();

  revalidatePath('/templates');
  return { success: true, template };
}
