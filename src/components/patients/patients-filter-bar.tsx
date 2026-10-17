'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface PatientsFilterBarProps {
  tags: string[];
}

export function PatientsFilterBar({ tags }: PatientsFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') || '';
  const consent = searchParams.get('consent') || 'all';
  const tag = searchParams.get('tag') || 'all';
  const lastVisit = searchParams.get('lastVisit') || 'all';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    router.push(`/patients?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
      <div className="relative w-full md:w-72">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search name, phone, email..."
          className="pl-9"
          defaultValue={search}
          onKeyDown={e => {
            if (e.key === 'Enter') updateParam('search', (e.target as HTMLInputElement).value);
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <Select value={consent} onValueChange={val => updateParam('consent', val)}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Consent" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Consent</SelectItem>
            <SelectItem value="sms_opted_in">SMS Opted In</SelectItem>
            <SelectItem value="sms_opted_out">SMS Opted Out</SelectItem>
            <SelectItem value="email_opted_in">Email Opted In</SelectItem>
            <SelectItem value="email_opted_out">Email Opted Out</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tag} onValueChange={val => updateParam('tag', val)}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Tag" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {tags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={lastVisit} onValueChange={val => updateParam('lastVisit', val)}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Last Visit" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Visits</SelectItem>
            <SelectItem value="last_30_days">Last 30 Days</SelectItem>
            <SelectItem value="last_90_days">Last 90 Days</SelectItem>
            <SelectItem value="older">Older than 90d</SelectItem>
            <SelectItem value="never">Never Visited</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
