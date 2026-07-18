"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, RefreshCw, Users } from "lucide-react";
import type { SignupEntry } from "@/lib/signups";

export default function SignupsPanel({
  initialSignups,
}: {
  initialSignups: SignupEntry[];
}) {
  const [signups, setSignups] = useState(initialSignups);
  const [downloading, setDownloading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setRefreshing(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/signups?t=${Date.now()}`, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "Could not load sign-ups.");
      }
      setSignups(Array.isArray(json.signups) ? json.signups : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not refresh sign-ups.");
    } finally {
      setRefreshing(false);
    }
  }

  // Always load fresh data when the dashboard opens (don't trust a stale SSR list).
  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function downloadCsv() {
    setDownloading(true);
    setError("");
    try {
      // Refresh first so CSV matches the latest GitHub data.
      const listRes = await fetch(`/api/admin/signups?t=${Date.now()}`, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const listJson = await listRes.json().catch(() => ({}));
      if (listRes.ok && Array.isArray(listJson.signups)) {
        setSignups(listJson.signups);
      }

      const res = await fetch(`/api/admin/signups?format=csv&t=${Date.now()}`, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Download failed");
      }
      const blob = await res.blob();
      const text = await blob.text();
      // Guard: empty CSV is only a header line
      const lines = text.trim().split(/\r?\n/).filter(Boolean);
      if (lines.length <= 1) {
        setError(
          "CSV is empty — no sign-ups found in storage yet. Submit the form again, wait 10 seconds, then Refresh.",
        );
        return;
      }

      const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `bristol-vip-signups-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Could not download CSV. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-ink-line bg-ink-card p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-white">
            Mailing list sign-ups
          </h2>
          <p className="mt-1 text-sm text-white/50">
            People who joined via <span className="text-white/70">Sign up now</span>.{" "}
            <span className="inline-flex items-center gap-1 text-gold">
              <Users className="h-3.5 w-3.5" />
              {signups.length} total
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-white/80 transition hover:border-white/40 disabled:opacity-50"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </button>
          <button
            type="button"
            onClick={() => void downloadCsv()}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-gold transition hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloading ? "Preparing…" : "Download CSV"}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {signups.length === 0 ? (
        <p className="mt-6 rounded-lg border border-ink-line bg-ink px-4 py-6 text-center text-sm text-white/50">
          No sign-ups loaded yet. Click <span className="text-white/80">Refresh</span>{" "}
          after someone submits the form. Use the live site{" "}
          <span className="text-white/70">bristol-vip-pi.vercel.app</span> (not the
          old bristol-vip.vercel.app).
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-ink-line">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-ink text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-3 py-3 font-medium">Name</th>
                <th className="px-3 py-3 font-medium">Email</th>
                <th className="px-3 py-3 font-medium">Phone</th>
                <th className="px-3 py-3 font-medium">Address</th>
                <th className="px-3 py-3 font-medium">Gender</th>
                <th className="px-3 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-line bg-ink/40 text-white/80">
              {signups.map((row) => (
                <tr key={row.id}>
                  <td className="whitespace-nowrap px-3 py-3">
                    {row.firstName} {row.surname}
                  </td>
                  <td className="px-3 py-3">{row.email}</td>
                  <td className="whitespace-nowrap px-3 py-3">{row.phone}</td>
                  <td className="max-w-[220px] truncate px-3 py-3" title={row.address}>
                    {row.address}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{row.gender}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-white/50">
                    {new Date(row.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-white/40">
        CSV opens in Excel / Google Sheets. Admin URL must be{" "}
        <code className="text-white/60">bristol-vip-pi.vercel.app/admin</code>.
      </p>
    </div>
  );
}
