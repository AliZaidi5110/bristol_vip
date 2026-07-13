import { kv } from "@vercel/kv";

const KV_KEY = "ticket_link";

export const FALLBACK_TICKET_LINK = "https://www.eventbrite.co.uk/";

function envTicketLink(): string | null {
  const link = process.env.TICKET_LINK?.trim();
  return link || null;
}

function hasKv(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function hasSupabase(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

async function getFromKv(): Promise<string | null> {
  if (!hasKv()) return null;
  try {
    const value = await kv.get<string>(KV_KEY);
    return typeof value === "string" && value ? value : null;
  } catch {
    return null;
  }
}

async function getFromSupabase(): Promise<string | null> {
  if (!hasSupabase()) return null;
  try {
    const { getPublicSupabase, SETTINGS_ROW_ID } = await import("./supabase");
    const supabase = getPublicSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select("ticket_link")
      .eq("id", SETTINGS_ROW_ID)
      .single();
    if (error || !data?.ticket_link) return null;
    return data.ticket_link;
  } catch {
    return null;
  }
}

/** Read the live ticket link. KV → Supabase → TICKET_LINK env → fallback. */
export async function getTicketLink(): Promise<string> {
  const fromKv = await getFromKv();
  if (fromKv) return fromKv;

  const fromDb = await getFromSupabase();
  if (fromDb) return fromDb;

  return envTicketLink() ?? FALLBACK_TICKET_LINK;
}

/** Persist a new ticket link. Returns which store was used, or null on failure. */
export async function setTicketLink(
  ticketLink: string,
): Promise<"kv" | "supabase" | null> {
  if (hasKv()) {
    try {
      await kv.set(KV_KEY, ticketLink);
      return "kv";
    } catch {
      // fall through to Supabase
    }
  }

  if (hasSupabase()) {
    try {
      const { getServiceSupabase, SETTINGS_ROW_ID } = await import("./supabase");
      const supabase = getServiceSupabase();
      const { error } = await supabase
        .from("site_settings")
        .update({ ticket_link: ticketLink, updated_at: new Date().toISOString() })
        .eq("id", SETTINGS_ROW_ID);
      if (!error) return "supabase";
    } catch {
      return null;
    }
  }

  return null;
}

export function getStorageStatus(): string {
  if (hasKv()) return "Vercel KV";
  if (hasSupabase()) return "Supabase";
  if (envTicketLink()) return "TICKET_LINK env var (read-only in admin)";
  return "fallback default";
}
