'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { updateRemindersSettings } from '@/features/settings/actions';
import { toast } from 'sonner';
import { Bell, Moon, Star } from 'lucide-react';
import { SiteSettings } from '@/db/schema';

export function RemindersTab({ siteId, settings }: { siteId: string; settings: SiteSettings }) {
  const [loading, setLoading] = useState(false);
  const qh = (settings.quiet_hours as any) || { start: '21:00', end: '08:00', enabled: true };
  const [form, setForm] = useState({
    reminder_hours_before: settings.reminder_hours_before || '24',
    reminder_default_enabled: settings.reminder_default_enabled === 'true',
    auto_request_reviews: settings.auto_request_reviews === 'true',
    quiet_enabled: qh.enabled ?? true,
    quiet_start: qh.start || '21:00',
    quiet_end: qh.end || '08:00',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateRemindersSettings(siteId, {
        reminder_hours_before: form.reminder_hours_before,
        reminder_default_enabled: form.reminder_default_enabled ? 'true' : 'false',
        auto_request_reviews: form.auto_request_reviews ? 'true' : 'false',
        quiet_hours: { enabled: form.quiet_enabled, start: form.quiet_start, end: form.quiet_end },
      });
      if (res.success) {
        toast.success('Reminder settings updated.');
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
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Automated Reminders</CardTitle>
          <CardDescription>Configure SMS & email reminder timing and quiet hours.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Reminders by Default</Label>
              <p className="text-sm text-muted-foreground">Automatically schedule reminders for new appointments.</p>
            </div>
            <Switch checked={form.reminder_default_enabled} onCheckedChange={(v) => setForm({ ...form, reminder_default_enabled: v })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder_hours_before">Hours Before Appointment</Label>
            <Input id="reminder_hours_before" type="number" value={form.reminder_hours_before} onChange={(e) => setForm({ ...form, reminder_hours_before: e.target.value })} className="max-w-xs" />
          </div>

          <div className="flex items-center justify-between border-b pb-4 pt-2">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /> Auto-Request Reviews</Label>
              <p className="text-sm text-muted-foreground">Automatically request reviews after appointments complete.</p>
            </div>
            <Switch checked={form.auto_request_reviews} onCheckedChange={(v) => setForm({ ...form, auto_request_reviews: v })} />
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2"><Moon className="h-4 w-4 text-indigo-500" /> Quiet Hours</Label>
                <p className="text-sm text-muted-foreground">Suppress outbound automated texts during late hours.</p>
              </div>
              <Switch checked={form.quiet_enabled} onCheckedChange={(v) => setForm({ ...form, quiet_enabled: v })} />
            </div>

            {form.quiet_enabled && (
              <div className="grid grid-cols-2 gap-4 max-w-sm pl-6 border-l-2 border-primary/20">
                <div className="space-y-1">
                  <Label className="text-xs">Quiet Start</Label>
                  <Input type="time" value={form.quiet_start} onChange={(e) => setForm({ ...form, quiet_start: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Quiet End</Label>
                  <Input type="time" value={form.quiet_end} onChange={(e) => setForm({ ...form, quiet_end: e.target.value })} />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
