"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/site.config";
import GetTicketsButton from "./GetTicketsButton";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Event", href: "#event" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar({ ticketLink }: { ticketLink: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-ink-line bg-ink/85 backdrop-blur-md"
          : "border-b border-transparent bg-gradient-to-b from-black/60 to-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="#home" className="flex items-center gap-3" aria-label={siteConfig.brandName}>
          <Image
            src={siteConfig.assets.logo}
            alt={`${siteConfig.brandName} logo`}
            width={44}
            height={44}
            className="h-10 w-auto"
            priority
          />
          <span className="font-display text-lg font-semibold uppercase tracking-[0.2em] text-white">
            {siteConfig.brandName}
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <ul className="flex items-center gap-7 text-sm font-medium uppercase tracking-wider text-white/80">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition-colors hover:text-gold">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <GetTicketsButton href={ticketLink} className="!px-5 !py-2.5" />
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-md text-white md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink-line bg-ink/95 backdrop-blur-md md:hidden">
          <ul className="flex flex-col gap-1 px-4 py-4 text-sm font-medium uppercase tracking-wider text-white/85">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-md px-3 py-3 transition-colors hover:bg-ink-card hover:text-gold"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="px-3 pt-3">
              <GetTicketsButton href={ticketLink} className="w-full" />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
