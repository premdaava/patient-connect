'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientFormSchema, type PatientFormValues } from '@/features/patients/schemas';
import { createPatient } from '@/features/patients/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export function AddPatientDialog() {
  const [open, setOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema) as any,
    defaultValues: { first_name: '', last_name: '', email: '', phone: '', date_of_birth: '', address: '', tags: [], notes: '' },
  });

  const tags = form.watch('tags');

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) form.setValue('tags', [...tags, tagInput.trim()]);
    setTagInput('');
  };

  const removeTag = (tag: string) => form.setValue('tags', tags.filter(t => t !== tag));

  async function onSubmit(values: PatientFormValues) {
    try {
      const res = await createPatient(values);
      if (res.success) {
        toast.success('Patient added successfully');
        form.reset();
        setOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add patient');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>Enter patient details. Consent defaults to Opted In.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input placeholder="John" {...form.register('first_name')} />
              {form.formState.errors.first_name && <p className="text-xs text-destructive">{form.formState.errors.first_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input placeholder="Doe" {...form.register('last_name')} />
              {form.formState.errors.last_name && <p className="text-xs text-destructive">{form.formState.errors.last_name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="john@example.com" {...form.register('email')} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="(555) 123-4567" {...form.register('phone')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" {...form.register('date_of_birth')} />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input placeholder="123 Main St" {...form.register('address')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input placeholder="Add tag + Enter" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag} />
              <Button type="button" variant="secondary" onClick={handleAddTag}>Add</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2.5 py-1 rounded-md">
                    {t} <button type="button" onClick={() => removeTag(t)}>&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input placeholder="Clinical notes..." {...form.register('notes')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Patient'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

