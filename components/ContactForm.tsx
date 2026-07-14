"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { siteConfig } from "@/site.config";

type Status = "idle" | "sending" | "success" | "error";

function formSubmitEndpoint(): string {
  const id =
    process.env.NEXT_PUBLIC_FORMSUBMIT_ID?.trim() ||
    siteConfig.contactEmail;
  return `https://formsubmit.co/ajax/${encodeURIComponent(id)}`;
}

function isFormSubmitSuccess(json: unknown): boolean {
  if (!json || typeof json !== "object") return false;
  const success = (json as { success?: string | boolean }).success;
  return success === "true" || success === true;
}

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
      _subject: `New enquiry from ${data.get("name")} — Bristol VIP`,
      _template: "table",
      _captcha: "false",
    };

    try {
      const res = await fetch(formSubmitEndpoint(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);

      if (isFormSubmitSuccess(json)) {
        setStatus("success");
        setMessage("Thanks — we'll be in touch soon.");
        form.reset();
        return;
      }

      const remoteMessage =
        json && typeof json === "object" && "message" in json
          ? String((json as { message?: string }).message)
          : "";

      if (remoteMessage.toLowerCase().includes("activation")) {
        setStatus("error");
        setMessage(
          "Almost there — open the FormSubmit email in bristolvip1@gmail.com and click Activate Form (check spam).",
        );
        return;
      }

      setStatus("error");
      setMessage(
        remoteMessage ||
          "Could not send your message. Please email us at bristolvip1@gmail.com directly.",
      );
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again or email bristolvip1@gmail.com.");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-ink-line bg-ink px-4 py-3 text-white placeholder-white/40 outline-none transition-colors focus:border-gold";

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-white">
          {siteConfig.sections.contact.formHeading}
        </h3>
        <p className="mt-1 text-sm text-white/50">
          {siteConfig.sections.contact.formSubtext}
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            name="name"
            type="text"
            required
            maxLength={120}
            placeholder="Your name"
            className={inputClass}
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Your email"
            className={inputClass}
          />
        </div>
        <textarea
          name="message"
          required
          maxLength={2000}
          rows={5}
          placeholder="Tell us what you're planning…"
          className={`${inputClass} resize-none`}
        />

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-widest text-ink transition-all hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {status === "sending" ? "Sending…" : "Send Message"}
          </button>

          {message && (
            <p
              role="status"
              className={`text-sm ${
                status === "success" ? "text-gold" : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
