'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { updateConsent } from '@/features/patients/actions';
import { toast } from 'sonner';

interface PatientConsentTabProps {
  patientId: string;
  consent: any;
}

export function PatientConsentTab({ patientId, consent }: PatientConsentTabProps) {
  const [smsOptedIn, setSmsOptedIn] = useState(consent?.sms_consent === 'opted_in');
  const [emailOptedIn, setEmailOptedIn] = useState(consent?.email_consent === 'opted_in');
  const [loading, setLoading] = useState(false);

  const handleSmsToggle = async (checked: boolean) => {
    const newStatus = checked ? 'opted_in' : 'opted_out';
    setSmsOptedIn(checked);
    setLoading(true);
    try {
      await updateConsent({ patient_id: patientId, channel: 'sms', status: newStatus });
      toast.success(`SMS consent updated to ${checked ? 'Opted In' : 'Opted Out'}`);
    } catch (err: any) {
      setSmsOptedIn(!checked);
      toast.error(err.message || 'Failed to update consent');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailToggle = async (checked: boolean) => {
    const newStatus = checked ? 'opted_in' : 'opted_out';
    setEmailOptedIn(checked);
    setLoading(true);
    try {
      await updateConsent({ patient_id: patientId, channel: 'email', status: newStatus });
      toast.success(`Email consent updated to ${checked ? 'Opted In' : 'Opted Out'}`);
    } catch (err: any) {
      setEmailOptedIn(!checked);
      toast.error(err.message || 'Failed to update consent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="bg-card border rounded-lg p-6 shadow-sm space-y-6">
        <div>
          <h3 className="font-semibold text-lg">Communication Consent Management</h3>
          <p className="text-xs text-muted-foreground">Manage compliance opt-in / opt-out preferences per channel.</p>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">SMS Text Messaging</Label>
            <p className="text-xs text-muted-foreground">Patient consents to receive SMS appointment reminders and notifications.</p>
          </div>
          <Switch checked={smsOptedIn} onCheckedChange={handleSmsToggle} disabled={loading} />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">Email Notifications</Label>
            <p className="text-xs text-muted-foreground">Patient consents to receive email announcements and reminders.</p>
          </div>
          <Switch checked={emailOptedIn} onCheckedChange={handleEmailToggle} disabled={loading} />
        </div>
      </div>
    </div>
  );
}
