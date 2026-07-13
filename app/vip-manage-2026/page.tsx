import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { ADMIN_DASHBOARD_PATH } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Admin Access",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  // If already logged in, skip straight to the dashboard.
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (await verifySessionToken(token)) {
    redirect(ADMIN_DASHBOARD_PATH);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-6">
      <LoginForm />
    </main>
  );
}
