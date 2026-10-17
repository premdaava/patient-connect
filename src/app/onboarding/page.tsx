"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { CheckCircle2, ArrowRight, Sparkles, Building2, Users, Star, Bell } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState({
    patients: true, // starter data cloned
    reviewLink: true, // set during setup
    reminders: false,
    bookingLink: false,
  });

  const completedCount = Object.values(tasks).filter(Boolean).length;
  const progressPercent = (completedCount / 4) * 100;

  const toggleTask = (key: keyof typeof tasks) => {
    setTasks(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success("Checklist updated!");
  };

  const handleFinish = () => {
    toast.success("Onboarding completed!");
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-md text-xl mb-2">
            PC
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome to DAG Patient Connect!</h1>
          <p className="text-muted-foreground">Complete your practice setup to get the most out of your patient engagement platform.</p>
        </div>

        <Card className="border shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-xl font-bold">Getting Started Checklist</CardTitle>
              <span className="text-sm font-medium text-muted-foreground">{completedCount} of 4 completed</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Import Patient List</h4>
                  <p className="text-xs text-muted-foreground">Starter patients & consents have been populated.</p>
                </div>
              </div>
              <Checkbox checked={tasks.patients} onCheckedChange={() => toggleTask("patients")} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-card shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Set Google / Yelp Review Link</h4>
                  <p className="text-xs text-muted-foreground">Configure where post-visit review requests point.</p>
                </div>
              </div>
              <Checkbox checked={tasks.reviewLink} onCheckedChange={() => toggleTask("reviewLink")} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-card shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Enable Automated Reminders</h4>
                  <p className="text-xs text-muted-foreground">24h & 2h SMS reminders to prevent no-shows.</p>
                </div>
              </div>
              <Checkbox checked={tasks.reminders} onCheckedChange={() => toggleTask("reminders")} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-card shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Share Online Booking Link</h4>
                  <p className="text-xs text-muted-foreground">Embed self-scheduling widget on your website.</p>
                </div>
              </div>
              <Checkbox checked={tasks.bookingLink} onCheckedChange={() => toggleTask("bookingLink")} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <Button variant="ghost" onClick={handleFinish}>
              Skip to Dashboard
            </Button>
            <Button onClick={handleFinish} className="gap-1.5 shadow-sm">
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
