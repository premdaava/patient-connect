'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { updateNotificationSettings } from '@/features/settings/actions';
import { toast } from 'sonner';
import { BellRing } from 'lucide-react';
import { SiteSettings } from '@/db/schema';

export function NotificationsTab({ siteId, settings }: { siteId: string; settings: SiteSettings }) {
  const [loading, setLoading] = useState(false);
  const notifs = (settings.notifications as any) || {
    email_alerts: true,
    sms_alerts: true,
    review_notifications: true,
    daily_digest: false,
  };

  const [form, setForm] = useState({
    email_alerts: notifs.email_alerts ?? true,
    sms_alerts: notifs.sms_alerts ?? true,
    review_notifications: notifs.review_notifications ?? true,
    daily_digest: notifs.daily_digest ?? false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateNotificationSettings(siteId, { notifications: form });
      if (res.success) {
        toast.success('Notification preferences updated successfully.');
      } else {
        toast.error('Failed to update.');
      }
    } catch {
      toast.error('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BellRing className="h-5 w-5 text-primary" /> Staff Notification Preferences</CardTitle>
          <CardDescription>Choose which alerts and digests staff members receive.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="space-y-0.5">
              <Label className="text-base">Email Booking & Message Alerts</Label>
              <p className="text-sm text-muted-foreground">Receive instant email when a patient books or messages.</p>
            </div>
            <Switch checked={form.email_alerts} onCheckedChange={(v) => setForm({ ...form, email_alerts: v })} />
          </div>

          <div className="flex items-center justify-between border-b pb-4">
            <div className="space-y-0.5">
              <Label className="text-base">SMS Patient Reply Alerts</Label>
              <p className="text-sm text-muted-foreground">Receive SMS notification when a patient replies to a conversation.</p>
            </div>
            <Switch checked={form.sms_alerts} onCheckedChange={(v) => setForm({ ...form, sms_alerts: v })} />
          </div>

          <div className="flex items-center justify-between border-b pb-4">
            <div className="space-y-0.5">
              <Label className="text-base">New Review Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified when patients leave Google or Yelp reviews.</p>
            </div>
            <Switch checked={form.review_notifications} onCheckedChange={(v) => setForm({ ...form, review_notifications: v })} />
          </div>

          <div className="flex items-center justify-between pb-2">
            <div className="space-y-0.5">
              <Label className="text-base">Daily Summary Digest</Label>
              <p className="text-sm text-muted-foreground">Receive a daily morning email summary of appointments and patient requests.</p>
            </div>
            <Switch checked={form.daily_digest} onCheckedChange={(v) => setForm({ ...form, daily_digest: v })} />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
