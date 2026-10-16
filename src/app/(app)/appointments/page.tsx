'use client';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Calendar}
        title="Appointments"
        description="Schedule and manage appointments"
        actions={
          <>
            <Button variant="outline">Today</Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </>
        }
      />

      <EmptyState
        icon={Calendar}
        title="No appointments scheduled"
        description="Start by creating a new appointment for your patients"
        action={{
          label: 'New Appointment',
          onClick: () => console.log('New appointment'),
        }}
      />
    </div>
  );
}
