'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Users, Tag, MessageSquare } from 'lucide-react';
import { AddPatientDialog } from './add-patient-dialog';
import { CsvImportDialog } from './csv-import-dialog';
import { BulkTagDialog } from './bulk-tag-dialog';
import { BulkMessageDialog } from './bulk-message-dialog';
import { PatientsFilterBar } from './patients-filter-bar';
import { PatientsTable } from './patients-table';

interface PatientsViewProps {
  data: {
    patients: Array<any>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  tags: string[];
}

export function PatientsView({ data, tags }: PatientsViewProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(data.patients.map(p => p.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) setSelectedIds([...selectedIds, id]);
    else setSelectedIds(selectedIds.filter(i => i !== id));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Patients"
        description="Manage patient database, consent, and communications"
        actions={
          <div className="flex items-center gap-2">
            <CsvImportDialog />
            <AddPatientDialog />
          </div>
        }
      />

      <PatientsFilterBar tags={tags} />

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-secondary/60 px-4 py-2.5 rounded-lg border text-sm">
          <span className="font-medium">{selectedIds.length} patient(s) selected</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setTagDialogOpen(true)}>
              <Tag className="mr-1.5 h-3.5 w-3.5" /> Add Tag
            </Button>
            <Button size="sm" onClick={() => setMessageDialogOpen(true)}>
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Send Message
            </Button>
          </div>
        </div>
      )}

      {data.patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patients found"
          description="Try adjusting your search or filters, or add your first patient."
        />
      ) : (
        <PatientsTable
          data={data}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
        />
      )}

      <BulkTagDialog
        open={tagDialogOpen}
        onOpenChange={setTagDialogOpen}
        selectedIds={selectedIds}
        onSuccess={() => setSelectedIds([])}
      />

      <BulkMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
        selectedIds={selectedIds}
        onSuccess={() => setSelectedIds([])}
      />
    </div>
  );
}
