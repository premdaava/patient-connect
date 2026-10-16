'use client';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="Templates"
        description="Message templates with merge fields"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        }
      />

      <EmptyState
        icon={FileText}
        title="No templates yet"
        description="Create reusable message templates with merge fields for personalization"
        action={{
          label: 'New Template',
          onClick: () => console.log('New template'),
        }}
      />
    </div>
  );
}
