'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bulkSendMessage } from '@/features/patients/bulk-actions';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface SendPatientMessageDialogProps {
  patientId: string;
  patientName: string;
}

export function SendPatientMessageDialog({ patientId, patientName }: SendPatientMessageDialogProps) {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<'sms' | 'email'>('sms');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    try {
      const res = await bulkSendMessage({
        patient_ids: [patientId],
        channel,
        subject: channel === 'email' ? subject : undefined,
        body,
      });
      if (res.success && res.successCount > 0) {
        toast.success(`Message sent to ${patientName}`);
        setBody('');
        setSubject('');
        setOpen(false);
      } else {
        toast.error(res.lastError || 'Failed to send message (check consent)');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <MessageSquare className="mr-2 h-4 w-4" /> Send Message
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Message to {patientName}</DialogTitle>
          <DialogDescription>Send SMS or Email directly to patient.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={(v: any) => setChannel(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {channel === 'email' && (
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input placeholder="Subject..." value={subject} onChange={e => setSubject(e.target.value)} required />
            </div>
          )}
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea placeholder="Type message..." rows={4} value={body} onChange={e => setBody(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Message'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
