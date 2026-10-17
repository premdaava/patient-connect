import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';

export const sites = pgTable('sites', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  timezone: text('timezone').notNull().default('America/New_York'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  logo_url: text('logo_url'),
  website: text('website'),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
});

export const siteSettings = pgTable('site_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  site_id: uuid('site_id')
    .notNull()
    .references(() => sites.id, { onDelete: 'cascade' }),
  booking_enabled: text('booking_enabled').notNull().default('true'), // 'true' | 'false'
  booking_hours: jsonb('booking_hours').notNull().default({
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '17:00' },
    sunday: { enabled: false, start: '09:00', end: '17:00' },
  }),
  appointment_duration_minutes: text('appointment_duration_minutes').notNull().default('30'),
  buffer_minutes: text('buffer_minutes').notNull().default('0'),
  advance_booking_days: text('advance_booking_days').notNull().default('30'),
  reminder_default_enabled: text('reminder_default_enabled').notNull().default('true'),
  reminder_hours_before: text('reminder_hours_before').notNull().default('24'),
  review_link: text('review_link'),
  auto_request_reviews: text('auto_request_reviews').notNull().default('false'),
  quiet_hours: jsonb('quiet_hours'),
  notifications: jsonb('notifications'),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .notNull()
    .defaultNow(),
});

export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type NewSiteSettings = typeof siteSettings.$inferInsert;
