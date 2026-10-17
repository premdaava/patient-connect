#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["'](.*)["']$/, '$1');
      process.env[key] = val;
    }
  }
}

import { db, migrationClient } from "../src/db";
import * as schema from "../src/db/schema";
import { hashSync } from "bcryptjs";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🌱 Starting seed...");
  
  // Ensure columns exist on campaigns table if table already existed
  await db.execute(sql`
    ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS replied_count text NOT NULL DEFAULT '0';
    ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS booked_count text NOT NULL DEFAULT '0';
  `);

  // Truncate all tables safely
  await db.execute(sql`
    TRUNCATE TABLE 
      message_stats, campaign_recipients, campaigns,
      review_requests, messages, threads,
      templates, reminders, appointments,
      consents, patients, booking_requests,
      site_settings, memberships, users, sites
    CASCADE;
  `);

  const [brightSmiles, lakeside, peakPhysio] = await db.insert(schema.sites).values([
    { name: "Bright Smiles Dental", slug: "bright-smiles-dental", timezone: "America/New_York", phone: "+12125551234", email: "contact@brightsmilesdental.com", address: "123 Main St, New York, NY 10001", website: "https://brightsmilesdental.com" },
    { name: "Lakeside Family Clinic", slug: "lakeside-family-clinic", timezone: "America/Chicago", phone: "+13125559876", email: "info@lakesideclinic.com", address: "456 Lake Dr, Chicago, IL 60601", website: "https://lakesideclinic.com" },
    { name: "Peak Physio", slug: "peak-physio", timezone: "America/Denver", phone: "+13035558888", email: "contact@peakphysio.com", address: "789 Mountain Ave, Denver, CO 80202", website: "https://peakphysio.com" }
  ]).returning();

  await db.insert(schema.siteSettings).values([
    { site_id: brightSmiles.id, booking_enabled: "true", reminder_default_enabled: "true", reminder_hours_before: "24", review_link: "https://www.google.com/maps", auto_request_reviews: "true" },
    { site_id: lakeside.id, booking_enabled: "true", reminder_default_enabled: "true" },
    { site_id: peakPhysio.id, booking_enabled: "true", reminder_default_enabled: "true" }
  ]);

  const passwordHash = hashSync("Demo@1234", 10);
  const [demoUser, staff1, staff2] = await db.insert(schema.users).values([
    { email: "demo@dagpatientconnect.com", password_hash: passwordHash, first_name: "Demo", last_name: "User", phone: "+12125551000" },
    { email: "sarah.johnson@brightsmilesdental.com", password_hash: passwordHash, first_name: "Sarah", last_name: "Johnson", phone: "+12125551001" },
    { email: "mike.chen@brightsmilesdental.com", password_hash: passwordHash, first_name: "Mike", last_name: "Chen", phone: "+12125551002" }
  ]).returning();

  await db.insert(schema.memberships).values([
    { user_id: demoUser.id, site_id: brightSmiles.id, role: "owner" },
    { user_id: staff1.id, site_id: brightSmiles.id, role: "staff" },
    { user_id: staff2.id, site_id: brightSmiles.id, role: "staff" }
  ]);

  const firstNames = ["Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "William"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"];
  const patientsData = [];
  for (let i = 0; i < 60; i++) {
    patientsData.push({
      site_id: brightSmiles.id,
      first_name: firstNames[i % firstNames.length],
      last_name: lastNames[i % lastNames.length],
      email: `patient${i}@brightsmiles.test`,
      phone: `+1212555${2000 + i}`,
      date_of_birth: "1985-05-15",
      tags: i % 3 === 0 ? ["VIP"] : ["Regular"],
      last_visit_date: "2026-09-01",
    });
  }
  const patients = await db.insert(schema.patients).values(patientsData).returning();

  await db.insert(schema.consents).values(patients.map((p, i) => ({
    site_id: brightSmiles.id,
    patient_id: p.id,
    sms_consent: i % 8 === 0 ? "opted_out" : "opted_in",
    email_consent: i % 10 === 0 ? "opted_out" : "opted_in",
  })));

  const appointmentsData = [];
  const now = new Date();
  for (let d = -7; d <= 7; d++) {
    const aptDate = new Date(now.getTime() + d * 86400000);
    for (let j = 0; j < 4; j++) {
      const startTime = new Date(aptDate);
      startTime.setHours(9 + j * 2, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setMinutes(30);
      appointmentsData.push({
        site_id: brightSmiles.id,
        patient_id: patients[(Math.abs(d + 7) * 4 + j) % patients.length].id,
        appointment_type: j % 2 === 0 ? "Cleaning" : "Exam",
        provider: j % 2 === 0 ? "Dr. Sarah Johnson" : "Dr. Mike Chen",
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: d < 0 ? "completed" : d === 0 ? "confirmed" : "scheduled",
      });
    }
  }
  const appointments = await db.insert(schema.appointments).values(appointmentsData).returning();

  const futureApts = appointments.filter(a => new Date(a.start_time) > now);
  if (futureApts.length > 0) {
    await db.insert(schema.reminders).values(futureApts.map(a => ({
      site_id: brightSmiles.id,
      appointment_id: a.id,
      patient_id: a.patient_id,
      channel: "sms",
      scheduled_for: new Date(new Date(a.start_time).getTime() - 86400000).toISOString(),
      status: "pending",
      message_body: "Reminder: You have an upcoming appointment tomorrow.",
    })));
  }

  await db.insert(schema.templates).values([
    { site_id: brightSmiles.id, name: "Reminder 24h", category: "appointment_reminder", channel: "sms", body: "Reminder: appointment tomorrow.", is_active: "true" },
    { site_id: brightSmiles.id, name: "Welcome New Patient", category: "general", channel: "both", subject: "Welcome!", body: "Welcome to Bright Smiles Dental!", is_active: "true" },
    { site_id: brightSmiles.id, name: "Post-Visit Thank You", category: "follow_up", channel: "email", subject: "Thank you", body: "Thank you for visiting us today!", is_active: "true" },
    { site_id: brightSmiles.id, name: "Seasonal Cleaning", category: "promotional", channel: "both", subject: "Fall Cleaning", body: "Time for your bi-annual cleaning!", is_active: "true" },
    { site_id: brightSmiles.id, name: "Confirmation", category: "appointment_reminder", channel: "sms", body: "Your appointment is confirmed.", is_active: "true" },
    { site_id: brightSmiles.id, name: "Missed Appointment", category: "follow_up", channel: "both", subject: "We missed you", body: "Please call us to reschedule.", is_active: "true" },
  ]);

  for (let i = 0; i < 8; i++) {
    const pt = patients[i];
    const [thread] = await db.insert(schema.threads).values({
      site_id: brightSmiles.id,
      patient_id: pt.id,
      channel: "sms",
      status: i < 2 ? "open" : "closed",
      last_message_at: now.toISOString(),
      last_message_preview: "Thank you!",
      unread_count: i < 2 ? "1" : "0",
    }).returning();

    await db.insert(schema.messages).values([
      { site_id: brightSmiles.id, thread_id: thread.id, patient_id: pt.id, direction: "inbound", channel: "sms", sender_type: "patient", body: "Can I reschedule my appointment?", status: "delivered" },
      { site_id: brightSmiles.id, thread_id: thread.id, patient_id: pt.id, direction: "outbound", channel: "sms", sender_type: "staff", sender_id: staff1.id, body: `Hi ${pt.first_name}, absolutely! When works for you?`, status: "delivered" }
    ]);
  }

  const [camp1] = await db.insert(schema.campaigns).values([
    { site_id: brightSmiles.id, name: "Fall Special", channel: "both", subject: "20% off whitening", body: "Special offer for our patients!", status: "sent", sent_at: now.toISOString(), total_recipients: "20", sent_count: "20", delivered_count: "19", failed_count: "1", replied_count: "3", booked_count: "2" },
    { site_id: brightSmiles.id, name: "Checkup Reminder", channel: "sms", body: "Time for your checkup!", status: "sent", sent_at: now.toISOString(), total_recipients: "15", sent_count: "15", delivered_count: "15", failed_count: "0", replied_count: "2", booked_count: "1" },
    { site_id: brightSmiles.id, name: "Newsletter", channel: "email", subject: "Dental Tips", body: "Brush twice daily!", status: "draft", total_recipients: "0", replied_count: "0", booked_count: "0" },
  ]).returning();

  await db.insert(schema.campaignRecipients).values(patients.slice(0, 20).map(p => ({
    site_id: brightSmiles.id,
    campaign_id: camp1.id,
    patient_id: p.id,
    channel: "sms",
    status: "delivered",
    sent_at: now.toISOString(),
  })));

  const completedApts = appointments.filter(a => a.status === "completed");
  if (completedApts.length > 0) {
    await db.insert(schema.reviewRequests).values(completedApts.slice(0, 20).map((a, i) => ({
      site_id: brightSmiles.id,
      patient_id: a.patient_id,
      appointment_id: a.id,
      token: `token_${i}_${Math.random()}`,
      channel: "sms",
      status: "submitted",
      sent_at: now.toISOString(),
      submitted_at: now.toISOString(),
      rating: String((i % 2) + 4),
      feedback: "Great service!",
    })));
  }

  const statsData = [];
  for (let d = 0; d < 30; d++) {
    const statDate = new Date(now.getTime() - d * 86400000).toISOString().split("T")[0];
    statsData.push({
      site_id: brightSmiles.id,
      date: statDate,
      channel: "sms",
      message_type: "reminder",
      sent_count: "25",
      delivered_count: "24",
      failed_count: "1",
    });
  }
  await db.insert(schema.messageStats).values(statsData);

  console.log("✅ Seed completed successfully!");
  await migrationClient.end();
}

main().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
