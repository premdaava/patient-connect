if (typeof window === 'undefined' && process.env.NEXT_RUNTIME) {
  require('server-only');
}
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, or, ilike, desc, asc, sql, inArray } from 'drizzle-orm';


export interface PatientFilters {
  search?: string;
  consent?: string;
  tag?: string;
  lastVisit?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function getPatients(siteId: string, filters: PatientFilters = {}) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;
  const offset = (page - 1) * limit;

  const conditions = [eq(schema.patients.site_id, siteId)];

  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(schema.patients.first_name, searchTerm),
        ilike(schema.patients.last_name, searchTerm),
        ilike(schema.patients.email, searchTerm),
        ilike(schema.patients.phone, searchTerm)
      )!
    );
  }

  if (filters.consent) {
    if (filters.consent === 'sms_opted_in') conditions.push(eq(schema.consents.sms_consent, 'opted_in'));
    else if (filters.consent === 'sms_opted_out') conditions.push(eq(schema.consents.sms_consent, 'opted_out'));
    else if (filters.consent === 'email_opted_in') conditions.push(eq(schema.consents.email_consent, 'opted_in'));
    else if (filters.consent === 'email_opted_out') conditions.push(eq(schema.consents.email_consent, 'opted_out'));
  }

  if (filters.tag && filters.tag !== 'all') {
    conditions.push(sql`${filters.tag} = ANY(${schema.patients.tags})`);
  }

  if (filters.lastVisit && filters.lastVisit !== 'all') {
    const now = new Date();
    if (filters.lastVisit === 'last_30_days') {
      const d = new Date();
      d.setDate(now.getDate() - 30);
      conditions.push(sql`${schema.patients.last_visit_date} >= ${d.toISOString().split('T')[0]}`);
    } else if (filters.lastVisit === 'last_90_days') {
      const d = new Date();
      d.setDate(now.getDate() - 90);
      conditions.push(sql`${schema.patients.last_visit_date} >= ${d.toISOString().split('T')[0]}`);
    } else if (filters.lastVisit === 'older') {
      const d = new Date();
      d.setDate(now.getDate() - 90);
      conditions.push(sql`${schema.patients.last_visit_date} < ${d.toISOString().split('T')[0]}`);
    } else if (filters.lastVisit === 'never') {
      conditions.push(sql`${schema.patients.last_visit_date} IS NULL`);
    }
  }

  const whereClause = and(...conditions);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.patients)
    .leftJoin(schema.consents, and(eq(schema.consents.patient_id, schema.patients.id), eq(schema.consents.site_id, siteId)))
    .where(whereClause);

  const total = Number(countResult?.count || 0);

  let orderBy = desc(schema.patients.created_at);
  const sortOrder = filters.sortOrder === 'asc' ? asc : desc;
  if (filters.sortBy === 'name') orderBy = sortOrder(schema.patients.last_name);
  else if (filters.sortBy === 'last_visit') orderBy = sortOrder(schema.patients.last_visit_date);
  else if (filters.sortBy === 'created_at') orderBy = sortOrder(schema.patients.created_at);

  const rows = await db
    .select({
      id: schema.patients.id,
      site_id: schema.patients.site_id,
      first_name: schema.patients.first_name,
      last_name: schema.patients.last_name,
      email: schema.patients.email,
      phone: schema.patients.phone,
      date_of_birth: schema.patients.date_of_birth,
      address: schema.patients.address,
      tags: schema.patients.tags,
      notes: schema.patients.notes,
      last_visit_date: schema.patients.last_visit_date,
      created_at: schema.patients.created_at,
      sms_consent: schema.consents.sms_consent,
      email_consent: schema.consents.email_consent,
    })
    .from(schema.patients)
    .leftJoin(schema.consents, and(eq(schema.consents.patient_id, schema.patients.id), eq(schema.consents.site_id, siteId)))
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  return { patients: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getPatientById(siteId: string, patientId: string) {
  const [patient] = await db
    .select()
    .from(schema.patients)
    .where(and(eq(schema.patients.id, patientId), eq(schema.patients.site_id, siteId)))
    .limit(1);

  if (!patient) return null;

  const [consent] = await db
    .select()
    .from(schema.consents)
    .where(and(eq(schema.consents.patient_id, patientId), eq(schema.consents.site_id, siteId)))
    .limit(1);

  return { ...patient, consent: consent || { sms_consent: 'opted_in', email_consent: 'opted_in' } };
}

export async function getPatientAppointments(siteId: string, patientId: string) {
  return await db
    .select()
    .from(schema.appointments)
    .where(and(eq(schema.appointments.patient_id, patientId), eq(schema.appointments.site_id, siteId)))
    .orderBy(desc(schema.appointments.start_time));
}

export async function getPatientMessages(siteId: string, patientId: string) {
  const patientThreads = await db
    .select()
    .from(schema.threads)
    .where(and(eq(schema.threads.patient_id, patientId), eq(schema.threads.site_id, siteId)));

  if (patientThreads.length === 0) return [];
  const threadIds = patientThreads.map(t => t.id);

  return await db
    .select()
    .from(schema.messages)
    .where(and(inArray(schema.messages.thread_id, threadIds), eq(schema.messages.site_id, siteId)))
    .orderBy(desc(schema.messages.created_at));
}

export async function getPatientTags(siteId: string) {
  const result = await db.select({ tags: schema.patients.tags }).from(schema.patients).where(eq(schema.patients.site_id, siteId));
  const tagSet = new Set<string>();
  result.forEach(row => {
    if (row.tags && Array.isArray(row.tags)) row.tags.forEach(t => tagSet.add(t));
  });
  return Array.from(tagSet).sort();
}
