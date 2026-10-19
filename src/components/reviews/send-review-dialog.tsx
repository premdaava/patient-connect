'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Star } from 'lucide-react';
import { sendReviewRequestAction } from '@/features/reviews/actions';
import { toast } from 'sonner';

interface SendReviewDialogProps {
  patients: any[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SendReviewDialog({ patients, open: externalOpen, onOpenChange: externalOnOpenChange }: SendReviewDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = isControlled ? externalOnOpenChange! : setInternalOpen;
  const [patientId, setPatientId] = useState('');
  const [channel, setChannel] = useState<'sms' | 'email'>('sms');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      toast.error('Please select a patient');
      return;
    }

    setLoading(true);
    try {
      await sendReviewRequestAction({
        patient_id: patientId,
        channel,
        body: body.trim() || undefined,
      });
      toast.success('Review request sent successfully!');
      setOpen(false);
      setPatientId('');
      setBody('');
    } catch (error) {
      toast.error('Failed to send review request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Send Review Request
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Send Review Request</DialogTitle>
            <DialogDescription>
              Send an instant review request via SMS or email to a patient.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.first_name} {p.last_name} ({p.phone || p.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={channel} onValueChange={(v: any) => setChannel(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS Text Message</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Message Body (optional)</Label>
              <Textarea
                placeholder="Hi {{first_name}}, thank you for visiting us! Please leave a review..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
              />
              <p className="text-[10px] text-muted-foreground">
                A secure tracking link will be automatically appended to the message.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
