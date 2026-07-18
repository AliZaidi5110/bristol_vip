"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Check,
  ImagePlus,
  Link2,
  Loader2,
  LogOut,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { siteConfig } from "@/site.config";
import { ADMIN_LOGIN_PATH } from "@/lib/routes";
import type { SiteEventSettings } from "@/lib/settings";
import type { SignupEntry } from "@/lib/signups";
import SignupsPanel from "./SignupsPanel";

type Toast = { type: "success" | "error"; text: string } | null;

/** Fresh GitHub uploads may not be on Vercel yet — preview via raw URL. */
function previewSrc(path: string): string {
  if (path.includes("/uploads/")) {
    return `https://raw.githubusercontent.com/AliZaidi5110/bristol_vip/main/public${path}`;
  }
  return path;
}

export default function AdminDashboard({
  initialEvent,
  storageStatus,
  canSave,
  galleryImages,
  initialSignups,
}: {
  initialEvent: SiteEventSettings;
  storageStatus: string;
  canSave: boolean;
  galleryImages: string[];
  initialSignups: SignupEntry[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(initialEvent);
  const [form, setForm] = useState(initialEvent);
  const [pickerImages, setPickerImages] = useState(galleryImages);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const unchanged =
    form.ticketLink === saved.ticketLink &&
    form.title === saved.title &&
    form.description === saved.description &&
    form.date === saved.date &&
    form.location === saved.location &&
    form.image === saved.image;

  function updateField<K extends keyof SiteEventSettings>(
    key: K,
    value: SiteEventSettings[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      const res = await fetch("/api/admin/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setToast({ type: "error", text: json?.error ?? "Could not save." });
        return;
      }

      const event = json.event ?? form;
      setSaved(event);
      setForm(event);
      const where = json.storage ? ` (saved to ${json.storage})` : "";
      setToast({
        type: "success",
        text: `Event updated — live on the site now${where}. Hard-refresh the homepage if needed.`,
      });
    } catch {
      setToast({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function onUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    setToast(null);

    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setToast({ type: "error", text: json?.error ?? "Upload failed." });
        return;
      }

      const path = String(json.path ?? "");
      if (!path) {
        setToast({ type: "error", text: "Upload succeeded but no path returned." });
        return;
      }

      updateField("image", path);
      setPickerImages((prev) => (prev.includes(path) ? prev : [path, ...prev]));
      setToast({
        type: "success",
        text: "Photo uploaded. Click Save event to publish it on the site.",
      });
    } catch {
      setToast({ type: "error", text: "Upload network error. Please try again." });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
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
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10">
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
          Upcoming Event
        </h2>
        <p className="mt-1 text-sm text-white/50">
          Update the featured event card, photo, and every &ldquo;Get Tickets&rdquo;
          button. Storage: <span className="text-white/70">{storageStatus}</span>
        </p>

        {!canSave && (
          <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
            <p className="font-medium">Free setup — no payment needed (GitHub token):</p>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-amber-100/90">
              <li>
                Open{" "}
                <a
                  href="https://github.com/settings/tokens/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold underline"
                >
                  github.com/settings/tokens/new
                </a>{" "}
                (log in to GitHub)
              </li>
              <li>
                Note: <strong>Bristol VIP admin</strong> → Expiration:{" "}
                <strong>No expiration</strong> → tick only <strong>repo</strong> →
                Generate token
              </li>
              <li>
                Copy the token → Vercel → project →{" "}
                <strong>Settings → Environment Variables</strong> → add{" "}
                <code className="text-amber-50">GITHUB_TOKEN</code> = paste token →
                Redeploy
              </li>
            </ol>
          </div>
        )}

        <div className="mt-5 rounded-lg border border-ink-line bg-ink px-4 py-3">
          <p className="text-xs uppercase tracking-widest text-white/40">
            Current ticket link
          </p>
          <a
            href={saved.ticketLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center gap-2 break-all text-sm text-gold hover:underline"
          >
            <Link2 className="h-4 w-4 shrink-0" />
            {saved.ticketLink}
          </a>
        </div>

        <form onSubmit={onSave} className="mt-6 space-y-5">
          <div>
            <p className="block text-sm font-medium text-white/80">
              Upcoming event photo
            </p>
            <p className="mt-1 text-xs text-white/45">
              This is the image on the left of the event details on the homepage.
              Pick from your gallery or upload a new photo.
            </p>

            <div className="mt-3 relative aspect-[4/5] max-w-xs overflow-hidden rounded-xl border border-ink-line bg-ink">
              <Image
                src={previewSrc(form.image || siteConfig.assets.eventFlyer)}
                alt="Upcoming event preview"
                fill
                sizes="320px"
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                disabled={uploading || !canSave}
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-gold transition hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading ? "Uploading…" : "Upload photo"}
              </button>
              <span className="inline-flex items-center gap-1.5 text-xs text-white/40">
                <ImagePlus className="h-3.5 w-3.5" />
                JPG / PNG / WebP · under 8 MB
              </span>
            </div>

            <div className="mt-4 grid max-h-64 grid-cols-3 gap-2 overflow-y-auto rounded-xl border border-ink-line bg-ink p-2 sm:grid-cols-4">
              {pickerImages.map((src) => {
                const selected = form.image === src;
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => updateField("image", src)}
                    className={`relative aspect-square overflow-hidden rounded-lg border transition ${
                      selected
                        ? "border-gold ring-2 ring-gold/50"
                        : "border-white/10 hover:border-white/40"
                    }`}
                    aria-label={`Select ${src}`}
                    aria-pressed={selected}
                  >
                    <Image
                      src={previewSrc(src)}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-cover"
                      unoptimized
                    />
                    {selected && (
                      <span className="absolute inset-x-0 bottom-0 bg-gold/90 py-0.5 text-center text-[10px] font-bold uppercase tracking-wider text-ink">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-white/80">
              Event title
            </label>
            <input
              id="title"
              type="text"
              required
              maxLength={200}
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink-line bg-ink px-4 py-3 text-white placeholder-white/40 outline-none transition-colors focus:border-gold"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-white/80">
                Date & time
              </label>
              <input
                id="date"
                type="text"
                required
                maxLength={120}
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
                placeholder="Saturday 15 March 2026 · 10pm"
                className="mt-1 w-full rounded-lg border border-ink-line bg-ink px-4 py-3 text-white placeholder-white/40 outline-none transition-colors focus:border-gold"
              />
            </div>
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-white/80"
              >
                Location
              </label>
              <input
                id="location"
                type="text"
                required
                maxLength={200}
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="Bristol city centre"
                className="mt-1 w-full rounded-lg border border-ink-line bg-ink px-4 py-3 text-white placeholder-white/40 outline-none transition-colors focus:border-gold"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-white/80"
            >
              Description
            </label>
            <textarea
              id="description"
              required
              rows={4}
              maxLength={2000}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="mt-1 w-full resize-y rounded-lg border border-ink-line bg-ink px-4 py-3 text-white placeholder-white/40 outline-none transition-colors focus:border-gold"
            />
          </div>

          <div>
            <label
              htmlFor="ticketLink"
              className="block text-sm font-medium text-white/80"
            >
              Ticket link
            </label>
            <input
              id="ticketLink"
              type="url"
              required
              value={form.ticketLink}
              onChange={(e) => updateField("ticketLink", e.target.value)}
              placeholder="https://www.eventbrite.co.uk/e/your-event"
              className="mt-1 w-full rounded-lg border border-ink-line bg-ink px-4 py-3 text-white placeholder-white/40 outline-none transition-colors focus:border-gold"
            />
          </div>

          <button
            type="submit"
            disabled={saving || unchanged}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-widest text-ink transition-all hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Save event"}
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

      <SignupsPanel initialSignups={initialSignups} />
    </div>
  );
}
