import { pgTable, text, timestamp, uuid, date, index } from 'drizzle-orm/pg-core';
import { sites } from './sites';

export const messageStats = pgTable(
  'message_stats',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    site_id: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    date: date('date', { mode: 'string' }).notNull(),
    channel: text('channel').notNull(), // 'sms' | 'email'
    message_type: text('message_type').notNull(), // 'reminder' | 'campaign' | 'inbox' | 'review_request'
    sent_count: text('sent_count').notNull().default('0'),
    delivered_count: text('delivered_count').notNull().default('0'),
    failed_count: text('failed_count').notNull().default('0'),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    site_idx: index('message_stats_site_id_idx').on(table.site_id),
    date_idx: index('message_stats_date_idx').on(table.date),
  })
);

export type MessageStats = typeof messageStats.$inferSelect;
export type NewMessageStats = typeof messageStats.$inferInsert;
