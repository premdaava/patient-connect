import base64

code = '''import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MessageSquare, 
  BellRing, 
  Star, 
  Send, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2,
  Users,
  TrendingUp
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur lg:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-md">
            PC
          </div>
          <span className="text-xl font-bold tracking-tight">DAG Patient Connect</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="shadow-sm">Get Started</Button>
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium">
              Next-Gen Patient Engagement & Operations
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Fill chairs, stop no-shows, and delight patients.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              The all-in-one patient engagement platform built for modern practices. Automated SMS reminders, two-way texting, online booking, and 5-star review collection.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In to Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t py-8 px-6 lg:px-12 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} DAG Patient Connect. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/login" className="hover:underline">Sign In</Link>
            <Link href="/register" className="hover:underline">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
'''

with open("/Users/premkumark/Sites/DAG/dag-patient-connect/src/app/page.tsx", "w") as f:
    f.write(code)
print("page.tsx written successfully")
