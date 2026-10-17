'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bot, Zap } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId?: string;
  patientId?: string;
  patientName?: string;
  onSimulated: () => void;
}

export function SimulateReplyDialog({ open, onOpenChange, threadId, patientId, patientName, onSimulated }: Props) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText : message;
    if (!textToSend.trim()) {
      toast.error('Please enter a message or select a keyword');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/dev/simulate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: threadId,
          patient_id: patientId,
          message: textToSend,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to simulate reply');
      }

      toast.success(data.effect || 'Simulated patient reply received!', {
        description: data.auto_reply ? `Auto-reply triggered: "${data.auto_reply}"` : undefined,
      });

      setMessage('');
      onOpenChange(false);
      onSimulated();
    } catch (err: any) {
      toast.error(err.message || 'Simulation error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Simulate Patient Reply {patientName ? `(${patientName})` : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <p className="text-xs text-muted-foreground">
            Test inbound SMS replies from a patient. Use quick keyword buttons or type a custom message.
          </p>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Quick Keyword Presets</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex flex-col h-auto py-2 text-xs"
                onClick={() => handleSend('C')}
                disabled={loading}
              >
                <span className="font-bold text-primary">C / Confirm</span>
                <span className="text-[10px] text-muted-foreground">Confirms appt</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex flex-col h-auto py-2 text-xs"
                onClick={() => handleSend('STOP')}
                disabled={loading}
              >
                <span className="font-bold text-destructive">STOP</span>
                <span className="text-[10px] text-muted-foreground">Opts out SMS</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex flex-col h-auto py-2 text-xs"
                onClick={() => handleSend('R')}
                disabled={loading}
              >
                <span className="font-bold text-amber-600">R / Review</span>
                <span className="text-[10px] text-muted-foreground">Triggers review</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-msg">Custom Patient Reply</Label>
            <Textarea
              id="custom-msg"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Can I reschedule my cleaning to next Tuesday?"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={() => handleSend()} disabled={loading || !message.trim()}>
            {loading ? 'Simulating...' : 'Send Inbound Reply'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
