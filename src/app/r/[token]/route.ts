import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const [reviewReq] = await db
    .select()
    .from(schema.reviewRequests)
    .where(eq(schema.reviewRequests.token, token))
    .limit(1);

  if (!reviewReq) {
    redirect('https://www.google.com/maps');
  }

  const nowIso = new Date().toISOString();

  // Update status to clicked if still sent
  if (reviewReq.status === 'sent') {
    await db
      .update(schema.reviewRequests)
      .set({
        status: 'clicked',
        opened_at: nowIso,
        updated_at: nowIso,
      })
      .where(eq(schema.reviewRequests.id, reviewReq.id));
  }

  // Get site review link
  const [settings] = await db
    .select()
    .from(schema.siteSettings)
    .where(eq(schema.siteSettings.site_id, reviewReq.site_id))
    .limit(1);

  const reviewUrl = settings?.review_link || 'https://www.google.com/maps';
  redirect(reviewUrl);
}
