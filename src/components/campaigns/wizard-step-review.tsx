'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';

interface Props {
  name: string;
  channel: string;
  subject: string;
  body: string;
  scheduleType: string;
  scheduledFor: string;
  recipientCount: number;
  onBack: () => void;
  onSubmit: () => void;
}

export function WizardStepReview({ name, channel, subject, body, scheduleType, scheduledFor, recipientCount, onBack, onSubmit }: Props) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">Review Campaign Summary</CardTitle>
        <CardDescription>Verify details before launching.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 bg-muted/40 p-4 rounded-xl border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Campaign Name</div>
              <div className="font-semibold">{name}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Channel</div>
              <div className="font-semibold uppercase">{channel}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Audience Size</div>
              <div className="font-semibold text-primary">{recipientCount} opted-in patients</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Schedule</div>
              <div className="font-semibold">{scheduleType === 'now' ? 'Send Immediately' : `Scheduled for ${scheduledFor}`}</div>
            </div>
          </div>
          {subject && (
            <div>
              <div className="text-muted-foreground text-xs">Subject</div>
              <div className="font-semibold">{subject}</div>
            </div>
          )}
          <div>
            <div className="text-muted-foreground text-xs mb-1">Message Body</div>
            <div className="bg-background p-3 rounded-lg border text-sm whitespace-pre-wrap">{body}</div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
          <Button onClick={onSubmit} className="bg-primary"><Send className="mr-2 h-4 w-4" /> {scheduleType === 'now' ? 'Send Campaign Now' : 'Schedule Campaign'}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
