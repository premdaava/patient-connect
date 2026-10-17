'use server';

if (typeof window === 'undefined' && process.env.NEXT_RUNTIME) {
  require('server-only');
}

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { sendMockSms } from '@/lib/providers/sms.mock';
import { revalidatePath } from 'next/cache';

const submissionLimits = new Map<string, number>();

export async function submitPublicBooking(siteSlug: string, data: {
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  appointment_type: string;
  preferred_date: string;
  notes?: string;
  honeypot?: string;
  clientIp?: string;
}) {
  if (data.honeypot && data.honeypot.trim().length > 0) {
    return { success: true };
  }

  const rateKey = data.clientIp || data.phone;
  const now = Date.now();
  const lastTime = submissionLimits.get(rateKey) || 0;
  if (now - lastTime < 10000) {
    return { success: false, error: 'Please wait a moment before submitting another request.' };
  }
  submissionLimits.set(rateKey, now);

  const [site] = await db
    .select()
    .from(schema.sites)
    .where(eq(schema.sites.slug, siteSlug))
    .limit(1);

  if (!site) {
    return { success: false, error: 'Practice not found.' };
  }

  const [bookingReq] = await db
    .insert(schema.bookingRequests)
    .values({
      site_id: site.id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || undefined,
      phone: data.phone,
      appointment_type: data.appointment_type,
      preferred_date: data.preferred_date,
      notes: data.notes || undefined,
      status: 'pending',
    })
    .returning();

  revalidatePath('/appointments');
  return { success: true, bookingRequest: bookingReq };
}

export async function approveBookingRequest(siteId: string, requestId: string) {
  const [req] = await db
    .select()
    .from(schema.bookingRequests)
    .where(and(eq(schema.bookingRequests.site_id, siteId), eq(schema.bookingRequests.id, requestId)))
    .limit(1);

  if (!req || req.status === 'confirmed') {
    return { success: false, error: 'Booking request not found or already confirmed.' };
  }

  let [patient] = await db
    .select()
    .from(schema.patients)
    .where(and(eq(schema.patients.site_id, siteId), eq(schema.patients.phone, req.phone)))
    .limit(1);

  if (!patient) {
    [patient] = await db
      .insert(schema.patients)
      .values({
        site_id: siteId,
        first_name: req.first_name,
        last_name: req.last_name,
        phone: req.phone,
        email: req.email || undefined,
        notes: req.notes || undefined,
      })
      .returning();
  }

  const startDate = req.preferred_date;
  const endDate = new Date(new Date(startDate).getTime() + 30 * 60000).toISOString();

  const [apt] = await db
    .insert(schema.appointments)
    .values({
      site_id: siteId,
      patient_id: patient.id,
      appointment_type: req.appointment_type,
      provider: 'Dr. Sarah Johnson',
      start_time: startDate,
      end_time: endDate,
      status: 'confirmed',
      notes: req.notes || 'Approved online booking request',
    })
    .returning();

  await db
    .update(schema.bookingRequests)
    .set({
      status: 'confirmed',
      confirmed_appointment_id: apt.id,
      updated_at: new Date().toISOString(),
    })
    .where(eq(schema.bookingRequests.id, requestId));

  if (!patient.phone) {
    return { success: false, error: 'Patient phone number is required.' };
  }

  await sendMockSms({
    siteId,
    patientId: patient.id,
    to: patient.phone,
    body: `Your appointment for ${req.appointment_type} on ${new Date(startDate).toLocaleString()} has been confirmed! We look forward to seeing you.`,
  });



  revalidatePath('/appointments');
  return { success: true };
}

export async function declineBookingRequest(siteId: string, requestId: string) {
  await db
    .update(schema.bookingRequests)
    .set({
      status: 'declined',
      updated_at: new Date().toISOString(),
    })
    .where(and(eq(schema.bookingRequests.site_id, siteId), eq(schema.bookingRequests.id, requestId)));

  revalidatePath('/appointments');
  return { success: true, error: undefined as string | undefined };
}

