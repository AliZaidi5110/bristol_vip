import "server-only";

import { Resend } from "resend";

export type ContactPayload = {
  name: string;
  email: string;
  message: string;

  /**
   * Optional unique ID created when the form submission begins.
   * Reusing the same ID on retries prevents duplicate emails.
   */
  submissionId?: string;
};

export type EmailConfigStatus = {
  resendConfigured: boolean;
  toEmail: string;
  fromEmail: string;
  usingResendSandbox: boolean;
  siteOrigin: string;
};

type NormalizedContactPayload = {
  name: string;
  email: string;
  message: string;
  submissionId?: string;
};

type ValidationResult =
  | {
      ok: true;
      payload: NormalizedContactPayload;
    }
  | {
      ok: false;
      error: string;
    };

type SendContactEmailResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5_000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let resendClient: Resend | null = null;

function getEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function getResendClient(apiKey: string): Resend {
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

function getSiteOrigin(): string {
  const configured =
    getEnv("NEXT_PUBLIC_SITE_URL") || getEnv("SITE_URL");

  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      console.error(
        "[contact] NEXT_PUBLIC_SITE_URL or SITE_URL is invalid.",
      );
    }
  }

  const vercelUrl = getEnv("VERCEL_URL");

  if (vercelUrl) {
    try {
      return new URL(
        vercelUrl.startsWith("http")
          ? vercelUrl
          : `https://${vercelUrl}`,
      ).origin;
    } catch {
      console.error("[contact] VERCEL_URL is invalid.");
    }
  }

  return "https://www.bristolvip.co.uk";
}

export function getEmailConfigStatus(): EmailConfigStatus {
  const apiKey = getEnv("RESEND_API_KEY");
  const toEmail = getEnv("CONTACT_TO_EMAIL");
  const fromEmail = getEnv("CONTACT_FROM_EMAIL");

  return {
    resendConfigured: Boolean(apiKey),
    toEmail,
    fromEmail,
    usingResendSandbox: fromEmail.includes("resend.dev"),
    siteOrigin: getSiteOrigin(),
  };
}

function normalizeAndValidatePayload(
  payload: ContactPayload,
): ValidationResult {
  if (!payload || typeof payload !== "object") {
    return {
      ok: false,
      error: "Invalid contact form submission.",
    };
  }

  const name =
    typeof payload.name === "string"
      ? payload.name.replace(/[\r\n\t]+/g, " ").trim()
      : "";

  const email =
    typeof payload.email === "string"
      ? payload.email.trim().toLowerCase()
      : "";

  const message =
    typeof payload.message === "string"
      ? payload.message.replace(/\u0000/g, "").trim()
      : "";

  const submissionId =
    typeof payload.submissionId === "string"
      ? payload.submissionId
          .trim()
          .replace(/[^a-zA-Z0-9_-]/g, "")
          .slice(0, 200)
      : undefined;

  if (!name) {
    return {
      ok: false,
      error: "Please enter your name.",
    };
  }

  if (name.length > MAX_NAME_LENGTH) {
    return {
      ok: false,
      error: `Name must be ${MAX_NAME_LENGTH} characters or fewer.`,
    };
  }

  if (
    !email ||
    email.length > MAX_EMAIL_LENGTH ||
    !EMAIL_PATTERN.test(email)
  ) {
    return {
      ok: false,
      error: "Please enter a valid email address.",
    };
  }

  if (!message) {
    return {
      ok: false,
      error: "Please enter your event details.",
    };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      error: `Event details must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,
    };
  }

  return {
    ok: true,
    payload: {
      name,
      email,
      message,
      submissionId: submissionId || undefined,
    },
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPlainText(
  payload: NormalizedContactPayload,
): string {
  return [
    "New contact form submission — Bristol VIP Events",
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    "",
    "Event details:",
    payload.message,
  ].join("\n");
}

function buildHtmlEmail(
  payload: NormalizedContactPayload,
): string {
  const name = escapeHtml(payload.name);
  const email = escapeHtml(payload.email);
  const message = escapeHtml(payload.message).replace(
    /\r?\n/g,
    "<br />",
  );

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  />
  <title>New Bristol VIP enquiry</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#0a0a0a;
    font-family:Arial,Helvetica,sans-serif;
    color:#f5f5f5;
  "
>
  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="background:#0a0a0a;padding:24px 12px;"
  >
    <tr>
      <td align="center">
        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="
            width:100%;
            max-width:600px;
            background:#141414;
            border:1px solid #2a2a2a;
            border-radius:12px;
            overflow:hidden;
          "
        >
          <tr>
            <td
              style="
                padding:24px 28px;
                background:#1a1a1a;
                border-bottom:1px solid #c9a227;
              "
            >
              <h1
                style="
                  margin:0;
                  font-size:20px;
                  color:#c9a227;
                  letter-spacing:0.05em;
                  text-transform:uppercase;
                "
              >
                New Enquiry
              </h1>

              <p
                style="
                  margin:8px 0 0;
                  font-size:14px;
                  color:#aaaaaa;
                "
              >
                Bristol VIP Events website contact form
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:28px;">
              <p
                style="
                  margin:0 0 4px;
                  font-size:12px;
                  color:#888888;
                  text-transform:uppercase;
                  letter-spacing:0.08em;
                "
              >
                Name
              </p>

              <p
                style="
                  margin:0 0 20px;
                  font-size:16px;
                  color:#ffffff;
                "
              >
                ${name}
              </p>

              <p
                style="
                  margin:0 0 4px;
                  font-size:12px;
                  color:#888888;
                  text-transform:uppercase;
                  letter-spacing:0.08em;
                "
              >
                Email
              </p>

              <p
                style="
                  margin:0 0 20px;
                  font-size:16px;
                "
              >
                <a
                  href="mailto:${email}"
                  style="
                    color:#c9a227;
                    text-decoration:none;
                  "
                >
                  ${email}
                </a>
              </p>

              <p
                style="
                  margin:0 0 4px;
                  font-size:12px;
                  color:#888888;
                  text-transform:uppercase;
                  letter-spacing:0.08em;
                "
              >
                Event details
              </p>

              <div
                style="
                  margin:0;
                  padding:16px;
                  background:#101010;
                  border:1px solid #292929;
                  border-radius:8px;
                  font-size:15px;
                  line-height:1.65;
                  color:#e8e8e8;
                  overflow-wrap:anywhere;
                "
              >
                ${message}
              </div>
            </td>
          </tr>

          <tr>
            <td
              style="
                padding:18px 28px;
                background:#101010;
                border-top:1px solid #252525;
              "
            >
              <p
                style="
                  margin:0;
                  font-size:12px;
                  line-height:1.5;
                  color:#777777;
                "
              >
                Reply directly to this email to contact the customer.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendContactEmail(
  incomingPayload: ContactPayload,
): Promise<SendContactEmailResult> {
  const validation =
    normalizeAndValidatePayload(incomingPayload);

  if (!validation.ok) {
    return {
      ok: false,
      error: validation.error,
    };
  }

  const apiKey = getEnv("RESEND_API_KEY");
  const toEmail = getEnv("CONTACT_TO_EMAIL");
  const fromEmail = getEnv("CONTACT_FROM_EMAIL");

  const missingVariables = [
    !apiKey && "RESEND_API_KEY",
    !toEmail && "CONTACT_TO_EMAIL",
    !fromEmail && "CONTACT_FROM_EMAIL",
  ].filter(Boolean);

  if (missingVariables.length > 0) {
    console.error(
      `[contact] Missing environment variables: ${missingVariables.join(
        ", ",
      )}`,
    );

    return {
      ok: false,
      error:
        "The email service is temporarily unavailable. Please try again later.",
    };
  }

  const payload = validation.payload;
  const resend = getResendClient(apiKey);

  const emailData = {
    from: fromEmail,
    to: [toEmail],
    replyTo: payload.email,
    subject: `New enquiry from ${payload.name} — Bristol VIP`,
    text: buildPlainText(payload),
    html: buildHtmlEmail(payload),
    tags: [
      {
        name: "source",
        value: "contact-form",
      },
    ],
  };

  try {
    const sendOptions = payload.submissionId
      ? {
          idempotencyKey: `contact-form/${payload.submissionId}`,
        }
      : undefined;

    const { data, error } = sendOptions
      ? await resend.emails.send(emailData, sendOptions)
      : await resend.emails.send(emailData);

    if (error) {
      console.error("[contact] Resend error:", error.message);

      return {
        ok: false,
        error:
          "We could not send your message right now. Please try again.",
      };
    }

    if (!data?.id) {
      console.error(
        "[contact] Resend returned no email ID.",
      );

      return {
        ok: false,
        error:
          "We could not send your message right now. Please try again.",
      };
    }

    console.info("[contact] Email sent successfully:", data.id);

    return {
      ok: true,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown email error";

    console.error("[contact] Resend exception:", message);

    return {
      ok: false,
      error:
        "We could not send your message right now. Please try again.",
    };
  }
}