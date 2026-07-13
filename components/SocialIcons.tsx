import { Instagram, MessageCircle, Music2 } from "lucide-react";
import { siteConfig } from "@/site.config";

const ICONS: Record<string, typeof Instagram> = {
  instagram: Instagram,
  whatsapp: MessageCircle,
  tiktok: Music2,
};

const LABELS: Record<string, string> = {
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  tiktok: "TikTok",
};

export default function SocialIcons({ className = "" }: { className?: string }) {
  const entries = Object.entries(siteConfig.socials).filter(
    ([, href]) => Boolean(href),
  );

  if (entries.length === 0) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {entries.map(([key, href]) => {
        const Icon = ICONS[key] ?? MessageCircle;
        return (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={LABELS[key] ?? key}
            className="grid h-10 w-10 place-items-center rounded-full border border-ink-line text-white/80 transition-colors hover:border-gold hover:text-gold"
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </a>
        );
      })}
    </div>
  );
}
