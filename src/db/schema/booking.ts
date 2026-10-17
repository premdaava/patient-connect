import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { sites } from './sites';

export const bookingRequests = pgTable(
  'booking_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    site_id: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    first_name: text('first_name').notNull(),
    last_name: text('last_name').notNull(),
    email: text('email'),
    phone: text('phone').notNull(),
    appointment_type: text('appointment_type').notNull(),
    preferred_date: timestamp('preferred_date', { withTimezone: true, mode: 'string' }).notNull(),
    notes: text('notes'),
    status: text('status').notNull().default('pending'), // 'pending' | 'confirmed' | 'declined'
    confirmed_appointment_id: uuid('confirmed_appointment_id'),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    site_idx: index('booking_requests_site_id_idx').on(table.site_id),
    status_idx: index('booking_requests_status_idx').on(table.status),
  })
);

export type BookingRequest = typeof bookingRequests.$inferSelect;
export type NewBookingRequest = typeof bookingRequests.$inferInsert;
