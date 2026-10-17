'use client';

import { useState, useEffect, useTransition } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { createAppointment, updateAppointment, updateAppointmentStatus, sendManualReminder } from '@/features/appointments/actions';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, AlertCircle, Send } from 'lucide-react';

export function AppointmentDrawer({ open, onOpenChange, appointment, patients, providers }: any) {
  const isEditing = Boolean(appointment?.id);
  const [pid, setPid] = useState(appointment?.patient_id || '');
  const [type, setType] = useState(appointment?.appointment_type || 'Cleaning');
  const [prov, setProv] = useState(appointment?.provider || providers[0] || 'Dr. Sarah Johnson');
  const [start, setStart] = useState(appointment?.start_time ? new Date(appointment.start_time).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
  const [end, setEnd] = useState(appointment?.end_time ? new Date(appointment.end_time).toISOString().slice(0, 16) : new Date(Date.now() + 1800000).toISOString().slice(0, 16));
  const [notes, setNotes] = useState(appointment?.notes || '');
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (appointment) {
      setPid(appointment.patient_id || '');
      setType(appointment.appointment_type || 'Cleaning');
      setProv(appointment.provider || providers[0] || 'Dr. Sarah Johnson');
      if (appointment.start_time) setStart(new Date(appointment.start_time).toISOString().slice(0, 16));
      if (appointment.end_time) setEnd(new Date(appointment.end_time).toISOString().slice(0, 16));
      setNotes(appointment.notes || '');
    } else {
      setPid(patients[0]?.id || '');
      setType('Cleaning');
      setProv(providers[0] || 'Dr. Sarah Johnson');
      setStart(new Date().toISOString().slice(0, 16));
      setEnd(new Date(Date.now() + 1800000).toISOString().slice(0, 16));
      setNotes('');
    }
  }, [appointment, patients, providers, open]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pid) { toast.error('Select patient'); return; }
    startTransition(async () => {
      const s = new Date(start).toISOString();
      const en = new Date(end).toISOString();
      if (isEditing && appointment?.id) {
        const res = await updateAppointment(appointment.site_id, appointment.id, { appointment_type: type, provider: prov, start_time: s, end_time: en, notes });
        if (res.success) { toast.success('Updated'); onOpenChange(false); } else { toast.error('Error'); }
      } else {
        const res = await createAppointment('', { patient_id: pid, appointment_type: type, provider: prov, start_time: s, end_time: en, notes });
        if (res.success) { toast.success('Created'); onOpenChange(false); } else { toast.error('Error'); }
      }
    });
  };

  const setStatus = (st: string) => {
    if (!appointment?.id) return;
    startTransition(async () => {
      const res = await updateAppointmentStatus(appointment.site_id, appointment.id, st);
      if (res.success) { toast.success(`Status: ${st}`); onOpenChange(false); } else { toast.error('Error'); }
    });
  };

  const sendReminder = (id: string) => {
    if (!appointment?.id) return;
    startTransition(async () => {
      const res = await sendManualReminder(appointment.site_id, appointment.id, id);
      if (res.success) { toast.success('Reminder sent'); onOpenChange(false); } else { toast.error(res.error || 'Error'); }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Appointment' : 'New Appointment'}</SheetTitle>
          <SheetDescription>{isEditing ? 'Manage appointment details' : 'Schedule a new visit'}</SheetDescription>
        </SheetHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <div className="space-y-1">
            <Label>Patient</Label>
            <Select value={pid} onValueChange={setPid} disabled={isEditing}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>
                {patients.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                  <SelectItem value="Exam">Exam</SelectItem>
                  <SelectItem value="Consultation">Consultation</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Provider</Label>
              <Select value={prov} onValueChange={setProv}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {providers.map((p: string) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1"><Label>Start</Label><Input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} required /></div>
            <div className="space-y-1"><Label>End</Label><Input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} required /></div>
          </div>
          <div className="space-y-1"><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} /></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={pending}>{isEditing ? 'Save' : 'Create'}</Button></div>
        </form>
        {isEditing && appointment && (
          <div className="mt-6 pt-4 border-t space-y-4">
            <div>
              <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase">Status</h4>
              <div className="flex flex-wrap gap-1.5">
                <Button size="sm" variant={appointment.status === 'confirmed' ? 'default' : 'outline'} onClick={() => setStatus('confirmed')}><CheckCircle2 className="mr-1 h-3.5 w-3.5 text-green-500" /> Confirm</Button>
                <Button size="sm" variant={appointment.status === 'completed' ? 'default' : 'outline'} onClick={() => setStatus('completed')}><CheckCircle2 className="mr-1 h-3.5 w-3.5 text-blue-500" /> Complete</Button>
                <Button size="sm" variant={appointment.status === 'no_show' ? 'default' : 'outline'} onClick={() => setStatus('no_show')}><AlertCircle className="mr-1 h-3.5 w-3.5 text-yellow-500" /> No-Show</Button>
                <Button size="sm" variant={appointment.status === 'cancelled' ? 'default' : 'outline'} onClick={() => setStatus('cancelled')}><XCircle className="mr-1 h-3.5 w-3.5 text-red-500" /> Cancel</Button>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase">Reminders</h4>
              {appointment.reminders && appointment.reminders.length > 0 ? (
                <div className="space-y-2">
                  {appointment.reminders.map((r: any) => (
                    <div key={r.id} className="p-2.5 border rounded bg-muted/30 text-xs space-y-1.5">
                      <div className="flex justify-between items-center"><span className="font-medium">{r.channel.toUpperCase()}</span><Badge variant={r.status === 'sent' ? 'default' : 'secondary'}>{r.status}</Badge></div>
                      <p className="text-muted-foreground">{r.message_body}</p>
                      <div className="flex justify-between text-[10px] text-muted-foreground"><span>Sch: {new Date(r.scheduled_for).toLocaleString()}</span>{r.sent_at && <span>Sent: {new Date(r.sent_at).toLocaleString()}</span>}</div>
                      {r.status === 'pending' && <div className="flex justify-end"><Button size="sm" variant="secondary" onClick={() => sendReminder(r.id)}><Send className="mr-1 h-3 w-3" /> Send now</Button></div>}
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-muted-foreground">No reminders.</p>}
            </div>

          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

