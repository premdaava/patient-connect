import { getTenantContext } from '@/lib/tenant';
import { getAppointments, getPatientOptions, getProviders, getAppointmentById } from '@/features/appointments/queries';
import { getBookingRequests } from '@/features/booking/queries';
import { AppointmentsView } from '@/components/appointments/appointments-view';

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; provider?: string; search?: string }>;
}) {
  const { site } = await getTenantContext();
  const params = await searchParams;

  const rawAppointments = await getAppointments(site.id, {
    status: params.status,
    provider: params.provider,
    search: params.search,
  });

  const appointments = await Promise.all(
    rawAppointments.map(async (apt) => {
      const fullApt = await getAppointmentById(site.id, apt.id);
      return fullApt || apt;
    })
  );

  const patients = await getPatientOptions(site.id);
  const providers = await getProviders(site.id);
  const bookingRequests = await getBookingRequests(site.id);

  return (
    <AppointmentsView
      appointments={appointments}
      patients={patients}
      providers={providers}
      bookingRequests={bookingRequests}
      siteId={site.id}
    />
  );
}


