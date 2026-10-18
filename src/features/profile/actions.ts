'use server';

if (typeof window === 'undefined' && process.env.NEXT_RUNTIME) {
  require('server-only');
}

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashSync, compareSync } from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function updateProfile(userId: string, data: {
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
}) {
  if (!data.first_name || !data.last_name) {
    return { success: false, error: 'First name and last name are required.' };
  }

  await db
    .update(schema.users)
    .set({
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone || null,
      avatar_url: data.avatar_url || null,
      updated_at: new Date().toISOString(),
    })
    .where(eq(schema.users.id, userId));

  revalidatePath('/profile');
  revalidatePath('/dashboard');
  revalidatePath('/settings');
  return { success: true };
}

export async function updatePassword(userId: string, data: {
  current_password: string;
  new_password: string;
}) {
  if (!data.current_password || !data.new_password) {
    return { success: false, error: 'Current password and new password are required.' };
  }

  if (data.new_password.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!user || !compareSync(data.current_password, user.password_hash)) {
    return { success: false, error: 'Incorrect current password. Please verify and try again.' };
  }

  const newPasswordHash = hashSync(data.new_password, 10);

  await db
    .update(schema.users)
    .set({
      password_hash: newPasswordHash,
      updated_at: new Date().toISOString(),
    })
    .where(eq(schema.users.id, userId));

  return { success: true };
}
