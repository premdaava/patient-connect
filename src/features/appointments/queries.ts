if (typeof window === 'undefined' && process.env.NEXT_RUNTIME) {
  require('server-only');
}

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, gte, lte, desc, asc, or, ilike } from 'drizzle-orm';

export interface AppointmentFilters {
  status?: string;
  provider?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export async function getAppointments(siteId: string, filters?: AppointmentFilters) {
  const conditions = [eq(schema.appointments.site_id, siteId)];

  if (filters?.status && filters.status !== 'all') {
    conditions.push(eq(schema.appointments.status, filters.status));
  }

  if (filters?.provider && filters.provider !== 'all') {
    conditions.push(eq(schema.appointments.provider, filters.provider));
  }

  if (filters?.startDate) {
    conditions.push(gte(schema.appointments.start_time, filters.startDate));
  }

  if (filters?.endDate) {
    conditions.push(lte(schema.appointments.start_time, filters.endDate));
  }

  const list = await db
    .select({
      id: schema.appointments.id,
      site_id: schema.appointments.site_id,
      patient_id: schema.appointments.patient_id,
      appointment_type: schema.appointments.appointment_type,
      provider: schema.appointments.provider,
      start_time: schema.appointments.start_time,
      end_time: schema.appointments.end_time,
      status: schema.appointments.status,
      notes: schema.appointments.notes,
      created_at: schema.appointments.created_at,
      patient: {
        id: schema.patients.id,
        first_name: schema.patients.first_name,
        last_name: schema.patients.last_name,
        phone: schema.patients.phone,
        email: schema.patients.email,
      },
    })
    .from(schema.appointments)
    .innerJoin(schema.patients, eq(schema.appointments.patient_id, schema.patients.id))
    .where(and(...conditions))
    .orderBy(asc(schema.appointments.start_time));

  if (filters?.search) {
    const query = filters.search.toLowerCase();
    return list.filter(
      (a) =>
        a.patient.first_name.toLowerCase().includes(query) ||
        a.patient.last_name.toLowerCase().includes(query) ||
        a.appointment_type.toLowerCase().includes(query) ||
        a.provider.toLowerCase().includes(query)
    );
  }

  return list;
}

export async function getAppointmentById(siteId: string, id: string) {
  const [appointment] = await db
    .select({
      id: schema.appointments.id,
      site_id: schema.appointments.site_id,
      patient_id: schema.appointments.patient_id,
      appointment_type: schema.appointments.appointment_type,
      provider: schema.appointments.provider,
      start_time: schema.appointments.start_time,
      end_time: schema.appointments.end_time,
      status: schema.appointments.status,
      notes: schema.appointments.notes,
      created_at: schema.appointments.created_at,
      patient: {
        id: schema.patients.id,
        first_name: schema.patients.first_name,
        last_name: schema.patients.last_name,
        phone: schema.patients.phone,
        email: schema.patients.email,
      },
    })
    .from(schema.appointments)
    .innerJoin(schema.patients, eq(schema.appointments.patient_id, schema.patients.id))
    .where(and(eq(schema.appointments.site_id, siteId), eq(schema.appointments.id, id)))
    .limit(1);

  if (!appointment) return null;

  const reminders = await db
    .select()
    .from(schema.reminders)
    .where(and(eq(schema.reminders.site_id, siteId), eq(schema.reminders.appointment_id, id)))
    .orderBy(asc(schema.reminders.scheduled_for));

  return {
    ...appointment,
    reminders,
  };
}

export async function getPatientOptions(siteId: string) {
  return await db
    .select({
      id: schema.patients.id,
      first_name: schema.patients.first_name,
      last_name: schema.patients.last_name,
      phone: schema.patients.phone,
      email: schema.patients.email,
    })
    .from(schema.patients)
    .where(eq(schema.patients.site_id, siteId))
    .orderBy(asc(schema.patients.last_name));
}

export async function getProviders(siteId: string) {
  const appointmentsList = await db
    .select({ provider: schema.appointments.provider })
    .from(schema.appointments)
    .where(eq(schema.appointments.site_id, siteId));

  const providers = Array.from(new Set(appointmentsList.map((a) => a.provider))).filter(Boolean);
  if (providers.length === 0) {
    return ['Dr. Sarah Johnson', 'Dr. Mike Chen'];
  }
  return providers;
}
