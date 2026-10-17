import { getTenantContext } from '@/lib/tenant';
import { PageHeader } from '@/components/shared/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Building2, Bell, Calendar, Code, Users, BellRing } from 'lucide-react';
import { getSiteSettings, getTeamMembers } from '@/features/settings/queries';
import { PracticeTab } from '@/components/settings/practice-tab';
import { RemindersTab } from '@/components/settings/reminders-tab';
import { BookingTab } from '@/components/settings/booking-tab';
import { EmbedTab } from '@/components/settings/embed-tab';
import { TeamTab } from '@/components/settings/team-tab';
import { NotificationsTab } from '@/components/settings/notifications-tab';

export default async function SettingsPage() {
  const { site } = await getTenantContext();
  const settings = await getSiteSettings(site.id);
  const members = await getTeamMembers(site.id);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        description="Manage your practice profile, reminders, booking, team, and notifications"
      />

      <Tabs defaultValue="practice" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="practice" className="gap-2"><Building2 className="h-4 w-4" /> Practice</TabsTrigger>
          <TabsTrigger value="reminders" className="gap-2"><Bell className="h-4 w-4" /> Reminders</TabsTrigger>
          <TabsTrigger value="booking" className="gap-2"><Calendar className="h-4 w-4" /> Booking</TabsTrigger>
          <TabsTrigger value="embed" className="gap-2"><Code className="h-4 w-4" /> Embed</TabsTrigger>
          <TabsTrigger value="team" className="gap-2"><Users className="h-4 w-4" /> Team</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><BellRing className="h-4 w-4" /> Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="practice">
          <PracticeTab site={site} settings={settings} />
        </TabsContent>
        <TabsContent value="reminders">
          <RemindersTab siteId={site.id} settings={settings} />
        </TabsContent>
        <TabsContent value="booking">
          <BookingTab siteId={site.id} settings={settings} />
        </TabsContent>
        <TabsContent value="embed">
          <EmbedTab siteSlug={site.slug} />
        </TabsContent>
        <TabsContent value="team">
          <TeamTab siteId={site.id} members={members} />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab siteId={site.id} settings={settings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}


