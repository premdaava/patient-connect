'use client';

import React from 'react';
import { Smartphone, Wifi, Battery } from 'lucide-react';

interface PhonePreviewProps {
  body: string;
  subject?: string;
  siteName: string;
}

export function PhonePreview({ body, subject, siteName }: PhonePreviewProps) {
  // Replace sample merge fields
  const sampleData: Record<string, string> = {
    '{{first_name}}': 'Sarah',
    '{{appt_date}}': 'Tomorrow, Oct 18',
    '{{appt_time}}': '10:00 AM',
    '{{site_name}}': siteName || 'Bright Smiles Dental',
    '{{review_link}}': 'https://dagpatientconnect.com/r/xyz',
  };

  let renderedBody = body || 'Type your message template...';
  for (const [key, val] of Object.entries(sampleData)) {
    const regex = new RegExp(key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
    renderedBody = renderedBody.replace(regex, val);
  }

  const charCount = body.length;
  const segments = Math.ceil(charCount / 160) || 1;

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
        <Smartphone className="h-3.5 w-3.5" />
        Live SMS Preview
      </div>
      <div className="relative w-[280px] h-[520px] rounded-[40px] border-[8px] border-slate-800 bg-slate-950 p-3 shadow-xl flex flex-col justify-between text-white">
        {/* Phone Notch / Status bar */}
        <div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 px-3 pt-1">
            <span>9:41</span>
            <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto" />
            <div className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              <Battery className="h-3 w-3" />
            </div>
          </div>
          <div className="text-center pt-3 pb-2 border-b border-slate-800/80">
            <p className="text-xs font-semibold text-slate-200">{siteName}</p>
            <p className="text-[10px] text-slate-400">Text Message</p>
          </div>
        </div>

        {/* Message Bubble */}
        <div className="flex-1 overflow-y-auto py-4 px-1 flex flex-col justify-center">
          {subject && (
            <div className="mb-2 text-[11px] font-medium text-slate-300 bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400">Subject:</span> {subject}
            </div>
          )}
          <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tl-sm text-xs leading-relaxed shadow-sm max-w-[90%] whitespace-pre-wrap">
            {renderedBody}
          </div>
          <span className="text-[9px] text-slate-500 mt-1 ml-1">Delivered Just now</span>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-400 flex justify-between px-1">
          <span>{charCount} chars</span>
          <span>{segments} segment{segments > 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
