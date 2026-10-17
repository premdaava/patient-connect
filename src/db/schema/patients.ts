import { pgTable, text, timestamp, uuid, date, index } from 'drizzle-orm/pg-core';
import { sites } from './sites';

export const patients = pgTable(
  'patients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    site_id: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    first_name: text('first_name').notNull(),
    last_name: text('last_name').notNull(),
    email: text('email'),
    phone: text('phone'),
    date_of_birth: date('date_of_birth', { mode: 'string' }),
    address: text('address'),
    tags: text('tags').array().notNull().default([]), // array of strings
    notes: text('notes'),
    last_visit_date: date('last_visit_date', { mode: 'string' }),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    site_idx: index('patients_site_id_idx').on(table.site_id),
  })
);

export const consents = pgTable(
  'consents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    site_id: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    patient_id: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    sms_consent: text('sms_consent').notNull().default('opted_in'), // 'opted_in' | 'opted_out'
    email_consent: text('email_consent').notNull().default('opted_in'), // 'opted_in' | 'opted_out'
    sms_opted_at: timestamp('sms_opted_at', { withTimezone: true, mode: 'string' }),
    email_opted_at: timestamp('email_opted_at', { withTimezone: true, mode: 'string' }),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    site_idx: index('consents_site_id_idx').on(table.site_id),
    patient_idx: index('consents_patient_id_idx').on(table.patient_id),
  })
);

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
export type Consent = typeof consents.$inferSelect;
export type NewConsent = typeof consents.$inferInsert;
