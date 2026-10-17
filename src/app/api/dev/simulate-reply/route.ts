import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getTenantContext } from '@/lib/tenant';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { thread_id, patient_id, message } = body;
    if (!message) return NextResponse.json({ success: false, error: 'Message required' }, { status: 400 });

    let siteId: string;
    try {
      const tenant = await getTenantContext();
      siteId = tenant.site.id;
    } catch {
      const [site] = await db.select().from(schema.sites).limit(1);
      if (!site) return NextResponse.json({ success: false, error: 'No site' }, { status: 400 });
      siteId = site.id;
    }

    let targetThreadId = thread_id;
    let targetPatientId = patient_id;

    if (!targetThreadId && targetPatientId) {
      const [existing] = await db.select().from(schema.threads).where(and(eq(schema.threads.site_id, siteId), eq(schema.threads.patient_id, targetPatientId))).limit(1);
      if (existing) targetThreadId = existing.id;
      else {
        const [newT] = await db.insert(schema.threads).values({
          site_id: siteId, patient_id: targetPatientId, channel: 'sms', status: 'open',
          last_message_at: new Date().toISOString(), last_message_preview: message, unread_count: '1'
        }).returning();
        targetThreadId = newT.id;
      }
    }

    if (!targetThreadId) {
      const [first] = await db.select().from(schema.threads).where(eq(schema.threads.site_id, siteId)).limit(1);
      if (!first) return NextResponse.json({ success: false, error: 'No threads' }, { status: 400 });
      targetThreadId = first.id;
      targetPatientId = first.patient_id;
    } else {
      const [tRec] = await db.select().from(schema.threads).where(eq(schema.threads.id, targetThreadId)).limit(1);
      if (tRec) targetPatientId = tRec.patient_id;
    }

    const nowIso = new Date().toISOString();
    await db.insert(schema.messages).values({
      site_id: siteId, thread_id: targetThreadId, patient_id: targetPatientId!,
      direction: 'inbound', channel: 'sms', sender_type: 'patient', body: message, status: 'delivered', is_read: 'false'
    });

    const [currentThread] = await db.select().from(schema.threads).where(eq(schema.threads.id, targetThreadId)).limit(1);
    const currentUnread = currentThread ? parseInt(currentThread.unread_count || '0', 10) : 0;

    await db.update(schema.threads).set({
      last_message_at: nowIso, last_message_preview: message, unread_count: String(currentUnread + 1), status: 'open', updated_at: nowIso
    }).where(eq(schema.threads.id, targetThreadId));

    const trimmed = message.trim().toUpperCase();
    let effect = 'Inbound message received';
    let autoReply = '';

    if (trimmed === 'STOP' || trimmed.includes('STOP')) {
      effect = 'Patient opted out of SMS (STOP keyword)';
      const [ex] = await db.select().from(schema.consents).where(and(eq(schema.consents.site_id, siteId), eq(schema.consents.patient_id, targetPatientId!))).limit(1);
      if (ex) {
        await db.update(schema.consents).set({ sms_consent: 'opted_out', updated_at: nowIso }).where(eq(schema.consents.id, ex.id));
      } else {
        await db.insert(schema.consents).values({ site_id: siteId, patient_id: targetPatientId!, sms_consent: 'opted_out', email_consent: 'opted_in' });
      }
      autoReply = 'You have been successfully unsubscribed. Reply START to resubscribe.';
    } else if (trimmed === 'C' || trimmed === 'CONFIRM' || trimmed.includes('CONFIRM')) {
      effect = 'Appointment confirmed (C keyword)';
      const [nextApt] = await db.select().from(schema.appointments).where(
        and(eq(schema.appointments.site_id, siteId), eq(schema.appointments.patient_id, targetPatientId!), sql`${schema.appointments.start_time} >= ${nowIso}`)
      ).orderBy(sql`${schema.appointments.start_time} ASC`).limit(1);
      if (nextApt) {
        await db.update(schema.appointments).set({ status: 'confirmed', updated_at: nowIso }).where(eq(schema.appointments.id, nextApt.id));
      }
      autoReply = 'Thank you! Your appointment has been confirmed.';
    } else if (trimmed === 'R' || trimmed === 'REVIEW' || trimmed.includes('REVIEW')) {
      effect = 'Review request response triggered';
      autoReply = 'Thank you for your feedback! Please leave us a review here: https://www.google.com/maps';
    } else {
      effect = `Inbound message received: "${message}"`;
    }

    if (autoReply) {
      await db.insert(schema.messages).values({
        site_id: siteId, thread_id: targetThreadId, patient_id: targetPatientId!,
        direction: 'outbound', channel: 'sms', sender_type: 'system', body: autoReply, status: 'sent', is_read: 'true'
      });
      await db.update(schema.threads).set({
        last_message_at: new Date().toISOString(), last_message_preview: autoReply, updated_at: new Date().toISOString()
      }).where(eq(schema.threads.id, targetThreadId));
    }

    return NextResponse.json({ success: true, effect, auto_reply: autoReply || null, thread_id: targetThreadId });
  } catch (error: any) {
    console.error('Simulate reply error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error' }, { status: 500 });
  }
}
