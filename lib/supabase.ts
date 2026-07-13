import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Public (anon) client — safe to use anywhere. Governed by Row Level Security,
 * so it can only READ site_settings (public read policy). Never let it write.
 */
export function getPublicSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars.",
    );
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

/**
 * Service-role client — bypasses RLS. MUST only ever be used inside server-side
 * API routes / server actions. Never import this into a Client Component.
 */
export function getServiceSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.",
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export const SETTINGS_ROW_ID = 1;

/** Fallback used if Supabase is unreachable or not configured yet. */
export const FALLBACK_TICKET_LINK = "https://www.eventbrite.co.uk/";

export type SiteSettings = {
  id: number;
  ticket_link: string;
  updated_at: string;
};

/**
 * Read the single settings row (server-side). Returns the fallback link if the
 * database is not yet configured, so the site never crashes during setup.
 */
export async function getTicketLink(): Promise<string> {
  try {
    const supabase = getPublicSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select("ticket_link")
      .eq("id", SETTINGS_ROW_ID)
      .single();

    if (error || !data?.ticket_link) return FALLBACK_TICKET_LINK;
    return data.ticket_link;
  } catch {
    return FALLBACK_TICKET_LINK;
  }
}
