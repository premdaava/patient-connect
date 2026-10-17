'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { WizardStepAudience } from './wizard-step-audience';
import { WizardStepMessage } from './wizard-step-message';
import { WizardStepSchedule } from './wizard-step-schedule';
import { WizardStepReview } from './wizard-step-review';
import { createAndSendCampaign } from '@/features/campaigns/actions';
import { toast } from 'sonner';

interface Props { siteId: string; templates: any[]; availableTags: string[]; }

export function CampaignBuilderWizard({ siteId, templates, availableTags }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [previewPatients, setPreviewPatients] = useState<any[]>([]);
  const [fetchingAudience, setFetchingAudience] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'sms' | 'email' | 'both'>('sms');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const [lastVisit, setLastVisit] = useState('all');
  const [excludeFutureApts, setExcludeFutureApts] = useState(true);
  const [tag, setTag] = useState('all');

  const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
  const [scheduledFor, setScheduledFor] = useState('');

  useEffect(() => {
    async function fetchAudience() {
      setFetchingAudience(true);
      try {
        const res = await fetch(`/api/campaigns/audience-preview?siteId=${siteId}&channel=${channel}&lastVisit=${lastVisit}&excludeFutureApts=${excludeFutureApts}&tag=${tag}`);
        if (res.ok) { const data = await res.json(); setPreviewPatients(data.patients || []); }
      } catch (err) { console.error(err); } finally { setFetchingAudience(false); }
    }
    fetchAudience();
  }, [siteId, channel, lastVisit, excludeFutureApts, tag]);

  const handleTemplateSelect = (id: string) => {
    setSelectedTemplateId(id);
    const t = templates.find((x) => x.id === id);
    if (t) { setBody(t.body || ''); if (t.subject) setSubject(t.subject); if (t.channel) setChannel(t.channel); }
  };

  const handleFinalSubmit = async () => {
    if (!name.trim() || !body.trim()) { toast.error('Fill name and body.'); return; }
    setLoading(true);
    const res = await createAndSendCampaign(siteId, {
      name, channel, subject: channel !== 'sms' ? subject : undefined, body,
      audienceFilter: { lastVisit, excludeFutureApts, tag, channel },
      scheduleType, scheduledFor: scheduleType === 'later' ? scheduledFor : undefined,
    });
    setLoading(false);
    setShowConfirmDialog(false);
    if (res.success) {
      toast.success(scheduleType === 'now' ? 'Campaign sent!' : 'Campaign scheduled!');
      router.push(`/campaigns/${res.campaignId}`);
    } else { toast.error(res.error || 'Failed'); }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b pb-6">
        {['Audience', 'Message', 'Schedule', 'Review'].map((t, i) => (
          <div key={t} className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm ${step === i + 1 ? 'bg-primary text-primary-foreground' : step > i + 1 ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
              {step > i + 1 ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
            </div>
            <div className="hidden sm:block"><div className="text-xs text-muted-foreground">Step {i + 1}</div><div className="text-sm font-semibold">{t}</div></div>
          </div>
        ))}
      </div>
      {step === 1 && <WizardStepAudience channel={channel} setChannel={setChannel} lastVisit={lastVisit} setLastVisit={setLastVisit} excludeFutureApts={excludeFutureApts} setExcludeFutureApts={setExcludeFutureApts} tag={tag} setTag={setTag} availableTags={availableTags} previewPatients={previewPatients} fetchingAudience={fetchingAudience} onNext={() => setStep(2)} />}
      {step === 2 && <WizardStepMessage name={name} setName={setName} channel={channel} subject={subject} setSubject={setSubject} body={body} setBody={setBody} templates={templates} selectedTemplateId={selectedTemplateId} handleTemplateSelect={handleTemplateSelect} insertMergeField={(f) => setBody(p => `${p} {{${f}}}`)} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
      {step === 3 && <WizardStepSchedule scheduleType={scheduleType} setScheduleType={setScheduleType} scheduledFor={scheduledFor} setScheduledFor={setScheduledFor} onBack={() => setStep(2)} onNext={() => setStep(4)} />}
      {step === 4 && <WizardStepReview name={name} channel={channel} subject={subject} body={body} scheduleType={scheduleType} scheduledFor={scheduledFor} recipientCount={previewPatients.length} onBack={() => setStep(3)} onSubmit={() => setShowConfirmDialog(true)} />}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Dispatch</DialogTitle><DialogDescription>Dispatch <strong>{name}</strong> to <strong>{previewPatients.length}</strong> patients?</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button><Button onClick={handleFinalSubmit} disabled={loading} className="bg-primary">{loading ? 'Sending...' : 'Confirm'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
