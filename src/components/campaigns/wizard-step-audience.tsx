'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface Props {
  channel: 'sms' | 'email' | 'both';
  setChannel: (v: 'sms' | 'email' | 'both') => void;
  lastVisit: string;
  setLastVisit: (v: string) => void;
  excludeFutureApts: boolean;
  setExcludeFutureApts: (v: boolean) => void;
  tag: string;
  setTag: (v: string) => void;
  availableTags: string[];
  previewPatients: any[];
  fetchingAudience: boolean;
  onNext: () => void;
}

export function WizardStepAudience({
  channel, setChannel, lastVisit, setLastVisit, excludeFutureApts, setExcludeFutureApts, tag, setTag, availableTags, previewPatients, fetchingAudience, onNext
}: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-12">
      <Card className="md:col-span-6">
        <CardHeader>
          <CardTitle className="text-lg">Audience Filters</CardTitle>
          <CardDescription>Target segments (opted-in only).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Channel</Label>
            <Select value={channel} onValueChange={(v: any) => setChannel(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">SMS Only</SelectItem>
                <SelectItem value="email">Email Only</SelectItem>
                <SelectItem value="both">SMS & Email</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Enforces opted-in consent.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Last Visit</Label>
            <Select value={lastVisit} onValueChange={setLastVisit}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                <SelectItem value="1_month">Older than 1 mo</SelectItem>
                <SelectItem value="3_months">Older than 3 mos</SelectItem>
                <SelectItem value="6_months">Older than 6 mos (Recall)</SelectItem>
                <SelectItem value="12_months">Older than 12 mos</SelectItem>
                <SelectItem value="never">Never visited</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tag</Label>
            <Select value={tag} onValueChange={setTag}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {availableTags.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="fa" checked={excludeFutureApts} onCheckedChange={(c) => setExcludeFutureApts(c === true)} />
            <Label htmlFor="fa" className="text-sm font-normal cursor-pointer">Exclude patients with future appointments</Label>
          </div>
        </CardContent>
      </Card>
      <Card className="md:col-span-6 flex flex-col justify-between">
        <div>
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Recipients</span>
              <Badge>{previewPatients.length}</Badge>
            </CardTitle>
            <CardDescription>Matching patients preview.</CardDescription>
          </CardHeader>
          <CardContent>
            {fetchingAudience ? (
              <div className="py-12 text-center text-muted-foreground text-sm">Calculating...</div>
            ) : previewPatients.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm border rounded-lg p-4">No matching opted-in patients found.</div>
            ) : (
              <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground font-medium sticky top-0">
                    <tr><th className="p-2">Name</th><th className="p-2">Contact</th><th className="p-2">Last Visit</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {previewPatients.slice(0, 15).map((p) => (
                      <tr key={p.id} className="hover:bg-accent/50">
                        <td className="p-2 font-medium">{p.first_name} {p.last_name}</td>
                        <td className="p-2 text-muted-foreground">{channel === 'email' ? p.email : p.phone}</td>
                        <td className="p-2 text-muted-foreground">{p.last_visit_date || 'Never'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </div>
        <div className="p-6 pt-0 flex justify-end">
          <Button onClick={onNext} disabled={previewPatients.length === 0}>Next: Message <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </div>
      </Card>
    </div>
  );
}
