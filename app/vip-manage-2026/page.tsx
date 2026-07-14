import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { isAdminConfigured } from "@/lib/admin-config";
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
      {!isAdminConfigured() && (
        <div className="fixed inset-x-0 top-0 z-50 border-b border-red-500/40 bg-red-950/90 px-4 py-3 text-center text-sm text-red-200">
          Admin is not configured on this server yet. Add{" "}
          <code className="text-red-100">SESSION_SECRET</code> and{" "}
          <code className="text-red-100">ADMIN_PASSWORD</code> in Vercel →
          Settings → Environment Variables, then redeploy.
        </div>
      )}
      <LoginForm configured={isAdminConfigured()} />
    </main>
  );
}
