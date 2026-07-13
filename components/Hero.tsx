import Image from "next/image";
import { siteConfig } from "@/site.config";
import { getHeroVideoSrc } from "@/lib/media";
import GetTicketsButton from "./GetTicketsButton";
import HeroBackground from "./HeroBackground";

export default function Hero({ ticketLink }: { ticketLink: string }) {
  const heroVideo = getHeroVideoSrc();
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Poster image — always visible as fallback beneath the video */}
      <Image
        src={siteConfig.assets.heroPoster}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <HeroBackground videoSrc={heroVideo} />

      {/* Dark overlays so text stays readable over video/photo */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-ink" />
      <div className="absolute inset-0 bg-black/35" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <p className="animate-fade-in font-display text-sm uppercase tracking-[0.35em] text-gold">
          {siteConfig.heroKicker}
        </p>

        <h1 className="mt-5 animate-fade-up font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
          {siteConfig.brandName}
        </h1>

        <p className="mx-auto mt-5 max-w-xl animate-fade-up text-lg font-light tracking-wide text-white/85 sm:text-2xl">
          {siteConfig.tagline}
        </p>

        <div className="mt-10 flex animate-fade-up flex-col items-center justify-center gap-4 sm:flex-row">
          <GetTicketsButton href={ticketLink} className="!px-8 !py-4 text-base" />
          <a
            href={siteConfig.ctas.heroSecondaryHref}
            className="inline-flex items-center justify-center rounded-full border border-white/25 px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:border-white/70"
          >
            {siteConfig.ctas.heroSecondary}
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/30 p-1.5">
          <span className="h-2 w-1 animate-bounce rounded-full bg-gold" />
        </div>
      </div>
    </section>
  );
}
