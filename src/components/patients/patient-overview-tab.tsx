'use client';

interface PatientOverviewTabProps {
  patient: any;
  appointments: any[];
}

export function PatientOverviewTab({ patient, appointments }: PatientOverviewTabProps) {
  const upcomingApts = appointments.filter(a => new Date(a.start_time) >= new Date());

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <div className="bg-card border rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-lg">Patient Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Full Name</p>
              <p className="font-medium">{patient.first_name} {patient.last_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Date of Birth</p>
              <p className="font-medium">{patient.date_of_birth || 'Not recorded'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Email Address</p>
              <p className="font-medium">{patient.email || 'Not recorded'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Phone Number</p>
              <p className="font-medium">{patient.phone || 'Not recorded'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground text-xs">Address</p>
              <p className="font-medium">{patient.address || 'Not recorded'}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-lg">Clinical & General Notes</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {patient.notes || 'No clinical notes recorded for this patient.'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-card border rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-md">Consent Status</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span>SMS Consent</span>
              <span className={`font-medium ${patient.consent?.sms_consent === 'opted_in' ? 'text-green-600' : 'text-amber-600'}`}>
                {patient.consent?.sms_consent === 'opted_in' ? 'Opted In' : 'Opted Out'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Email Consent</span>
              <span className={`font-medium ${patient.consent?.email_consent === 'opted_in' ? 'text-green-600' : 'text-amber-600'}`}>
                {patient.consent?.email_consent === 'opted_in' ? 'Opted In' : 'Opted Out'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-md">Upcoming Appointments</h3>
          {upcomingApts.length === 0 ? (
            <p className="text-xs text-muted-foreground">No upcoming appointments scheduled.</p>
          ) : (
            <div className="space-y-3">
              {upcomingApts.map(apt => (
                <div key={apt.id} className="border-b pb-2 last:border-0 last:pb-0 text-xs space-y-1">
                  <p className="font-semibold">{apt.appointment_type}</p>
                  <p className="text-muted-foreground">{new Date(apt.start_time).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
