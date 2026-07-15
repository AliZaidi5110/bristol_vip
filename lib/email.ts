import { Resend } from "resend";
import { siteConfig } from "@/site.config";

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

async function sendViaResend(
  payload: ContactPayload,
  to: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "Bristol VIP Website <onboarding@resend.dev>";

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: payload.email,
    subject: `New enquiry from ${payload.name} — Bristol VIP`,
    text: buildPlainText(payload),
    html: buildHtmlEmail(payload),
  });

  if (error) {
    console.error("[contact] Resend error:", error.message ?? error);
    return false;
  }

  if (data?.id) return true;
  return false;
}

/** Fallback when Resend cannot deliver (e.g. free tier domain limits). */
async function sendViaFormSubmit(
  payload: ContactPayload,
  to: string,
): Promise<boolean> {
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
    return res.ok && (json?.success === "true" || json?.success === true);
  } catch {
    return false;
  }
}

export async function sendContactEmail(
  payload: ContactPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const to =
    process.env.CONTACT_TO_EMAIL?.trim() || siteConfig.contactEmail;
  if (!to) {
    return { ok: false, error: "Email service is not configured." };
  }

  if (await sendViaResend(payload, to)) {
    return { ok: true };
  }

  if (await sendViaFormSubmit(payload, to)) {
    return { ok: true };
  }

  return {
    ok: false,
    error: "We could not send your message right now. Please try again later.",
  };
}
