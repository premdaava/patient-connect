import { NextRequest, NextResponse } from 'next/server';
import { getMatchingAudiencePatients } from '@/features/campaigns/queries';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const siteId = url.searchParams.get('siteId');
  const channel = url.searchParams.get('channel') || 'sms';
  const lastVisit = url.searchParams.get('lastVisit') || 'all';
  const excludeFutureApts = url.searchParams.get('excludeFutureApts') === 'true';
  const tag = url.searchParams.get('tag') || 'all';

  if (!siteId) {
    return NextResponse.json({ error: 'Missing siteId' }, { status: 400 });
  }

  const patients = await getMatchingAudiencePatients(siteId, {
    channel,
    lastVisit,
    excludeFutureApts,
    tag,
  });

  return NextResponse.json({ patients });
}
