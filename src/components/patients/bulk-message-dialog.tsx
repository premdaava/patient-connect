'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bulkSendMessage } from '@/features/patients/bulk-actions';
import { toast } from 'sonner';

interface BulkMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSuccess: () => void;
}

export function BulkMessageDialog({ open, onOpenChange, selectedIds, onSuccess }: BulkMessageDialogProps) {
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
        patient_ids: selectedIds,
        channel,
        subject: channel === 'email' ? subject : undefined,
        body,
      });
      if (res.success) {
        toast.success(`Sent message to ${res.successCount} patient(s)${res.failCount > 0 ? ` (${res.failCount} failed/opted-out)` : ''}`);
        if (res.lastError && res.failCount > 0) {
          toast.warning(`Note: ${res.lastError}`);
        }
        setBody('');
        setSubject('');
        onSuccess();
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send messages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Message to Selected Patients</DialogTitle>
          <DialogDescription>Broadcast to {selectedIds.length} patient(s). Opted-out patients will be respected.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={(val: any) => setChannel(val)}>
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
              <Input placeholder="Email subject..." value={subject} onChange={e => setSubject(e.target.value)} required />
            </div>
          )}

          <div className="space-y-2">
            <Label>Message Body</Label>
            <Textarea placeholder="Type your message..." rows={4} value={body} onChange={e => setBody(e.target.value)} required />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Broadcast'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
