import { Resend } from "resend";
import { siteConfig } from "@/site.config";

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

export type EmailConfigStatus = {
  resendConfigured: boolean;
  toEmail: string;
  fromEmail: string;
  usingResendSandbox: boolean;
  siteOrigin: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getToEmail(): string {
  return process.env.CONTACT_TO_EMAIL?.trim() || siteConfig.contactEmail;
}

function getFromEmail(): string {
  return (
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "Bristol VIP Website <onboarding@resend.dev>"
  );
}

function getSiteOrigin(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    siteConfig.website;

  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // fall through
    }
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return vercel.startsWith("http") ? vercel : `https://${vercel}`;
  }

  return "https://bristol-vip-pi.vercel.app";
}

export function getEmailConfigStatus(): EmailConfigStatus {
  const fromEmail = getFromEmail();
  return {
    resendConfigured: Boolean(process.env.RESEND_API_KEY?.trim()),
    toEmail: getToEmail(),
    fromEmail,
    usingResendSandbox: fromEmail.includes("resend.dev"),
    siteOrigin: getSiteOrigin(),
  };
}

function buildPlainText(payload: ContactPayload): string {
  return [
    "New contact form submission — Bristol VIP Events",
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    "",
    "Message:",
    payload.message,
  ].join("\n");
}

function buildHtmlEmail(payload: ContactPayload): string {
  const name = escapeHtml(payload.name);
  const email = escapeHtml(payload.email);
  const message = escapeHtml(payload.message).replace(/\n/g, "<br />");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#141414;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:24px 28px;background:#1a1a1a;border-bottom:1px solid #c9a227;">
              <h1 style="margin:0;font-size:20px;color:#c9a227;letter-spacing:0.05em;text-transform:uppercase;">New Enquiry</h1>
              <p style="margin:8px 0 0;font-size:14px;color:#aaaaaa;">Bristol VIP Events website contact form</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:16px;">
                    <p style="margin:0 0 4px;font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:0.08em;">Name</p>
                    <p style="margin:0;font-size:16px;color:#ffffff;">${name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:16px;">
                    <p style="margin:0 0 4px;font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:0.08em;">Email</p>
                    <p style="margin:0;font-size:16px;"><a href="mailto:${email}" style="color:#c9a227;text-decoration:none;">${email}</a></p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:0.08em;">Message</p>
                    <p style="margin:0;font-size:15px;line-height:1.6;color:#e8e8e8;">${message}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

type ProviderResult =
  | { ok: true; provider: "resend" | "formsubmit" }
  | { ok: false; provider: "resend" | "formsubmit"; error: string };

async function sendViaResend(
  payload: ContactPayload,
  to: string,
): Promise<ProviderResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, provider: "resend", error: "RESEND_API_KEY is not set." };
  }

  const from = getFromEmail();
  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: payload.email,
      subject: `New enquiry from ${payload.name} — Bristol VIP`,
      text: buildPlainText(payload),
      html: buildHtmlEmail(payload),
    });

    if (error) {
      const message = error.message ?? String(error);
      console.error("[contact] Resend error:", message);
      return { ok: false, provider: "resend", error: message };
    }

    if (data?.id) {
      console.info("[contact] Sent via Resend:", data.id);
      return { ok: true, provider: "resend" };
    }

    return {
      ok: false,
      provider: "resend",
      error: "Resend returned no email id.",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[contact] Resend exception:", message);
    return { ok: false, provider: "resend", error: message };
  }
}

/**
 * FormSubmit fallback — needs Origin/Referer (server-only calls are rejected),
 * and a one-time "Activate Form" click in the inbox for CONTACT_TO_EMAIL.
 */
async function sendViaFormSubmit(
  payload: ContactPayload,
  to: string,
): Promise<ProviderResult> {
  const origin = getSiteOrigin();

  try {
    const res = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(to)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Origin: origin,
          Referer: `${origin}/`,
        },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          message: payload.message,
          _replyto: payload.email,
          _subject: `New enquiry from ${payload.name} — Bristol VIP`,
          _template: "table",
          _captcha: "false",
        }),
      },
    );

    const json = (await res.json().catch(() => null)) as {
      success?: boolean | string;
      message?: string;
    } | null;

    const success =
      res.ok && (json?.success === "true" || json?.success === true);

    if (success) {
      console.info("[contact] Sent via FormSubmit");
      return { ok: true, provider: "formsubmit" };
    }

    const message =
      json?.message ||
      `FormSubmit failed with status ${res.status}.`;
    console.error("[contact] FormSubmit error:", message);

    if (/activation/i.test(message)) {
      return {
        ok: false,
        provider: "formsubmit",
        error:
          `FormSubmit needs activation — check ${to} for an "Activate Form" email (also spam).`,
      };
    }

    return { ok: false, provider: "formsubmit", error: message };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[contact] FormSubmit exception:", message);
    return { ok: false, provider: "formsubmit", error: message };
  }
}

function userFacingError(results: ProviderResult[]): string {
  const failures = results.filter(
    (r): r is Extract<ProviderResult, { ok: false }> => !r.ok,
  );

  const formSubmit = failures.find((r) => r.provider === "formsubmit");
  if (formSubmit && /activation/i.test(formSubmit.error)) {
    return formSubmit.error;
  }

  const resend = failures.find((r) => r.provider === "resend");
  if (
    resend &&
    /only send testing emails|verify a domain|not authorized/i.test(resend.error)
  ) {
    return (
      "Email is almost set up. Resend can only send to your Resend account email " +
      "until you verify a domain at resend.com/domains — or activate FormSubmit in your inbox."
    );
  }

  if (resend && /RESEND_API_KEY is not set/i.test(resend.error)) {
    return (
      "Email is not configured yet. Add RESEND_API_KEY (and CONTACT_TO_EMAIL) " +
      "in Vercel environment variables, then redeploy."
    );
  }

  return "We could not send your message right now. Please try again later.";
}

export async function sendContactEmail(
  payload: ContactPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const to = getToEmail();
  if (!to) {
    return { ok: false, error: "Email service is not configured." };
  }

  const results: ProviderResult[] = [];

  const resendResult = await sendViaResend(payload, to);
  results.push(resendResult);
  if (resendResult.ok) return { ok: true };

  const formSubmitResult = await sendViaFormSubmit(payload, to);
  results.push(formSubmitResult);
  if (formSubmitResult.ok) return { ok: true };

  return { ok: false, error: userFacingError(results) };
}
