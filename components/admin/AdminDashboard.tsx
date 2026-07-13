"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Link2, Loader2, LogOut, TriangleAlert } from "lucide-react";
import { siteConfig } from "@/site.config";
import { ADMIN_LOGIN_PATH } from "@/lib/routes";

type Toast = { type: "success" | "error"; text: string } | null;

export default function AdminDashboard({ initialLink }: { initialLink: string }) {
  const router = useRouter();
  const [savedLink, setSavedLink] = useState(initialLink);
  const [value, setValue] = useState(initialLink);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      const res = await fetch("/api/admin/ticket-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketLink: value.trim() }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setToast({ type: "error", text: json?.error ?? "Could not save." });
        return;
      }

      setSavedLink(json.ticketLink ?? value.trim());
      setToast({ type: "success", text: "Ticket link updated — it's live now." });
    } catch {
      setToast({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function onLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // ignore — we redirect regardless
    }
    router.replace(ADMIN_LOGIN_PATH);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="font-display text-sm uppercase tracking-[0.3em] text-gold">
            {siteConfig.brandName}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-tight text-white">
            Dashboard
          </h1>
        </div>
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-2 rounded-full border border-ink-line px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-white/50 hover:text-white disabled:opacity-60"
        >
          {loggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          Log out
        </button>
      </header>

      <div className="mt-10 rounded-2xl border border-ink-line bg-ink-card p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-white">
          Current Event Ticket Link
        </h2>
        <p className="mt-1 text-sm text-white/50">
          This URL powers every &ldquo;Get Tickets&rdquo; button on the site.
          Changes go live instantly.
        </p>

        <div className="mt-5 rounded-lg border border-ink-line bg-ink px-4 py-3">
          <p className="text-xs uppercase tracking-widest text-white/40">
            Currently saved
          </p>
          <a
            href={savedLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center gap-2 break-all text-sm text-gold hover:underline"
          >
            <Link2 className="h-4 w-4 shrink-0" />
            {savedLink}
          </a>
        </div>

        <form onSubmit={onSave} className="mt-6 space-y-4">
          <label htmlFor="ticketLink" className="block text-sm font-medium text-white/80">
            New ticket link
          </label>
          <input
            id="ticketLink"
            type="url"
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://www.eventbrite.co.uk/e/your-event"
            className="w-full rounded-lg border border-ink-line bg-ink px-4 py-3 text-white placeholder-white/40 outline-none transition-colors focus:border-gold"
          />

          <button
            type="submit"
            disabled={saving || value.trim() === savedLink}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-widest text-ink transition-all hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Save"}
          </button>
        </form>

        {toast && (
          <div
            role="status"
            className={`mt-5 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
              toast.type === "success"
                ? "border-gold/40 bg-gold/10 text-gold"
                : "border-red-500/40 bg-red-500/10 text-red-300"
            }`}
          >
            {toast.type === "success" ? (
              <Check className="h-4 w-4" />
            ) : (
              <TriangleAlert className="h-4 w-4" />
            )}
            {toast.text}
          </div>
        )}
      </div>
    </div>
  );
}
