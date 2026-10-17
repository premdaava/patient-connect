import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { sites } from './sites';
import { patients } from './patients';
import { users } from './users';

export const templates = pgTable(
  'templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    site_id: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    category: text('category').notNull(), // 'appointment_reminder' | 'follow_up' | 'promotional' | 'general'
    channel: text('channel').notNull(), // 'sms' | 'email' | 'both'
    subject: text('subject'), // for email
    body: text('body').notNull(),
    is_active: text('is_active').notNull().default('true'), // 'true' | 'false'
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    site_idx: index('templates_site_id_idx').on(table.site_id),
  })
);

export const threads = pgTable(
  'threads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    site_id: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    patient_id: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    channel: text('channel').notNull(), // 'sms' | 'email'
    status: text('status').notNull().default('open'), // 'open' | 'closed'
    last_message_at: timestamp('last_message_at', { withTimezone: true, mode: 'string' }).notNull(),
    last_message_preview: text('last_message_preview'),
    unread_count: text('unread_count').notNull().default('0'),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    site_idx: index('threads_site_id_idx').on(table.site_id),
    patient_idx: index('threads_patient_id_idx').on(table.patient_id),
    last_message_idx: index('threads_last_message_at_idx').on(table.last_message_at),
  })
);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    site_id: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    thread_id: uuid('thread_id')
      .notNull()
      .references(() => threads.id, { onDelete: 'cascade' }),
    patient_id: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    direction: text('direction').notNull(), // 'inbound' | 'outbound'
    channel: text('channel').notNull(), // 'sms' | 'email'
    sender_type: text('sender_type').notNull(), // 'patient' | 'staff' | 'system'
    sender_id: uuid('sender_id').references(() => users.id, { onDelete: 'set null' }),
    subject: text('subject'), // for email
    body: text('body').notNull(),
    status: text('status').notNull().default('sent'), // 'sent' | 'delivered' | 'failed'
    is_read: text('is_read').notNull().default('false'), // 'true' | 'false'
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    site_idx: index('messages_site_id_idx').on(table.site_id),
    thread_idx: index('messages_thread_id_idx').on(table.thread_id),
    created_at_idx: index('messages_created_at_idx').on(table.created_at),
  })
);

export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type Thread = typeof threads.$inferSelect;
export type NewThread = typeof threads.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
