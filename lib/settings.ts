import { kv } from "@vercel/kv";
import { siteConfig } from "@/site.config";
import {
  getEventFromGitHub,
  hasGitHubWrite,
  setEventOnGitHub,
} from "./github-event-store";

const KV_EVENT_KEY = "site_event";
const KV_TICKET_KEY = "ticket_link"; // legacy

export const FALLBACK_TICKET_LINK = "https://www.eventbrite.co.uk/";

export type SiteEventSettings = {
  ticketLink: string;
  title: string;
  description: string;
  date: string;
  location: string;
};

export type StorageBackend = "kv" | "github" | "supabase";

function defaults(): SiteEventSettings {
  const { featuredEvent } = siteConfig;
  return {
    ticketLink: FALLBACK_TICKET_LINK,
    title: featuredEvent.title,
    description: featuredEvent.description,
    date: featuredEvent.date,
    location: featuredEvent.location,
  };
}

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

function normalizeEvent(raw: Partial<SiteEventSettings> | null): SiteEventSettings | null {
  if (!raw?.ticketLink) return null;
  const base = defaults();
  return {
    ticketLink: raw.ticketLink.trim(),
    title: raw.title?.trim() || base.title,
    description: raw.description?.trim() || base.description,
    date: raw.date?.trim() || base.date,
    location: raw.location?.trim() || base.location,
  };
}

async function getEventFromKv(): Promise<SiteEventSettings | null> {
  if (!hasKv()) return null;
  try {
    const stored = await kv.get<SiteEventSettings>(KV_EVENT_KEY);
    const normalized = normalizeEvent(stored);
    if (normalized) return normalized;

    const legacyLink = await kv.get<string>(KV_TICKET_KEY);
    if (legacyLink) {
      return { ...defaults(), ticketLink: legacyLink };
    }
  } catch {
    return null;
  }
  return null;
}

async function getTicketFromSupabase(): Promise<string | null> {
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

/** Full event settings for the upcoming event card + ticket buttons. */
export async function getSiteEvent(): Promise<SiteEventSettings> {
  const fromKv = await getEventFromKv();
  if (fromKv) return fromKv;

  const fromGitHub = normalizeEvent(await getEventFromGitHub());
  if (fromGitHub) return fromGitHub;

  const fromDb = await getTicketFromSupabase();
  if (fromDb) return { ...defaults(), ticketLink: fromDb };

  const fromEnv = envTicketLink();
  if (fromEnv) return { ...defaults(), ticketLink: fromEnv };

  return defaults();
}

export async function getTicketLink(): Promise<string> {
  return (await getSiteEvent()).ticketLink;
}

export async function setSiteEvent(
  settings: SiteEventSettings,
): Promise<StorageBackend | null> {
  if (hasKv()) {
    try {
      await kv.set(KV_EVENT_KEY, settings);
      await kv.set(KV_TICKET_KEY, settings.ticketLink);
      return "kv";
    } catch {
      // fall through
    }
  }

  if (hasGitHubWrite()) {
    const ok = await setEventOnGitHub(settings);
    if (ok) return "github";
  }

  if (hasSupabase()) {
    try {
      const { getServiceSupabase, SETTINGS_ROW_ID } = await import("./supabase");
      const supabase = getServiceSupabase();
      const { error } = await supabase
        .from("site_settings")
        .update({
          ticket_link: settings.ticketLink,
          updated_at: new Date().toISOString(),
        })
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
  if (hasGitHubWrite()) return "GitHub (data/site-event.json)";
  if (hasSupabase()) return "Supabase (ticket link only)";
  if (envTicketLink()) return "TICKET_LINK env var (read-only in admin)";
  return "defaults from site.config.ts (read-only)";
}

export function canSaveEvents(): boolean {
  return hasKv() || hasGitHubWrite() || hasSupabase();
}
