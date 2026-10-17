import { pgTable, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { sites } from './sites';
import { patients } from './patients';

export const campaigns = pgTable(
  'campaigns',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    site_id: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    channel: text('channel').notNull(), // 'sms' | 'email' | 'both'
    subject: text('subject'), // for email
    body: text('body').notNull(),
    status: text('status').notNull().default('draft'), // 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
    scheduled_for: timestamp('scheduled_for', { withTimezone: true, mode: 'string' }),
    sent_at: timestamp('sent_at', { withTimezone: true, mode: 'string' }),
    audience_filter: text('audience_filter'), // JSON string or simple filter
    total_recipients: text('total_recipients').notNull().default('0'),
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
    site_idx: index('campaigns_site_id_idx').on(table.site_id),
    status_idx: index('campaigns_status_idx').on(table.status),
  })
);

export const campaignRecipients = pgTable(
  'campaign_recipients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    site_id: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    campaign_id: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id, { onDelete: 'cascade' }),
    patient_id: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    channel: text('channel').notNull(), // 'sms' | 'email'
    status: text('status').notNull().default('pending'), // 'pending' | 'sent' | 'delivered' | 'failed' | 'opted_out'
    sent_at: timestamp('sent_at', { withTimezone: true, mode: 'string' }),
    delivered_at: timestamp('delivered_at', { withTimezone: true, mode: 'string' }),
    error_message: text('error_message'),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    site_idx: index('campaign_recipients_site_id_idx').on(table.site_id),
    campaign_idx: index('campaign_recipients_campaign_id_idx').on(table.campaign_id),
    patient_idx: index('campaign_recipients_patient_id_idx').on(table.patient_id),
  })
);

export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;
export type CampaignRecipient = typeof campaignRecipients.$inferSelect;
export type NewCampaignRecipient = typeof campaignRecipients.$inferInsert;
