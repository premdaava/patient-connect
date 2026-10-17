import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { sites } from './sites';
import { patients } from './patients';
import { appointments } from './appointments';

export const reviewRequests = pgTable(
  'review_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    site_id: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    patient_id: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    appointment_id: uuid('appointment_id').references(() => appointments.id, { onDelete: 'set null' }),
    token: text('token').notNull().unique(),
    channel: text('channel').notNull(), // 'sms' | 'email'
    status: text('status').notNull().default('sent'), // 'sent' | 'opened' | 'submitted'
    sent_at: timestamp('sent_at', { withTimezone: true, mode: 'string' }).notNull(),
    opened_at: timestamp('opened_at', { withTimezone: true, mode: 'string' }),
    submitted_at: timestamp('submitted_at', { withTimezone: true, mode: 'string' }),
    rating: text('rating'), // '1' | '2' | '3' | '4' | '5'
    feedback: text('feedback'),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    site_idx: index('review_requests_site_id_idx').on(table.site_id),
    patient_idx: index('review_requests_patient_id_idx').on(table.patient_id),
    token_idx: index('review_requests_token_idx').on(table.token),
  })
);

export type ReviewRequest = typeof reviewRequests.$inferSelect;
export type NewReviewRequest = typeof reviewRequests.$inferInsert;
