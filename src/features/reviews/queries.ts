'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function getReviewRequests(siteId: string) {
  const requests = await db
    .select({
      id: schema.reviewRequests.id,
      patient_id: schema.reviewRequests.patient_id,
      appointment_id: schema.reviewRequests.appointment_id,
      token: schema.reviewRequests.token,
      channel: schema.reviewRequests.channel,
      status: schema.reviewRequests.status,
      sent_at: schema.reviewRequests.sent_at,
      opened_at: schema.reviewRequests.opened_at,
      submitted_at: schema.reviewRequests.submitted_at,
      rating: schema.reviewRequests.rating,
      feedback: schema.reviewRequests.feedback,
      patient_first: schema.patients.first_name,
      patient_last: schema.patients.last_name,
      patient_phone: schema.patients.phone,
      patient_email: schema.patients.email,
      appointment_type: schema.appointments.appointment_type,
      appointment_date: schema.appointments.start_time,
    })
    .from(schema.reviewRequests)
    .innerJoin(schema.patients, eq(schema.reviewRequests.patient_id, schema.patients.id))
    .leftJoin(schema.appointments, eq(schema.reviewRequests.appointment_id, schema.appointments.id))
    .where(eq(schema.reviewRequests.site_id, siteId))
    .orderBy(desc(schema.reviewRequests.sent_at));

  return requests;
}

export async function getReviewStats(siteId: string) {
  const requests = await db
    .select({
      rating: schema.reviewRequests.rating,
      status: schema.reviewRequests.status,
    })
    .from(schema.reviewRequests)
    .where(eq(schema.reviewRequests.site_id, siteId));

  const totalSent = requests.length;
  const submitted = requests.filter((r) => r.rating !== null && r.rating !== undefined);
  const totalSubmitted = submitted.length;

  let totalScore = 0;
  const distribution: Record<string, number> = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };

  for (const r of submitted) {
    if (r.rating && distribution[r.rating] !== undefined) {
      distribution[r.rating]++;
      totalScore += parseInt(r.rating, 10);
    }
  }

  const averageRating = totalSubmitted > 0 ? (totalScore / totalSubmitted).toFixed(1) : '0.0';

  return {
    totalSent,
    totalSubmitted,
    averageRating: parseFloat(averageRating),
    distribution,
  };
}
