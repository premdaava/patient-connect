'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PhonePreview } from '@/components/templates/phone-preview';

interface Props {
  name: string;
  setName: (v: string) => void;
  channel: string;
  subject: string;
  setSubject: (v: string) => void;
  body: string;
  setBody: (v: string) => void;
  templates: any[];
  selectedTemplateId: string;
  handleTemplateSelect: (id: string) => void;
  insertMergeField: (field: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function WizardStepMessage({
  name, setName, channel, subject, setSubject, body, setBody, templates, selectedTemplateId, handleTemplateSelect, insertMergeField, onBack, onNext
}: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-12">
      <Card className="md:col-span-7 space-y-4">
        <CardHeader>
          <CardTitle className="text-lg">Compose Message</CardTitle>
          <CardDescription>Select template or write custom message.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Campaign Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Summer Recall" />
          </div>
          <div className="space-y-2">
            <Label>Load Template</Label>
            <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
              <SelectTrigger><SelectValue placeholder="Select template..." /></SelectTrigger>
              <SelectContent>
                {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} ({t.category})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {(channel === 'email' || channel === 'both') && (
            <div className="space-y-2">
              <Label>Email Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line" />
            </div>
          )}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Message Body</Label>
              <div className="flex gap-1">
                {['first_name', 'last_name', 'site_name', 'review_link'].map((f) => (
                  <Button key={f} variant="outline" size="sm" className="h-7 text-xs" onClick={() => insertMergeField(f)}>+{f}</Button>
                ))}
              </div>
            </div>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="Type message..." />
          </div>
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            <Button onClick={onNext} disabled={!name.trim() || !body.trim()}>Next: Schedule <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>
      <Card className="md:col-span-5">
        <CardHeader>
          <CardTitle className="text-lg">Live Smartphone Preview</CardTitle>
          <CardDescription>Real-time message rendering.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-4">
          <PhonePreview body={body || 'Preview...'} subject={subject} siteName="Bright Smiles" />
        </CardContent>
      </Card>
    </div>
  );
}
