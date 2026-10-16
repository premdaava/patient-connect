import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';

export default function InboxPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={MessageSquare}
        title="Inbox"
        description="Patient conversations and messages"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Message
          </Button>
        }
      />

      <EmptyState
        icon={MessageSquare}
        title="No messages yet"
        description="When patients reply to your messages, they'll appear here"
      />
    </div>
  );
}
