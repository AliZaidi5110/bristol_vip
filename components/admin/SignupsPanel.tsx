"use client";

import { useState } from "react";
import { Download, Loader2, Users } from "lucide-react";
import type { SignupEntry } from "@/lib/signups";

export default function SignupsPanel({
  initialSignups,
}: {
  initialSignups: SignupEntry[];
}) {
  const [signups] = useState(initialSignups);
  const [downloading, setDownloading] = useState(false);

  async function downloadCsv() {
    setDownloading(true);
    try {
      const res = await fetch("/api/admin/signups?format=csv", {
        method: "GET",
        credentials: "same-origin",
      });
      if (!res.ok) {
        throw new Error("Download failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bristol-vip-signups-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Could not download CSV. Please try again.");
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

        <button
          type="button"
          onClick={downloadCsv}
          disabled={downloading || signups.length === 0}
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

      {signups.length === 0 ? (
        <p className="mt-6 rounded-lg border border-ink-line bg-ink px-4 py-6 text-center text-sm text-white/50">
          No sign-ups yet. When customers submit the form, they will appear here.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-ink-line">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-ink text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-3 py-3 font-medium">Name</th>
                <th className="px-3 py-3 font-medium">Email</th>
                <th className="px-3 py-3 font-medium">Phone</th>
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
        CSV opens in Excel, Google Sheets, or Numbers. Columns: First Name, Surname,
        Email, Address, Phone, Gender, Submitted At.
      </p>
    </div>
  );
}
