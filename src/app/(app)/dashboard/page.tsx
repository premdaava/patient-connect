import Link from 'next/link';
import { getTenantContext } from '@/lib/tenant';
import { getDashboardData } from '@/features/dashboard';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LayoutDashboard, Plus, MessageSquare, Calendar, Users, CheckCircle2, Clock, Send, ArrowUpRight, ChevronRight, Sparkles } from 'lucide-react';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';

interface DashboardPageProps {
  searchParams: Promise<{ days?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const days = [7, 30, 90].includes(Number(params.days)) ? Number(params.days) : 7;
  const tenant = await getTenantContext();
  const d = await getDashboardData(tenant.site.id, days);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          icon={LayoutDashboard}
          title={`Welcome back, ${tenant.user.first_name}!`}
          description={`Here is what is happening at ${tenant.site.name} today.`}
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-md bg-muted p-1 text-sm font-medium">
            {[7, 30, 90].map((dVal) => (
              <Link 
                key={dVal}
                href={`/dashboard?days=${dVal}`} 
                className={`rounded px-3 py-1.5 transition-colors ${days === dVal ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {dVal} Days
              </Link>
            ))}
          </div>
          <div className="flex gap-2">
            <Link href="/patients"><Button variant="outline" size="sm"><Plus className="mr-1.5 h-4 w-4" /> Add Patient</Button></Link>
            <Link href="/appointments"><Button size="sm"><Calendar className="mr-1.5 h-4 w-4" /> New Appointment</Button></Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Messages Sent" value={d.messagesSentCount} icon={Send} trend={{ value: 12, isPositive: true }} />
        <StatCard title="Delivery Rate" value={`${d.deliveryRate}%`} icon={CheckCircle2} trend={{ value: 2, isPositive: true }} />
        <StatCard title="Patient Replies" value={d.repliesCount} icon={MessageSquare} trend={{ value: 8, isPositive: true }} />
        <StatCard title="Confirmed %" value={`${d.confirmedPercent}%`} icon={Calendar} trend={{ value: 5, isPositive: true }} />
        <StatCard title="No-Show Rate" value={`${d.noShowRate}%`} icon={Clock} trend={{ value: -1.5, isPositive: false }} />
        <StatCard title="New Patients" value={d.newPatientsCount} icon={Users} trend={{ value: 14, isPositive: true }} />
      </div>

      <DashboardCharts messagesByDay={d.messagesByDay} statusCounts={d.statusCounts} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-semibold">Upcoming Appointments</CardTitle>
                <CardDescription>Next scheduled visits at your practice</CardDescription>
              </div>
              <Link href="/appointments"><Button variant="ghost" size="sm" className="gap-1 text-xs">View all <ChevronRight className="h-3.5 w-3.5" /></Button></Link>
            </CardHeader>
            <CardContent>
              {d.upcomingAppointments.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No upcoming appointments found.</div>
              ) : (
                <div className="space-y-3">
                  {d.upcomingAppointments.map((apt) => {
                    const aptDate = new Date(apt.start_time);
                    return (
                      <div key={apt.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                            {apt.patient_first[0]}{apt.patient_last[0]}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{apt.patient_first} {apt.patient_last}</p>
                            <p className="text-xs text-muted-foreground">
                              {apt.appointment_type} • {aptDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at {aptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'} className="capitalize text-xs">{apt.status}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-semibold">Recent Patient Replies</CardTitle>
                <CardDescription>Latest inbound messages from conversations</CardDescription>
              </div>
              <Link href="/inbox"><Button variant="ghost" size="sm" className="gap-1 text-xs">Open inbox <ChevronRight className="h-3.5 w-3.5" /></Button></Link>
            </CardHeader>
            <CardContent>
              {d.recentReplies.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No recent replies found.</div>
              ) : (
                <div className="space-y-3">
                  {d.recentReplies.map((reply) => {
                    const replyDate = new Date(reply.created_at);
                    return (
                      <Link key={reply.id} href={`/inbox?thread=${reply.thread_id}`} className="block rounded-lg border p-3 transition-colors hover:bg-muted/50">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{reply.patient_first} {reply.patient_last}</span>
                          <span className="text-xs text-muted-foreground">{replyDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at {replyDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">&ldquo;{reply.body}&rdquo;</p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Setup Progress</CardTitle>
                <span className="text-sm font-bold text-primary">{d.onboardingProgress}%</span>
              </div>
              <Progress value={d.onboardingProgress} className="mt-2 h-2" />
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className={d.totalPatients > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}>{d.totalPatients > 0 ? '✓' : '○'} Import patients ({d.totalPatients} added)</span>
                <Link href="/patients"><Button variant="ghost" size="sm" className="h-7 text-xs">View</Button></Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">✓ Set Google Review link</span>
                <Link href="/settings"><Button variant="ghost" size="sm" className="h-7 text-xs">Setup</Button></Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">✓ Enable automated reminders</span>
                <Link href="/settings"><Button variant="ghost" size="sm" className="h-7 text-xs">Enable</Button></Link>
              </div>
            </CardContent>
            {d.onboardingProgress < 100 && (
              <CardFooter className="pt-0">
                <Link href="/onboarding" className="w-full">
                  <Button variant="outline" size="sm" className="w-full text-xs">Complete Onboarding <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Button>
                </Link>
              </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
              <CardDescription>Common practice management tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/patients" className="block"><Button variant="outline" className="w-full justify-start gap-2"><Plus className="h-4 w-4 text-primary" /> Add Patient</Button></Link>
              <Link href="/appointments" className="block"><Button variant="outline" className="w-full justify-start gap-2"><Calendar className="h-4 w-4 text-primary" /> New Appointment</Button></Link>
              <Link href="/campaigns" className="block"><Button variant="outline" className="w-full justify-start gap-2"><Send className="h-4 w-4 text-primary" /> Send Broadcast</Button></Link>
              <Link href="/inbox" className="block"><Button variant="outline" className="w-full justify-start gap-2"><MessageSquare className="h-4 w-4 text-primary" /> Open Inbox</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
