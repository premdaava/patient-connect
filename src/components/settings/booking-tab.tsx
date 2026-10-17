'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { updateBookingSettings } from '@/features/settings/actions';
import { toast } from 'sonner';
import { Calendar, Clock } from 'lucide-react';
import { SiteSettings } from '@/db/schema';

export function BookingTab({ siteId, settings }: { siteId: string; settings: SiteSettings }) {
  const [loading, setLoading] = useState(false);
  const hours = (settings.booking_hours as any) || {
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '17:00' },
    sunday: { enabled: false, start: '09:00', end: '17:00' },
  };

  const [form, setForm] = useState({
    booking_enabled: settings.booking_enabled === 'true',
    duration: settings.appointment_duration_minutes || '30',
    buffer: settings.buffer_minutes || '0',
    advance: settings.advance_booking_days || '30',
    hours,
  });

  const handleDay = (day: string, field: string, val: any) => {
    setForm({ ...form, hours: { ...form.hours, [day]: { ...form.hours[day], [field]: val } } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateBookingSettings(siteId, {
        booking_enabled: form.booking_enabled ? 'true' : 'false',
        appointment_duration_minutes: form.duration,
        buffer_minutes: form.buffer,
        advance_booking_days: form.advance,
        booking_hours: form.hours,
      });
      if (res.success) {
        toast.success('Booking settings updated successfully.');
      } else {
        toast.error('Failed to update.');
      }
    } catch {
      toast.error('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Online Booking & Hours</CardTitle>
          <CardDescription>Configure availability, slot lengths, and enable online booking.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Public Online Booking</Label>
              <p className="text-sm text-muted-foreground">Allow patients to book via public booking page and widget.</p>
            </div>
            <Switch checked={form.booking_enabled} onCheckedChange={(v) => setForm({ ...form, booking_enabled: v })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dur">Slot Length (Mins)</Label>
              <Input id="dur" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buf">Buffer (Mins)</Label>
              <Input id="buf" type="number" value={form.buffer} onChange={(e) => setForm({ ...form, buffer: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adv">Advance Limit (Days)</Label>
              <Input id="adv" type="number" value={form.advance} onChange={(e) => setForm({ ...form, advance: e.target.value })} />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Label className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Weekly Business Hours</Label>
            <div className="space-y-2 border rounded-xl p-4 bg-muted/20">
              {days.map((day) => {
                const d = form.hours[day] || { enabled: false, start: '09:00', end: '17:00' };
                return (
                  <div key={day} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3 w-32 capitalize">
                      <Switch checked={d.enabled} onCheckedChange={(v) => handleDay(day, 'enabled', v)} />
                      <span className="text-sm font-medium">{day}</span>
                    </div>
                    {d.enabled ? (
                      <div className="flex items-center gap-2">
                        <Input type="time" value={d.start} onChange={(e) => handleDay(day, 'start', e.target.value)} className="w-32 h-8 text-xs" />
                        <span className="text-muted-foreground text-xs">to</span>
                        <Input type="time" value={d.end} onChange={(e) => handleDay(day, 'end', e.target.value)} className="w-32 h-8 text-xs" />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic pr-12">Closed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
