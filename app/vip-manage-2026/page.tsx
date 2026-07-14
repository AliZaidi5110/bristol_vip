import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import {
  DEFAULT_ADMIN_PASSWORD,
  isUsingBuiltInCredentials,
} from "@/lib/admin-credentials";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { ADMIN_DASHBOARD_PATH } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Admin Access",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (await verifySessionToken(token)) {
    redirect(ADMIN_DASHBOARD_PATH);
  }

  const usingDefaults = isUsingBuiltInCredentials();

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-6">
      {usingDefaults && (
        <div className="fixed inset-x-0 top-0 z-50 border-b border-amber-500/40 bg-amber-950/90 px-4 py-3 text-center text-sm text-amber-100">
          Using default admin password:{" "}
          <code className="text-amber-50">{DEFAULT_ADMIN_PASSWORD}</code> — add{" "}
          <code className="text-amber-50">SESSION_SECRET</code> and{" "}
          <code className="text-amber-50">ADMIN_PASSWORD</code> on Vercel for
          better security.
        </div>
      )}
      <LoginForm usingDefaults={usingDefaults} />
    </main>
  );
}
