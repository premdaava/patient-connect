code = '''import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { compareSync } from "bcryptjs";
import { createSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

async function loginAction(formData: FormData) {
  "use server";
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  if (!user || !compareSync(password, user.password_hash)) {
    throw new Error("Invalid email or password");
  }

  // Get user membership / site
  const [membership] = await db
    .select()
    .from(schema.memberships)
    .where(eq(schema.memberships.user_id, user.id))
    .limit(1);

  const siteId = membership?.site_id || "";
  const role = membership?.role || "owner";

  await createSession({
    userId: user.id,
    siteId,
    role,
    email: user.email,
    name: `${user.first_name} ${user.last_name}`,
  });

  redirect("/dashboard");
}

export default async function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
              PC
            </div>
            DAG Patient Connect
          </Link>
        </div>

        <Card className="border shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access your practice</CardDescription>
          </CardHeader>
          <form action={loginAction}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  defaultValue="demo@dagpatientconnect.com"
                  placeholder="name@example.com" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  defaultValue="Demo@1234"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full shadow-sm">
                Sign In
              </Button>
              <div className="text-center text-xs text-muted-foreground">
                Don&apos;t have a practice account?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Register practice
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
'''

with open("/Users/premkumark/Sites/DAG/dag-patient-connect/src/app/login/page.tsx", "w") as f:
    f.write(code)
print("login page created successfully")
