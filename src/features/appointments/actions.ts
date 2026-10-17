'use server';

if (typeof window === 'undefined' && process.env.NEXT_RUNTIME) {
  require('server-only');
}

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { sendMockSms } from '@/lib/providers/sms.mock';
import { revalidatePath } from 'next/cache';

export async function createAppointment(siteId: string, data: {
  patient_id: string;
  appointment_type: string;
  provider: string;
  start_time: string;
  end_time: string;
  notes?: string;
}) {
  const [newApt] = await db
    .insert(schema.appointments)
    .values({
      site_id: siteId,
      patient_id: data.patient_id,
      appointment_type: data.appointment_type,
      provider: data.provider,
      start_time: data.start_time,
      end_time: data.end_time,
      status: 'scheduled',
      notes: data.notes,
    })
    .returning();

  const [settings] = await db
    .select()
    .from(schema.siteSettings)
    .where(eq(schema.siteSettings.site_id, siteId))
    .limit(1);

  const reminderEnabled = settings?.reminder_default_enabled !== 'false';
  if (reminderEnabled) {
    const hoursBefore = parseInt(settings?.reminder_hours_before || '24', 10);
    const startTimeDate = new Date(data.start_time);
    const scheduledFor = new Date(startTimeDate.getTime() - hoursBefore * 60 * 60 * 1000);

    await db.insert(schema.reminders).values({
      site_id: siteId,
      appointment_id: newApt.id,
      patient_id: data.patient_id,
      channel: 'sms',
      scheduled_for: scheduledFor.toISOString(),
      status: 'pending',
      message_body: `Reminder: You have an appointment for ${data.appointment_type} with ${data.provider} on ${new Date(data.start_time).toLocaleString()}.`,
    });
  }

  revalidatePath('/appointments');
  return { success: true, appointment: newApt };
}

export async function updateAppointment(siteId: string, id: string, data: {
  appointment_type: string;
  provider: string;
  start_time: string;
  end_time: string;
  notes?: string;
}) {
  const [updated] = await db
    .update(schema.appointments)
    .set({
      appointment_type: data.appointment_type,
      provider: data.provider,
      start_time: data.start_time,
      end_time: data.end_time,
      notes: data.notes,
      updated_at: new Date().toISOString(),
    })
    .where(and(eq(schema.appointments.site_id, siteId), eq(schema.appointments.id, id)))
    .returning();

  revalidatePath('/appointments');
  return { success: true, appointment: updated };
}

export async function updateAppointmentStatus(siteId: string, id: string, status: string) {
  const [updated] = await db
    .update(schema.appointments)
    .set({
      status,
      updated_at: new Date().toISOString(),
    })
    .where(and(eq(schema.appointments.site_id, siteId), eq(schema.appointments.id, id)))
    .returning();

  if (status === 'completed' && updated) {
    const [settings] = await db
      .select()
      .from(schema.siteSettings)
      .where(eq(schema.siteSettings.site_id, siteId))
      .limit(1);

    if (settings?.auto_request_reviews === 'true') {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const nowIso = new Date().toISOString();
      await db.insert(schema.reviewRequests).values({
        site_id: siteId,
        patient_id: updated.patient_id,
        appointment_id: updated.id,
        token,
        channel: 'sms',
        status: 'sent',
        sent_at: nowIso,
      });
    }
  }

  revalidatePath('/appointments');
  revalidatePath('/reviews');
  return { success: true, appointment: updated };
}

export async function sendManualReminder(siteId: string, appointmentId: string, reminderId: string) {
  const [reminder] = await db
    .select()
    .from(schema.reminders)
    .where(and(eq(schema.reminders.site_id, siteId), eq(schema.reminders.id, reminderId)))
    .limit(1);

  if (!reminder) {
    return { success: false, error: 'Reminder not found' };
  }

  const [patient] = await db
    .select()
    .from(schema.patients)
    .where(eq(schema.patients.id, reminder.patient_id))
    .limit(1);

  if (!patient || !patient.phone) {
    return { success: false, error: 'Patient phone number not found' };
  }

  const result = await sendMockSms({
    siteId,
    patientId: patient.id,
    to: patient.phone,
    body: reminder.message_body,
  });

  const nowIso = new Date().toISOString();

  if (!result.success) {
    await db
      .update(schema.reminders)
      .set({
        status: 'failed',
        error_message: result.error || 'Failed to send SMS',
        updated_at: nowIso,
      })
      .where(eq(schema.reminders.id, reminderId));

    return { success: false, error: result.error };
  }

  await db
    .update(schema.reminders)
    .set({
      status: 'sent',
      sent_at: nowIso,
      updated_at: nowIso,
    })
    .where(eq(schema.reminders.id, reminderId));

  let [thread] = await db
    .select()
    .from(schema.threads)
    .where(and(eq(schema.threads.site_id, siteId), eq(schema.threads.patient_id, patient.id)))
    .limit(1);

  if (!thread) {
    [thread] = await db
      .insert(schema.threads)
      .values({
        site_id: siteId,
        patient_id: patient.id,
        channel: 'sms',
        status: 'open',
        last_message_at: nowIso,
        last_message_preview: reminder.message_body,
      })
      .returning();
  } else {
    await db
      .update(schema.threads)
      .set({
        last_message_at: nowIso,
        last_message_preview: reminder.message_body,
        updated_at: nowIso,
      })
      .where(eq(schema.threads.id, thread.id));
  }

  await db.insert(schema.messages).values({
    site_id: siteId,
    thread_id: thread.id,
    patient_id: patient.id,
    direction: 'outbound',
    channel: 'sms',
    sender_type: 'system',
    body: reminder.message_body,
    status: 'sent',
  });

  revalidatePath('/appointments');
  revalidatePath('/inbox');
  return { success: true };
}

export async function runDueReminders() {
  const nowIso = new Date().toISOString();
  const dueReminders = await db
    .select()
    .from(schema.reminders)
    .where(and(eq(schema.reminders.status, 'pending'), lte(schema.reminders.scheduled_for, nowIso)));

  let sentCount = 0;
  let failedCount = 0;

  for (const reminder of dueReminders) {
    const [patient] = await db
      .select()
      .from(schema.patients)
      .where(eq(schema.patients.id, reminder.patient_id))
      .limit(1);

    if (!patient || !patient.phone) {
      await db
        .update(schema.reminders)
        .set({ status: 'failed', error_message: 'No phone number', updated_at: nowIso })
        .where(eq(schema.reminders.id, reminder.id));
      failedCount++;
      continue;
    }

    const result = await sendMockSms({
      siteId: reminder.site_id,
      patientId: patient.id,
      to: patient.phone,
      body: reminder.message_body,
    });

    if (!result.success) {
      await db
        .update(schema.reminders)
        .set({ status: 'failed', error_message: result.error, updated_at: nowIso })
        .where(eq(schema.reminders.id, reminder.id));
      failedCount++;
      continue;
    }

    await db
      .update(schema.reminders)
      .set({ status: 'sent', sent_at: nowIso, updated_at: nowIso })
      .where(eq(schema.reminders.id, reminder.id));

    let [thread] = await db
      .select()
      .from(schema.threads)
      .where(and(eq(schema.threads.site_id, reminder.site_id), eq(schema.threads.patient_id, patient.id)))
      .limit(1);

    if (!thread) {
      [thread] = await db
        .insert(schema.threads)
        .values({
          site_id: reminder.site_id,
          patient_id: patient.id,
          channel: 'sms',
          status: 'open',
          last_message_at: nowIso,
          last_message_preview: reminder.message_body,
        })
        .returning();
    } else {
      await db
        .update(schema.threads)
        .set({ last_message_at: nowIso, last_message_preview: reminder.message_body, updated_at: nowIso })
        .where(eq(schema.threads.id, thread.id));
    }

    await db.insert(schema.messages).values({
      site_id: reminder.site_id,
      thread_id: thread.id,
      patient_id: patient.id,
      direction: 'outbound',
      channel: 'sms',
      sender_type: 'system',
      body: reminder.message_body,
      status: 'sent',
    });

    sentCount++;
  }

  return { success: true, sentCount, failedCount };
}

