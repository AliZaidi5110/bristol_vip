import { Resend } from "resend";
import { siteConfig } from "@/site.config";

type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

export async function sendContactEmail(
  payload: ContactPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error:
        "Email is not configured yet. Add RESEND_API_KEY in Vercel environment variables.",
    };
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
      `New contact form submission`,
      ``,
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      ``,
      `Message:`,
      payload.message,
    ].join("\n"),
  });

  if (error) {
    return { ok: false, error: "Could not send email. Check RESEND_API_KEY setup." };
  }

  return { ok: true };
}
