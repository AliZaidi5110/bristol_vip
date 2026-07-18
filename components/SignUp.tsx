"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Loader2, Send } from "lucide-react";
import { siteConfig } from "@/site.config";
import Reveal from "./Reveal";

type Status = "idle" | "sending" | "success" | "error";

const GENDER_OPTIONS = [
  "Female",
  "Male",
  "Non-binary",
  "Prefer not to say",
  "Other",
] as const;

const inputClass =
  "w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3.5 text-white placeholder-white/45 outline-none transition-colors focus:border-gold";

export default function SignUp() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const phoneRaw = String(data.get("phone") ?? "").trim();
    const phone = phoneRaw.startsWith("+") ? phoneRaw : `+44 ${phoneRaw.replace(/^0+/, "")}`;

    const payload = {
      firstName: String(data.get("firstName") ?? "").trim(),
      surname: String(data.get("surname") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      address: String(data.get("address") ?? "").trim(),
      phone,
      gender: String(data.get("gender") ?? "").trim(),
      bve_hp_field: String(data.get("bve_hp_field") ?? ""),
    };

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setMessage(json?.error ?? "Could not join the list. Please try again.");
        return;
      }

      setStatus("success");
      setMessage("You're on the list — we'll keep you first in the know.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <section id="signup" className="relative overflow-hidden border-t border-ink-line py-24 sm:py-32">
      <Image
        src={siteConfig.assets.aboutImage}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        priority={false}
      />
      <div className="absolute inset-0 bg-black/75" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-black/50 to-ink" />

      <div className="relative mx-auto max-w-xl px-6">
        <Reveal>
          <p className="text-center font-display text-sm uppercase tracking-[0.35em] text-gold">
            {siteConfig.sections.mailingList.kicker}
          </p>
          <h2 className="mt-3 text-center font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl">
            {siteConfig.sections.mailingList.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-center text-base leading-relaxed text-white/70">
            {siteConfig.sections.mailingList.description}
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-10 rounded-2xl border border-white/15 bg-black/55 p-6 shadow-2xl backdrop-blur-md sm:p-8">
            <form onSubmit={onSubmit} className="space-y-4">
              <input
                type="text"
                name="bve_hp_field"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
              />

              <input
                name="firstName"
                type="text"
                required
                maxLength={80}
                placeholder="First Name *"
                className={inputClass}
              />
              <input
                name="surname"
                type="text"
                required
                maxLength={80}
                placeholder="Surname *"
                className={inputClass}
              />
              <input
                name="email"
                type="email"
                required
                maxLength={200}
                placeholder="Email *"
                className={inputClass}
              />
              <input
                name="address"
                type="text"
                required
                maxLength={300}
                placeholder="Address *"
                className={inputClass}
              />

              <div className="flex overflow-hidden rounded-lg border border-white/15 bg-black/40 focus-within:border-gold">
                <span className="flex items-center border-r border-white/15 px-3 text-sm font-medium text-white/70">
                  +44
                </span>
                <input
                  name="phone"
                  type="tel"
                  required
                  maxLength={40}
                  placeholder="77 7777 7777"
                  className="w-full bg-transparent px-4 py-3.5 text-white placeholder-white/45 outline-none"
                />
              </div>

              <div className="relative">
                <select
                  name="gender"
                  required
                  defaultValue=""
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="" disabled>
                    Gender *
                  </option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-ink text-white">
                      {option}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/50">
                  ▾
                </span>
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold uppercase tracking-widest text-ink transition-all hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : status === "success" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {status === "sending"
                  ? "Submitting…"
                  : status === "success"
                    ? "Joined"
                    : "Sign up now"}
              </button>

              {message && (
                <p
                  role="status"
                  className={`text-center text-sm ${
                    status === "success" ? "text-gold" : "text-red-400"
                  }`}
                >
                  {message}
                </p>
              )}
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
