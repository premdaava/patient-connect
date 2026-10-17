import 'server-only';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, asc, desc, and } from 'drizzle-orm';


export async function getTemplates(siteId: string) {
  return await db
    .select()
    .from(schema.templates)
    .where(eq(schema.templates.site_id, siteId))
    .orderBy(asc(schema.templates.category), asc(schema.templates.name));
}

export async function getTemplateById(siteId: string, id: string) {
  const [template] = await db
    .select()
    .from(schema.templates)
    .where(and(eq(schema.templates.site_id, siteId), eq(schema.templates.id, id)))
    .limit(1);
  return template || null;
}
