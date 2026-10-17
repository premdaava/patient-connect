import { getTenantContext } from '@/lib/tenant';
import { getThreads, getUnreadThreadsCount } from '@/features/inbox/queries';
import { getTemplates } from '@/features/templates/queries';
import { InboxView } from '@/components/inbox/inbox-view';

export default async function InboxPage() {
  const { site, user } = await getTenantContext();
  const threads = await getThreads(site.id);
  const templates = await getTemplates(site.id);
  const unreadCount = await getUnreadThreadsCount(site.id);

  return (
    <InboxView
      initialThreads={threads}
      templates={templates}
      siteId={site.id}
      siteName={site.name}
      userId={user.id}
    />
  );
}

