import { z } from 'zod';

export const patientFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  date_of_birth: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional().or(z.literal('')),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

export const consentUpdateSchema = z.object({
  patient_id: z.string().uuid(),
  channel: z.enum(['sms', 'email']),
  status: z.enum(['opted_in', 'opted_out']),
});

export const bulkAddTagSchema = z.object({
  patient_ids: z.array(z.string().uuid()).min(1, 'Select at least one patient'),
  tag: z.string().min(1, 'Tag is required'),
});

export const bulkSendMessageSchema = z.object({
  patient_ids: z.array(z.string().uuid()).min(1, 'Select at least one patient'),
  channel: z.enum(['sms', 'email']),
  template_id: z.string().uuid().optional().or(z.literal('')),
  subject: z.string().optional().or(z.literal('')),
  body: z.string().min(1, 'Message body is required'),
});

export const csvImportRowSchema = z.object({
  first_name: z.string().min(1, 'First name required'),
  last_name: z.string().min(1, 'Last name required'),
  email: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  date_of_birth: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  tags: z.string().optional().or(z.literal('')), // comma-separated in CSV
  notes: z.string().optional().or(z.literal('')),
});

export type CsvImportRow = z.infer<typeof csvImportRowSchema>;
