import { Resend } from "resend";
import { siteConfig } from "@/site.config";

type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

async function sendViaResend(
  payload: ContactPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not set." };
  }

  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "Bristol VIP Events <onboarding@resend.dev>";

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [siteConfig.contactEmail],
    replyTo: payload.email,
    subject: `New enquiry from ${payload.name} — Bristol VIP`,
    text: [
      "New contact form submission",
      "",
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      "",
      "Message:",
      payload.message,
    ].join("\n"),
  });

  if (error) {
    return { ok: false, error: "Resend could not send the email." };
  }

  return { ok: true };
}

/**
 * Free fallback — no API key required. FormSubmit emails the site contact
 * address directly. On the first submission they send a one-time activation
 * link to that inbox (check spam).
 */
async function sendViaFormSubmit(
  payload: ContactPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const to = siteConfig.contactEmail;

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        message: payload.message,
        _subject: `New enquiry from ${payload.name} — Bristol VIP`,
        _template: "table",
        _captcha: "false",
      }),
    });

    const json = await res.json().catch(() => null);
    if (res.ok && json?.success === "true") {
      return { ok: true };
    }

    return {
      ok: false,
      error:
        "Could not deliver your message. If this is the first submission, check bristolvip1@gmail.com for a FormSubmit activation email.",
    };
  } catch {
    return { ok: false, error: "Could not send your message. Please try again." };
  }
}

export async function sendContactEmail(
  payload: ContactPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (process.env.RESEND_API_KEY?.trim()) {
    const viaResend = await sendViaResend(payload);
    if (viaResend.ok) return viaResend;
    // Fall through to FormSubmit if Resend fails.
  }

  return sendViaFormSubmit(payload);
}
