'use client';

import { formatPhoneDisplay } from '@/lib/phone';
import { SendPatientMessageDialog } from './send-patient-message-dialog';
import { Mail, Phone, MapPin, Calendar } from 'lucide-react';

interface PatientHeaderCardProps {
  patient: any;
}

export function PatientHeaderCard({ patient }: PatientHeaderCardProps) {
  const fullName = `${patient.first_name} ${patient.last_name}`;
  const initials = `${patient.first_name[0] || ''}${patient.last_name[0] || ''}`.toUpperCase();

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
          {initials}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
            <div className="flex gap-1">
              {patient.tags?.map((t: string) => (
                <span key={t} className="bg-secondary text-secondary-foreground text-xs px-2.5 py-0.5 rounded-md font-medium">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-1">
            {patient.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" /> {formatPhoneDisplay(patient.phone)}
              </span>
            )}
            {patient.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" /> {patient.email}
              </span>
            )}
            {patient.date_of_birth && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> DOB: {patient.date_of_birth}
              </span>
            )}
            {patient.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {patient.address}
              </span>
            )}
          </div>
        </div>
      </div>

      <div>
        <SendPatientMessageDialog patientId={patient.id} patientName={fullName} />
      </div>
    </div>
  );
}
