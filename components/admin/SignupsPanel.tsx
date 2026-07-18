"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, RefreshCw, Users } from "lucide-react";
import type { SignupEntry } from "@/lib/signups";

function toCsv(signups: SignupEntry[]): string {
  const header = [
    "First Name",
    "Surname",
    "Email",
    "Address",
    "Phone",
    "Gender",
    "Submitted At",
  ];
  const escape = (value: string) => `"${value.replace(/\r?\n/g, " ").replace(/"/g, '""')}"`;
  const rows = signups.map((s) =>
    [
      s.firstName,
      s.surname,
      s.email,
      s.address,
      s.phone,
      s.gender,
      s.createdAt,
    ]
      .map(escape)
      .join(","),
  );
  return `\uFEFF${[header.map(escape).join(","), ...rows].join("\r\n")}\r\n`;
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function SignupsPanel({
  initialSignups,
}: {
  initialSignups: SignupEntry[];
}) {
  const [signups, setSignups] = useState(initialSignups);
  const [downloading, setDownloading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function refresh() {
    setRefreshing(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch(`/api/admin/signups?t=${Date.now()}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "Could not load sign-ups (are you logged in?).");
      }
      const list = Array.isArray(json.signups) ? json.signups : [];
      setSignups(list);
      setInfo(`Loaded ${list.length} sign-up${list.length === 1 ? "" : "s"}.`);
      return list as SignupEntry[];
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not refresh sign-ups.");
      return null;
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function downloadCsv() {
    setDownloading(true);
    setError("");
    setInfo("");
    try {
      // 1) Prefer fresh server list
      const latest = await refresh();
      const rows = latest && latest.length > 0 ? latest : signups;

      if (rows.length > 0) {
        // Client-side export from the table — most reliable for Excel
        const stamp = new Date().toISOString().slice(0, 10);
        downloadTextFile(`bristol-vip-signups-${stamp}.csv`, toCsv(rows));
        setInfo(`Downloaded ${rows.length} sign-up${rows.length === 1 ? "" : "s"} as CSV.`);
        return;
      }

      // 2) Fallback: open server CSV endpoint in the same tab (sends cookies)
      window.location.href = `/api/admin/signups?format=csv&t=${Date.now()}`;
    } catch {
      setError("Could not download CSV. Click Refresh first, then try again.");
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
      {info && !error && (
        <p className="mt-4 rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
          {info}
        </p>
      )}

      {signups.length === 0 ? (
        <p className="mt-6 rounded-lg border border-ink-line bg-ink px-4 py-6 text-center text-sm text-white/50">
          No sign-ups in the table yet. Click <span className="text-white/80">Refresh</span>.
          If still empty, you are on the wrong site — use{" "}
          <span className="text-white/70">bristol-vip-pi.vercel.app/admin</span> only.
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
        Download CSV exports whatever is shown in the table above (opens in Excel).
      </p>
    </div>
  );
}
