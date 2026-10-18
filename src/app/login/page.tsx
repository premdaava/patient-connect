import { getSession, destroySession } from "@/lib/session";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import LoginClient from "./login-client";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, session.userId))
      .limit(1);
    const [site] = await db
      .select()
      .from(schema.sites)
      .where(eq(schema.sites.id, session.siteId))
      .limit(1);

    if (user && site) {
      redirect("/dashboard");
    } else {
      await destroySession();
    }
  }
  return <LoginClient />;
}

