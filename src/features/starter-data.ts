import { db } from '../db';
import * as schema from '../db/schema';

export async function cloneStarterData(siteId: string, staffId: string) {
  const starterNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William'];
  const starterLast = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
  const patients = [];

  for (let i = 0; i < 25; i++) {
    patients.push({
      site_id: siteId,
      first_name: starterNames[i % starterNames.length],
      last_name: starterLast[i % starterLast.length],
      email: `patient${i}@example.com`,
      phone: `+1212555${1000 + i}`,
      date_of_birth: '1990-01-01',
      tags: ['New Patient'],
      last_visit_date: '2026-10-01',
    });
  }

  const pts = await db.insert(schema.patients).values(patients).returning();

  for (const p of pts) {
    await db.insert(schema.consents).values({
      site_id: siteId,
      patient_id: p.id,
      sms_consent: 'opted_in',
      email_consent: 'opted_in',
    });
  }

  await db.insert(schema.appointments).values([
    {
      site_id: siteId,
      patient_id: pts[0].id,
      appointment_type: 'Cleaning',
      start_time: '2026-10-20T10:00:00Z',
      end_time: '2026-10-20T10:30:00Z',
      status: 'scheduled',
    },
  ]);

  await db.insert(schema.templates).values([
    { site_id: siteId, name: 'Reminder', category: 'appointment_reminder', channel: 'sms', body: 'Reminder for appointment', is_active: 'true' },
    { site_id: siteId, name: 'Welcome', category: 'general', channel: 'email', subject: 'Welcome', body: 'Welcome to our practice!' },
  ]);

  console.log('Starter data cloned successfully for site:', siteId);
}

