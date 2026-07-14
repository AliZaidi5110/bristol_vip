"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { ADMIN_DASHBOARD_PATH } from "@/lib/routes";

export default function LoginForm({ configured = true }: { configured?: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.replace(ADMIN_DASHBOARD_PATH);
        router.refresh();
        return;
      }

      const json = await res.json().catch(() => ({}));
      if (res.status === 500 && json?.error?.includes("not configured")) {
        setError(
          "Admin is not set up on the server. Add SESSION_SECRET and ADMIN_PASSWORD_HASH in Vercel, then redeploy.",
        );
        return;
      }
      setError(json?.error ?? "Login failed.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-ink-line bg-ink-card p-8 shadow-2xl">
      <div className="flex flex-col items-center text-center">
        <BrandLogo size="admin" />
        <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide text-white">
          Admin Access
        </h1>
        <p className="mt-1 text-sm text-white/50">Enter the password to continue.</p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full rounded-lg border border-ink-line bg-ink py-3 pl-10 pr-4 text-white placeholder-white/40 outline-none transition-colors focus:border-gold"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading || !configured}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-3 text-sm font-semibold uppercase tracking-widest text-ink transition-all hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Checking…" : "Log In"}
        </button>
      </form>
    </div>
  );
}
