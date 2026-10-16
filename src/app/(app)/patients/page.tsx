'use client';

import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Patients"
        description="Manage your patient database"
        actions={
          <>
            <Button variant="outline">Import CSV</Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </>
        }
      />

      <EmptyState
        icon={Users}
        title="No patients yet"
        description="Get started by adding your first patient or importing from a CSV file"
        action={{
          label: 'Add Patient',
          onClick: () => console.log('Add patient'),
        }}
      />
    </div>
  );
}
