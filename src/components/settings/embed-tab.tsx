'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Code, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function EmbedTab({ siteSlug }: { siteSlug: string }) {
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const embedSnippet = `<script src="${origin}/widget.js" data-site="${siteSlug}"></script>`;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" /> Website Embed Widget
          </CardTitle>
          <CardDescription>
            Add online booking to your website by pasting this snippet before <code className="text-xs bg-muted px-1.5 py-0.5 rounded">&lt;/body&gt;</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Embed Code Snippet</Label>
            <Input readOnly value={embedSnippet} className="font-mono text-xs bg-muted" />
          </div>
          <div>
            <Link href={`/book/${siteSlug}`} target="_blank">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" /> Open Public Booking Page
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Live Widget Preview
          </CardTitle>
          <CardDescription>
            Preview how the floating booking button appears on patient websites.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-2xl p-6 bg-slate-100 dark:bg-slate-900 min-h-[300px] flex items-center justify-center relative">
            <div className="text-center space-y-2">
              <h3 className="font-bold text-sm">Patient Website Preview</h3>
              <p className="text-xs text-muted-foreground">Floating button pinned to bottom right.</p>
            </div>
            <div className="absolute bottom-6 right-6">
              <Link href={`/book/${siteSlug}?embed=true`} target="_blank">
                <button className="bg-primary text-primary-foreground px-4 py-3 rounded-full font-semibold text-xs shadow-lg hover:scale-105 transition-transform">
                  Book Appointment
                </button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
