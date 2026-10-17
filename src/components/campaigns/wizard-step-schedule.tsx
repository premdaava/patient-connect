'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Props {
  scheduleType: 'now' | 'later';
  setScheduleType: (v: 'now' | 'later') => void;
  scheduledFor: string;
  setScheduledFor: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function WizardStepSchedule({ scheduleType, setScheduleType, scheduledFor, setScheduledFor, onBack, onNext }: Props) {
  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">Delivery Schedule</CardTitle>
        <CardDescription>Choose when campaign is dispatched.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`border rounded-xl p-4 cursor-pointer transition-all ${
              scheduleType === 'now' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:bg-accent/50'
            }`}
            onClick={() => setScheduleType('now')}
          >
            <div className="font-semibold text-sm">Send Now</div>
            <div className="text-xs text-muted-foreground mt-1">Dispatch immediately.</div>
          </div>
          <div
            className={`border rounded-xl p-4 cursor-pointer transition-all ${
              scheduleType === 'later' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:bg-accent/50'
            }`}
            onClick={() => setScheduleType('later')}
          >
            <div className="font-semibold text-sm">Schedule for Later</div>
            <div className="text-xs text-muted-foreground mt-1">Queue for a future date/time.</div>
          </div>
        </div>

        {scheduleType === 'later' && (
          <div className="space-y-2">
            <Label>Date & Time</Label>
            <Input type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} />
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
          <Button onClick={onNext} disabled={scheduleType === 'later' && !scheduledFor}>Review & Send <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}
