'use client';

import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { Avatar } from '@/components/shared/avatar';
import { Stepper } from '@/components/shared/stepper';
import { SearchInput } from '@/components/shared/search-input';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Users, TrendingUp, Calendar, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function UIKitPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const sampleData = [
    { id: 1, name: 'John Doe', status: 'Active', date: '2024-01-15' },
    { id: 2, name: 'Jane Smith', status: 'Pending', date: '2024-01-16' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader title="UI Kit" description="Component library showcase" />
      <Separator />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Stat Cards</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Patients" value="1,234" icon={Users} trend={{ value: 12.5, isPositive: true }} />
          <StatCard title="Appointments" value="42" icon={Calendar} />
          <StatCard title="Messages" value="156" icon={MessageSquare} />
          <StatCard title="Response" value="94%" icon={TrendingUp} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Badges & Avatars</h2>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex gap-2">
              <StatusBadge status="success" label="Success" />
              <StatusBadge status="warning" label="Warning" />
              <StatusBadge status="error" label="Error" />
            </div>
            <div className="flex gap-4">
              <Avatar fallback="JD" />
              <Avatar fallback="JS" />
              <Avatar fallback="BJ" />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Stepper</h2>
        <Card>
          <CardContent className="pt-6">
            <Stepper
              steps={[{ label: 'Account' }, { label: 'Practice' }, { label: 'Preferences' }]}
              currentStep={currentStep}
            />
            <div className="mt-6 flex justify-center gap-2">
              <Button variant="outline" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}>
                Previous
              </Button>
              <Button onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}>Next</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Search</h2>
        <SearchInput placeholder="Search..." />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Data Table</h2>
        <DataTable
          columns={[
            { header: 'Name', accessorKey: 'name' },
            { header: 'Status', cell: (row) => <StatusBadge status="success" label={row.status} /> },
          ]}
          data={sampleData}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Empty State</h2>
        <EmptyState
          icon={Users}
          title="No data"
          description="Get started by adding items"
          action={{ label: 'Add Item', onClick: () => {} }}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Confirm Dialog</h2>
        <Button onClick={() => setConfirmOpen(true)}>Open Dialog</Button>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Confirm"
          description="Are you sure?"
          onConfirm={() => {}}
        />
      </section>
    </div>
  );
}
