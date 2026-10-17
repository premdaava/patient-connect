'use client';

import { useState, useTransition } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Plus, List, Grid, Bell, Search } from 'lucide-react';
import { AppointmentsCalendar } from './appointments-calendar';
import { AppointmentsTable } from './appointments-table';
import { AppointmentDrawer } from './appointment-drawer';
import { runDueReminders } from '@/features/appointments/actions';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';

export function AppointmentsView({ appointments, patients, providers }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [providerFilter, setProviderFilter] = useState(searchParams.get('provider') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [pending, startTransition] = useTransition();

  const handleRunReminders = () => {
    startTransition(async () => {
      try {
        const res = await runDueReminders();
        if (res.success) {
          toast.success(`Reminders run! Sent: ${res.sentCount}, Failed: ${res.failedCount}`);
          router.refresh();
        } else { toast.error('Failed'); }
      } catch { toast.error('Failed'); }
    });
  };

  const filtered = appointments.filter((apt: any) => {
    if (statusFilter !== 'all' && apt.status !== statusFilter) return false;
    if (providerFilter !== 'all' && apt.provider !== providerFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const pName = `${apt.patient.first_name} ${apt.patient.last_name}`.toLowerCase();
      if (!pName.includes(q) && !apt.appointment_type.toLowerCase().includes(q) && !apt.provider.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CalendarIcon}
        title="Appointments"
        description="Schedule and manage appointments across providers"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRunReminders} disabled={pending}>
              <Bell className="mr-2 h-4 w-4" /> Run due reminders now
            </Button>
            <Button onClick={() => { setSelectedAppointment(null); setDrawerOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> New Appointment
            </Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patient, type, provider..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no_show">No-Show</SelectItem>
            </SelectContent>
          </Select>

          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Provider" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              {providers.map((p: string) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          <Button size="sm" variant={viewMode === 'calendar' ? 'default' : 'ghost'} className="h-8 gap-1.5 text-xs" onClick={() => setViewMode('calendar')}>
            <Grid className="h-3.5 w-3.5" /> Calendar
          </Button>
          <Button size="sm" variant={viewMode === 'list' ? 'default' : 'ghost'} className="h-8 gap-1.5 text-xs" onClick={() => setViewMode('list')}>
            <List className="h-3.5 w-3.5" /> List
          </Button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <AppointmentsCalendar appointments={filtered} onSelectAppointment={(apt: any) => { setSelectedAppointment(apt); setDrawerOpen(true); }} currentDate={currentDate} onDateChange={setCurrentDate} />
      ) : (
        <AppointmentsTable appointments={filtered} onSelectAppointment={(apt: any) => { setSelectedAppointment(apt); setDrawerOpen(true); }} />
      )}

      <AppointmentDrawer open={drawerOpen} onOpenChange={setDrawerOpen} appointment={selectedAppointment} patients={patients} providers={providers} />
    </div>
  );
}
