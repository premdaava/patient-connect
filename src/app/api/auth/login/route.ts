import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { compareSync } from 'bcryptjs';
import { createSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    let email = '';
    let password = '';

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } else {
      const formData = await request.formData();
      email = formData.get('email') as string;
      password = formData.get('password') as string;
    }

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
    }

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (!user || !compareSync(password, user.password_hash)) {
      return NextResponse.json({ success: false, error: 'Invalid email or password. Please try again.' }, { status: 401 });
    }

    const [membership] = await db
      .select()
      .from(schema.memberships)
      .where(eq(schema.memberships.user_id, user.id))
      .limit(1);

    const siteId = membership?.site_id || '';
    const role = membership?.role || 'owner';

    await createSession({
      userId: user.id,
      siteId,
      role,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: error.message || 'An unexpected error occurred during login.' }, { status: 500 });
  }
}
