'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PhonePreview } from './phone-preview';
import { createTemplate, updateTemplate } from '@/features/templates/actions';
import { toast } from 'sonner';
import { Template } from '@/db/schema';
import { Sparkles } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: string;
  siteName: string;
  template?: Template | null;
}

const FIELDS = [
  { label: 'First Name', value: '{{first_name}}' },
  { label: 'Appt Date', value: '{{appt_date}}' },
  { label: 'Appt Time', value: '{{appt_time}}' },
  { label: 'Site Name', value: '{{site_name}}' },
  { label: 'Review Link', value: '{{review_link}}' },
];

export function TemplateEditorDialog({ open, onOpenChange, siteId, siteName, template }: Props) {
  const isEditing = !!template;
  const [name, setName] = useState(template?.name || '');
  const [category, setCategory] = useState(template?.category || 'appointment_reminder');
  const [channel, setChannel] = useState(template?.channel || 'sms');
  const [subject, setSubject] = useState(template?.subject || '');
  const [body, setBody] = useState(template?.body || '');
  const [loading, setLoading] = useState(false);

  const insert = (v: string) => setBody((p) => p + v);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !body) return toast.error('Name & body required');
    setLoading(true);
    try {
      if (isEditing && template) {
        await updateTemplate(siteId, template.id, { name, category, channel, subject: channel !== 'sms' ? subject : undefined, body });
        toast.success('Template updated');
      } else {
        await createTemplate(siteId, { name, category, channel, subject: channel !== 'sms' ? subject : undefined, body });
        toast.success('Template created');
      }
      onOpenChange(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Error saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEditing ? 'Edit Template' : 'New Template'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appointment_reminder">Reminder</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {channel !== 'sms' && (
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" /> Merge Fields
              </Label>
              <div className="flex flex-wrap gap-1">
                {FIELDS.map((f) => (
                  <Badge key={f.value} variant="outline" className="cursor-pointer hover:bg-secondary" onClick={() => insert(f.value)}>
                    + {f.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border">
            <PhonePreview body={body} subject={subject} siteName={siteName} />
          </div>
          <div className="col-span-full flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
