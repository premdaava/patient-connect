import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { sites } from './sites';
import { patients } from './patients';

export const appointments = pgTable(
  'appointments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    site_id: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    patient_id: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    appointment_type: text('appointment_type').notNull(),
    provider: text('provider').notNull().default('Dr. Smith'),
    start_time: timestamp('start_time', { withTimezone: true, mode: 'string' }).notNull(),
    end_time: timestamp('end_time', { withTimezone: true, mode: 'string' }).notNull(),
    status: text('status').notNull().default('scheduled'), // 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
    notes: text('notes'),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    site_idx: index('appointments_site_id_idx').on(table.site_id),
    patient_idx: index('appointments_patient_id_idx').on(table.patient_id),
    start_time_idx: index('appointments_start_time_idx').on(table.start_time),
  })
);

export const reminders = pgTable(
  'reminders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    site_id: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    appointment_id: uuid('appointment_id')
      .notNull()
      .references(() => appointments.id, { onDelete: 'cascade' }),
    patient_id: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    channel: text('channel').notNull(), // 'sms' | 'email'
    scheduled_for: timestamp('scheduled_for', { withTimezone: true, mode: 'string' }).notNull(),
    sent_at: timestamp('sent_at', { withTimezone: true, mode: 'string' }),
    status: text('status').notNull().default('pending'), // 'pending' | 'sent' | 'failed' | 'cancelled'
    message_body: text('message_body').notNull(),
    error_message: text('error_message'),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    site_idx: index('reminders_site_id_idx').on(table.site_id),
    appointment_idx: index('reminders_appointment_id_idx').on(table.appointment_id),
    scheduled_for_idx: index('reminders_scheduled_for_idx').on(table.scheduled_for),
  })
);

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type Reminder = typeof reminders.$inferSelect;
export type NewReminder = typeof reminders.$inferInsert;
