import { NextResponse, type NextRequest } from "next/server";
import { getEmailConfigStatus, sendContactEmail } from "@/lib/email";

export const runtime = "nodejs";

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Safe config probe — no secrets. Useful for diagnosing production email setup. */
export async function GET() {
  const status = getEmailConfigStatus();
  return NextResponse.json({
    ok: true,
    email: {
      resendConfigured: status.resendConfigured,
      toEmail: status.toEmail,
      fromEmail: status.fromEmail,
      usingResendSandbox: status.usingResendSandbox,
      siteOrigin: status.siteOrigin,
      readyHint: status.resendConfigured
        ? status.usingResendSandbox
          ? "Resend sandbox mode: can only deliver to the email used for your Resend account until a domain is verified."
          : "Resend looks configured with a custom from address."
        : "RESEND_API_KEY missing — FormSubmit fallback will be used (needs one-time inbox activation).",
    },
  });
}

export async function POST(request: NextRequest) {
  let name = "";
  let email = "";
  let message = "";
  let honeypot = "";

  try {
    const body = await request.json();
    name = typeof body?.name === "string" ? body.name.trim() : "";
    email = typeof body?.email === "string" ? body.email.trim() : "";
    message = typeof body?.message === "string" ? body.message.trim() : "";
    honeypot = typeof body?.website === "string" ? body.website.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  if (!name || name.length > 120) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!isEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email." },
      { status: 400 },
    );
  }
  if (!message || message.length > 2000) {
    return NextResponse.json(
      { error: "Please enter a message (max 2000 chars)." },
      { status: 400 },
    );
  }

  const result = await sendContactEmail({ name, email, message });
  if (!result.ok) {
    return NextResponse.json(
      {
        error:
          result.error ||
          "We could not send your message right now. Please try again later.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
