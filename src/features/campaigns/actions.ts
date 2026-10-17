'use server';

if (typeof window === 'undefined' && process.env.NEXT_RUNTIME) {
  require('server-only');
}

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getMatchingAudiencePatients, AudienceFilterOptions } from './queries';

export interface CreateCampaignInput {
  name: string;
  channel: string; // 'sms' | 'email' | 'both'
  subject?: string;
  body: string;
  audienceFilter: AudienceFilterOptions;
  scheduleType: 'now' | 'later';
  scheduledFor?: string;
}

export async function createAndSendCampaign(siteId: string, data: CreateCampaignInput) {
  const matchingPatients = await getMatchingAudiencePatients(siteId, data.audienceFilter);

  if (matchingPatients.length === 0) {
    return { success: false, error: 'No matching opted-in patients found for this audience filter.' };
  }

  const nowIso = new Date().toISOString();
  const isNow = data.scheduleType === 'now';
  const status = isNow ? 'sent' : 'scheduled';
  const sentAt = isNow ? nowIso : null;

  const [campaign] = await db
    .insert(schema.campaigns)
    .values({
      site_id: siteId,
      name: data.name,
      channel: data.channel,
      subject: data.subject || null,
      body: data.body,
      status,
      scheduled_for: data.scheduledFor || null,
      sent_at: sentAt,
      audience_filter: JSON.stringify(data.audienceFilter),
      total_recipients: String(matchingPatients.length),
      sent_count: isNow ? String(matchingPatients.length) : '0',
      delivered_count: '0',
      failed_count: '0',
      replied_count: '0',
      booked_count: '0',
    })
    .returning();

  if (isNow) {
    let delivered = 0;
    let failed = 0;
    let replied = 0;
    let booked = 0;

    const recipientValues = matchingPatients.map((patient, index) => {
      // Realistic outcome simulation: 90% delivered, 10% failed
      // Of delivered: ~20% replied, ~10% booked
      const isFail = Math.random() < 0.08;
      let recipStatus = 'delivered';
      if (isFail) {
        recipStatus = 'failed';
        failed++;
      } else {
        delivered++;
        const isReplied = Math.random() < 0.22;
        const isBooked = Math.random() < 0.12;
        if (isBooked) {
          recipStatus = 'booked';
          replied++;
          booked++;
        } else if (isReplied) {
          recipStatus = 'replied';
          replied++;
        }
      }

      return {
        site_id: siteId,
        campaign_id: campaign.id,
        patient_id: patient.id,
        channel: data.channel === 'both' ? (index % 2 === 0 ? 'sms' : 'email') : data.channel,
        status: recipStatus,
        sent_at: nowIso,
        delivered_at: recipStatus !== 'failed' ? nowIso : null,
        error_message: recipStatus === 'failed' ? 'Carrier network timeout / Invalid destination' : null,
      };
    });

    if (recipientValues.length > 0) {
      await db.insert(schema.campaignRecipients).values(recipientValues);
    }

    await db
      .update(schema.campaigns)
      .set({
        delivered_count: String(delivered),
        failed_count: String(failed),
        replied_count: String(replied),
        booked_count: String(booked),
        updated_at: nowIso,
      })
      .where(eq(schema.campaigns.id, campaign.id));
  } else {
    // Scheduled campaign recipients placeholder
    const recipientValues = matchingPatients.map((patient, index) => ({
      site_id: siteId,
      campaign_id: campaign.id,
      patient_id: patient.id,
      channel: data.channel === 'both' ? (index % 2 === 0 ? 'sms' : 'email') : data.channel,
      status: 'pending',
    }));
    if (recipientValues.length > 0) {
      await db.insert(schema.campaignRecipients).values(recipientValues);
    }
  }

  revalidatePath('/campaigns');
  return { success: true, campaignId: campaign.id };
}

export async function cancelCampaign(siteId: string, campaignId: string) {
  await db
    .update(schema.campaigns)
    .set({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .where(and(eq(schema.campaigns.site_id, siteId), eq(schema.campaigns.id, campaignId)));

  revalidatePath('/campaigns');
  revalidatePath(`/campaigns/${campaignId}`);
  return { success: true };
}

export async function deleteCampaign(siteId: string, campaignId: string) {
  await db
    .delete(schema.campaigns)
    .where(and(eq(schema.campaigns.site_id, siteId), eq(schema.campaigns.id, campaignId)));

  revalidatePath('/campaigns');
  return { success: true };
}
