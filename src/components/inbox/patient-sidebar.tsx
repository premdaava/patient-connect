'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, ShieldCheck, ShieldAlert } from 'lucide-react';
import { updatePatientConsent, getPatientNextAppointment } from '@/features/inbox/actions';

import { toast } from 'sonner';

interface Props {
  siteId: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    email: string | null;
  };
  consent?: {
    sms_consent: string;
    email_consent: string;
  } | null;
}

export function PatientSidebar({ siteId, patient, consent }: Props) {
  const [smsOptedIn, setSmsOptedIn] = useState(consent?.sms_consent !== 'opted_out');
  const [emailOptedIn, setEmailOptedIn] = useState(consent?.email_consent !== 'opted_out');
  const [nextApt, setNextApt] = useState<any>(null);

  useEffect(() => {
    setSmsOptedIn(consent?.sms_consent !== 'opted_out');
    setEmailOptedIn(consent?.email_consent !== 'opted_out');

    async function loadApt() {
      const apt = await getPatientNextAppointment(siteId, patient.id);
      setNextApt(apt);
    }
    loadApt();
  }, [siteId, patient.id, consent]);

  const handleSmsToggle = async (checked: boolean) => {
    setSmsOptedIn(checked);
    try {
      await updatePatientConsent(siteId, patient.id, checked ? 'opted_in' : 'opted_out', emailOptedIn ? 'opted_in' : 'opted_out');
      toast.success(checked ? 'SMS consent enabled' : 'SMS opted out');
    } catch {
      toast.error('Failed to update consent');
      setSmsOptedIn(!checked);
    }
  };

  const handleEmailToggle = async (checked: boolean) => {
    setEmailOptedIn(checked);
    try {
      await updatePatientConsent(siteId, patient.id, smsOptedIn ? 'opted_in' : 'opted_out', checked ? 'opted_in' : 'opted_out');
      toast.success(checked ? 'Email consent enabled' : 'Email opted out');
    } catch {
      toast.error('Failed to update consent');
      setEmailOptedIn(!checked);
    }
  };

  const initials = `${patient.first_name[0] || ''}${patient.last_name[0] || ''}`.toUpperCase();

  return (
    <div className="w-80 border-l bg-background p-4 overflow-y-auto flex flex-col gap-6">
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-16 w-16 mb-3 text-lg font-bold bg-primary/10 text-primary">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <h2 className="font-semibold text-lg">{patient.first_name} {patient.last_name}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{patient.email || 'No email'}</p>
        <p className="text-xs text-muted-foreground">{patient.phone || 'No phone'}</p>
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" /> Next Appointment
        </h3>
        {nextApt ? (
          <Card className="bg-muted/40">
            <CardContent className="p-3 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{nextApt.appointment_type}</span>
                <Badge variant={nextApt.status === 'confirmed' ? 'default' : 'secondary'} className="text-[10px]">{nextApt.status}</Badge>
              </div>
              <p className="text-muted-foreground">{new Date(nextApt.start_time).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
              <p className="text-muted-foreground">Provider: {nextApt.provider}</p>
            </CardContent>
          </Card>
        ) : (
          <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-md text-center">No upcoming appointments</p>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          {smsOptedIn ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> : <ShieldAlert className="h-3.5 w-3.5 text-destructive" />}
          Consent Status
        </h3>
        <div className="space-y-3 bg-muted/30 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">SMS Messages</Label>
              <p className="text-[10px] text-muted-foreground">{smsOptedIn ? 'Opted In' : 'Opted Out'}</p>
            </div>
            <Switch checked={smsOptedIn} onCheckedChange={handleSmsToggle} />
          </div>
          <Separator className="my-1" />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">Email Messages</Label>
              <p className="text-[10px] text-muted-foreground">{emailOptedIn ? 'Opted In' : 'Opted Out'}</p>
            </div>
            <Switch checked={emailOptedIn} onCheckedChange={handleEmailToggle} />
          </div>
        </div>
      </div>
    </div>
  );
}
