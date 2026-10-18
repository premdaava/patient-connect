import sys

code = """\"use client\";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Stepper } from "@/components/shared/stepper";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "Alex",
    lastName: "Rivera",
    email: "alex@riveradental.com",
    password: "Password123!",
    phone: "+12125553333",
    practiceName: "Rivera Dental Studio",
    practiceSlug: "rivera-dental-studio",
    timezone: "America/New_York",
    practicePhone: "+12125554444",
    reviewLink: "https://g.page/r/riveradental/review",
    reminderHours: "24",
    channels: "both"
  });

  const updateField = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }));

  const handleFillSample = () => {
    setFormData({
      firstName: "Dr. Jordan",
      lastName: "Smith",
      email: "dr.smith." + Date.now() + "@apex.test",
      password: "Password123!",
      phone: "+13035557777",
      practiceName: "Apex Dental",
      practiceSlug: "apex-dental-" + Date.now(),
      timezone: "America/Denver",
      practicePhone: "+13035558888",
      reviewLink: "https://g.page/r/apex/review",
      reminderHours: "24",
      channels: "both"
    });
    toast.success("Sample filled!");
  };

  const steps = [
    { label: "Account" },
    { label: "Practice" },
    { label: "Preferences" }
  ];

  const handleNext = () => setStep(s => Math.min(s + 1, 3));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    if (!res.ok) {
      toast.error("Error");
      setIsSubmitting(false);
      return;
    }
    toast.success("Registered!");
    router.push("/onboarding");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-xl space-y-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="font-bold text-xl">Patient Connect</Link>
          <Button variant="outline" size="sm" onClick={handleFillSample}>
            <Sparkles className="h-4 w-4 mr-1"/>Fill Sample
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Create Practice Account</CardTitle>
            <Stepper steps={steps} currentStep={step} />
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>First Name</Label>
                  <Input value={formData.firstName} onChange={e => updateField("firstName", e.target.value)}/>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={formData.email} onChange={e => updateField("email", e.target.value)}/>
                </div>
                <div>
                  <Label>Password</Label>
                  <Input type="password" value={formData.password} onChange={e => updateField("password", e.target.value)}/>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Practice Name</Label>
                  <Input value={formData.practiceName} onChange={e => updateField("practiceName", e.target.value)}/>
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input value={formData.practiceSlug} onChange={e => updateField("practiceSlug", e.target.value)}/>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label>Review Link</Label>
                  <Input value={formData.reviewLink} onChange={e => updateField("reviewLink", e.target.value)}/>
                </div>
                <div className="p-4 bg-muted rounded text-sm">
                  Summary: {formData.practiceName} ({formData.practiceSlug})
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(s => s - 1)}>Back</Button>
            ) : (
              <Link href="/login"><Button variant="ghost">Sign In</Button></Link>
            )}
            {step < 3 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Finish"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
"""

with open("/Users/premkumark/Sites/DAG/dag-patient-connect/src/app/register/page.tsx", "w") as f:
    f.write(code)
print("register page written successfully")
