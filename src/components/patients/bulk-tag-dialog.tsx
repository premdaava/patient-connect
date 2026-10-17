'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { bulkAddTag } from '@/features/patients/bulk-actions';
import { toast } from 'sonner';

interface BulkTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSuccess: () => void;
}

export function BulkTagDialog({ open, onOpenChange, selectedIds, onSuccess }: BulkTagDialogProps) {
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag.trim()) return;
    setLoading(true);
    try {
      const res = await bulkAddTag({ patient_ids: selectedIds, tag: tag.trim() });
      if (res.success) {
        toast.success(`Added tag "${tag}" to ${selectedIds.length} patients`);
        setTag('');
        onSuccess();
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to add tag');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Tag to Selected Patients</DialogTitle>
          <DialogDescription>Apply a tag to {selectedIds.length} selected patient(s).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tag Name</Label>
            <Input placeholder="e.g. VIP, Ortho, Cleaning Due" value={tag} onChange={e => setTag(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Tag'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
