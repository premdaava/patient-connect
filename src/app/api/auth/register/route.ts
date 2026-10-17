import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { hashSync } from 'bcryptjs';
import { createSession } from '@/lib/session';
import { cloneStarterData } from '@/features/starter-data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      practiceName,
      practiceSlug,
      timezone,
      practicePhone,
      reviewLink,
      reminderHours,
    } = body;

    if (!firstName || !email || !password || !practiceName || !practiceSlug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const password_hash = hashSync(password, 10);

    const [user] = await db
      .insert(schema.users)
      .values({
        first_name: firstName,
        last_name: lastName,
        email,
        password_hash,
        phone,
      })
      .returning();

    const [site] = await db
      .insert(schema.sites)
      .values({
        name: practiceName,
        slug: practiceSlug,
        timezone: timezone || 'America/New_York',
        phone: practicePhone,
        email,
      })
      .returning();

    await db.insert(schema.memberships).values({
      user_id: user.id,
      site_id: site.id,
      role: 'owner',
    });

    await db.insert(schema.siteSettings).values({
      site_id: site.id,
      review_link: reviewLink,
      reminder_hours_before: reminderHours || '24',
    });

    await cloneStarterData(site.id, user.id);

    await createSession({
      userId: user.id,
      siteId: site.id,
      role: 'owner',
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
    });

    return NextResponse.json({ success: true, siteId: site.id });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
