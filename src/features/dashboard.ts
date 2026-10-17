import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, gte, sql, desc, count } from 'drizzle-orm';

export async function getDashboardData(siteId: string, days: number) {
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - days);
  const startDateStr = startDate.toISOString();
  const nowStr = now.toISOString();

  const [messagesSentResult] = await db
    .select({ count: count() })
    .from(schema.messages)
    .where(and(eq(schema.messages.site_id, siteId), eq(schema.messages.direction, 'outbound'), gte(schema.messages.created_at, startDateStr)));
  const messagesSentCount = messagesSentResult?.count || 0;

  const [deliveredResult] = await db
    .select({ count: count() })
    .from(schema.messages)
    .where(and(eq(schema.messages.site_id, siteId), eq(schema.messages.direction, 'outbound'), eq(schema.messages.status, 'delivered'), gte(schema.messages.created_at, startDateStr)));
  const deliveredCount = deliveredResult?.count || 0;
  const deliveryRate = messagesSentCount > 0 ? Math.round((deliveredCount / messagesSentCount) * 100) : 100;

  const [repliesResult] = await db
    .select({ count: count() })
    .from(schema.messages)
    .where(and(eq(schema.messages.site_id, siteId), eq(schema.messages.direction, 'inbound'), gte(schema.messages.created_at, startDateStr)));
  const repliesCount = repliesResult?.count || 0;

  const appointmentsInRange = await db
    .select()
    .from(schema.appointments)
    .where(and(eq(schema.appointments.site_id, siteId), gte(schema.appointments.start_time, startDateStr)));

  const totalApts = appointmentsInRange.length;
  const confirmedApts = appointmentsInRange.filter(a => a.status === 'confirmed' || a.status === 'completed').length;
  const confirmedPercent = totalApts > 0 ? Math.round((confirmedApts / totalApts) * 100) : 0;

  const pastApts = appointmentsInRange.filter(a => new Date(a.start_time) < now);
  const noShowApts = pastApts.filter(a => a.status === 'no_show').length;
  const noShowRate = pastApts.length > 0 ? Math.round((noShowApts / pastApts.length) * 100) : 0;

  const [newPatientsResult] = await db
    .select({ count: count() })
    .from(schema.patients)
    .where(and(eq(schema.patients.site_id, siteId), gte(schema.patients.created_at, startDateStr)));
  const newPatientsCount = newPatientsResult?.count || 0;

  const upcomingAppointments = await db
    .select({
      id: schema.appointments.id,
      appointment_type: schema.appointments.appointment_type,
      start_time: schema.appointments.start_time,
      status: schema.appointments.status,
      patient_first: schema.patients.first_name,
      patient_last: schema.patients.last_name,
      patient_phone: schema.patients.phone,
    })
    .from(schema.appointments)
    .innerJoin(schema.patients, eq(schema.appointments.patient_id, schema.patients.id))
    .where(and(eq(schema.appointments.site_id, siteId), gte(schema.appointments.start_time, nowStr)))
    .orderBy(schema.appointments.start_time)
    .limit(5);

  const recentReplies = await db
    .select({
      id: schema.messages.id,
      body: schema.messages.body,
      created_at: schema.messages.created_at,
      thread_id: schema.messages.thread_id,
      patient_first: schema.patients.first_name,
      patient_last: schema.patients.last_name,
    })
    .from(schema.messages)
    .innerJoin(schema.patients, eq(schema.messages.patient_id, schema.patients.id))
    .where(and(eq(schema.messages.site_id, siteId), eq(schema.messages.direction, 'inbound')))
    .orderBy(desc(schema.messages.created_at))
    .limit(5);

  const messagesByDay = await db
    .select({
      date: sql<string>`date(${schema.messages.created_at})`,
      count: count(),
    })
    .from(schema.messages)
    .where(and(eq(schema.messages.site_id, siteId), gte(schema.messages.created_at, startDateStr)))
    .groupBy(sql`date(${schema.messages.created_at})`)
    .orderBy(sql`date(${schema.messages.created_at})`);

  const statusCounts = {
    scheduled: appointmentsInRange.filter(a => a.status === 'scheduled').length,
    confirmed: appointmentsInRange.filter(a => a.status === 'confirmed').length,
    completed: appointmentsInRange.filter(a => a.status === 'completed').length,
    cancelled: appointmentsInRange.filter(a => a.status === 'cancelled').length,
    no_show: appointmentsInRange.filter(a => a.status === 'no_show').length,
  };

  const [siteSettings] = await db
    .select()
    .from(schema.siteSettings)
    .where(eq(schema.siteSettings.site_id, siteId))
    .limit(1);

  const [totalPatientsResult] = await db
    .select({ count: count() })
    .from(schema.patients)
    .where(eq(schema.patients.site_id, siteId));
  const totalPatients = totalPatientsResult?.count || 0;

  const hasReviewLink = Boolean(siteSettings?.review_link);
  const hasRemindersEnabled = siteSettings?.reminder_default_enabled === 'true';
  const hasPatientsImported = totalPatients > 0;
  
  const completedChecklistItems = [hasPatientsImported, hasReviewLink, hasRemindersEnabled].filter(Boolean).length;
  const onboardingProgress = Math.round((completedChecklistItems / 3) * 100);

  return {
    messagesSentCount,
    deliveryRate,
    repliesCount,
    confirmedPercent,
    noShowRate,
    newPatientsCount,
    upcomingAppointments,
    recentReplies,
    messagesByDay,
    statusCounts,
    totalPatients,
    onboardingProgress,
  };
}
