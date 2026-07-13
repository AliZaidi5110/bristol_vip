import { Ticket } from "lucide-react";

type Props = {
  href: string;
  label?: string;
  className?: string;
  variant?: "solid" | "outline";
};

/**
 * The "Get Tickets" CTA. The href is ALWAYS passed in from a server component
 * that read it from Supabase — it is never hardcoded.
 */
export default function GetTicketsButton({
  href,
  label = "Get Tickets",
  className = "",
  variant = "solid",
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-widest transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/70";
  const styles =
    variant === "solid"
      ? "bg-gold text-ink hover:bg-gold-soft hover:shadow-[0_0_30px_-6px_rgba(212,175,55,0.7)] hover:-translate-y-0.5"
      : "border border-gold/70 text-gold hover:bg-gold hover:text-ink";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${styles} ${className}`}
    >
      <Ticket className="h-4 w-4" aria-hidden="true" />
      {label}
    </a>
  );
}
