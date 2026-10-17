import { getTenantContext } from '@/lib/tenant';
import { getPatientById, getPatientAppointments, getPatientMessages } from '@/features/patients/queries';
import { notFound } from 'next/navigation';
import { PatientHeaderCard } from '@/components/patients/patient-header-card';
import { PatientOverviewTab } from '@/components/patients/patient-overview-tab';
import { PatientAppointmentsTab } from '@/components/patients/patient-appointments-tab';
import { PatientMessagesTab } from '@/components/patients/patient-messages-tab';
import { PatientConsentTab } from '@/components/patients/patient-consent-tab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const tenant = await getTenantContext();
  const siteId = tenant.site.id;
  const { id } = await params;

  const patient = await getPatientById(siteId, id);
  if (!patient) {
    notFound();
  }

  const appointments = await getPatientAppointments(siteId, id);
  const messages = await getPatientMessages(siteId, id);

  const fullName = `${patient.first_name} ${patient.last_name}`;

  return (
    <div className="space-y-6">
      <PatientHeaderCard patient={patient} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments ({appointments.length})</TabsTrigger>
          <TabsTrigger value="messages">Messages ({messages.length})</TabsTrigger>
          <TabsTrigger value="consent">Consent</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <PatientOverviewTab patient={patient} appointments={appointments} />
        </TabsContent>

        <TabsContent value="appointments">
          <PatientAppointmentsTab appointments={appointments} />
        </TabsContent>

        <TabsContent value="messages">
          <PatientMessagesTab patientId={patient.id} patientName={fullName} messages={messages} />
        </TabsContent>

        <TabsContent value="consent">
          <PatientConsentTab patientId={patient.id} consent={patient.consent} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

