import 'server-only';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, desc, asc, sql, not, inArray } from 'drizzle-orm';

export async function getCampaigns(siteId: string) {
  return await db
    .select()
    .from(schema.campaigns)
    .where(eq(schema.campaigns.site_id, siteId))
    .orderBy(desc(schema.campaigns.created_at));
}

export async function getCampaignById(siteId: string, campaignId: string) {
  const [campaign] = await db
    .select()
    .from(schema.campaigns)
    .where(and(eq(schema.campaigns.site_id, siteId), eq(schema.campaigns.id, campaignId)))
    .limit(1);

  if (!campaign) return null;

  const recipients = await db
    .select({
      id: schema.campaignRecipients.id,
      status: schema.campaignRecipients.status,
      channel: schema.campaignRecipients.channel,
      sent_at: schema.campaignRecipients.sent_at,
      delivered_at: schema.campaignRecipients.delivered_at,
      error_message: schema.campaignRecipients.error_message,
      patient: {
        id: schema.patients.id,
        first_name: schema.patients.first_name,
        last_name: schema.patients.last_name,
        phone: schema.patients.phone,
        email: schema.patients.email,
        tags: schema.patients.tags,
        last_visit_date: schema.patients.last_visit_date,
      },
    })
    .from(schema.campaignRecipients)
    .innerJoin(schema.patients, eq(schema.campaignRecipients.patient_id, schema.patients.id))
    .where(and(eq(schema.campaignRecipients.site_id, siteId), eq(schema.campaignRecipients.campaign_id, campaignId)));

  return { ...campaign, recipients };
}

export interface AudienceFilterOptions {
  lastVisit?: string; // 'all' | '1_month' | '3_months' | '6_months' | '12_months' | 'never'
  excludeFutureApts?: boolean;
  tag?: string;
  channel: string; // 'sms' | 'email' | 'both'
}

export async function getMatchingAudiencePatients(siteId: string, filters: AudienceFilterOptions) {
  const conditions = [eq(schema.patients.site_id, siteId)];

  // STRICTLY OPTED-IN
  if (filters.channel === 'sms') {
    conditions.push(eq(schema.consents.sms_consent, 'opted_in'));
  } else if (filters.channel === 'email') {
    conditions.push(eq(schema.consents.email_consent, 'opted_in'));
  } else {
    // 'both' -> needs both opted in or at least sms/email opted in. Let's require sms_consent === 'opted_in' for sms or email.
    conditions.push(sql`(${schema.consents.sms_consent} = 'opted_in' OR ${schema.consents.email_consent} = 'opted_in')`);
  }

  // Last visit filter
  if (filters.lastVisit && filters.lastVisit !== 'all') {
    const now = new Date();
    if (filters.lastVisit === '1_month') {
      const d = new Date();
      d.setMonth(now.getMonth() - 1);
      conditions.push(sql`${schema.patients.last_visit_date} < ${d.toISOString().split('T')[0]}`);
    } else if (filters.lastVisit === '3_months') {
      const d = new Date();
      d.setMonth(now.getMonth() - 3);
      conditions.push(sql`${schema.patients.last_visit_date} < ${d.toISOString().split('T')[0]}`);
    } else if (filters.lastVisit === '6_months') {
      const d = new Date();
      d.setMonth(now.getMonth() - 6);
      conditions.push(sql`${schema.patients.last_visit_date} < ${d.toISOString().split('T')[0]}`);
    } else if (filters.lastVisit === '12_months') {
      const d = new Date();
      d.setFullYear(now.getFullYear() - 1);
      conditions.push(sql`${schema.patients.last_visit_date} < ${d.toISOString().split('T')[0]}`);
    } else if (filters.lastVisit === 'never') {
      conditions.push(sql`${schema.patients.last_visit_date} IS NULL`);
    }
  }

  // Tag filter
  if (filters.tag && filters.tag !== 'all') {
    conditions.push(sql`${filters.tag} = ANY(${schema.patients.tags})`);
  }

  let patientsQuery = db
    .select({
      id: schema.patients.id,
      first_name: schema.patients.first_name,
      last_name: schema.patients.last_name,
      phone: schema.patients.phone,
      email: schema.patients.email,
      last_visit_date: schema.patients.last_visit_date,
      tags: schema.patients.tags,
      sms_consent: schema.consents.sms_consent,
      email_consent: schema.consents.email_consent,
    })
    .from(schema.patients)
    .innerJoin(
      schema.consents,
      and(eq(schema.consents.patient_id, schema.patients.id), eq(schema.consents.site_id, siteId))
    )
    .where(and(...conditions));

  let results = await patientsQuery;

  // Exclude future appointments if requested
  if (filters.excludeFutureApts) {
    const nowIso = new Date().toISOString();
    const futureApts = await db
      .select({ patient_id: schema.appointments.patient_id })
      .from(schema.appointments)
      .where(
        and(
          eq(schema.appointments.site_id, siteId),
          sql`${schema.appointments.start_time} >= ${nowIso}`
        )
      );
    const futurePatientIds = new Set(futureApts.map((a) => a.patient_id));
    results = results.filter((p) => !futurePatientIds.has(p.id));
  }

  return results;
}
